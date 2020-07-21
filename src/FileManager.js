import React from 'react';
import FileList from './FileList'
import DownloadLink from "react-download-link";
import { PDFDocument } from 'pdf-lib'
import { TiArrowDownThick } from 'react-icons/ti';

function range(stop) {
    const arr = new Array(stop);
    for (let i = 0; i < stop; i++) {
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
        this.handleUp = this.handleUp.bind(this);
        this.handleDown = this.handleDown.bind(this);
        this.state = {
            files: [],
            merged: null
        };
    }

    addFile(e) {
        console.log(e.target.files);
        const file = e.target.files[0];
        this.setState((state, props) => ({
            files: state.files.concat([file])
        }));
        e.target.value = "";
    }

    async merge() {
        var allPages = [];
        const pdfDoc = await PDFDocument.create();
        const files = this.state.files;
        this.setState({files:[]});

        for (let j = 0; j < files.length; j++) {
            const file = files[j];
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const pageCount = doc.getPageCount();
            const pageOrder = new Array(pageCount);
            for (let i = 0; i < pageCount; i++) {
                pageOrder[i] = i;
            }
            const copiedPages = await pdfDoc.copyPages(doc,range(pageCount));
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
                files: 
                    state.files.filter((e,idx) => idx !== i)
                })
            );
        });
    }

    handleUp(i) {
        return (e => {
            if (i === 0) {
                return;
            } else {
                this.setState((state,props) => {
                    let newFiles = Array.from(state.files);
                    newFiles[i] = state.files[i - 1];
                    newFiles[i - 1] = state.files[i];
                    return {files : newFiles};
                })
            }
        })
    }

    handleDown(i) {
        return (e => {
            if (i === this.state.files.length - 1) {
                return;
            } else {
                this.setState((state,props) => {
                    let newFiles = Array.from(state.files);
                    newFiles[i] = state.files[i + 1];
                    newFiles[i + 1] = state.files[i];
                    return {files : newFiles};

                })
            }
        })
    }

    render() {
        let isEmpty = this.state.files.length === 0;
        return (
            <div>
                <div className="controls">
                    <div className={"focus"}>
                        <TiArrowDownThick/> Click Here To Add File<br/>
                        <input className="input-btn" type="file" onChange={this.addFile}/>
                    </div>
                    <DownloadLink
                        label="Click Here When Done"
                        filename="merged.pdf"
                        className={"btn download-btn" + (isEmpty ? "" : " focus")}
                        exportFile={this.merge}
                        style={{}}
                    />
                </div>
                
                <FileList 
                    files={this.state.files}
                    handleDelete={this.handleDelete}
                    handleUp={this.handleUp}
                    handleDown={this.handleDown}
                />
                
            </div>
        )
    }
}
