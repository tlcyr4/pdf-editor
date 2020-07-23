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
        e.target.value = "";
        file.arrayBuffer().then(bytes => {
        PDFDocument.load(bytes).then(doc => {
            let pageMask = new Array(doc.getPageCount());
            this.setState((state, _props) => ({
                files: state.files.concat([file]),
                pageMasks : state.pageMasks.concat([pageMask.fill(true)])
            }));
        })})
        
    }

    async merge() {
        var allPages = [];
        const pdfDoc = await PDFDocument.create();
        const files = this.state.files;
        const pageMasks = this.state.pageMasks;
        this.setState({files:[],pageMasks:[]});
        debugger;
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
                    files: swapped(files, i, clamp(i - 1, 0, files.length)),
                    pageMasks: swapped(pageMasks, i, clamp(i - 1, 0, files.length))
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
                    files: swapped(files, i, clamp(i + 1, 0, files.length)),
                    pageMasks: swapped(pageMasks, i, clamp(i + 1, 0, files.length))
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
                    pageMasks : newPageMasks,
                    pageIndex: null,
                    selectedFile: null,
                    files: removed(state.files, state.selectedFile),
                    pageMasks: removed(state.pageMasks, state.selectedFile)
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
                    <div className="add-button">
                        <label className="custom-file-upload active">
                            <input 
                              className="input-btn"
                              type="file" 
                              onChange={this.addFile}
                            />
                            Pick File
                        </label>
                    </div>
                    {isEmpty ? (
                        <div className="merge-button inactive">
                            Merge Files
                        </div>) : (
                        <DownloadLink
                          label="Merge Files"
                          filename="merged.pdf"
                          className="merge-button active"
                          exportFile={this.merge}
                          style={{}}
                        />)}
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

            return (<div className="workspace-wrapper">
            <div className="workspace">
                <div className="edit-buttons-container big-btn">
                    <div className="big-btn active" onClick={this.pageUp.bind(this)}>Page Up</div>
                    <div className="big-btn active" onClick={this.deletePage}>Delete Page</div>
                    <div className="big-btn active" onClick={this.pageDown.bind(this)}>Page Down</div>
                </div>
                <div className="done-button active big-btn" onClick={this.handleDeselect.bind(this)}>Done</div>
                <div className="workspace-view">
                    <Document file={this.state.files[this.state.selectedFile]} >
                        <Page pageIndex={this.state.pageIndex}/>
                    </Document>
                </div>
            </div>
            </div>);
        }
    }
}
