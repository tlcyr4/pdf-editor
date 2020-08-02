import {extname} from 'path';
import React from 'react';
import {mergeStyleSets, CommandBar, DetailsList, CheckboxVisibility, IDragDropEvents} from '@fluentui/react';
import {Depths} from '@uifabric/fluent-theme';
import { IDocumentItem, IListViewProps }from './ListViewTypes';
import {IDocument} from './PDFEditorTypes';




const classNames = mergeStyleSets({
    fileIconHeaderIcon: {
      padding: 0,
      fontSize: '16px',
    },
    fileIconCell: {
      textAlign: 'center',
      selectors: {
        '&:before': {
          content: '.',
          display: 'inline-block',
          verticalAlign: 'middle',
          height: '100%',
          width: '0px',
          visibility: 'hidden',
        },
      },
    },
    fileIconImg: {
      verticalAlign: 'middle',
      maxHeight: '16px',
      maxWidth: '16px',
    },
    controlWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    exampleToggle: {
      display: 'inline-block',
      marginBottom: '10px',
      marginRight: '30px',
    },
    selectionDetails: {
      marginBottom: '20px',
    },
  });


const columns = [
    {
      key: 'column1',
      name: 'File Type',
      className: classNames.fileIconCell,
      iconClassName: classNames.fileIconHeaderIcon,
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth:16,
      maxWidth:16,
      onRender: (item: IDocumentItem) => {
        return <img src={item.iconName} className={classNames.fileIconImg} alt={item.fileType + ' file icon'} />;
      }
    },
    {
      key: 'column2',
      name: '文件名',
      fieldName: 'name',
      minWidth: 280,
      maxWidth: 440,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    // {
    //   key: 'column3',
    //   name: '文件大小',
    //   fieldName: 'fileSizeRaw',
    //   minWidth: 70,
    //   maxWidth: 90,
    //   isResizable: true,
    //   isCollapsible: true,
    //   data: 'number',
    //   onRender: (item:IDocumentItem) => {
    //     return <span>{item.fileSize}</span>;
    //   },
    // },
    {
      key: 'column4',
      name: '頁數',
      fieldName: 'pageCount',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      data: 'number',
      onRender: (item:IDocumentItem) => {
        return <span>{item.pageCount}</span>;
      },
    },
  ]

function url(docType:string) {
    switch (docType) {
        case 'png':
        case 'jpg':
        case 'jpeg':
            docType = 'photo';
            break;
        default:
            break;
    }
    return `https://static2.sharepointonline.com/files/fabric/assets/item-types/16/${docType}.svg`;
}



export default function ListView(props:IListViewProps) {
    // let [dragItemKey,setDragItemKey] = useState(null);
    let dragItemKey: string | null = null;
    function onActiveItemChanged(item:IDocumentItem) {
        props.setActiveDoc(item.key);
    }
    function itemOfDoc(doc:IDocument) :IDocumentItem {
        let name = doc.name;
        let docType = extname(name).replace('.','');
        let fileSizeRaw = doc.file.size;
        return {
            key: doc.key,
            name: name,
            value: name,
            iconName: url(docType),
            fileType: docType,
            fileSize: `${Math.round(fileSizeRaw / 1000)} KB`,
            fileSizeRaw: fileSizeRaw,
            pageCount: doc.pdfDoc.getPageCount()
        }
    }
    let dragDropEvents : IDragDropEvents = {
      canDrag: () => true,
      canDrop: () => true,
      onDragStart: (item ,e) => {
        // debugger;
        dragItemKey = item.key;
      },
      onDrop: (item, e) => {
        // debugger;
        console.log(`dragging ${dragItemKey} onto ${item.key}`);
        if (dragItemKey !== null) {
          console.log('running insertion');
          props.insertAt(dragItemKey,item.key);
        } else {
          debugger;
        }
      }
    };

    const _commands = [
      {
          key: 'upload',
          text: '添加文件',
          iconProps: { iconName: 'Add' },
          onClick: () => {
            let inputTag = document.getElementById("file-input");
            if (inputTag) {
              inputTag.click();
            }
          }
        },
        {
          key: 'download',
          text: '下載所有文件',
          iconProps: { iconName: 'BuildQueue' },
          onClick: props.merge,
        },
        {
          key: 'delete',
          text: ' 刪除所選文件',
          iconProps: { iconName: 'Clear' },
          onClick: props.deleteDoc,
        },
    ];
    return (
      <div style={{width: "100%", height: "100%", boxSizing: "border-box", paddingLeft: "60px", boxShadow: Depths.depth64}}>
        <input
          type="file"
          id="file-input"
          onChange={props.addFiles}
          style={{display:"none"}}
          accept='image/*,.pdf'
          multiple={true}
        />
        <CommandBar
          items={_commands}
          style={{
            display:"flex",
            flexDirection:"row",
            justifyContent:"center",
            paddingTop: "16px"
          }}/>
        <DetailsList
          items={props.documents.map(itemOfDoc)}
          columns={columns}
          checkboxVisibility={CheckboxVisibility.hidden}
          onActiveItemChanged={onActiveItemChanged}
          dragDropEvents={dragDropEvents}
        />
      </div>
    )
  }