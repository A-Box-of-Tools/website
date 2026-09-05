/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{OBJECTS}from'./objects.js?v=c0afd74cac';
import{TRACED}from'./traced.js?v=c0afd74cac';
export const SHAPES=[
...Object.entries(TRACED).map(([id,art])=>({
id,
label:`shape.${id}`,
width:art.width,
inner:art.inner,
paths:art.paths,
markup:art.paths.map((d)=>`<path d="${d}"/>`).join(''),
defaultCm:art.defaultCm,
})),
{
id:'object',
label:'shape.object',
width:0.6,
inner:null,
paths:null,
markup:null,
defaultCm:0,
},
];
const BY_ID=new Map(SHAPES.map((shape)=>[shape.id,shape]));
export function objectShape(id){
const art=OBJECTS[id];
if(!art)return BY_ID.get('object');
const{x,y,width,height}=art.box;
return{
id:'object',
label:'shape.object',
width:width/height,
inner:`scale(${1 / width} ${1 / height}) translate(${-(x + width / 2)} ${-y})`,
paths:null,
markup:art.markup,
stretch:true,
defaultCm:0,
};
}
export function shapeOf(id){
return BY_ID.get(id)??SHAPES[0];
}
