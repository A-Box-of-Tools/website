/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function runContext(request){
const resolution=request.scale===0.5?'half':request.scale===0.25?'quarter':'full';
return{
method:`result.method.${request.mode}`,
alignment:`result.alignment.${request.align}`,
resolution:`result.resolution.${resolution}`,
gain:Number(Number(request.gain).toPrecision(4)),
encoding:request.format==='jpeg'
?{key:'result.encoding.jpeg',values:{quality:Math.round(request.quality*100)}}
:{key:'result.encoding.png',values:{}},
parameter:request.mode==='sigma'
?{key:'result.settings.sigma',values:{kappa:Number(request.kappa).toFixed(1)}}
:request.mode==='focus'
?{key:'result.settings.focus',values:{radius:request.radius}}
:null,
};
}
