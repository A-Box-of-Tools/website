/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SAMPLES={
'yaml-json':{
a:[
'# Which region the renderer runs in. This comment does not survive the',
'# trip: JSON has nowhere to put one.',
'service: renderer',
'replicas: 2',
'regions:',
'  - eu-west',
'  - us-east',
'flags:',
'  cache: true',
'  debug: false',
'country: no',
'account: 90071992547409931234',
].join('\n'),
},
'json-yaml':{
a:[
'{',
'  "service": "renderer",',
'  "replicas": 2,',
'  "regions": ["eu-west", "us-east"],',
'  "flags": { "cache": true, "debug": false },',
'  "note": "no",',
'  "version": "1.10",',
'  "command": "run --watch\\nreload --graceful"',
'}',
].join('\n'),
},
};
