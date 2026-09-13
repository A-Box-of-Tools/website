/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{examplePdfFile}from'./shared/example-pdf.js?v=39a464ea0b';
export function makeExample(){
return examplePdfFile('example-statement.pdf',{pages:3,ledger:true});
}
