/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Name,PdfStream,Ref}from'./shared/pdf-objects.js?v=ceec396e4e';
import{readPages}from'./shared/pdf-pages.js?v=ceec396e4e';
import{contentFor,placements,visibleSize,visibleToUser}from'./stamp.js?v=ceec396e4e';
export const NAMES={image:'AbxWmImg',state:'AbxWmGs'};
export function stampDocument(doc,image,settings){
const pages=readPages(doc);
const chosen=settings.firstPageOnly?pages.slice(0,1):pages;
if(chosen.length===0)return{pages:0,stamps:0,names:[]};
const imageRef=addImage(doc,image);
const stateRef=addObject(doc,new Map([
['Type',new Name('ExtGState')],
['ca',settings.opacity],
['CA',settings.opacity],
]));
const openRef=addObject(doc,textStream('q\n'));
let stamps=0;
const names=[];
const aspect=image.width/image.height;
for(const page of chosen){
const resources=ownResources(doc,page);
const images=subDictionary(doc,resources,'XObject');
const states=subDictionary(doc,resources,'ExtGState');
const allocated={image:unusedName(images,NAMES.image),state:unusedName(states,NAMES.state)};
names.push(allocated);
const visible=visibleSize(page.rotate,page.visibleBox);
const spots=placements(visible,aspect,settings);
stamps+=spots.length;
const drawing=contentFor(spots,visibleToUser(page.rotate,page.visibleBox),allocated);
const existing=page.dict.get('Contents');
const list=existing===undefined
?[]
:Array.isArray(doc.resolve(existing))?[...doc.resolve(existing)]:[existing];
const closing=list.length?'\nQ\n':'';
const drawRef=addObject(doc,textStream(closing+drawing));
page.dict.set('Contents',list.length?[openRef,...list,drawRef]:[drawRef]);
images.set(allocated.image,imageRef);
states.set(allocated.state,stateRef);
}
return{pages:chosen.length,stamps,names};
}
export async function carriesStamp(doc,page,decode,names=NAMES){
const resources=doc.resolve(page.dict.get('Resources')??page.inherited.get('Resources'));
const xobjects=resources instanceof Map?doc.resolve(resources.get('XObject')):null;
const states=resources instanceof Map?doc.resolve(resources.get('ExtGState')):null;
if(!(xobjects instanceof Map)||!xobjects.has(names.image)
||!(states instanceof Map)||!states.has(names.state))return false;
const contents=doc.resolve(page.dict.get('Contents'));
const last=Array.isArray(contents)?doc.resolve(contents[contents.length-1]):contents;
if(!(last instanceof PdfStream))return false;
const text=await decode(last);
return text.includes(`/${names.image} Do`)&&text.includes(`/${names.state} gs`);
}
function addImage(doc,image){
const maskRef=addObject(doc,new PdfStream(new Map([
['Type',new Name('XObject')],
['Subtype',new Name('Image')],
['Width',image.width],
['Height',image.height],
['ColorSpace',new Name('DeviceGray')],
['BitsPerComponent',8],
['Length',image.alpha.length],
]),image.alpha));
return addObject(doc,new PdfStream(new Map([
['Type',new Name('XObject')],
['Subtype',new Name('Image')],
['Width',image.width],
['Height',image.height],
['ColorSpace',new Name('DeviceRGB')],
['BitsPerComponent',8],
['SMask',maskRef],
['Length',image.rgb.length],
]),image.rgb));
}
function textStream(text){
const bytes=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)bytes[i]=text.charCodeAt(i)&0xff;
return new PdfStream(new Map([['Length',bytes.length]]),bytes);
}
function addObject(doc,value){
let number=1;
for(const key of doc.objects.keys())if(key>=number)number=key+1;
for(const key of doc.entries.keys())if(key>=number)number=key+1;
doc.objects.set(number,value);
return new Ref(number,0);
}
function ownResources(doc,page){
const own=page.dict.get('Resources');
const source=doc.resolve(own??page.inherited.get('Resources'));
const copy=source instanceof Map?new Map(source):new Map();
page.dict.set('Resources',copy);
return copy;
}
function subDictionary(doc,resources,key){
const value=resources.get(key);
const source=doc.resolve(value);
const copy=source instanceof Map?new Map(source):new Map();
resources.set(key,copy);
return copy;
}
function unusedName(dictionary,base){
let name=base;
for(let suffix=1;dictionary.has(name);suffix+=1)name=`${base}${suffix}`;
return name;
}
