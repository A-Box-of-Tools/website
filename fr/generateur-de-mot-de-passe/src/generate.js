/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{pick,randomInt}from'./random.js';
import{wordlist}from'./wordlist.js';
const LOWER='abcdefghijklmnopqrstuvwxyz';
const UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS='0123456789';
export const SYMBOL_SETS={
full:'!#$%&()*+,-./:;<=>?@[]^_{|}~',
safe:'!@#$%^&*',
};
export const LOOKALIKES='Il1|O0';
function without(chars,remove){
return[...chars].filter((ch)=>!remove.includes(ch)).join('');
}
export function alphabet(options){
const symbols=SYMBOL_SETS[options.symbolSet]??SYMBOL_SETS.full;
const chosen=[
['lower',options.lower?LOWER:''],
['upper',options.upper?UPPER:''],
['digits',options.digits?DIGITS:''],
['symbols',options.symbols?symbols:''],
];
return chosen
.map(([id,chars])=>({
id,
chars:options.avoidLookalikes?without(chars,LOOKALIKES):chars,
}))
.filter((entry)=>entry.chars.length>0);
}
export function classSizes(options){
return alphabet(options).map((entry)=>entry.chars.length);
}
const MAX_ATTEMPTS=1000;
export function password(options){
const classes=alphabet(options);
const length=options.length;
if(classes.length===0)throw new Error('no character classes are switched on');
if(length<1)throw new Error('a password needs a length');
if(options.requireEach&&length<classes.length){
throw new Error(`${length} characters cannot hold one of each of ${classes.length} classes`);
}
const all=classes.map((entry)=>entry.chars).join('');
const members=classes.map((entry)=>new Set(entry.chars));
for(let attempt=0;attempt<MAX_ATTEMPTS;attempt+=1){
const chars=Array.from({length},()=>pick(all));
if(!options.requireEach
||members.every((set)=>chars.some((ch)=>set.has(ch)))){
return chars.join('');
}
}
throw new Error('could not meet the "one of each" rule; loosen the settings');
}
const SEPARATORS={
hyphen:'-',
space:' ',
dot:'.',
underscore:'_',
none:'',
};
function cased(words,style){
if(style==='upper')return words.map((word)=>word.toUpperCase());
if(style==='title'){
return words.map((word)=>word[0].toUpperCase()+word.slice(1));
}
return words;
}
export function phraseChoices(options){
const extras=[];
if(options.separator==='digit'&&options.words>1){
extras.push(...Array(options.words-1).fill(10));
}
if(options.addDigit)extras.push(10);
if(options.addSymbol)extras.push(SYMBOL_SETS.safe.length);
return extras;
}
export function passphrase(options){
const list=wordlist(options.list);
const count=options.words;
if(count<1)throw new Error('a passphrase needs at least one word');
const words=cased(
Array.from({length:count},()=>pick(list)),
options.capitals,
);
const joined=options.separator==='digit'
?words.reduce((text,word,index)=>(
index===0?word:`${text}${randomInt(10)}${word}`))
:words.join(SEPARATORS[options.separator]??'-');
const tail=(options.addDigit?String(randomInt(10)):'')
+(options.addSymbol?pick(SYMBOL_SETS.safe):'');
return joined+tail;
}
export function generate(options){
return options.mode==='passphrase'?passphrase(options):password(options);
}
