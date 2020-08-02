import {PDFDocument} from 'pdf-lib';

export interface IDocument {
    name:string;
    file: File;
    key:string;
    pdfDoc:PDFDocument;
  }