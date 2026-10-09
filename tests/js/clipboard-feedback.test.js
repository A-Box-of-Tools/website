/** Copy feedback must never describe a refused or retired browser write. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { clipboardFeedback } from '../../shared/js/clipboard-feedback.js';
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise,resolve,reject }; };
function fixture() {
  let source = {text:'old'}; const writes=[], states=[], timers=[], cancelled=[];
  const action=clipboardFeedback({read:()=>source,current:value=>value===source,
    write:text=>{const gate=deferred();writes.push({text,...gate});return gate.promise;},
    done:()=>states.push('done'),selected:value=>states.push('selected:'+value.text),restore:()=>states.push('restored'),
    later:fn=>{timers.push(fn);return timers.length;},cancel:id=>cancelled.push(id)});
  return {action,writes,states,timers,cancelled,replace:text=>{source={text};action.invalidate();}};
}
test('copy waits for success and a refused write selects only its captured current text',async()=>{
 const f=fixture();const copy=f.action.copy();assert.deepEqual(f.states,['restored']);f.writes[0].reject(new Error('permission refused'));await copy;
 assert.deepEqual(f.states,['restored','selected:old']);assert.equal(f.timers.length,1);f.timers[0]();assert.equal(f.states.at(-1),'restored');
 const next=f.action.copy();f.writes[1].resolve();await next;assert.equal(f.states.at(-1),'done');
});
test('replacement retires both late success and late refusal without selecting new text',async()=>{
 for(const refused of [false,true]){const f=fixture();const copy=f.action.copy();f.replace('new');const length=f.states.length;
  if(refused)f.writes[0].reject(new Error('late'));else f.writes[0].resolve();await copy;assert.equal(f.states.length,length);assert.equal(f.timers.length,0);
 }
});
test('a newer copy owns feedback even when an older action completes first',async()=>{
 const f=fixture();const old=f.action.copy(),next=f.action.copy();f.writes[0].resolve();await old;assert.ok(!f.states.includes('done'));
 f.writes[1].resolve();await next;assert.equal(f.states.at(-1),'done');assert.equal(f.timers.length,1);
});
test('a delivered retired timer cannot restore or lose the current timer',async()=>{
 const f=fixture();const first=f.action.copy();f.writes[0].resolve();await first;
 const second=f.action.copy();f.writes[1].resolve();await second;const length=f.states.length;f.timers[0]();assert.equal(f.states.length,length);
 f.action.invalidate();assert.equal(f.cancelled.at(-1),2);f.timers[1]();assert.equal(f.states.at(-1),'restored');
});
