/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SAMPLES={
format:{
language:'json',
a:'{"10":"ten","2":"two","name":"a box of tools","tags":["local","offline"],'
+'"limits":{"files":null,"size":1e999},"price":0.1,"free":true}',
},
convert:{
conversion:'json-yaml',
a:[
'{',
'  "service": "renderer",',
'  "replicas": 2,',
'  "regions": ["eu-west", "us-east"],',
'  "flags": { "cache": true, "debug": false },',
'  "note": "no",',
'  "command": "run --watch\nreload --graceful"',
'}',
].join('\n'),
},
};
