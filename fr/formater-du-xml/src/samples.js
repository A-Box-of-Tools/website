/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SAMPLES={
format:{
a:[
'<?xml version="1.0" encoding="UTF-8"?>',
'<catalogue lang="en">',
'<!-- prices exclude tax -->',
'        <item sku="A-1"><name>Ratchet</name>',
'   <price currency="GBP">18.00</price></item>',
'  <item sku="A-2">',
'<name>Socket set</name><price currency="GBP">42.50</price><note/>',
'    </item>',
'</catalogue>',
].join('\n'),
},
convert:{
conversion:'xml-json',
a:[
'<?xml version="1.0" encoding="UTF-8"?>',
'<server name="renderer">',
'  <region>eu-west</region>',
'  <region>us-east</region>',
'  <replicas>2</replicas>',
'  <flags cache="true" debug="false"/>',
'</server>',
].join('\n'),
},
};
