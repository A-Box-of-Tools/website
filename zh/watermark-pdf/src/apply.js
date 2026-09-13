/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{Name,PdfStream,Ref}from'./shared/pdf-objects.js?v=9e054b3571';
import{readPages}from'./shared/pdf-pages.js?v=9e054b3571';
import{contentFor,placements,visibleSize,visibleToUser}from'./stamp.js?v=9e054b3571';
export const NAMES={image:'AbxWmImg',state:'AbxWmGs'};
export function stampDocument(doc,image,settings){
const pages=readPages(doc);
const chosen=settings.firstPageOnly?pages.slice(0,1):pages;
if(chosen.length===0)return{pages:0,stamps:0};
const imageRef=addImage(doc,image);
const stateRef=addObject(doc,new Map([
['Type',new Name('ExtGState')],
['ca',settings.opacity],
['CA',settings.opacity],
]));
const openRef=addObject(doc,textStream('q\n'));
let stamps=0;
const aspect=image.width/image.height;
for(const page of chosen){
const visible=visibleSize(page.rotate,page.box);
const spots=placements(visible,aspect,settings);
stamps+=spots.length;
const drawing=contentFor(spots,visibleToUser(page.rotate,page.box),NAMES);
const existing=page.dict.get('Contents');
const list=existing===undefined
?[]
:Array.isArray(doc.resolve(existing))?[...doc.resolve(existing)]:[existing];
const closing=list.length?'\nQ\n':'';
const drawRef=addObject(doc,textStream(closing+drawing));
page.dict.set('Contents',list.length?[openRef,...list,drawRef]:[drawRef]);
const resources=ownResources(doc,page);
subDictionary(doc,resources,'XObject').set(NAMES.image,imageRef);
subDictionary(doc,resources,'ExtGState').set(NAMES.state,stateRef);
}
return{pages:chosen.length,stamps};
}
export async function carriesStamp(doc,page,decode){
const resources=doc.resolve(page.dict.get('Resources')??page.inherited.get('Resources'));
const xobjects=resources instanceof Map?doc.resolve(resources.get('XObject')):null;
if(!(xobjects instanceof Map)||!xobjects.has(NAMES.image))return false;
const contents=doc.resolve(page.dict.get('Contents'));
const last=Array.isArray(contents)?doc.resolve(contents[contents.length-1]):contents;
if(!(last instanceof PdfStream))return false;
const text=await decode(last);
return text.includes(`/${NAMES.image} Do`);
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
if(own instanceof Map)return own;
const source=doc.resolve(own??page.inherited.get('Resources'));
const copy=source instanceof Map?new Map(source):new Map();
page.dict.set('Resources',copy);
return copy;
}
function subDictionary(doc,resources,key){
const value=resources.get(key);
if(value instanceof Map)return value;
const source=doc.resolve(value);
const copy=source instanceof Map?new Map(source):new Map();
resources.set(key,copy);
return copy;
}
