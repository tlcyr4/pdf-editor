import { IContextualMenuItem } from '@fluentui/react';

export interface IDocumentItem {
    key:string;
    name:string;
    value:string;
    fileType:string;
    iconName:string;
    fileSize:string;
    pageCount:number;
    fileSizeRaw:number;
  }


  export interface IListViewProps {
    setActiveDoc: (key: string) => void;
    merge: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem) => boolean | void;
    deleteDoc: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem) => boolean | void;
    addFiles: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    insertAt: (srcKey: string,dstKey:string) => void;
    documents: any[];
  }