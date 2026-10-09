/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const BITS=[
{id:'perm.print',bit:3,since:2},
{id:'perm.modify',bit:4,since:2},
{id:'perm.copy',bit:5,since:2},
{id:'perm.annotate',bit:6,since:2},
{id:'perm.forms',bit:9,since:3},
{id:'perm.accessibility',bit:10,since:3},
{id:'perm.assemble',bit:11,since:3},
{id:'perm.printhq',bit:12,since:3},
];
export function permissionsIn(p,revision){
const bits=p|0;
return BITS
.filter((entry)=>revision>=entry.since)
.map((entry)=>({
...entry,
allowed:(bits&(1<<(entry.bit-1)))!==0,
}));
}
export function refusedIn(permissions){
return permissions.filter((entry)=>!entry.allowed);
}
