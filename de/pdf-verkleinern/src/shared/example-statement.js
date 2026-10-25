/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const HEADINGS=['Date','Reference','Account','Amount'];
export const ROWS=[
['2026-01-04','INV-2026-0184','A. Moreau','1,240.00'],
['2026-01-11','INV-2026-0191','K. Tanaka','318.50'],
['2026-01-18','INV-2026-0207','A. Moreau','2,905.75'],
['2026-02-02','INV-2026-0233','L. Okafor','87.20'],
['2026-02-15','INV-2026-0248','K. Tanaka','1,015.00'],
['2026-02-27','INV-2026-0262','L. Okafor','640.40'],
];
export function rowsFor(page,count=5){
const start=((page-1)*2)%ROWS.length;
return[...ROWS.slice(start),...ROWS.slice(0,start)].slice(0,count);
}
const MOVEMENTS=[
['2026-01-04','INV-2026-0184','A. Moreau',1240.00],
['2026-01-07','DD-2026-0031','Utilities',-86.40],
['2026-01-11','INV-2026-0191','K. Tanaka',318.50],
['2026-01-15','CRD-2026-4417','Stationery',-54.15],
['2026-01-18','INV-2026-0207','A. Moreau',2905.75],
['2026-01-22','DD-2026-0044','Insurance',-212.00],
['2026-01-29','SAL-2026-0011','Payroll',-1860.00],
['2026-02-02','INV-2026-0233','L. Okafor',87.20],
['2026-02-09','CRD-2026-4502','Travel',-143.65],
['2026-02-15','INV-2026-0248','K. Tanaka',1015.00],
['2026-02-19','DD-2026-0058','Utilities',-91.30],
['2026-02-23','CRD-2026-4590','Software',-240.00],
['2026-02-27','INV-2026-0262','L. Okafor',640.40],
['2026-03-02','SAL-2026-0012','Payroll',-1860.00],
['2026-03-06','INV-2026-0274','A. Moreau',1730.85],
];
export const LEDGER_HEADINGS=['Date','Reference','Account','Amount','Balance'];
function money(value){
const text=Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
return value<0?`-${text}`:text;
}
export function ledgerRows(opening=3500){
let balance=opening;
return MOVEMENTS.map(([date,reference,account,amount])=>{
balance=Math.round((balance+amount)*100)/100;
return[date,reference,account,money(amount),money(balance)];
});
}
