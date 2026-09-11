/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{examplePdfFile}from'./shared/example-pdf.js?v=39978eb31e';
export function makeExample(){
return[
examplePdfFile('example-a.pdf',{pages:3}),
examplePdfFile('example-b.pdf',{pages:4}),
examplePdfFile('example-c.pdf',{pages:5}),
];
}
