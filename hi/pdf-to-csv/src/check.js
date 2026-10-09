/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseAmount}from'./values.js?v=d4c7e8c12a';
const EPSILON=0.005;
const RECOGNISE=0.5;
const MIN_LINKS=3;
export function checkBalance(rows,money,mark){
if(rows.length<MIN_LINKS+1)return null;
let best=null;
for(const balance of money){
const others=money.filter((at)=>at!==balance);
for(const amount of others){
const proof=follow(rows,balance,[amount],false,mark);
if(better(proof,best))best=proof;
}
for(const debit of others){
for(const credit of others){
if(debit===credit)continue;
const proof=follow(rows,balance,[debit,credit],true,mark);
if(better(proof,best))best=proof;
}
}
}
if(!best||best.held<2||best.held<best.links*RECOGNISE)return null;
return best;
}
function better(proof,best){
if(!proof)return false;
if(!best)return true;
if(proof.held!==best.held)return proof.held>best.held;
return proof.links>best.links;
}
function follow(rows,balance,amounts,credited,mark){
let previous=null;
let carried=0;
let links=0;
let held=0;
const broken=[];
for(let at=0;at<rows.length;at+=1){
const cells=rows[at].cells;
const value=credited
?(parseAmount(cells[amounts[1]],mark)??0)-(parseAmount(cells[amounts[0]],mark)??0)
:parseAmount(cells[amounts[0]],mark)??0;
carried+=value;
const here=parseAmount(cells[balance],mark);
if(here===null)continue;
if(previous!==null){
links+=1;
if(Math.abs(here-previous-carried)<=EPSILON)held+=1;
else broken.push(at+1);
}
previous=here;
carried=0;
}
if(links<MIN_LINKS)return null;
return{balance,amounts,credited,links,held,broken};
}
