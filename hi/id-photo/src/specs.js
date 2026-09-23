/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const BACKGROUNDS={
white:{id:'white',hex:'#ffffff',tolerance:14},
'off-white':{id:'off-white',hex:'#f6f4f0',tolerance:18},
'light-grey':{id:'light-grey',hex:'#dcdcdc',tolerance:20},
cream:{id:'cream',hex:'#ebe4d7',tolerance:22},
};
const mmBand=(minMm,maxMm,frameMm)=>({
min:minMm/frameMm,
max:maxMm/frameMm,
minMm,
maxMm,
});
const band=(min,max,advisory=false)=>({min,max,advisory});
export const ICAO_HEAD=band(0.70,0.80);
export const ICAO_EYE=band(0.50,0.60);
export const SPECS=[
{
id:'icao',
country:'country.icao',
document:'spec.icao.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:ICAO_HEAD,
eye:ICAO_EYE,
background:'light-grey',
digital:{
label:'spec.icao.upload',
width:{min:413},
height:{min:531},
bytes:{},
format:'image/jpeg',
},
notes:['spec.icao.note1','spec.icao.note2'],
source:{
authority:'International Civil Aviation Organization',
document:'Doc 9303, Machine Readable Travel Documents, Part 3',
checked:'2026-08-20',
},
},
{
id:'us-passport',
country:'country.us',
document:'spec.us-passport.doc',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'off-white',
digital:{
label:'spec.us-passport.upload',
width:{min:600,max:1200},
height:{min:600,max:1200},
bytes:{max:240*1024},
format:'image/jpeg',
},
notes:[
'spec.us-passport.note1',
'spec.us-passport.note2',
'spec.us-passport.note3',
],
source:{
authority:'U.S. Department of State',
document:'travel.state.gov, Photo Requirements',
checked:'2026-08-20',
},
},
{
id:'us-dv',
country:'country.us',
document:'spec.us-dv.doc',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'off-white',
digital:{
label:'spec.us-dv.upload',
width:{exact:600},
height:{exact:600},
bytes:{max:240*1024},
format:'image/jpeg',
},
notes:['spec.us-dv.note1','spec.us-dv.note2'],
source:{
authority:'U.S. Department of State',
document:'dvprogram.state.gov, Photo Requirements',
checked:'2026-08-20',
},
},
{
id:'uk-passport',
country:'country.uk',
document:'spec.uk-passport.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(29,34,45),
eye:ICAO_EYE,
background:'cream',
digital:{
label:'spec.uk-passport.upload',
width:{min:600},
height:{min:750},
bytes:{min:50*1024,max:10*1024*1024},
format:'image/jpeg',
},
notes:['spec.uk-passport.note1','spec.uk-passport.note2'],
source:{
authority:'HM Passport Office',
document:'gov.uk, Passport photo requirements',
checked:'2026-08-20',
},
},
{
id:'schengen',
country:'country.schengen',
document:'spec.schengen.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:['spec.schengen.note1','spec.schengen.note2'],
source:{
authority:'European Commission',
document:'Visa Code, common photograph standards (ICAO-aligned)',
checked:'2026-08-20',
},
},
{
id:'de-passport',
country:'country.de',
document:'spec.de-passport.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:['spec.de-passport.note1','spec.de-passport.note2'],
source:{
authority:'Bundesministerium des Innern',
document:'Passbildschablone / biometric photo template',
checked:'2026-08-20',
},
},
{
id:'ca-passport',
country:'country.ca',
document:'spec.ca-passport.doc',
kind:'portrait',
print:{widthMm:50,heightMm:70,dpi:300},
head:mmBand(31,36,70),
eye:band(0.55,0.72,true),
background:'white',
digital:null,
notes:[
'spec.ca-passport.note1',
'spec.ca-passport.note2',
'spec.ca-passport.note3',
],
source:{
authority:'Immigration, Refugees and Citizenship Canada',
document:'canada.ca, Photo requirements for passports',
checked:'2026-08-20',
},
},
{
id:'au-passport',
country:'country.au',
document:'spec.au-passport.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:['spec.au-passport.note1','spec.au-passport.note2'],
source:{
authority:'Australian Passport Office',
document:'passports.gov.au, Photo guidelines',
checked:'2026-08-20',
},
},
{
id:'in-passport',
country:'country.in',
document:'spec.in-passport.doc',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'white',
digital:null,
notes:['spec.in-passport.note1','spec.in-passport.note2'],
source:{
authority:'Ministry of External Affairs',
document:'Passport Seva, photo specifications',
checked:'2026-08-20',
},
},
{
id:'in-print-35x45',
country:'country.in',
document:'spec.in-print-35x45.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(30,36,45),
eye:ICAO_EYE,
background:'white',
digital:null,
notes:['spec.in-print-35x45.note1','spec.in-print-35x45.note2'],
source:{
authority:'source.common',
document:'source.common.doc',
checked:'2026-08-20',
},
},
{
id:'in-exam-photo',
country:'country.in',
document:'spec.in-exam-photo.doc',
kind:'portrait',
print:null,
head:band(0.60,0.80,true),
eye:band(0.52,0.68,true),
background:'white',
digital:{
label:'spec.in-exam-photo.upload',
width:{exact:200},
height:{exact:230},
bytes:{min:20*1024,max:50*1024},
format:'image/jpeg',
},
notes:[
'spec.in-exam-photo.note1',
'spec.in-exam-photo.note2',
'spec.in-exam-photo.note3',
],
source:{
authority:'Staff Selection Commission / UPSC',
document:'Notice of Examination, photograph and signature specifications',
checked:'2026-08-20',
},
},
{
id:'in-exam-signature',
country:'country.in',
document:'spec.in-exam-signature.doc',
kind:'signature',
print:null,
head:band(0,1,true),
eye:band(0,1,true),
background:'white',
digital:{
label:'spec.in-exam-signature.upload',
width:{exact:140},
height:{exact:60},
bytes:{min:10*1024,max:20*1024},
format:'image/jpeg',
},
notes:[
'spec.in-exam-signature.note1',
'spec.in-exam-signature.note2',
'spec.in-exam-signature.note3',
],
source:{
authority:'Staff Selection Commission / UPSC',
document:'Notice of Examination, photograph and signature specifications',
checked:'2026-08-20',
},
},
{
id:'cn-passport',
country:'country.cn',
document:'spec.cn-passport.doc',
kind:'portrait',
print:{widthMm:33,heightMm:48,dpi:300},
head:mmBand(28,33,48),
eye:band(0.50,0.62,true),
background:'white',
digital:{
label:'spec.cn-passport.upload',
width:{exact:354},
height:{exact:472},
bytes:{min:40*1024,max:120*1024},
format:'image/jpeg',
},
notes:['spec.cn-passport.note1','spec.cn-passport.note2'],
source:{
authority:'National Immigration Administration',
document:'Published photograph standard for exit and entry documents',
checked:'2026-08-20',
},
},
{
id:'jp-passport',
country:'country.jp',
document:'spec.jp-passport.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:band(0.53,0.64,true),
background:'off-white',
digital:null,
notes:['spec.jp-passport.note1','spec.jp-passport.note2'],
source:{
authority:'Ministry of Foreign Affairs of Japan',
document:'Passport photograph standards',
checked:'2026-08-20',
},
},
{
id:'custom',
country:'country.other',
document:'spec.custom.doc',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:ICAO_HEAD,
eye:ICAO_EYE,
background:'white',
digital:{
label:'spec.custom.upload',
width:{exact:413},
height:{exact:531},
bytes:{max:200*1024},
format:'image/jpeg',
},
notes:['spec.custom.note1','spec.custom.note2'],
source:{
authority:'source.you',
document:'source.you.doc',
checked:'',
},
},
];
const BY_ID=new Map(SPECS.map((spec)=>[spec.id,spec]));
export const specById=(id)=>BY_ID.get(id)??SPECS[0];
export function specsByCountry(){
const groups=[];
for(const spec of SPECS){
let group=groups.find((entry)=>entry.country===spec.country);
if(!group){
group={country:spec.country,specs:[]};
groups.push(group);
}
group.specs.push(spec);
}
return groups;
}
export function backgroundOf(spec,t){
const found=BACKGROUNDS[spec.background]??BACKGROUNDS.white;
return{
...found,
label:t(`bg.${found.id}.label`),
inline:t(`bg.${found.id}.inline`),
note:t(`bg.${found.id}.note`),
};
}
export function portalPixels(spec){
const digital=spec.digital;
if(!digital)return null;
const side=(axis)=>axis.exact??axis.min??axis.max??null;
const width=side(digital.width);
const height=side(digital.height);
return width&&height?{width,height}:null;
}
export function portalBytes(spec){
const bytes=spec.digital?.bytes??{};
return{min:bytes.min??0,max:bytes.max??Infinity};
}
export function printLabel(spec,t){
if(!spec.print)return t('print.none');
const{widthMm,heightMm,dpi}=spec.print;
return t('print.size',{width:trim(widthMm),height:trim(heightMm),dpi});
}
export function pixelLabel(spec,t){
const digital=spec.digital;
if(!digital)return null;
const axis=(value)=>(value.exact?`${value.exact}`:value.min?`${value.min}+`:'-');
if(digital.width.exact&&digital.height.exact){
return t('px.exact',{width:digital.width.exact,height:digital.height.exact});
}
if(digital.width.max||digital.height.max){
return t('px.upto',{
width:axis(digital.width),
height:axis(digital.height),
maxWidth:digital.width.max??'?',
maxHeight:digital.height.max??'?',
});
}
return t('px.least',{width:digital.width.min,height:digital.height.min});
}
export function trim(mm){
return String(Math.round(mm*10)/10);
}
export function withCustom(spec,values){
const heightMm=positive(values.heightMm)??spec.print?.heightMm??45;
const widthMm=positive(values.widthMm)??spec.print?.widthMm??35;
const dpi=positive(values.dpi)??spec.print?.dpi??300;
const headMinMm=positive(values.headMinMm)??heightMm*spec.head.min;
const headMaxMm=positive(values.headMaxMm)??heightMm*spec.head.max;
return{
...spec,
print:{widthMm,heightMm,dpi},
head:mmBand(Math.min(headMinMm,headMaxMm),Math.max(headMinMm,headMaxMm),heightMm),
background:BACKGROUNDS[values.background]?values.background:spec.background,
digital:{
...spec.digital,
width:{exact:positive(values.pxWidth)??spec.digital.width.exact},
height:{exact:positive(values.pxHeight)??spec.digital.height.exact},
bytes:{
min:values.minKb?Math.round(values.minKb*1024):undefined,
max:values.maxKb?Math.round(values.maxKb*1024):undefined,
},
format:'image/jpeg',
},
};
}
function positive(value){
const number=Number.parseFloat(value);
return Number.isFinite(number)&&number>0?number:null;
}
