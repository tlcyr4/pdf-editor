import React from 'react';
import FileList from './FileList'
import DownloadLink from "react-download-link";
import { PDFDocument } from 'pdf-lib'
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function swapped(arr, a, b) {
    let newArr = Array.from(arr);
    newArr[a] = arr[b];
    newArr[b] = arr[a];
    return newArr;
}

function clamp(target, min, max) {
    if (target < min) {
        target = min;
    }
    if (target > max) {
        target = max;
    }
    return target;
}

function removed(arr, i) {
    return arr.filter((_e,j) => i !== j);
}

function range(end) {
    let arr = new Array(end);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    return arr;
}

export default class FileManager extends React.Component {
    constructor(props) {
        super(props);
        this.addFile = this.addFile.bind(this);
        this.merge = this.merge.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.deletePage = this.deletePage.bind(this);
        this.handleUp = this.handleUp.bind(this);
        this.handleDown = this.handleDown.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = {
            files: [],
            selectedFile: null,
            pageMasks : [],
            pageIndex: null
        };
    }

    addFile(e) {
        const file = e.target.files[0];
        // alert("Filename: " + file.name + " , Type: " + file.type);
        e.target.value = "";
        switch (file.type) {
            case "application/pdf":
                this.loadPDF(file);
                break;
            case "image/png":
            case "image/jpg":
                this.convertImage(file);
                break;
        
            default:
                alert("Cannot use file type: " + file.type);
                return;
                break;
        }
        
        
    }

    async convertImage(file) {
        const pdfDoc = await PDFDocument.create();
        let imageBytes = await file.arrayBuffer();
        let image;
        switch (file.type) {
            case "image/png":
                image = await pdfDoc.embedPng(imageBytes);
                break;
            case "image/jpg":
                image = await pdfDoc.embedJpg(imageBytes);
                break;
            default:
                alert("Cannot use image type: " + file.type);
                return;
                break;
        }
        let page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image);
        let docBytes = await pdfDoc.save();
        this.loadPDF(new File(
            [docBytes], file.name, {
                type:"application/pdf",
                lastModified: file.lastModified
            }
        ));
    }

    loadPDF(file) {
        file.arrayBuffer().then(bytes => {
            PDFDocument.load(bytes).then(doc => {
                let pageMask = new Array(doc.getPageCount());
                this.setState((state, _props) => ({
                    files: state.files.concat([file]),
                    pageMasks : state.pageMasks.concat([pageMask.fill(true)])
                }));
            })});
    }

    async merge() {
        var allPages = [];
        const pdfDoc = await PDFDocument.create();
        const files = this.state.files;
        const pageMasks = this.state.pageMasks;
        this.setState({files:[],pageMasks:[]});
        for (let j = 0; j < files.length; j++) {
            let file = files[j];
            let pageMask = pageMasks[j];

            let useMask = (_e,i) => pageMask[i];
            let pageOrder = range(pageMask.length)
                            .filter(useMask);
            
            let bytes = await file.arrayBuffer();
            let doc = await PDFDocument.load(bytes);
            
            let copiedPages = await pdfDoc.copyPages(doc,pageOrder);
            allPages = allPages.concat(copiedPages);
        }
        allPages.forEach(page => {
            pdfDoc.addPage(page);
        });
        return await pdfDoc.save();
    }

    handleDelete(i) {
        return (e => {
            this.setState((state, props) => ({
                files: removed(state.files, i),
                pageMasks: removed(state.pageMasks, i)
                })
            );
        });
    }

    handleUp(i) {
        return (_e => {
            this.setState((state,_props) => {
                let files = state.files;
                let pageMasks = state.pageMasks;
                return {
                    files: swapped(files, i, clamp(i - 1, 0, files.length - 1)),
                    pageMasks: swapped(pageMasks, i, clamp(i - 1, 0, files.length - 1))
                }
            });
        })
    }

    handleDown(i) {
        return (e => {
            this.setState((state,_props) => {
                let files = state.files;
                let pageMasks = state.pageMasks;
                return {
                    files: swapped(files, i, clamp(i + 1, 0, files.length - 1)),
                    pageMasks: swapped(pageMasks, i, clamp(i + 1, 0, files.length - 1))
                }
            });
        })
    }

    handleSelect(i) {
        return (e => {
            this.setState((state,props) =>({
                selectedFile: i,
                pageIndex: state.pageMasks[i].indexOf(true)
            }));
        })
    }

    handleDeselect() {
        this.setState({selectedFile: null});
    }

    deletePage() {
        console.log("delete page");
        this.setState((state,_props) => {
            let newPageMasks = Array.from(state.pageMasks);
            newPageMasks[this.state.selectedFile][this.state.pageIndex] = false;

            let pageMask = newPageMasks[this.state.selectedFile];
            
            // let i = this.state.pageIndex;
            // first try page down
            console.log(`mask ${pageMask}`);
            console.log(`starting at index ${this.state.pageIndex}`);
            let i = pageMask.findIndex((e,i)=> i > this.state.pageIndex && e);
            console.log(`up to index ${i}`);
            // otherwise page up
            if (i === -1) {
                i = pageMask.lastIndexOf(true);
                console.log(`down to index ${i}`);
            }


            if (i !== -1) {
                return {
                    pageMasks : newPageMasks,
                    pageIndex : i
                }
            } else {
                console.log("deleting whole file");
                return {
                    pageIndex: null,
                    selectedFile: null,
                    files: removed(state.files, state.selectedFile),
                    pageMasks: removed(newPageMasks, state.selectedFile)
                }
            }

            
        })
    }

    pageDown() {
        let pageMask = this.state.pageMasks[this.state.selectedFile];
        for (let i = this.state.pageIndex + 1; i < pageMask.length; i++) {
            if (pageMask[i]) {
                this.setState({pageIndex : i });
                break;
            }
        }
    }
    pageUp() {
        let pageMask = this.state.pageMasks[this.state.selectedFile];
        for (let i = this.state.pageIndex - 1; i >= 0; i--) {
            if (pageMask[i]) {
                this.setState({pageIndex : i });
                break;
            }
        }
    }

    render() {
        let isEmpty = this.state.files.length === 0;
        if (this.state.selectedFile === null) {
            return (<div className="workspace-wrapper">
                <div className="workspace">
                    <div className="add-button active">
                        <div className="corner-tag">First Step</div>
                        <label className="custom-file-upload">
                            <input 
                              className="input-btn"
                              type="file" 
                              onChange={this.addFile}
                              accept=".pdf,.jpg,.png"
                            />
                            Select A  New File
                        </label>
                    </div>
                    {isEmpty ? (
                        <div className="merge-button inactive">
                            <div className="corner-tag">
                                Final Step
                            </div>
                            Merge All Selected Files
                        </div>) : (
                            <div className="merge-button active">
                                <div className="corner-tag">
                                    Final Step
                                </div>
                                <DownloadLink
                                label="Merge All Selected Files"
                                filename="merged.pdf"
                                className="merge-link"
                                exportFile={this.merge}
                                style={{}}
                                >
                                </DownloadLink>
                            </div>
                        )}
                    <FileList 
                      files={this.state.files}
                      handleDelete={this.handleDelete}
                      handleUp={this.handleUp}
                      handleDown={this.handleDown}
                      handleSelect={this.handleSelect}
                    />
            </div>
            </div>
            )
        } else {
            let pageMask = this.state.pageMasks[this.state.selectedFile];
            let pageIndex = this.state.pageIndex;
            let file = this.state.files[this.state.selectedFile];
            const [adjustedPageNum,adjustedPageCount] = adjusted(pageIndex, pageMask);


            return (<div className="workspace-wrapper">
            <div className="workspace">
                <div className="edit-buttons-container big-btn">
                    <div className="big-btn active" onClick={this.pageUp.bind(this)}>Page Up</div>
                    <div className="big-btn active" onClick={this.deletePage}>Delete Page</div>
                    <div className="big-btn active" onClick={this.pageDown.bind(this)}>Page Down</div>
                </div>
                <div className="done-button active big-btn" onClick={this.handleDeselect.bind(this)}>Done</div>
                <div className="workspace-view">
        <h2>{file.name} （{adjustedPageNum} / {adjustedPageCount}）</h2>
                    <Document 
                        file={this.state.files[this.state.selectedFile]}
                        className="doc-viewer"    
                    >
                        <Page pageIndex={this.state.pageIndex}/>
                    </Document>
                </div>
            </div>
            </div>);
        }
    }
}

function adjusted(pageIndex, pageMask) {
    let adjustedIndex;
    let adjustedCount = 0;
    for (let i = 0; i < pageMask.length; i++) {
        if (pageMask[i]) {
            adjustedCount += 1;
        }
        if (i === pageIndex) {
            adjustedIndex = adjustedCount;
        }
    }
    return [adjustedIndex, adjustedCount];
}