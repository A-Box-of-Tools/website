/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function messageBox(element,{onShow}={}){
return{
show(message){
element.textContent=message;
element.hidden=false;
onShow?.();
},
clear(){
element.textContent='';
element.hidden=true;
},
};
}
