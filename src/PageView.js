import React from 'react';
import { CommandBar, Spinner } from '@fluentui/react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import { Document, Page, pdfjs } from 'react-pdf';
import './PageView.css';
import useWindowDimensions from './utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  
function clamp(i,min,max) {
    return i < min ? min : i > max ? max : i;
}

export default function PageView(props) {
    const { width } = useWindowDimensions();
    
    let pageIndex = props.pageIndex;
    let setPageIndex = props.setPageIndex;
    if (props.doc === null) {
        return (<div></div>)
    }
    let pageCount = props.doc.pdfDoc.getPageCount();
    
    const _commands = [
        {
            key: 'pageUp',
            text: '上一頁',
            iconProps: { iconName: 'Up' },
            onClick:() => setPageIndex(clamp(pageIndex - 1,0,pageCount - 1))
        },
        {
            key: 'deletePage',
            text: ' 刪除當前頁面',
            iconProps: { iconName: 'Clear' },
            onClick: () => {
                if (pageCount === 1) {
                    props.deleteDoc();
                } else {
                    props.deletePage(pageIndex);
                    setPageIndex(clamp(pageIndex, 0, pageCount - 2))
                }
            },
        },
        {
            key: 'pageDown',
            text: '下一頁',
            iconProps: { iconName: 'Down' },
            onClick:() => setPageIndex(clamp(pageIndex + 1, 0 ,pageCount - 1))
        },
    ];
    return (
      <div style={{width: "100%", height: "100%", boxSizing: "border-box"}}>
        <div style={{
          display:"flex",
          flexDirection:"row",
          justifyContent:"space-between",
              padding: `16px ${width * .05}px 0px`,
              alignItems:"center"
          }}>
          <div style={{
          display:"flex",
          flexDirection:"row",
          }}>
            {pageIndex + 1} / {pageCount}
          </div>
          <CommandBar
            items={_commands}
            style={{
              display:"flex",
              flexDirection:"row",
            }}/>
        </div>
        <div>
            <Document
            className='document'
              file={props.doc.file}
              loading={<Spinner label="Loading"/>}>
                <Page
                className='page ms-depth-64'
                pageIndex={pageIndex}
                width={width * 0.4}
                style={{boxShadow:Depths.depth64,marginTop:"0px"}}
                />
            </Document>
        </div>
      </div>
    )
  }