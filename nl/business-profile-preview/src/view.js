/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{attributeList,showCount,showHost,showTime,statusLine}from'./profile.js?v=3f9e9a36a1';
const ACTIONS=[
{id:'directions',mark:'route',needs:(p)=>Boolean(p.address)},
{id:'website',mark:'globe',needs:(p)=>Boolean(p.website)},
{id:'call',mark:'phone',needs:(p)=>Boolean(p.phone)},
{id:'save',mark:'save',needs:()=>true},
{id:'share',mark:'share',needs:()=>true},
];
export function describe(profile,labels,now){
const fill=(key,values={})=>(labels[key]??key)
.replace(/\{(\w+)\}/g,(whole,name)=>(name in values?values[name]:whole));
const at=(value)=>showTime(value,profile.clock,fill('time.am'),fill('time.pm'));
return{
name:profile.name||fill('sample.placeholder'),
named:Boolean(profile.name),
category:profile.category,
price:profile.price,
rating:profile.rating,
ratingText:profile.rating===''?'':Number(profile.rating).toFixed(1),
reviewsText:reviewsText(profile,fill),
reviewsShort:profile.reviews===''?fill('label.noreviews')
:fill('label.reviewsshort',{count:showCount(profile.reviews)}),
hasReviews:profile.rating!==''&&profile.reviews!=='',
address:profile.address,
addressText:addressText(profile,fill),
phone:profile.phone,
host:showHost(profile.website),
description:profile.description,
chips:attributeList(profile),
status:status(profile,fill,at,now),
actions:ACTIONS.filter((one)=>one.needs(profile))
.map((one)=>({mark:one.mark,label:fill(`label.${one.id}`)})),
photo:profile.photo,
words:{
from:fill('label.from'),
website:fill('label.website'),
directions:fill('label.directions'),
},
};
}
function reviewsText(profile,fill){
if(profile.rating===''||profile.reviews==='')return fill('label.noreviews');
return Number(profile.reviews)===1
?fill('label.review1')
:fill('label.reviews',{count:showCount(profile.reviews)});
}
function addressText(profile,fill){
if(!profile.address)return'';
return profile.serviceArea?fill('label.serves',{area:profile.address}):profile.address;
}
function status(profile,fill,at,now){
const line=statusLine(profile,now);
const word={
'status.open':['open','status.open'],
'status.open24':['open','status.open24'],
'status.closed':['closed','status.closed'],
'status.closedtoday':['closed','status.closed'],
'status.closeduntil':['closed','status.closed'],
'status.temporary':['closed','status.temporary'],
'status.permanent':['closed','status.permanent'],
}[line.key]??['closed','status.closed'];
const tail={
'status.open':()=>fill('status.closes',{at:at(line.at)}),
'status.closedtoday':()=>fill('status.opens',{at:at(line.at)}),
'status.closeduntil':()=>fill('status.opensday',{
at:at(line.at),day:fill(`day.${DAY[line.day]}`),
}),
}[line.key];
return{tone:word[0],lead:fill(word[1]),tail:tail?tail():''};
}
const DAY=['sun','mon','tue','wed','thu','fri','sat'];
