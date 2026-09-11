/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{examplePdfFile}from'./shared/example-pdf.js?v=d4c7e8c12a';
export function makeExample(){
return examplePdfFile('example-statement.pdf',{pages:3,ledger:true});
}
