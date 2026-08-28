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
country:'ICAO standard',
document:'Any biometric travel document',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:ICAO_HEAD,
eye:ICAO_EYE,
background:'light-grey',
digital:{
label:'Machine-readable capture',
width:{min:413},
height:{min:531},
bytes:{},
format:'image/jpeg',
},
notes:[
'The 35 x 45 mm frame is what most of the world issues against, and 70-80 per '
+'cent head height with the eye line between half and three-fifths of the way '
+'up is the geometry every specification below is a variation of.',
'Doc 9303 also asks for at least 90 pixels between the centres of the eyes in '
+'the stored image, which a 413 x 531 crop of a modern phone photograph clears '
+'comfortably.',
],
source:{
authority:'International Civil Aviation Organization',
document:'Doc 9303, Machine Readable Travel Documents, Part 3',
checked:'2026-08-20',
},
},
{
id:'us-passport',
country:'United States',
document:'Passport, visa and green card',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'off-white',
digital:{
label:'Online photo upload',
width:{min:600,max:1200},
height:{min:600,max:1200},
bytes:{max:240*1024},
format:'image/jpeg',
},
notes:[
'Square, and the only square passport photograph in wide use: 2 x 2 inches, '
+'which is 51 x 51 mm.',
'The head may sit anywhere from 25 to 35 mm, a far wider window than the ICAO '
+'rule, and the eye line is measured from the bottom edge rather than as a '
+'proportion.',
'The uploaded file must be square as well, between 600 and 1200 pixels a side, '
+'and 240 KB is the ceiling the form enforces.',
],
source:{
authority:'U.S. Department of State',
document:'travel.state.gov, Photo Requirements',
checked:'2026-08-20',
},
},
{
id:'us-dv',
country:'United States',
document:'Diversity Visa lottery entry',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'off-white',
digital:{
label:'Entrant Status Check upload',
width:{exact:600},
height:{exact:600},
bytes:{max:240*1024},
format:'image/jpeg',
},
notes:[
'The same photograph as the passport rule above, but the entry form takes one '
+'size and one size only: exactly 600 x 600 pixels, at most 240 KB.',
'An entry rejected for its photograph is not corrected, it is discarded, which '
+'is why this one is worth getting exactly right rather than approximately.',
],
source:{
authority:'U.S. Department of State',
document:'dvprogram.state.gov, Photo Requirements',
checked:'2026-08-20',
},
},
{
id:'uk-passport',
country:'United Kingdom',
document:'Passport',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(29,34,45),
eye:ICAO_EYE,
background:'cream',
digital:{
label:'Digital photo for an online application',
width:{min:600},
height:{min:750},
bytes:{min:50*1024,max:10*1024*1024},
format:'image/jpeg',
},
notes:[
'The head is measured chin to crown and must be between 29 and 34 mm - notably '
+'shorter than the ICAO band, so a photo cropped to the ICAO rule can be '
+'refused here for having too large a head.',
'The digital rule has a floor as well as a ceiling: under 50 KB the upload is '
+'refused for being too small.',
],
source:{
authority:'HM Passport Office',
document:'gov.uk, Passport photo requirements',
checked:'2026-08-20',
},
},
{
id:'schengen',
country:'Schengen area',
document:'Visa application',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:[
'The common visa format used by every Schengen consulate: 35 x 45 mm with the '
+'face filling 70 to 80 per cent of the height, which is 32 to 36 mm.',
'Consulates differ on what they will accept as a background. Plain light grey '
+'is refused by nobody; a white wall with a shadow on it is refused by most.',
],
source:{
authority:'European Commission',
document:'Visa Code, common photograph standards (ICAO-aligned)',
checked:'2026-08-20',
},
},
{
id:'de-passport',
country:'Germany',
document:'Passport and identity card',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:[
'The Bundesdruckerei photo template asks for a face height of 32 to 36 mm in a '
+'35 x 45 mm frame, with the eyes in the upper third.',
'Since 2025 the photograph is normally captured at the issuing office or sent '
+'to it electronically by a photographer, so a print made here is for the '
+'applications that still take one.',
],
source:{
authority:'Bundesministerium des Innern',
document:'Passbildschablone / biometric photo template',
checked:'2026-08-20',
},
},
{
id:'ca-passport',
country:'Canada',
document:'Passport',
kind:'portrait',
print:{widthMm:50,heightMm:70,dpi:300},
head:mmBand(31,36,70),
eye:band(0.55,0.72,true),
background:'white',
digital:null,
notes:[
'The odd one out on shape: 50 x 70 mm, which is taller and narrower in '
+'proportion than anything else here, so a crop made for another country '
+'will not fit it.',
'Face height is 31 to 36 mm measured chin to crown. Canada publishes no eye '
+'line, so the band shown here is the one that follows from the head sitting '
+'centred in the frame; treat it as guidance rather than as a rule.',
'The photographer must print the date and the studio name on the back, which is '
+'not something any tool can do for you.',
],
source:{
authority:'Immigration, Refugees and Citizenship Canada',
document:'canada.ca, Photo requirements for passports',
checked:'2026-08-20',
},
},
{
id:'au-passport',
country:'Australia',
document:'Passport',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:ICAO_EYE,
background:'light-grey',
digital:null,
notes:[
'A plain, light-coloured background with the face 32 to 36 mm from chin to '
+'crown in a 35 x 45 mm print.',
'Two prints are asked for with a paper application, which is what the sheet '
+'export below is for.',
],
source:{
authority:'Australian Passport Office',
document:'passports.gov.au, Photo guidelines',
checked:'2026-08-20',
},
},
{
id:'in-passport',
country:'India',
document:'Passport',
kind:'portrait',
print:{widthMm:51,heightMm:51,dpi:300},
head:mmBand(25,35,51),
eye:mmBand(28,35,51),
background:'white',
digital:null,
notes:[
'Passport Seva asks for a 2 x 2 inch photograph on a plain white background, '
+'the same frame the United States uses.',
'A 35 x 45 mm print is what most Indian forms mean by "passport size", and it '
+'is a separate entry in this list - the two are not interchangeable.',
],
source:{
authority:'Ministry of External Affairs',
document:'Passport Seva, photo specifications',
checked:'2026-08-20',
},
},
{
id:'in-print-35x45',
country:'India',
document:'Passport-size print for a form',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(30,36,45),
eye:ICAO_EYE,
background:'white',
digital:null,
notes:[
'What a bank, a college or a government form means when it asks for a '
+'"passport size photo" to be pasted on: 35 x 45 mm, white background, head '
+'and shoulders.',
'No authority publishes a head-height band for this, so the ICAO one is applied '
+'and shown as guidance. Nothing measures these with a ruler.',
],
source:{
authority:'Common practice',
document:'The 35 x 45 mm stationer standard, not a published rule',
checked:'2026-08-20',
},
},
{
id:'in-exam-photo',
country:'India',
document:'SSC / UPSC online form photo',
kind:'portrait',
print:null,
head:band(0.60,0.80,true),
eye:band(0.52,0.68,true),
background:'white',
digital:{
label:'Online application photo',
width:{exact:200},
height:{exact:230},
bytes:{min:20*1024,max:50*1024},
format:'image/jpeg',
},
notes:[
'The rule these forms actually enforce is three numbers: 200 x 230 pixels, '
+'JPEG, and between 20 and 50 KB. Both ends are checked - a 12 KB file is '
+'refused for being too small exactly as a 60 KB one is refused for being '
+'too large.',
'The head-and-shoulders framing is described in words rather than measured, so '
+'the bands here are guidance drawn from the sample images on the forms.',
'There is no print size, because there is nothing to print: this is a file for '
+'a web form. The sheet export is switched off for it.',
],
source:{
authority:'Staff Selection Commission / UPSC',
document:'Notice of Examination, photograph and signature specifications',
checked:'2026-08-20',
},
},
{
id:'in-exam-signature',
country:'India',
document:'SSC / UPSC online form signature',
kind:'signature',
print:null,
head:band(0,1,true),
eye:band(0,1,true),
background:'white',
digital:{
label:'Online application signature',
width:{exact:140},
height:{exact:60},
bytes:{min:10*1024,max:20*1024},
format:'image/jpeg',
},
notes:[
'Not a portrait at all: a signature written in black or dark blue ink on white '
+'paper, photographed or scanned, cropped to 140 x 60 pixels and saved as a '
+'JPEG between 10 and 20 KB.',
'The head and eye overlay is switched off for this one. What is checked instead '
+'is that the paper is light, that there is ink on it, and that the ink is '
+'not so faint the form will read it as blank.',
'A 140 x 60 crop of a signature is 8400 pixels. Reaching 10 KB is the hard part '
+'of this specification, not staying under 20 - see the padding note on the '
+'page.',
],
source:{
authority:'Staff Selection Commission / UPSC',
document:'Notice of Examination, photograph and signature specifications',
checked:'2026-08-20',
},
},
{
id:'cn-passport',
country:'China',
document:'Passport and visa',
kind:'portrait',
print:{widthMm:33,heightMm:48,dpi:300},
head:mmBand(28,33,48),
eye:band(0.50,0.62,true),
background:'white',
digital:{
label:'Online visa application upload',
width:{exact:354},
height:{exact:472},
bytes:{min:40*1024,max:120*1024},
format:'image/jpeg',
},
notes:[
'A 33 x 48 mm frame, which is narrower than the 35 x 45 used almost everywhere '
+'else, with the head 28 to 33 mm from chin to crown.',
'The upload has a floor as well as a ceiling - 40 KB to 120 KB at exactly '
+'354 x 472 pixels, which is that same frame at 272 dpi.',
],
source:{
authority:'National Immigration Administration',
document:'Published photograph standard for exit and entry documents',
checked:'2026-08-20',
},
},
{
id:'jp-passport',
country:'Japan',
document:'Passport',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:mmBand(32,36,45),
eye:band(0.53,0.64,true),
background:'off-white',
digital:null,
notes:[
'A 35 x 45 mm print with the face 34 mm from chin to crown, give or take 2 mm, '
+'and 4 to 6 mm of clear space above the head.',
'The clearance above the head is stated as its own rule here rather than being '
+'implied by the head height, which is why the eye band shown is guidance.',
],
source:{
authority:'Ministry of Foreign Affairs of Japan',
document:'Passport photograph standards',
checked:'2026-08-20',
},
},
{
id:'custom',
country:'Anywhere else',
document:'Type the numbers yourself',
kind:'portrait',
print:{widthMm:35,heightMm:45,dpi:300},
head:ICAO_HEAD,
eye:ICAO_EYE,
background:'white',
digital:{
label:'Whatever the form asks for',
width:{exact:413},
height:{exact:531},
bytes:{max:200*1024},
format:'image/jpeg',
},
notes:[
'Every figure on this one is editable. Put in what the form in front of you '
+'says, and the overlay, the print and the file-size search all follow it.',
'It starts on the ICAO geometry, because a country not on the list above is '
+'far more likely to be using that than anything else.',
],
source:{
authority:'You',
document:'Whatever you were sent',
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
export function printLabel(spec){
if(!spec.print)return'no print size - this rule is for a web form';
const{widthMm,heightMm,dpi}=spec.print;
return`${trim(widthMm)} x ${trim(heightMm)} mm at ${dpi} dpi`;
}
export function pixelLabel(spec){
const digital=spec.digital;
if(!digital)return null;
const axis=(value)=>(value.exact?`${value.exact}`:value.min?`${value.min}+`:'-');
if(digital.width.exact&&digital.height.exact){
return`exactly ${digital.width.exact} x ${digital.height.exact} px`;
}
if(digital.width.max||digital.height.max){
return`${axis(digital.width)} x ${axis(digital.height)} px, up to `
+`${digital.width.max ?? '?'} x ${digital.height.max ?? '?'}`;
}
return`at least ${digital.width.min} x ${digital.height.min} px`;
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
