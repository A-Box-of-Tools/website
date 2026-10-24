/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{examplePdfFile}from'./shared/example-pdf.js?v=e73a553965';
export function makeExample(name='statement.pdf'){
return examplePdfFile(name,{pages:2});
}
