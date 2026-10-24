/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const DEG='°';
const ORIENTATION={
1:'Normal',
2:'Mirrored horizontally',
3:`Rotated 180${DEG}`,
4:'Mirrored vertically',
5:`Mirrored, rotated 270${DEG}`,
6:`Rotated 90${DEG} clockwise`,
7:`Mirrored, rotated 90${DEG}`,
8:`Rotated 270${DEG} clockwise`,
};
const RESOLUTION_UNIT={1:'None',2:'Inches',3:'Centimetres'};
const EXPOSURE_PROGRAM={
0:'Not defined',
1:'Manual',
2:'Program',
3:'Aperture priority',
4:'Shutter priority',
5:'Creative (slow speed)',
6:'Action (fast speed)',
7:'Portrait',
8:'Landscape',
};
const METERING_MODE={
0:'Unknown',
1:'Average',
2:'Centre-weighted average',
3:'Spot',
4:'Multi-spot',
5:'Pattern',
6:'Partial',
255:'Other',
};
const LIGHT_SOURCE={
0:'Unknown',
1:'Daylight',
2:'Fluorescent',
3:'Tungsten',
4:'Flash',
9:'Fine weather',
10:'Cloudy',
11:'Shade',
17:'Standard light A',
18:'Standard light B',
19:'Standard light C',
255:'Other',
};
const COLOR_SPACE={1:'sRGB',0xfffd:'Wide gamut sRGB',0xfffe:'Adobe RGB',0xffff:'Uncalibrated'};
const EXPOSURE_MODE={0:'Auto',1:'Manual',2:'Auto bracket'};
const WHITE_BALANCE={0:'Auto',1:'Manual'};
const SCENE_CAPTURE={0:'Standard',1:'Landscape',2:'Portrait',3:'Night scene'};
const CONTRAST={0:'Normal',1:'Soft',2:'Hard'};
const SATURATION={0:'Normal',1:'Low',2:'High'};
const SENSING_METHOD={
1:'Not defined',
2:'One-chip colour area',
3:'Two-chip colour area',
4:'Three-chip colour area',
5:'Colour sequential area',
7:'Trilinear',
8:'Colour sequential linear',
};
const CUSTOM_RENDERED={0:'Normal',1:'Custom'};
const GAIN_CONTROL={0:'None',1:'Low gain up',2:'High gain up',3:'Low gain down',4:'High gain down'};
const SUBJECT_DISTANCE_RANGE={0:'Unknown',1:'Macro',2:'Close',3:'Distant'};
const YCBCR_POSITIONING={1:'Centred',2:'Co-sited'};
const COMPRESSION={1:'Uncompressed',6:'JPEG'};
const ALTITUDE_REF={0:'Above sea level',1:'Below sea level'};
const GPS_DIFFERENTIAL={0:'No correction',1:'Differential correction applied'};
function describeFlash(value){
if(typeof value!=='number')return null;
if((value&0x20)!==0)return'No flash on this camera';
const parts=[(value&1)?'Fired':'Did not fire'];
if((value&0x18)===0x18)parts.push('auto');
else if((value&0x18)===0x08)parts.push('forced on');
else if((value&0x18)===0x10)parts.push('forced off');
if((value&0x40)!==0)parts.push('red-eye reduction');
return parts.join(', ');
}
const round=(n,places)=>Number(n.toFixed(places)).toString();
const asSeconds=(v)=>{
if(typeof v!=='number'||!isFinite(v)||v<=0)return null;
return v>=1?`${round(v, 2)} s`:`1/${Math.round(1 / v)} s`;
};
export const IMAGE_TAGS={
0x00fe:{name:'NewSubfileType'},
0x0100:{name:'Image width',unit:'px'},
0x0101:{name:'Image height',unit:'px'},
0x0102:{name:'Bits per sample'},
0x0103:{name:'Compression',values:COMPRESSION},
0x0106:{name:'Photometric interpretation'},
0x010e:{name:'Image description',edit:'text'},
0x010f:{name:'Camera make',edit:'text'},
0x0110:{name:'Camera model',edit:'text',risk:'medium',note:'names the device the photo came from'},
0x0111:{name:'Strip offsets'},
0x0112:{name:'Orientation',edit:'enum',values:ORIENTATION},
0x0115:{name:'Samples per pixel'},
0x0116:{name:'Rows per strip'},
0x0117:{name:'Strip byte counts'},
0x011a:{name:'X resolution',edit:'rational'},
0x011b:{name:'Y resolution',edit:'rational'},
0x0128:{name:'Resolution unit',edit:'enum',values:RESOLUTION_UNIT},
0x012d:{name:'Transfer function'},
0x0131:{name:'Software',edit:'text',risk:'medium',note:'names the app, phone or edit history behind the file'},
0x0132:{name:'File changed',edit:'text',risk:'medium',note:'a timestamp of when the file was last written'},
0x013b:{name:'Artist',edit:'text',risk:'high',note:'usually a real name'},
0x013e:{name:'White point'},
0x013f:{name:'Primary chromaticities'},
0x0201:{name:'Thumbnail offset'},
0x0202:{name:'Thumbnail length',unit:'bytes'},
0x0211:{name:'YCbCr coefficients'},
0x0212:{name:'YCbCr sub-sampling'},
0x0213:{name:'YCbCr positioning',values:YCBCR_POSITIONING},
0x0214:{name:'Reference black/white'},
0x02bc:{name:'XMP packet',risk:'medium',note:'a block of XML that often repeats the camera and edit history'},
0x8298:{name:'Copyright',edit:'text'},
0x83bb:{name:'IPTC block',risk:'high',note:'the caption and byline fields a photo desk fills in'},
0x8769:{name:'Exif IFD pointer'},
0x8773:{name:'Embedded ICC profile'},
0x8825:{name:'GPS IFD pointer'},
0x9c9b:{name:'Title (Windows)',edit:'text'},
0x9c9c:{name:'Comment (Windows)',edit:'text'},
0x9c9d:{name:'Author (Windows)',edit:'text',risk:'high',note:'usually a real name'},
0x9c9e:{name:'Keywords (Windows)',edit:'text'},
0x9c9f:{name:'Subject (Windows)',edit:'text'},
0xc4a5:{name:'Print image matching'},
0xc614:{name:'Unique camera model',risk:'medium',note:'names the device the photo came from'},
};
export const EXIF_TAGS={
0x829a:{name:'Exposure time',format:asSeconds},
0x829d:{name:'Aperture',format:(v)=>(typeof v==='number'?`f/${round(v, 1)}`:null)},
0x8822:{name:'Exposure program',values:EXPOSURE_PROGRAM},
0x8824:{name:'Spectral sensitivity'},
0x8827:{name:'ISO',edit:'int'},
0x8828:{name:'Opto-electric conversion function'},
0x8830:{name:'Sensitivity type'},
0x8831:{name:'Standard output sensitivity'},
0x8832:{name:'Recommended exposure index'},
0x8833:{name:'ISO speed'},
0x9000:{name:'Exif version'},
0x9003:{name:'Taken',edit:'text',risk:'medium',note:'the moment the shutter fired, to the second'},
0x9004:{name:'Digitised',edit:'text',risk:'medium',note:'when the file was created, to the second'},
0x9010:{name:'Time zone',edit:'text',risk:'medium',note:'narrows down where in the world you were'},
0x9011:{name:'Time zone (taken)',edit:'text',risk:'medium',note:'narrows down where in the world you were'},
0x9012:{name:'Time zone (digitised)',edit:'text',risk:'medium',note:'narrows down where in the world you were'},
0x9101:{name:'Components configuration'},
0x9102:{name:'Compressed bits per pixel'},
0x9201:{name:'Shutter speed value',format:(v)=>(typeof v==='number'?asSeconds(2**-v):null)},
0x9202:{name:'Aperture value'},
0x9203:{name:'Brightness value'},
0x9204:{name:'Exposure compensation',unit:'EV'},
0x9205:{name:'Max aperture value'},
0x9206:{name:'Subject distance',unit:'m'},
0x9207:{name:'Metering mode',values:METERING_MODE},
0x9208:{name:'Light source',values:LIGHT_SOURCE},
0x9209:{name:'Flash',format:describeFlash},
0x920a:{name:'Focal length',format:(v)=>(typeof v==='number'?`${round(v, 1)} mm`:null)},
0x9214:{name:'Subject area'},
0x927c:{
name:'Maker note',
risk:'high',
note:"the manufacturer's private block - serial numbers and lens data live here",
},
0x9286:{name:'User comment',edit:'text'},
0x9290:{name:'Sub-second time'},
0x9291:{name:'Sub-second time (taken)'},
0x9292:{name:'Sub-second time (digitised)'},
0x9400:{name:'Ambient temperature',unit:`${DEG}C`},
0x9401:{name:'Humidity',unit:'%'},
0x9403:{name:'Pressure',unit:'hPa'},
0x9405:{name:'Water depth',unit:'m'},
0x9406:{name:'Acceleration'},
0x9407:{name:'Camera elevation angle',unit:DEG},
0xa000:{name:'FlashPix version'},
0xa001:{name:'Colour space',values:COLOR_SPACE},
0xa002:{name:'Pixel width',unit:'px'},
0xa003:{name:'Pixel height',unit:'px'},
0xa004:{name:'Related sound file',risk:'medium',note:'names another file that was on the device'},
0xa005:{name:'Interoperability IFD pointer'},
0xa20b:{name:'Flash energy'},
0xa20e:{name:'Focal plane X resolution'},
0xa20f:{name:'Focal plane Y resolution'},
0xa210:{name:'Focal plane resolution unit',values:RESOLUTION_UNIT},
0xa214:{name:'Subject location'},
0xa215:{name:'Exposure index'},
0xa217:{name:'Sensing method',values:SENSING_METHOD},
0xa300:{name:'File source'},
0xa301:{name:'Scene type'},
0xa302:{name:'CFA pattern'},
0xa401:{name:'Custom rendered',values:CUSTOM_RENDERED},
0xa402:{name:'Exposure mode',values:EXPOSURE_MODE},
0xa403:{name:'White balance',values:WHITE_BALANCE},
0xa404:{name:'Digital zoom ratio'},
0xa405:{name:'Focal length (35 mm equivalent)',unit:'mm'},
0xa406:{name:'Scene capture type',values:SCENE_CAPTURE},
0xa407:{name:'Gain control',values:GAIN_CONTROL},
0xa408:{name:'Contrast',values:CONTRAST},
0xa409:{name:'Saturation',values:SATURATION},
0xa40a:{name:'Sharpness',values:CONTRAST},
0xa40b:{name:'Device setting description'},
0xa40c:{name:'Subject distance range',values:SUBJECT_DISTANCE_RANGE},
0xa420:{name:'Image unique ID',edit:'text',risk:'high',note:'a per-photo identifier that links copies of the same file together'},
0xa430:{name:'Camera owner',edit:'text',risk:'high',note:'a name typed into the camera'},
0xa431:{name:'Camera serial number',edit:'text',risk:'high',note:'ties every photo you take to one physical body'},
0xa432:{name:'Lens specification'},
0xa433:{name:'Lens make',edit:'text'},
0xa434:{name:'Lens model',edit:'text'},
0xa435:{name:'Lens serial number',edit:'text',risk:'high',note:'ties every photo you take to one physical lens'},
0xa460:{name:'Composite image'},
0xa461:{name:'Source image count'},
0xa462:{name:'Source exposure times'},
};
export const GPS_TAGS={
0x0000:{name:'GPS version'},
0x0001:{name:'Latitude reference'},
0x0002:{name:'Latitude'},
0x0003:{name:'Longitude reference'},
0x0004:{name:'Longitude'},
0x0005:{name:'Altitude reference',values:ALTITUDE_REF},
0x0006:{name:'Altitude',unit:'m'},
0x0007:{name:'GPS time (UTC)'},
0x0008:{name:'Satellites'},
0x0009:{name:'Receiver status'},
0x000a:{name:'Measure mode'},
0x000b:{name:'Dilution of precision'},
0x000c:{name:'Speed unit'},
0x000d:{name:'Speed'},
0x000e:{name:'Track reference'},
0x000f:{name:'Track'},
0x0010:{name:'Image direction reference'},
0x0011:{name:'Image direction',unit:DEG},
0x0012:{name:'Map datum'},
0x0013:{name:'Destination latitude reference'},
0x0014:{name:'Destination latitude'},
0x0015:{name:'Destination longitude reference'},
0x0016:{name:'Destination longitude'},
0x0017:{name:'Destination bearing reference'},
0x0018:{name:'Destination bearing'},
0x0019:{name:'Destination distance reference'},
0x001a:{name:'Destination distance'},
0x001b:{name:'Processing method'},
0x001c:{name:'Area information'},
0x001d:{name:'GPS date (UTC)'},
0x001e:{name:'Differential correction',values:GPS_DIFFERENTIAL},
0x001f:{name:'Horizontal positioning error',unit:'m'},
};
export const INTEROP_TAGS={
0x0001:{name:'Interoperability index'},
0x0002:{name:'Interoperability version'},
};
export const DICTIONARIES={
ifd0:IMAGE_TAGS,
exif:EXIF_TAGS,
gps:GPS_TAGS,
interop:INTEROP_TAGS,
ifd1:IMAGE_TAGS,
};
export const GROUP_LABELS={
ifd0:{title:'Image',note:'The camera, the software, and when the file was written.'},
exif:{title:'Camera settings',note:'How the shot was taken, and when the shutter fired.'},
gps:{title:'Location',note:'Where the photo was taken, usually to within a few metres.'},
interop:{title:'Interoperability',note:'Two housekeeping tags. Nothing personal.'},
ifd1:{title:'Thumbnail',note:'A second, smaller copy of the picture, with tags of its own.'},
};
export function describeTag(group,tag){
return DICTIONARIES[group]?.[tag]
??{name:`Tag 0x${tag.toString(16).padStart(4, '0')}`};
}
export{describeFlash};
