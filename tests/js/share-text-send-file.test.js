/** Admission, ownership and close boundaries are independent of transport timing. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileSender, sendFile, FILE_CHANNEL, validRequest } from '../../tools/share-text/src/send-file.js';
const REQUEST='11111111-1111-4111-8111-111111111111',NEXT='22222222-2222-4222-8222-222222222222';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const turns=async()=>{for(let n=0;n<10;n++)await Promise.resolve();};
class Channel extends EventTarget{
 constructor(state='open'){super();this.readyState=state;this.messages=[];this.bufferedAmount=0;}
 send(value){assert.equal(this.readyState,'open');this.messages.push(typeof value==='string'?JSON.parse(value):value);}
 open(){this.readyState='open';this.dispatchEvent(new Event('open'));}
 close(){if(this.readyState==='closed')return;this.readyState='closed';this.dispatchEvent(new Event('close'));}
}
function fixture({allowed=true,file}={}){
 const lanes=[],control=new Channel(),timers=new Map();let count=0;
 const files=new Map([['file',file??new File([Uint8Array.from([1,2,3,4])],'source.bin',{type:'application/octet-stream'})]]);
 const sender=fileSender({peer:{createDataChannel(label){const lane=new Channel('connecting');lane.label=label;lanes.push(lane);return lane;}},control,files,admitted:()=>allowed,
 later:fn=>{timers.set(++count,fn);return count;},cancelTimer:id=>timers.delete(id)});
 return{sender,lanes,control,files,timers};
}
test('only bounded UUID requests from an admitted reader can create a lane',()=>{
 const denied=fixture({allowed:false});assert.equal(denied.sender.request({id:'file',request:REQUEST}),false);assert.equal(denied.lanes.length,0);
 const f=fixture();for(const request of [null,4,'','x'.repeat(1000),REQUEST+'x'])assert.equal(f.sender.request({id:'file',request}),false);
 assert.equal(validRequest(REQUEST),true);assert.equal(f.sender.request({id:'x'.repeat(129),request:REQUEST}),false);assert.equal(f.lanes.length,0);
 assert.equal(f.sender.request({id:'missing',request:REQUEST}),true);assert.deepEqual(f.control.messages,[{type:'file-gone',id:'missing',request:REQUEST}]);
});
test('Cancel before opening retires its lane and a stale open cannot start the retry',async()=>{
 const f=fixture();f.sender.request({id:'file',request:REQUEST});assert.equal(f.lanes[0].label,FILE_CHANNEL+REQUEST);f.sender.cancel(REQUEST);
 assert.equal(f.lanes[0].readyState,'closed');f.sender.request({id:'file',request:NEXT});f.lanes[0].open();await turns();assert.equal(f.lanes[0].messages.length,0);
 f.lanes[1].open();await turns();assert.deepEqual(f.lanes[1].messages[1],Uint8Array.from([1,2,3,4]).buffer);assert.equal(f.lanes[1].messages.at(-1).type,'file-end');
 f.lanes[0].close();assert.equal(f.sender.request({id:'file',request:REQUEST}),false);f.lanes[1].close();assert.equal(f.sender.request({id:'file',request:REQUEST}),true);f.sender.close();
});
test('a pending cancelled native read cannot enter a new channel or remove its owner',async()=>{
 const gate=deferred();let reads=0;const file={size:4,type:'x',slice(){reads++;return{arrayBuffer:()=>reads===1?gate.promise:Promise.resolve(Uint8Array.from([5,6,7,8]).buffer)};}};
 const f=fixture({file});f.sender.request({id:'file',request:REQUEST});f.lanes[0].open();await turns();f.sender.cancel(REQUEST);f.sender.request({id:'file',request:NEXT});f.lanes[1].open();await turns();
 gate.resolve(Uint8Array.from([1,2,3,4]).buffer);await turns();assert.equal(f.lanes[0].messages.length,1);assert.deepEqual(f.lanes[1].messages[1],Uint8Array.from([5,6,7,8]).buffer);
 assert.equal(f.sender.request({id:'file',request:REQUEST}),false);f.lanes[1].close();f.sender.close();
});
test('repeated cancelled native reads remain bounded per reader',async()=>{
 const gates=[];const file={size:4,type:'x',slice(){const gate=deferred();gates.push(gate);return{arrayBuffer:()=>gate.promise};}};
 const f=fixture({file});for(const request of [REQUEST,NEXT]){f.sender.request({id:'file',request});f.lanes.at(-1).open();await turns();f.sender.cancel(request);}
 assert.equal(f.sender.request({id:'file',request:REQUEST}),false);assert.equal(f.lanes.length,2);assert.deepEqual(f.control.messages.at(-1),{type:'file-failed',id:'file',request:REQUEST});
 gates[0].resolve(new ArrayBuffer(4));await turns();assert.equal(f.sender.request({id:'file',request:REQUEST}),true);f.sender.close();gates[1].resolve(new ArrayBuffer(4));await turns();
});
test('closing backpressure retires the wait without another read or byte',async()=>{
 const lane=new Channel();lane.bufferedAmount=9<<20;let reads=0;const file={size:4,type:'x',slice(){reads++;throw new Error('must not read while backpressured');}};
 const sent=sendFile(lane,file,'file');await turns();lane.close();await sent;assert.equal(reads,0);assert.equal(lane.messages.length,1);
});
test('legacy control-lane output keeps exact chunks and can request again after completion',async()=>{
 const f=fixture();assert.equal(f.sender.request({id:'file'}),true);await turns();assert.equal(f.lanes.length,0);assert.equal(f.control.messages[0].type,'file-begin');assert.deepEqual(f.control.messages[1],Uint8Array.from([1,2,3,4]).buffer);assert.equal(f.control.messages[2].type,'file-end');
 assert.equal(f.sender.request({id:'file'}),true);await turns();assert.equal(f.control.readyState,'open');f.sender.close();
});
test('a native read refusal reports failure only on its owned lane and timeout permits recovery',async()=>{
 const f=fixture({file:{size:4,type:'x',slice:()=>({arrayBuffer:()=>Promise.reject(new Error('native refused'))})}});
 f.sender.request({id:'file',request:REQUEST});f.lanes[0].open();await turns();assert.equal(f.lanes[0].messages.at(-1).type,'file-failed');assert.equal(f.control.messages.length,0);
 const timeout=[...f.timers.values()][0];timeout();assert.equal(f.lanes[0].readyState,'closed');assert.equal(f.sender.request({id:'file',request:NEXT}),true);f.sender.close();
});

test('a refused channel reports its request and a closed control lane cannot throw',()=>{
 const control=new Channel();let refused=true;const lanes=[];
 const sender=fileSender({peer:{createDataChannel(){if(refused)throw new Error('native refused');const lane=new Channel('connecting');lanes.push(lane);return lane;}},control,files:new Map([['file',new File(['x'],'x.txt')]]),admitted:()=>true});
 assert.equal(sender.request({id:'file',request:REQUEST}),false);assert.deepEqual(control.messages,[{type:'file-failed',id:'file',request:REQUEST}]);
 refused=false;assert.equal(sender.request({id:'file',request:NEXT}),true);sender.close();control.close();
 assert.doesNotThrow(()=>sender.request({id:'missing',request:REQUEST}));
});
