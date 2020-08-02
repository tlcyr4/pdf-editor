import React from 'react';
import PageView from './PageView';
import ListView from './ListView';
import { PDFDocument } from 'pdf-lib';
import { TeachingBubble } from '@fluentui/react';
// import { IconButton } from '@fluentui/react';



export default class PDFEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            docs : [],
            activeDoc : null,
            count: 0,
            pageIndex:null,
            teachState:0,
            hasFirstDoc: false,
        }
        this.setCrumbs = props.setCrumbs;
    }
    setTeachState(i) {
        this.setState({
            teachState:i
        })
    }
    setPageIndex(i) {
        this.setState({
            pageIndex: i
        });
    }
    addFiles(e) {
        let files = Array.from(e.target.files);
        e.target.files = null;
        e.target.value = '';

        async function aux(files) {
            // console.log(`adding ${files.length} files`);
            for (let i = 0; i < files.length; i++) {
                // console.log(`adding ${i + 1} of ${files.length} files`);

                const file = files[i];
                // console.log(`adding file ${file.name}`)
                await this.addFile(file);
            }
            // console.log(`done adding ${files.length} files`);
        }
        aux.bind(this)(files);
    }
    async addFile(file) {
        
        switch (file.type) {
            case "application/pdf":
                await this.loadPDF(file);
                break;
            case "image/png":
            case "image/jpg":
            case "image/jpeg":
                await this.convertImage(file);
                break;
            default:
                alert("Cannot use file type: " + file.type);
                return;
        }
    }

    async loadPDF(file) {
        let bytes = await file.arrayBuffer();
        let pdfDoc = await PDFDocument.load(bytes);

        if (!this.state.hasFirstDoc) {
            this.setState({
                hasFirstDoc:true,
                teachState: 1,
            });
        }

        this.setState((state, _props) => ({
            docs: state.docs.concat([{
                file:file,
                pdfDoc:pdfDoc,
                name:file.name,
                key: state.count
            }]),
            count: state.count + 1
        }))
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
            case "image/jpeg":
                image = await pdfDoc.embedJpg(imageBytes);
                break;
            default:
                alert("Cannot use image type: " + file.type);
                return;
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

    setActiveDoc(key) {
        let activeDoc = this.state.docs.find(d => d.key === key);
        this.setState({activeDoc: activeDoc, pageIndex:0});
        this.setCrumbs([{text: activeDoc.name, key:'activeDoc'}]);
    }

    deleteDoc() {
        this.setCrumbs([]);
        this.setState((state,_props) => ({
            docs: state.docs.filter(d => d.key !== state.activeDoc.key),
            activeDoc: null
        }));
    }

    insertAt(srcKey,dstKey) {
        let docs = this.state.docs;
        let srcIndex = docs.findIndex(d => d.key === srcKey);
        let dstIndex = docs.findIndex(d => d.key === dstKey);
        let src = docs[srcIndex];
        this.setState((state,_props) => {
            return {
                docs: state.docs.map((doc, i) => {
                    if (i === dstIndex) {
                        return src;
                    } else if (srcIndex <= i && i < dstIndex) {
                        return state.docs[i + 1];
                    } else if (dstIndex < i && i <= srcIndex) {
                        return state.docs[i - 1];
                    } else {
                        return doc;
                    }
                })
            }
        });
    }

    deletePage(index) {
        // delete page from pdfDoc
        let doc = this.state.activeDoc.pdfDoc;
        if (doc.getPageCount() === 1) {
            this.deleteDoc();
            // alert('deleting doc');
            return;
        }
        doc.removePage(index);
        // propagate change to file
        doc.save().then(bytes => {
            this.setState((state,_props) => {
                let activeDoc = state.activeDoc;
                let file = new File([bytes], activeDoc.name);
                let newActiveDoc = {
                    file:file,
                    pdfDoc:doc,
                    key:activeDoc.key,
                    name:activeDoc.name
                };
                return {
                    activeDoc:newActiveDoc,
                    docs: state.docs.map(
                        d => d.key === activeDoc.key ? newActiveDoc : d
                        )
                }
            });
            this.forceUpdate();
        })
    }
    async merge() {
        let allPages = [];
        let docs = this.state.docs;
        if (docs.length === 0) {
            return;
        }
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < docs.length; i++) {
            let doc = docs[i].pdfDoc;
            let pageOrder = doc.getPageIndices();
            let copiedPages = await pdfDoc.copyPages(doc,pageOrder);
            allPages = allPages.concat(copiedPages);
        }
        allPages.forEach(page => {
            pdfDoc.addPage(page);
        });
        let pdfBytes = await pdfDoc.save();

        let a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([pdfBytes], {type: 'text/csv'}));
        a.download = 'merged.pdf';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
        document.body.removeChild(a);
    }

    render() {
        let {docs,activeDoc,teachState} = this.state;
        // const helpIcon = {iconName: 'Help'};
        return (
        <main style={{display: 'grid',gridTemplateColumns: '50% 50%', flex: "1 1 auto"}}>
            <ListView
              documents={docs}
              addFiles={this.addFiles.bind(this)}
              setActiveDoc={this.setActiveDoc.bind(this)}
              deleteDoc={this.deleteDoc.bind(this)}
              merge={this.merge.bind(this)}
              insertAt={this.insertAt.bind(this)}
              setTeachState={this.setTeachState.bind(this)}
              teachState={this.state.teachState}
            />
            <PageView
              doc={activeDoc}
              deletePage={this.deletePage.bind(this)}
              deleteDoc={this.deleteDoc.bind(this)}
              setPageIndex={this.setPageIndex.bind(this)}
              pageIndex={this.state.pageIndex}
            />
            {/* <IconButton
              iconProps={helpIcon}
              title={'User Manual'}
              disabled={false}
              checked={true}
              style={{
                  position:"absolute",
                  margin: `22px 60px`
              }}
            /> */}
        </main>
        )
    }
  }