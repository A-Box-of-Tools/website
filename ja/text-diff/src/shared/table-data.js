/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const LIMITS=Object.freeze({inputChars:2*1024*1024,rows:5000,columns:100,cells:100000,outputRows:20000,outputCells:500000,outputChars:16*1024*1024});
const DELIMITERS=[',','\t',';','|'];
function fail(key){const error=new Error(key);error.key=key;throw error;}
function checkDelimiter(delimiter){if(!DELIMITERS.includes(delimiter))fail('table.delimiter');return delimiter;}
function detectDelimiter(text){
const records=[];
let counts=[0,0,0,0],quoted=false,touched=false,atStart=true;
for(let i=0;i<text.length&&records.length<20;i++){
const char=text[i];
if(quoted){
if(char==='"'){
if(text[i+1]==='"')i++;
else quoted=false;
}
}else if(char==='\r'||char==='\n'){
if(touched)records.push(counts);
counts=[0,0,0,0];touched=false;atStart=true;
if(char==='\r'&&text[i+1]==='\n')i++;
}else{
touched=true;
if(char==='"'&&atStart){quoted=true;atStart=false;continue;}
const index=DELIMITERS.indexOf(char);
if(index>=0)counts[index]++;
atStart=index>=0;
}
}
if(touched&&records.length<20)records.push(counts);
let best=',',bestScore=0;
for(let index=0;index<DELIMITERS.length;index++){
const frequencies=new Map();let nonempty=0;
for(const record of records){
if(record[index]>0){nonempty++;frequencies.set(record[index],(frequencies.get(record[index])||0)+1);}
}
const consistent=Math.max(0,...frequencies.values());
const score=consistent*1000+nonempty*10+(records[0]?.[index]||0);
if(score>bestScore){bestScore=score;best=DELIMITERS[index];}
}
return best;
}
function closesQuotedCell(source,start){
for(let i=start+1;i<source.length;i++){
if(source[i]!=='"')continue;
if(source[i+1]==='"'){i++;continue;}
const next=source[i+1];
return next===undefined||next==='\t'||next==='\r'||next==='\n';
}
return false;
}
export function parseTable(text,{delimiter='auto',header=true}={}){
if(header!=='auto'&&typeof header!=='boolean')fail('table.header');
if(typeof text!=='string')fail('table.empty');
if(text.length>LIMITS.inputChars)fail('table.input-limit');
const source=text.replace(/^\uFEFF/,'');
const separator=delimiter==='auto'?detectDelimiter(source):checkDelimiter(delimiter);
const records=[];
let record=[],field='',state=0,touched=false,cells=0;
const endField=()=>{
record.push(field);
if(record.length>LIMITS.columns)fail('table.column-limit');
field='';state=0;
};
const endRecord=()=>{
endField();
if(touched){
records.push(record);cells+=record.length;
if(records.length>LIMITS.rows+(header?1:0))fail('table.row-limit');
if(cells>LIMITS.cells+(header?LIMITS.columns:0))fail('table.cell-limit');
}
record=[];touched=false;
};
for(let i=0;i<source.length;i++){
const char=source[i];
if(state===2){
if(char==='"'){
if(source[i+1]==='"'){field+='"';i++;}
else state=3;
}else field+=char;
continue;
}
if(char===separator){touched=true;endField();}
else if(char==='\r'||char==='\n'){endRecord();if(char==='\r'&&source[i+1]==='\n')i++;}
else if(char==='"'&&state===0&&(separator!=='\t'||closesQuotedCell(source,i))){touched=true;state=2;}
else{if(state===3)fail('table.quotes');touched=true;field+=char;state=1;}
}
if(state===2)fail('table.quotes');
if(touched)endRecord();
if(!records.length)fail('table.empty');
const hasHeader=header==='auto'?detectHeader(records):header;
const headers=hasHeader?records.shift():Array(Math.max(...records.map(row=>row.length))).fill('');
if(records.some(row=>row.length>headers.length))fail('table.ragged');
if(records.length>LIMITS.rows)fail('table.row-limit');
if(records.length*headers.length>LIMITS.cells)fail('table.cell-limit');
const shortRows=records.filter(row=>row.length<headers.length).length;
const rows=records.map(row=>row.concat(Array(headers.length-row.length).fill('')));
return{headers,rows,header:hasHeader,delimiter:separator,shortRows};
}
function calendarDate(year,month,day){
if(year<100||month<1||month>12||day<1)return false;
return day<=new Date(Date.UTC(year,month,0)).getUTCDate();
}
function datePattern(value){
let match=/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(value);
if(match)return calendarDate(+match[1],+match[2],+match[3]);
match=/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
return Boolean(match&&(calendarDate(+match[3],+match[2],+match[1])
||calendarDate(+match[3],+match[1],+match[2])));
}
function valueKind(value){
const text=String(value??'').trim();
if(!text)return'column';
if(text.length>320)return'text';
if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))return'email';
if(/^https?:\/\/[^/\s]+(?:[/?#]\S*)?$/i.test(text))return'url';
const stamp=/^(\d{4}-\d{2}-\d{2})[T ]((?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?)(?:Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?$/.exec(text);
if(stamp&&datePattern(stamp[1]))return'datetime';
if(datePattern(text))return'date';
if(/^(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(text))return'time';
if(/^(?:true|false|yes|no)$/i.test(text))return'boolean';
if(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(text))return'id';
const digits=text.replace(/\D/g,'');
if(digits.length>=7&&digits.length<=15&&/^[+()\d .-]+$/.test(text)
&&(/^\+/.test(text)||/[() ]/.test(text)||/^\d{3}-\d{3}-\d{4}$/.test(text)))return'phone';
if(/^0\d+$/.test(text))return'id';
if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text))return'number';
if(/^(?=.*\p{L})(?=.*\d)[\p{L}\p{N}_.\/-]+$/u.test(text))return'id';
return'text';
}
function columnKind(rows,column){
const counts=new Map();
let total=0;
for(const row of rows.slice(0,50)){
const kind=valueKind(row[column]);
if(kind==='column')continue;
total++;
counts.set(kind,(counts.get(kind)||0)+1);
}
if(!total)return'column';
for(const[kind,count]of counts)if(count/total>=.8)return kind;
return'text';
}
export function typedColumns(table){
return table.headers.filter((_,column)=>!['text','column'].includes(columnKind(table.rows,column))).length;
}
const HEADER_LABELS=new Set([
'id','identifier','uuid','key','name','first name','firstname','last name','lastname','surname','full name','fullname',
'username','user','email','e mail','email address','e mail address','mail','phone','phone number','telephone','mobile',
'url','link','website','date','time','timestamp','date and time','created','updated','start','end','year','month','day',
'amount','price','cost','total','subtotal','tax','balance','currency','quantity','qty','count','unit','number','text',
'boolean','column','status','state','type','kind','category','group','label','tag','team','department','role','title',
'company','organization','organisation','vendor','supplier','customer','client','owner','contact','account','reference',
'ref','note','description','comment','remark','subject','message','city','region','province','country','address','street',
'zip','zip code','postcode','postal code','location','code','sku','product','item','order','invoice','paid','budget',
'age','gender','value','score','rank','source',
'vorname','nachname','e mail adresse','telefon','telefonnummer','handy','stadt','ort','plz','postleitzahl','straße','strasse',
'adresse','land','datum','uhrzeit','zeit','betrag','preis','summe','gesamt','menge','anzahl','abteilung','kunde','lieferant',
'firma','produkt','artikel','beschreibung','bemerkung','notiz','rechnung','nummer','kundennummer','rechnungsnummer',
'bestellnummer','artikelnummer','wert','typ','kategorie',
'nombre','apellido','apellidos','correo','correo electrónico','teléfono','móvil','ciudad','dirección','país','provincia',
'fecha','hora','importe','precio','cantidad','departamento','cliente','proveedor','empresa','producto','artículo',
'descripción','nota','estado','factura','número','código','valor','tipo','categoría',
'nom','prénom','courriel','adresse e mail','téléphone','ville','pays','heure','montant','prix','quantité','service',
'fournisseur','entreprise','société','produit','article','remarque','statut','facture','numéro','valeur','catégorie',
'nome','sobrenome','telefone','celular','cidade','endereço','data','preço','quantidade','fornecedor','produto','descrição',
'observação','observações','fatura','categoria',
'城市','国家','省份','公司','部门','客户','供应商','产品','商品','发票','手机','合计','总计','账号','邮件','电子邮件',
'都市','国','会社','部署','顧客','製品','合計','請求書','メールアドレス',
]);
const HEADER_NOUNS=new Set(['id','name','number','code','date','time','address','amount','price','total','count',
'description','type','status','email','phone','url','quantity','reference','title','value']);
const HEADER_ENDINGS=['姓名','名称','编号','号码','日期','时间','金额','价格','单价','数量','备注','状态','类型','说明','描述',
'代码','地址','电话','邮箱','名前','氏名','番号','日付','時間','時刻','金額','価格','単価','数量','備考','状態','種類','説明',
'住所','電話','メール','コード'];
function familiarLabel(value){
const name=String(value).normalize('NFKC').trim().toLowerCase()
.replace(/[_-]+/g,' ').replace(/\s+/g,' ').replace(/\s*\d+$/,'');
if(!name)return false;
if(HEADER_LABELS.has(name)||HEADER_LABELS.has(name.replace(/s$/,'')))return true;
if(HEADER_ENDINGS.some(ending=>name.endsWith(ending)))return true;
const words=name.split(' ');
const last=words.at(-1);
return words.length>1&&words.length<=4&&(HEADER_NOUNS.has(last)||HEADER_NOUNS.has(last.replace(/s$/,'')));
}
function detectHeader(records){
if(records.length<2)return false;
const first=records[0];
const width=Math.max(...records.map(row=>row.length));
if(first.length!==width)return false;
const body=records.slice(1,51);
let contrasts=0,labels=0;
for(let column=0;column<width;column++){
const kind=valueKind(first[column]);
const label=familiarLabel(first[column]);
const below=columnKind(body,column);
const typed=below!=='text'&&below!=='column'
&&body.filter(row=>String(row[column]??'').trim()).length>=2;
if(/^(?:n\/?a|null|none|unknown|missing|[-—])$/i.test(first[column].trim())
||(kind!=='text'&&!label&&!(kind==='id'&&typed&&below!=='id')))return false;
if(typed)contrasts++;
if(label)labels++;
}
return(width>1&&contrasts>=1)
||(labels>=Math.ceil(width*.6)&&(labels>=2||(width===1&&columnKind(body,0)!=='text')));
}
const KEY_NAME=/(?:^|[\s_-])(?:id|identifier|uuid|key|code|sku|ref|reference|number|email)$/;
export function suggestKeys(a,b){
if(a.header===false||b.header===false)return[0,0];
const name=header=>String(header).normalize('NFKC').trim().toLowerCase();
const inB=new Map();
b.headers.forEach((header,index)=>{
if(name(header)&&!inB.has(name(header)))inB.set(name(header),index);
});
const shared=a.headers.flatMap((header,index)=>(inB.has(name(header))?[[index,inB.get(name(header))]]:[]));
return shared.find(([left])=>KEY_NAME.test(name(a.headers[left])))??shared[0]??[0,0];
}
export function inferHeaders(table,labels={}){
const bases=table.headers.map((_,column)=>labels[columnKind(table.rows,column)]||labels.column||'');
const totals=new Map(),seen=new Map();
for(const base of bases)totals.set(base,(totals.get(base)||0)+1);
return bases.map((base,index)=>{
if(!base)return String(index+1);
const occurrence=(seen.get(base)||0)+1;
seen.set(base,occurrence);
return totals.get(base)>1?`${base} ${occurrence}`:base;
});
}
function validateTable(table){
if(!table||!Array.isArray(table.headers)||!Array.isArray(table.rows)||!table.headers.length)fail('table.empty');
if(table.headers.length>LIMITS.columns)fail('table.column-limit');
if(table.rows.length>LIMITS.rows)fail('table.row-limit');
if(table.rows.length*table.headers.length>LIMITS.cells)fail('table.cell-limit');
if(table.rows.some(row=>!Array.isArray(row)||row.length!==table.headers.length))fail('table.ragged');
}
function uniqueHeaders(headers){
const used=new Set();
return headers.map(header=>{
let name=header,suffix=2;
while(used.has(name))name=`${header} (${suffix++})`;
used.add(name);return name;
});
}
function nameHeader(header,index,labels){
if(String(header).trim())return String(header);
return labels.column?`${labels.column} ${index + 1}`:String(index+1);
}
function joinedHeaders(a,b,labels){
const left=a.headers.map((header,index)=>nameHeader(header,index,labels));
const right=b.headers.map((header,index)=>nameHeader(header,index,labels));
const counts=new Map();
for(const header of[...left,...right])counts.set(header,(counts.get(header)||0)+1);
const named=(headers,label)=>headers.map(header=>counts.get(header)>1?`${header} (${label})`:header);
return uniqueHeaders([...named(left,labels.left||'1'),...named(right,labels.right||'2')]);
}
export function extractKey(value,{match='exact',separator='-',trim=true,ignoreCase=true}={}){
if(!['exact','digits','letters-digits','before','after'].includes(match))fail('table.key');
if(['before','after'].includes(match)&&(typeof separator!=='string'||!separator.length))fail('table.separator');
let key=String(value??'').normalize('NFC');
if(trim)key=key.trim();
if(match==='digits')key=key.match(/[0-9]+/)?.[0]||'';
else if(match==='letters-digits')key=key.replace(/[^\p{L}\p{M}\p{N}]/gu,'');
else if(match==='before'||match==='after'){
const index=key.indexOf(separator);
if(index<0)return null;
key=match==='before'?key.slice(0,index):key.slice(index+separator.length);
}
if(trim)key=key.trim();
if(!key.trim())return null;
return ignoreCase?key.toLowerCase():key;
}
function columnIdentities(headers){
const seen=new Map();
return headers.map((header,index)=>{
const name=String(header).trim();
if(!name)return JSON.stringify([0,index]);
const occurrence=seen.get(name)||0;seen.set(name,occurrence+1);
return JSON.stringify([1,name,occurrence]);
});
}
function mergedColumns(a,b,pairs,labels){
let outputRows=0;
const usedB=new Set();
for(let index=0;index<a.rows.length;index++){
const matching=pairs.get(index)||[];
outputRows+=matching.length||1;
if(outputRows>LIMITS.outputRows)fail('table.output-limit');
for(const right of matching)usedB.add(right);
}
outputRows+=b.rows.length-usedB.size;
const checkSize=width=>{
if(outputRows>LIMITS.outputRows||outputRows*width>LIMITS.outputCells)fail('table.output-limit');
};
if(a.header===false||b.header===false){
const headers=joinedHeaders(a,b,labels);
checkSize(headers.length);
return{headers,conflicts:0,row:(left,right)=>[...left,...right]};
}
const aIds=columnIdentities(a.headers),bIds=columnIdentities(b.headers);
const indices=new Map(aIds.map((id,index)=>[id,index]));
const shared=new Map();
const bToA=bIds.map((id,index)=>{
const left=indices.get(id);
if(left===undefined||!String(b.headers[index]).trim())return-1;
shared.set(left,index);
return left;
});
checkSize(a.headers.length+bToA.filter(index=>index<0).length);
const conflicting=new Set();
for(const[left,matching]of pairs){
for(const right of matching){
for(const[ac,bc]of shared){
if(!conflicting.has(ac)&&a.rows[left][ac]!==''&&b.rows[right][bc]!==''
&&a.rows[left][ac]!==b.rows[right][bc])conflicting.add(ac);
}
}
}
const headers=a.headers.map((header,index)=>{
const name=nameHeader(header,index,labels);
return conflicting.has(index)?`${name} (${labels.left || '1'})`:name;
});
const bMap=b.headers.map((header,index)=>{
const left=bToA[index];
if(left>=0&&!conflicting.has(left))return left;
const name=nameHeader(header,index,labels);
headers.push(left>=0?`${name} (${labels.right || '2'})`:name);
return headers.length-1;
});
checkSize(headers.length);
return{
headers:uniqueHeaders(headers),conflicts:conflicting.size,
row(left,right){
const row=Array(headers.length).fill('');
left.forEach((value,index)=>{row[index]=value;});
right.forEach((value,index)=>{
if(row[bMap[index]]==='')row[bMap[index]]=value;
});
return row;
},
};
}
export function stitchTables(a,b,options={}){
validateTable(a);validateTable(b);
const settings={mode:'match',leftKey:0,rightKey:0,match:'exact',separator:'-',trim:true,ignoreCase:true,join:'full',pairs:[],labels:{},...options};
const{mode,labels}=settings;
const join=mode==='both'?'full':settings.join;
let headers;
const rows=[];
let characters=0;
const add=row=>{
for(const cell of row)characters+=cell.length;
if(rows.length+1>LIMITS.outputRows||(rows.length+1)*headers.length>LIMITS.outputCells
||characters>LIMITS.outputChars)fail('table.output-limit');
rows.push(row);
};
let matched=0,unmatchedA=0,unmatchedB=0,duplicateKeys=0,conflicts=0;
if(mode==='append'){
let aMap,bMap;
if(a.header===false||b.header===false){
const width=Math.max(a.headers.length,b.headers.length);
const sourceHeaders=a.header===false&&b.header!==false?b.headers:a.headers;
headers=uniqueHeaders(Array.from({length:width},(_,index)=>nameHeader(sourceHeaders[index]||'',index,labels)));
aMap=a.headers.map((_,index)=>index);bMap=b.headers.map((_,index)=>index);
}else{
const aIds=columnIdentities(a.headers),bIds=columnIdentities(b.headers);
const indices=new Map(aIds.map((id,index)=>[id,index]));
const names=a.headers.slice();
aMap=aIds.map(id=>indices.get(id));
bMap=bIds.map((id,index)=>{
if(!indices.has(id)){indices.set(id,names.length);names.push(b.headers[index]);}
return indices.get(id);
});
headers=uniqueHeaders(names.map((name,index)=>nameHeader(name,index,labels)));
}
for(const[table,mapping]of[[a,aMap],[b,bMap]]){
for(const sourceRow of table.rows){
const row=Array(headers.length).fill('');
mapping.forEach((column,index)=>{row[column]=sourceRow[index];});add(row);
}
}
unmatchedA=a.rows.length;unmatchedB=b.rows.length;
}else{
headers=joinedHeaders(a,b,labels);
const blankA=Array(a.headers.length).fill(''),blankB=Array(b.headers.length).fill('');
if(mode==='position'){
for(let index=0;index<Math.max(a.rows.length,b.rows.length);index++)add([...(a.rows[index]||blankA),...(b.rows[index]||blankB)]);
matched=Math.min(a.rows.length,b.rows.length);
unmatchedA=a.rows.length-matched;unmatchedB=b.rows.length-matched;
}else{
if(!['full','left','inner'].includes(join))fail('table.join');
const pairs=new Map(),usedB=new Set();
if(mode==='manual'){
if(!Array.isArray(settings.pairs))fail('table.pairs');
for(const pair of settings.pairs){
if(!Array.isArray(pair)||pair.length!==2)fail('table.pairs');
const[left,right]=pair;
if(!Number.isInteger(left)||!Number.isInteger(right)||left<0||right<0||left>=a.rows.length||right>=b.rows.length||pairs.has(left)||usedB.has(right))fail('table.pairs');
pairs.set(left,[right]);usedB.add(right);
}
usedB.clear();
}else if(mode==='match'||mode==='both'){
if(!Number.isInteger(settings.leftKey)||!Number.isInteger(settings.rightKey)||settings.leftKey<0||settings.rightKey<0||settings.leftKey>=a.headers.length||settings.rightKey>=b.headers.length)fail('table.key');
if(!['exact','digits','letters-digits','before','after'].includes(settings.match))fail('table.pattern');
if(['before','after'].includes(settings.match)&&(typeof settings.separator!=='string'||!settings.separator.length))fail('table.separator');
const leftKeys=a.rows.map(row=>extractKey(row[settings.leftKey],settings));
const rightKeys=b.rows.map(row=>extractKey(row[settings.rightKey],settings));
const index=new Map(),countsA=new Map(),duplicates=new Set();
rightKeys.forEach((key,row)=>{
if(key===null)return;
if(!index.has(key))index.set(key,[]);
index.get(key).push(row);
if(index.get(key).length>1)duplicates.add(key);
});
leftKeys.forEach((key,row)=>{
if(key===null)return;
countsA.set(key,(countsA.get(key)||0)+1);
if(countsA.get(key)>1)duplicates.add(key);
if(index.has(key))pairs.set(row,index.get(key));
});
duplicateKeys=duplicates.size;
}else fail('table.mode');
let joinRow=(left,right)=>[...left,...right];
if(mode==='both'){
const combined=mergedColumns(a,b,pairs,labels);
headers=combined.headers;
conflicts=combined.conflicts;
joinRow=combined.row;
}
a.rows.forEach((row,index)=>{
const matching=pairs.get(index);
if(matching?.length){
for(const right of matching){add(joinRow(row,b.rows[right]));matched++;usedB.add(right);}
}else{unmatchedA++;if(join!=='inner')add(joinRow(row,blankB));}
});
b.rows.forEach((row,index)=>{
if(!usedB.has(index)){unmatchedB++;if(join==='full')add(joinRow(blankA,row));}
});
}
}
return{headers,rows,matched,unmatchedA,unmatchedB,duplicateKeys,conflicts};
}
const ACTIVE_CELL=/^(?:[\t\r\n]|[\s\uFEFF]*[=+\-@])/u;
const PLAIN_SIGNED=/^[ \u00A0\uFEFF]*[+-][\d .,()/%+-]*$/u;
export function serializeTable(headers,rows,{delimiter=',',protectFormulas=true,includeHeader=true}={}){
checkDelimiter(delimiter);
const width=headers.length||rows[0]?.length||0;
if(rows.some(row=>row.length!==width))fail('table.ragged');
if(rows.length>LIMITS.outputRows||rows.length*width>LIMITS.outputCells)fail('table.output-limit');
const encode=value=>{
let text=String(value??'');
if(protectFormulas&&ACTIVE_CELL.test(text)&&!PLAIN_SIGNED.test(text))text=`'${text}`;
return text.includes(delimiter)||/["\r\n]/.test(text)?`"${text.replace(/"/g, '""')}"`:text;
};
const records=includeHeader&&headers.length?[headers,...rows]:rows;
return records.map(row=>row.map(encode).join(delimiter)||'""').join('\r\n');
}
