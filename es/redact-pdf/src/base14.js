/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
const g=`
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
oslash ugrave uacute ucircumflex udieresis yacute thorn ydieresis`,m=`
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
lslash oslash oe germandbls . . . .`,f=`
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
macron breve dotaccent ring cedilla hungarumlaut ogonek caron`;function u(i){const e=i.trim().split(/\s+/),r=new Array(256).fill("");return e.forEach((t,l)=>{t!=="."&&(r[l+32]=t)}),r}const c=u(g),h=u(m),b=u(f);function w(i){return i==="WinAnsiEncoding"?c:i==="MacRomanEncoding"?b:i==="StandardEncoding"||i==="MacExpertEncoding"?h:null}const p=[8364,0,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,0,381,0,0,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,0,382,376],x={fraction:8260,fi:64257,fl:64258,Lslash:321,lslash:322,dotlessi:305,ring:730,breve:728,dotaccent:729,caron:711,ogonek:731,hungarumlaut:733,grave:96,notequal:8800,infinity:8734,lessequal:8804,greaterequal:8805,partialdiff:8706,summation:8721,product:8719,pi:960,integral:8747,Omega:8486,radical:8730,approxequal:8776,Delta:8710,lozenge:9674,apple:63743},q=v();function v(){const i=new Map;for(let e=32;e<256;e+=1){const r=c[e];if(!r||i.has(r))continue;const t=e<128||e>=160?e:p[e-128];t&&i.set(r,String.fromCharCode(t))}for(const[e,r]of Object.entries(x))i.has(e)||i.set(e,String.fromCharCode(r));return i}function E(i){if(!i)return"";const e=q.get(i);if(e!==void 0)return e;const r=/^uni([0-9A-Fa-f]{4})/.exec(i);if(r)return String.fromCharCode(Number.parseInt(r[1],16));const t=/^u([0-9A-Fa-f]{4,6})$/.exec(i);if(t)return String.fromCodePoint(Number.parseInt(t[1],16));const l=i.indexOf(".");return l>0?E(i.slice(0,l)):""}const A={Helvetica:`278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278
    556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015
    667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722
    667 611 722 667 944 667 667 611 278 278 278 469 556 333
    556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333
    500 278 556 500 722 500 500 500 334 260 334 584`,"Helvetica-Bold":`278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278
    556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975
    722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722
    667 611 722 667 944 667 667 611 333 278 333 584 556 333
    556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389
    556 333 611 556 778 556 556 500 389 280 389 584`,"Times-Roman":`250 333 408 500 500 833 778 180 333 333 500 564 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 278 278 564 564 564 444 921
    722 667 667 722 611 556 722 722 333 389 722 611 889 722 722 556 722 667
    556 611 722 722 944 722 722 611 333 278 333 469 500 333
    444 500 444 500 444 333 500 500 278 278 500 278 778 500 500 500 500 333
    389 278 500 500 722 500 500 444 480 200 480 541`,"Times-Bold":`250 333 555 500 500 1000 833 278 333 333 500 570 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 570 570 570 500 930
    722 667 722 722 667 611 778 778 389 500 778 667 944 722 778 611 778 722
    556 667 722 722 1000 722 722 667 333 278 333 581 500 333
    500 556 444 556 444 333 500 556 278 333 556 278 833 556 500 556 556 444
    389 333 556 500 722 500 500 444 394 220 394 520`,"Times-Italic":`250 333 420 500 500 833 778 214 333 333 500 675 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 675 675 675 500 920
    611 611 667 722 611 611 722 722 333 444 667 556 833 667 722 611 722 611
    500 556 722 611 833 611 556 556 389 278 389 422 500 333
    500 500 444 500 444 278 500 500 278 278 444 278 722 500 500 500 500 389
    389 278 500 444 667 444 444 389 400 275 400 541`,"Times-BoldItalic":`250 389 555 500 500 833 778 278 333 333 500 570 250 333 250 278
    500 500 500 500 500 500 500 500 500 500 333 333 570 570 570 500 832
    667 667 667 722 667 667 722 778 389 500 667 611 889 722 722 611 722 667
    556 611 722 667 889 667 611 611 333 278 333 570 500 333
    500 500 444 500 444 333 500 556 278 278 500 278 778 556 500 500 500 389
    389 278 556 444 667 500 444 389 348 220 348 570`},y={Helvetica:`quoteright 222 quoteleft 222 quotedblleft 333 quotedblright 333
    quotesinglbase 222 quotedblbase 333 endash 556 emdash 1000 bullet 350
    ellipsis 1000 dagger 556 daggerdbl 556 perthousand 1000 fi 500 fl 500
    guilsinglleft 333 guilsinglright 333 guillemotleft 556 guillemotright 556
    exclamdown 333 questiondown 611 cent 556 sterling 556 yen 556 currency 556
    florin 556 section 556 paragraph 537 degree 400 Euro 556 copyright 737
    registered 737 trademark 1000 AE 1000 ae 889 OE 1000 oe 944 germandbls 611
    Oslash 778 oslash 611 Lslash 556 lslash 222 dotlessi 278 fraction 167
    multiply 584 divide 584 plusminus 584 logicalnot 584 mu 556
    ordfeminine 370 ordmasculine 365 periodcentered 278 brokenbar 260`,"Helvetica-Bold":`quoteright 278 quoteleft 278 quotedblleft 500 quotedblright 500
    quotesinglbase 278 quotedblbase 500 endash 556 emdash 1000 bullet 350
    ellipsis 1000 dagger 556 daggerdbl 556 perthousand 1000 fi 611 fl 611
    guilsinglleft 333 guilsinglright 333 guillemotleft 556 guillemotright 556
    exclamdown 333 questiondown 611 cent 556 sterling 556 yen 556 currency 556
    florin 556 section 556 paragraph 556 degree 400 Euro 556 copyright 737
    registered 737 trademark 1000 AE 1000 ae 889 OE 1000 oe 944 germandbls 611
    Oslash 778 oslash 611 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 584 divide 584 plusminus 584 logicalnot 584 mu 611
    ordfeminine 370 ordmasculine 365 periodcentered 278 brokenbar 280`,"Times-Roman":`quoteright 333 quoteleft 333 quotedblleft 444 quotedblright 444
    quotesinglbase 333 quotedblbase 444 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 333 questiondown 444 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 453 degree 400 Euro 500 copyright 760
    registered 760 trademark 980 AE 889 ae 667 OE 889 oe 722 germandbls 500
    Oslash 722 oslash 500 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 564 divide 564 plusminus 564 logicalnot 564 mu 500
    ordfeminine 276 ordmasculine 310 periodcentered 250 brokenbar 200`,"Times-Bold":`quoteright 333 quoteleft 333 quotedblleft 500 quotedblright 500
    quotesinglbase 333 quotedblbase 500 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 333 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 540 degree 400 Euro 500 copyright 747
    registered 747 trademark 1000 AE 1000 ae 722 OE 1000 oe 722 germandbls 556
    Oslash 778 oslash 500 Lslash 667 lslash 278 dotlessi 278 fraction 167
    multiply 570 divide 570 plusminus 570 logicalnot 570 mu 556
    ordfeminine 300 ordmasculine 330 periodcentered 250 brokenbar 220`,"Times-Italic":`quoteright 333 quoteleft 333 quotedblleft 556 quotedblright 556
    quotesinglbase 333 quotedblbase 556 endash 500 emdash 889 bullet 350
    ellipsis 889 dagger 500 daggerdbl 500 perthousand 1000 fi 500 fl 500
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 389 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 523 degree 400 Euro 500 copyright 760
    registered 760 trademark 980 AE 889 ae 667 OE 944 oe 667 germandbls 500
    Oslash 722 oslash 500 Lslash 556 lslash 278 dotlessi 278 fraction 167
    multiply 675 divide 675 plusminus 675 logicalnot 675 mu 500
    ordfeminine 276 ordmasculine 310 periodcentered 250 brokenbar 275`,"Times-BoldItalic":`quoteright 333 quoteleft 333 quotedblleft 500 quotedblright 500
    quotesinglbase 333 quotedblbase 500 endash 500 emdash 1000 bullet 350
    ellipsis 1000 dagger 500 daggerdbl 500 perthousand 1000 fi 556 fl 556
    guilsinglleft 333 guilsinglright 333 guillemotleft 500 guillemotright 500
    exclamdown 389 questiondown 500 cent 500 sterling 500 yen 500 currency 500
    florin 500 section 500 paragraph 500 degree 400 Euro 500 copyright 747
    registered 747 trademark 1000 AE 944 ae 722 OE 944 oe 722 germandbls 500
    Oslash 722 oslash 500 Lslash 611 lslash 278 dotlessi 278 fraction 167
    multiply 570 divide 570 plusminus 570 logicalnot 606 mu 576
    ordfeminine 266 ordmasculine 300 periodcentered 250 brokenbar 220`},k=["acute","grave","circumflex","tilde","dieresis","ring","cedilla","caron","breve","macron","ogonek","hungarumlaut","dotaccent"];function O(i){if(!i)return"";const r=String(i).replace(/^[A-Z]{6}\+/,"").replace(/[-_,\s]/g,"").toLowerCase(),t=/bold|black|heavy|semibold/.test(r),l=/italic|oblique/.test(r);return/courier|mono/.test(r)?"Courier":/helvetica|arial|verdana|tahoma|calibri|sans/.test(r)?t?"Helvetica-Bold":"Helvetica":/times|serif|georgia|garamond|book|roman/.test(r)?t&&l?"Times-BoldItalic":t?"Times-Bold":l?"Times-Italic":"Times-Roman":""}const d=new Map;function I(i){const e=O(i);if(!e)return null;if(d.has(e))return d.get(e);const r=new Map;if(e!=="Courier"){A[e].trim().split(/\s+/).forEach((a,n)=>{const o=c[n+32];o&&r.set(o,Number(a))});const s=y[e].trim().split(/\s+/);for(let a=0;a+1<s.length;a+=2)r.set(s[a],Number(s[a+1]))}const t=e==="Courier"?600:r.get("n")??500,l={width(s){const a=r.get(s);if(a!==void 0)return a;for(const n of k)if(s.length>n.length&&s.endsWith(n)){const o=r.get(s.slice(0,-n.length));if(o!==void 0)return o}return t}};return d.set(e,l),l}export{b as MAC_ROMAN,h as STANDARD,c as WIN_ANSI,O as base14Name,I as base14Widths,w as encodingByName,E as glyphText};
