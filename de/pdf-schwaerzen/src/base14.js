/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const WIN_ANSI_NAMES=`
space exclam quotedbl numbersign dollar percent ampersand quotesingle
parenleft parenright asterisk plus comma hyphen period slash
zero one two three four five six seven eight nine
colon semicolon less equal greater question at
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
bracketleft backslash bracketright asciicircum underscore grave
a b c d e f g h i j k l m n o p q r s t u v w x y z
braceleft bar braceright asciitilde .
Euro . quotesinglbase florin quotedblbase ellipsis dagger daggerdbl
circumflex perthousand Scaron guilsinglleft OE . Zcaron .
. quoteleft quoteright quotedblleft quotedblright bullet endash emdash
tilde trademark scaron guilsinglright oe . zcaron Ydieresis
space exclamdown cent sterling currency yen brokenbar section
dieresis copyright ordfeminine guillemotleft logicalnot hyphen registered macron
degree plusminus twosuperior threesuperior acute mu paragraph periodcentered
cedilla onesuperior ordmasculine guillemotright onequarter onehalf threequarters questiondown
Agrave Aacute Acircumflex Atilde Adieresis Aring AE Ccedilla
Egrave Eacute Ecircumflex Edieresis Igrave Iacute Icircumflex Idieresis
Eth Ntilde Ograve Oacute Ocircumflex Otilde Odieresis multiply
Oslash Ugrave Uacute Ucircumflex Udieresis Yacute Thorn germandbls
agrave aacute acircumflex atilde adieresis aring ae ccedilla
egrave eacute ecircumflex edieresis igrave iacute icircumflex idieresis
eth ntilde ograve oacute ocircumflex otilde odieresis divide
oslash ugrave uacute ucircumflex udieresis yacute thorn ydieresis`
;
const STANDARD_NAMES=`
space exclam quotedbl numbersign dollar percent ampersand quoteright
parenleft parenright asterisk plus comma hyphen period slash
zero one two three four five six seven eight nine
colon semicolon less equal greater question at
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
bracketleft backslash bracketright asciicircum underscore quoteleft
a b c d e f g h i j k l m n o p q r s t u v w x y z
braceleft bar braceright asciitilde .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. exclamdown cent sterling fraction yen florin section
currency quotesingle quotedblleft guillemotleft guilsinglleft guilsinglright fi fl
. endash dagger daggerdbl periodcentered . paragraph bullet
quotesinglbase quotedblbase quotedblright guillemotright ellipsis perthousand . questiondown
. grave acute circumflex tilde macron breve dotaccent
dieresis . ring cedilla . hungarumlaut ogonek caron
emdash . . . . . . .
. . . . . . . .
. AE . ordfeminine . . . .
Lslash Oslash OE ordmasculine . . . .
. ae . . . dotlessi . .
lslash oslash oe germandbls . . . .`
;
const MAC_ROMAN_NAMES=`
space exclam quotedbl numbersign dollar percent ampersand quotesingle
parenleft parenright asterisk plus comma hyphen period slash
zero one two three four five six seven eight nine
colon semicolon less equal greater question at
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
bracketleft backslash bracketright asciicircum underscore grave
a b c d e f g h i j k l m n o p q r s t u v w x y z
braceleft bar braceright asciitilde .
Adieresis Aring Ccedilla Eacute Ntilde Odieresis Udieresis aacute
agrave acircumflex adieresis atilde aring ccedilla eacute egrave
ecircumflex edieresis iacute igrave icircumflex idieresis ntilde oacute
ograve ocircumflex odieresis otilde uacute ugrave ucircumflex udieresis
dagger degree cent sterling section bullet paragraph germandbls
registered copyright trademark acute dieresis notequal AE Oslash
infinity plusminus lessequal greaterequal yen mu partialdiff summation
product pi integral ordfeminine ordmasculine Omega ae oslash
questiondown exclamdown logicalnot radical florin approxequal Delta guillemotleft
guillemotright ellipsis space Agrave Atilde Otilde OE oe
endash emdash quotedblleft quotedblright quoteleft quoteright divide lozenge
ydieresis Ydieresis fraction currency guilsinglleft guilsinglright fi fl
daggerdbl periodcentered quotesinglbase quotedblbase perthousand Acircumflex Ecircumflex Aacute
Edieresis Egrave Iacute Icircumflex Idieresis Igrave Oacute Ocircumflex
apple Ograve Uacute Ucircumflex Ugrave dotlessi circumflex tilde
macron breve dotaccent ring cedilla hungarumlaut ogonek caron`
;
function encodingFrom(text){
const names=text.trim().split(/\s+/);
const table=new Array(256).fill('');
names.forEach((glyph,index)=>{
if(glyph!=='.')table[index+32]=glyph;
});
return table;
}
export const WIN_ANSI=encodingFrom(WIN_ANSI_NAMES);
export const STANDARD=encodingFrom(STANDARD_NAMES);
export const MAC_ROMAN=encodingFrom(MAC_ROMAN_NAMES);
export function encodingByName(named){
if(named==='WinAnsiEncoding')return WIN_ANSI;
if(named==='MacRomanEncoding')return MAC_ROMAN;
if(named==='StandardEncoding'||named==='MacExpertEncoding')return STANDARD;
return null;
}
const CP1252_HIGH=[
0x20ac,0,0x201a,0x0192,0x201e,0x2026,0x2020,0x2021,
0x02c6,0x2030,0x0160,0x2039,0x0152,0,0x017d,0,
0,0x2018,0x2019,0x201c,0x201d,0x2022,0x2013,0x2014,
0x02dc,0x2122,0x0161,0x203a,0x0153,0,0x017e,0x0178,
];
const NAMED={
fraction:0x2044,fi:0xfb01,fl:0xfb02,Lslash:0x0141,lslash:0x0142,
dotlessi:0x0131,ring:0x02da,breve:0x02d8,dotaccent:0x02d9,
caron:0x02c7,ogonek:0x02db,hungarumlaut:0x02dd,grave:0x0060,
notequal:0x2260,infinity:0x221e,lessequal:0x2264,greaterequal:0x2265,
partialdiff:0x2202,summation:0x2211,product:0x220f,pi:0x03c0,
integral:0x222b,Omega:0x2126,radical:0x221a,approxequal:0x2248,
Delta:0x2206,lozenge:0x25ca,apple:0xf8ff,
};
const GLYPH_TEXT=buildGlyphText();
function buildGlyphText(){
const map=new Map();
for(let code=32;code<256;code+=1){
const glyph=WIN_ANSI[code];
if(!glyph||map.has(glyph))continue;
const value=code<0x80||code>=0xa0?code:CP1252_HIGH[code-0x80];
if(value)map.set(glyph,String.fromCharCode(value));
}
for(const[glyph,value]of Object.entries(NAMED)){
if(!map.has(glyph))map.set(glyph,String.fromCharCode(value));
}
return map;
}
export function glyphText(glyph){
if(!glyph)return'';
const known=GLYPH_TEXT.get(glyph);
if(known!==undefined)return known;
const uni=/^uni([0-9A-Fa-f]{4})/.exec(glyph);
if(uni)return String.fromCharCode(Number.parseInt(uni[1],16));
const u=/^u([0-9A-Fa-f]{4,6})$/.exec(glyph);
if(u)return String.fromCodePoint(Number.parseInt(u[1],16));
const dot=glyph.indexOf('.');
if(dot>0)return glyphText(glyph.slice(0,dot));
return'';
}
const ASCII_WIDTHS={
Helvetica:`278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278
    556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015
    667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722
    667 611 722 667 944 667 667 611 278 278 278 469 556 333
    556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333
    500 278 556 500 722 500 500 500 334 260 334 584`
,
'Helvetica-Bold':`278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278
    556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975
    722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722
    667 611 722 667 944 667 667 611 333 278 333 584 556 333
    556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389
    556 333 611 556 778 556 556 500 389 280 389 584`
,
'Times-Roman':`250 333 408 500 500 833 778 180 333 333 500 564 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 278 278 564 564 564 444 921
    722 667 667 722 611 556 722 722 333 389 722 611 889 722 722 556 722 667
    556 611 722 722 944 722 722 611 333 278 333 469 500 333
    444 500 444 500 444 333 500 500 278 278 500 278 778 500 500 500 500 333
    389 278 500 500 722 500 500 444 480 200 480 541`
,
'Times-Bold':`250 333 555 500 500 1000 833 278 333 333 500 570 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 570 570 570 500 930
    722 667 722 722 667 611 778 778 389 500 778 667 944 722 778 611 778 722
    556 667 722 722 1000 722 722 667 333 278 333 581 500 333
    500 556 444 556 444 333 500 556 278 333 556 278 833 556 500 556 556 444
    389 333 556 500 722 500 500 444 394 220 394 520`
,
'Times-Italic':`250 333 420 500 500 833 778 214 333 333 500 675 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 675 675 675 500 920
    611 611 667 722 611 611 722 722 333 444 667 556 833 667 722 611 722 611
    500 556 722 611 833 611 556 556 389 278 389 422 500 333
    500 500 444 500 444 278 500 500 278 278 444 278 722 500 500 500 500 389
    389 278 500 444 667 444 444 389 400 275 400 541`
,
'Times-BoldItalic':`250 389 555 500 500 833 778 278 333 333 500 570 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 570 570 570 500 832
    667 667 667 722 667 667 722 778 389 500 667 611 889 722 722 611 722 667
    556 611 722 667 889 667 611 611 333 278 333 570 500 333
    500 500 444 500 444 333 500 556 278 278 500 278 778 556 500 500 500 389
    389 278 556 444 667 500 444 389 348 220 348 570`
,
};
const EXTRA_WIDTHS={
Helvetica:`quoteright 222 quoteleft 222 quotedblleft 333 quotedblright 333
    quotesinglbase 222 quotedblbase 333 endash 556 emdash 1000 bullet 350
    ellipsis 1000 dagger 556 daggerdbl 556 perthousand 1000 fi 500 fl 500
    guilsinglleft 333 guilsinglright 333 guillemotleft 556 guillemotright 556
    exclamdown 333 questiondown 611 cent 556 sterling 556 yen 556 currency 556
    florin 556 section 556 paragraph 537 degree 400 Euro 556 copyright 737
    registered 737 trademark 1000 AE 1000 ae 889 OE 1000 oe 944 germandbls 611
    Oslash 778 oslash 611 Lslash 556 lslash 222 dotlessi 278 fraction 167
    multiply 584 divide 584 plusminus 584 logicalnot 584 mu 556
    ordfeminine 370 ordmasculine 365 periodcentered 278 brokenbar 260`
,
'Helvetica-Bold':`quoteright 278 quoteleft 278 quotedblleft 500 quotedblright 500
    quotesinglbase 278 quotedblbase 500 endash 556 emdash 1000 bullet 350
    ellipsis 1000 dagger 556 daggerdbl 556 perthousand 1000 fi 611 fl 611
    guilsinglleft 333 guilsinglright 333 guillemotleft 556 guillemotright 556
    exclamdown 333 questiondown 611 cent 556 sterling 556 yen 556 currency 556
    florin 556 section 556 paragraph 556 degree 400 Euro 556 copyright 737
    registered 737 trademark 1000 AE 1000 ae 889 OE 1000 oe 944 germandbls 611
    Oslash 778 oslash 611 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 584 divide 584 plusminus 584 logicalnot 584 mu 611
    ordfeminine 370 ordmasculine 365 periodcentered 278 brokenbar 280`
,
'Times-Roman':`quoteright 333 quoteleft 333 quotedblleft 444 quotedblright 444
    quotesinglbase 333 quotedblbase 444 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 333 questiondown 444 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 453 degree 400 Euro 500 copyright 760
    registered 760 trademark 980 AE 889 ae 667 OE 889 oe 722 germandbls 500
    Oslash 722 oslash 500 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 564 divide 564 plusminus 564 logicalnot 564 mu 500
    ordfeminine 276 ordmasculine 310 periodcentered 250 brokenbar 200`
,
'Times-Bold':`quoteright 333 quoteleft 333 quotedblleft 500 quotedblright 500
    quotesinglbase 333 quotedblbase 500 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 333 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 540 degree 400 Euro 500 copyright 747
    registered 747 trademark 1000 AE 1000 ae 722 OE 1000 oe 722 germandbls 556
    Oslash 778 oslash 500 Lslash 667 lslash 278 dotlessi 278 fraction 167
    multiply 570 divide 570 plusminus 570 logicalnot 570 mu 556
    ordfeminine 300 ordmasculine 330 periodcentered 250 brokenbar 220`
,
'Times-Italic':`quoteright 333 quoteleft 333 quotedblleft 556 quotedblright 556
    quotesinglbase 333 quotedblbase 556 endash 500 emdash 889 bullet 350
    ellipsis 889 dagger 500 daggerdbl 500 perthousand 1000 fi 500 fl 500
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 389 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 523 degree 400 Euro 500 copyright 760
    registered 760 trademark 980 AE 889 ae 667 OE 944 oe 667 germandbls 500
    Oslash 722 oslash 500 Lslash 556 lslash 278 dotlessi 278 fraction 167
    multiply 675 divide 675 plusminus 675 logicalnot 675 mu 500
    ordfeminine 276 ordmasculine 310 periodcentered 250 brokenbar 275`
,
'Times-BoldItalic':`quoteright 333 quoteleft 333 quotedblleft 500 quotedblright 500
    quotesinglbase 333 quotedblbase 500 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 389 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 500 degree 400 Euro 500 copyright 747
    registered 747 trademark 1000 AE 944 ae 722 OE 944 oe 722 germandbls 500
    Oslash 722 oslash 500 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 570 divide 570 plusminus 570 logicalnot 606 mu 576
    ordfeminine 266 ordmasculine 300 periodcentered 250 brokenbar 220`
,
};
const ACCENTS=[
'acute','grave','circumflex','tilde','dieresis','ring','cedilla',
'caron','breve','macron','ogonek','hungarumlaut','dotaccent',
];
export function base14Name(baseFont){
if(!baseFont)return'';
const plain=String(baseFont).replace(/^[A-Z]{6}\+/,'').replace(/[-_,\s]/g,'');
const lower=plain.toLowerCase();
const bold=/bold|black|heavy|semibold/.test(lower);
const italic=/italic|oblique/.test(lower);
if(/courier|mono/.test(lower))return'Courier';
if(/helvetica|arial|verdana|tahoma|calibri|sans/.test(lower)){
return bold?'Helvetica-Bold':'Helvetica';
}
if(/times|serif|georgia|garamond|book|roman/.test(lower)){
if(bold&&italic)return'Times-BoldItalic';
if(bold)return'Times-Bold';
if(italic)return'Times-Italic';
return'Times-Roman';
}
return'';
}
const CACHE=new Map();
export function base14Widths(baseFont){
const family=base14Name(baseFont);
if(!family)return null;
if(CACHE.has(family))return CACHE.get(family);
const table=new Map();
if(family!=='Courier'){
ASCII_WIDTHS[family].trim().split(/\s+/).forEach((value,index)=>{
const glyph=WIN_ANSI[index+32];
if(glyph)table.set(glyph,Number(value));
});
const extra=EXTRA_WIDTHS[family].trim().split(/\s+/);
for(let at=0;at+1<extra.length;at+=2){
table.set(extra[at],Number(extra[at+1]));
}
}
const fallback=family==='Courier'?600:table.get('n')??500;
const found={
width(glyph){
const known=table.get(glyph);
if(known!==undefined)return known;
for(const accent of ACCENTS){
if(glyph.length>accent.length&&glyph.endsWith(accent)){
const base=table.get(glyph.slice(0,-accent.length));
if(base!==undefined)return base;
}
}
return fallback;
},
};
CACHE.set(family,found);
return found;
}
