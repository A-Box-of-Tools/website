/** Selection ownership must preserve bytes and never collapse repeated names. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashSelection } from '../../tools/hash-checksum/src/hash-selection.js';
import { Stopped, Unreadable } from '../../tools/hash-checksum/src/hash.js';
import { manifestVerdict, readExpected } from '../../tools/hash-checksum/src/expected.js';
const record=(text,name='same.txt')=>({file:new File([text],name),digests:{}});
const digest=text=>createHash('sha256').update(text).digest('hex');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{resolve,promise};};

test('repeated filenames retain different real streamed digests in selection order',async()=>{
 const files=[record('abc'),record('def')];const results=[];
 await hashSelection(files,['sha256'],{onResult:(file,found)=>{Object.assign(file.digests,found);results.push(file);}});
 assert.deepEqual(results,files);assert.equal(files[0].digests.sha256,digest('abc'));assert.equal(files[1].digests.sha256,digest('def'));
});

test('a pending read keeps later files serial and uses captured files and algorithms',async()=>{
 const files=[record('abc'),record('def')],ids=['sha256'],gate=deferred(),calls=[];
 const pending=hashSelection(files,ids,{reader:async(file,asked)=>{calls.push({file,asked});if(calls.length===1)await gate.promise;return{sha256:'x'};}});
 files.push(record('new'));ids.push('md5');assert.equal(calls.length,1);gate.resolve();await pending;
 assert.equal(calls.length,2);assert.deepEqual(calls[0].asked,['sha256']);assert.deepEqual(calls[1].asked,['sha256']);
});

test('a native unreadable file reports its identity and later completed files remain usable',async()=>{
 const files=[record('abc'),record('bad'),record('def')],found=[],failed=[];
 await hashSelection(files,['sha256'],{reader:async file=>{if(file===files[1].file)throw new Unreadable('read.short');return{sha256:digest(await file.text())};},onResult:(file,value)=>found.push({file,value}),onError:(file,error)=>failed.push({file,error})});
 assert.deepEqual(found.map(x=>x.file),[files[0],files[2]]);assert.equal(found[0].value.sha256,digest('abc'));assert.equal(found[1].value.sha256,digest('def'));assert.equal(failed[0].file,files[1]);assert.equal(failed[0].error.message,'read.short');
});

test('a cancelled final native read cannot publish or start a later file',async()=>{
 const files=[record('abc'),record('def')],gate=deferred(),controller=new AbortController();let calls=0,results=0,progress=0;
 const pending=hashSelection(files,['sha256'],{signal:controller.signal,reader:async(file,ids,options)=>{calls++;await gate.promise;options.onProgress(3,3);return{sha256:digest('abc')};},onResult:()=>results++,onProgress:()=>progress++});
 controller.abort();gate.resolve();await assert.rejects(pending,Stopped);assert.equal(calls,1);assert.equal(results,0);assert.equal(progress,0);
});

test('restart requests only missing algorithms and never replaces an existing cache',async()=>{
 const files=[record('abc'),record('def')];files[0].digests={md5:'old',sha256:'present'};files[1].digests={md5:'other'};const calls=[];
 await hashSelection(files,['md5','sha256'],{reader:async(file,ids)=>{calls.push({file,ids});return{sha256:'new'};},onResult:(file,found)=>Object.assign(file.digests,found)});
 assert.equal(calls.length,1);assert.equal(calls[0].file,files[1].file);assert.deepEqual(calls[0].ids,['sha256']);assert.deepEqual(files[0].digests,{md5:'old',sha256:'present'});assert.deepEqual(files[1].digests,{md5:'other',sha256:'new'});
});

test('an unexpected internal failure is retained as an error rather than a checksum',async()=>{
 const error=new Error('internal');let results=0;
 await assert.rejects(hashSelection([record('x')],['sha256'],{reader:async()=>{throw error;},onResult:()=>results++}),e=>e===error);assert.equal(results,0);
});

test('manifest summary distinguishes exact, renamed, absent and differing files',()=>{
 const expected=readExpected(`${digest('abc')}  folder/abc.txt\n${digest('def')}  def.txt`);
 assert.equal(manifestVerdict(expected,{sha256:digest('abc')},'abc.txt').renamed,false);
 assert.equal(manifestVerdict(expected,{sha256:digest('abc')},'mirror.txt').renamed,true);
 assert.equal(manifestVerdict(expected,{sha256:digest('other')},'absent.txt').state,'unlisted');
 assert.equal(manifestVerdict(expected,{sha256:digest('other')},'abc.txt').state,'mismatch');
 assert.equal(manifestVerdict(expected,{},'absent.txt').state,'waiting');
 assert.equal(manifestVerdict(readExpected(digest('abc')),{sha256:digest('abc')},'x').renamed,false);
});

test('wrapped checksum fragments cannot create a spurious summary match',()=>{
 const wide=createHash('sha512').update('abc').digest('hex');const expected=readExpected(wide.slice(0,64)+'\n'+wide.slice(64));
 assert.equal(expected.wrapped,true);assert.equal(manifestVerdict(expected,{sha256:wide.slice(0,64)},'x').state,'waiting');
 assert.equal(manifestVerdict(expected,{sha512:wide},'x').state,'match');
});


test('Windows manifest directories describe the selected basename',()=>{
 const expected=readExpected(`${digest('abc')}  folder\\sample.bin`);
 const matching=manifestVerdict(expected,{sha256:digest('abc')},'sample.bin');
 assert.equal(matching.state,'match');assert.equal(matching.renamed,false);
 assert.equal(manifestVerdict(expected,{sha256:digest('other')},'sample.bin').state,'mismatch');
});
