/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfDocument}from'./shared/pdf-reader.js?v=79d44350d4';
export function documentForExport(input){
const bytes=input.bytes;
const cipher=input.doc.crypt;
return PdfDocument.open(bytes,{unlock:()=>cipher});
}
