import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// This little world uses meters as miniature-design units. Every asset is modeled here.
awaitReady();
async function awaitReady(){
  await document.fonts.load('80px Uyghur');
  start();
}
function start(){
const canvas=document.getElementById('world');
const low=matchMedia('(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,low?1.5:1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x142b3a,.018);
const camera=new THREE.PerspectiveCamera(innerWidth<innerHeight?48:36,innerWidth/innerHeight,.1,180);
camera.position.set(17,16,22);
const controls=new OrbitControls(camera,canvas);
controls.target.set(0,1.2,0);
controls.enableDamping=true;controls.dampingFactor=.065;
controls.enablePan=false;controls.rotateSpeed=.52;controls.zoomSpeed=.72;
controls.minDistance=11;controls.maxDistance=90;
controls.minPolarAngle=.28;controls.maxPolarAngle=1.39;
controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
controls.update();
function frameWholeModel(){
 camera.fov=camera.aspect<1?48:36;camera.updateProjectionMatrix();
 const direction=new THREE.Vector3(.57,.55,.74).normalize();
 const corners=[];for(const x of [-14.15,14.15])for(const y of [-.5,7.2])for(const z of [-14.15,14.15])corners.push(new THREE.Vector3(x,y,z));
 let distance=24;
 for(let i=0;i<75;i++){
  camera.position.copy(controls.target).addScaledVector(direction,distance);camera.lookAt(controls.target);camera.updateMatrixWorld();
  const fits=corners.every(p=>{const q=p.clone().project(camera);return Math.abs(q.x)<.89&&Math.abs(q.y)<.89;});
  if(fits)break;distance*=1.035;
 }
 controls.maxDistance=Math.max(42,distance*1.35);controls.update();
}
frameWholeModel();
const ambient=new THREE.HemisphereLight(0xabc9e5,0x394251,2.05);scene.add(ambient);
const moon=new THREE.DirectionalLight(0x9ec5e8,3.1);
moon.position.set(-8,17,8);moon.castShadow=true;
moon.shadow.mapSize.set(low?1024:2048,low?1024:2048);
Object.assign(moon.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:40});
moon.shadow.bias=-.0007;moon.shadow.normalBias=.025;
scene.add(moon);
const warmLights=[];
function rememberWarm(light,intensity){light.userData.nightIntensity=intensity;warmLights.push(light);return light;}
const warm=rememberWarm(new THREE.PointLight(0xffbd69,45,10,2),45);warm.position.set(.6,2.25,.1);scene.add(warm);
const fill=rememberWarm(new THREE.PointLight(0xffd58b,22,7,2),22);fill.position.set(-1.3,2.1,-1.7);scene.add(fill);
const sideWarm=rememberWarm(new THREE.PointLight(0xffca7b,16,7,2),16);sideWarm.position.set(3.4,1.8,-.4);scene.add(sideWarm);
let seed=763;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const bandData=new Uint8Array([92,160,207,255]);
const gradient=new THREE.DataTexture(bandData,4,1,THREE.RedFormat);
gradient.minFilter=gradient.magFilter=THREE.NearestFilter;gradient.needsUpdate=true;
function toon(color,extra={}){return new THREE.MeshToonMaterial({color,gradientMap:gradient,...extra});}
function standard(color,roughness=.75,extra={}){return new THREE.MeshStandardMaterial({color,roughness,...extra});}
const M={
 plaster:toon(0xd1b386),plasterLight:toon(0xe3cda2),plasterOld:toon(0xbca078),
 wood:toon(0x704a31),woodLight:toon(0xaa7c47),woodDark:toon(0x3d3028),
 teal:toon(0x227f80),blue:toon(0x24586e),tile:standard(0x369c99,.45),tileCream:toon(0xe0cda0),
 iron:standard(0x243b40,.48,{metalness:.35}),ironLight:standard(0x6c8081,.5,{metalness:.3}),
 road:standard(0x1d313c,.3,{metalness:.18}),stone:toon(0x6b7c7e),stoneLight:toon(0x929891),
 brick:toon(0x8c6954),brick2:toon(0xa18266),roof:toon(0x665d51),
 cream:toon(0xd7cbb1),white:toon(0xe8dcc5),cardboard:toon(0xa28354),
 red:toon(0xaa5643),green:toon(0x658251),yellow:toon(0xba9b4b),
 bread:toon(0xc89449),breadDark:toon(0x966433),leaf:toon(0x456d60),leaf2:toon(0x638273),
 orange:toon(0xcb8746),raisin:toon(0x5a4641),nuts:toon(0xb09266),
 light:standard(0xffdfa0,.5,{emissive:0xffce7a,emissiveIntensity:2.1}),
 milk:toon(0xd4d0b1),water:standard(0x6babae,.17,{metalness:.1}),
 glass:new THREE.MeshPhysicalMaterial({color:0xa8d9d9,transparent:true,opacity:.09,roughness:.12,metalness:0,depthWrite:false,side:THREE.DoubleSide}),
 darkGlass:standard(0x172b38,.23,{metalness:.35}),rubber:toon(0x1b282d),
 fabric:toon(0x467572),
};
const staticParts=new Map(),edgePts=[];
const edgeMat=new THREE.LineBasicMaterial({color:0x162830,transparent:true,opacity:.45});
function solid(geo,mat,pos,rot=null,parent=null,outline=false){
 const o=new THREE.Mesh(geo,mat);o.position.set(...pos);if(rot)o.rotation.set(...rot);
 o.castShadow=true;o.receiveShadow=true;
 if(parent){parent.add(o);if(outline){const line=new THREE.LineSegments(new THREE.EdgesGeometry(geo,24),edgeMat);o.add(line);}return o;}
 o.updateMatrix();const g=geo.clone();g.applyMatrix4(o.matrix);
 if(!g.getAttribute('uv'))g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));
 const k=mat.uuid;if(!staticParts.has(k))staticParts.set(k,{mat,geos:[]});staticParts.get(k).geos.push(g.index?g.toNonIndexed():g);
 if(outline){const e=new THREE.EdgesGeometry(geo,25);e.applyMatrix4(o.matrix);edgePts.push(...e.attributes.position.array);e.dispose();}
 geo.dispose();return o;
}
function box(w,h,d,x,y,z,m=M.wood,edge=false,par=null,rot=null){return solid(new THREE.BoxGeometry(w,h,d),m,[x,y,z],rot,par,edge);}
function cyl(rt,rb,h,x,y,z,m=M.wood,n=12,rot=null,par=null){return solid(new THREE.CylinderGeometry(rt,rb,h,n),m,[x,y,z],rot,par);}
function sphere(r,x,y,z,m,par=null,sx=1,sy=1,sz=1){const g=new THREE.SphereGeometry(r,10,7);g.scale(sx,sy,sz);return solid(g,m,[x,y,z],null,par);}
function torus(r,t,x,y,z,m,rot=null,par=null){return solid(new THREE.TorusGeometry(r,t,7,28),m,[x,y,z],rot,par);}
function rod(a,b,r,m=M.iron,par=null,n=8){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),v=v2.clone().sub(v1);
 const g=new THREE.CylinderGeometry(r,r,v.length(),n);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());
 g.applyQuaternion(q);return solid(g,m,v1.add(v2).multiplyScalar(.5).toArray(),null,par);}
function line(points,color=0x446270,opacity=.5){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));scene.add(l);return l;}
function plane(w,h,x,y,z,m,rot=[0,0,0],par=null){return solid(new THREE.PlaneGeometry(w,h),m,[x,y,z],rot,par);}
function freezeGroup(group){
 group.updateMatrixWorld(true);
 group.traverse(o=>{if(o.isMesh){const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);solid(geo,o.material,[0,0,0]);}
 else if(o.isLineSegments){const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);edgePts.push(...geo.attributes.position.array);geo.dispose();}});
 scene.remove(group);
}
function compactGroup(group){
 group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),byMaterial=new Map();
 group.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(inv.clone().multiply(o.matrixWorld));
 const key=o.material.uuid;if(!byMaterial.has(key))byMaterial.set(key,{mat:o.material,geos:[]});byMaterial.get(key).geos.push(geo.index?geo.toNonIndexed():geo);
 });
 group.clear();for(const {mat,geos} of byMaterial.values()){const mesh=new THREE.Mesh(mergeGeometries(geos,false),mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);geos.forEach(g=>g.dispose());}
}
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d');fn(cx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function texMat(t,em=0){return new THREE.MeshStandardMaterial({map:t,roughness:.7,side:THREE.DoubleSide,emissive:0xffdfb5,emissiveMap:t,emissiveIntensity:em});}
// Pointed timber arches and eight-point rosettes establish the residential architecture.
function pointedShape(w,h){
 const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h*.56);
 s.bezierCurveTo(r,h*.78,r*.46,h*.88,0,h);
 s.bezierCurveTo(-r*.46,h*.88,-r,h*.78,-r,h*.56);s.lineTo(-r,0);s.closePath();return s;
}
function pointedPanel(w,h,d,x,y,z,m,turn=0){solid(new THREE.ExtrudeGeometry(pointedShape(w,h),{depth:d,bevelEnabled:false,curveSegments:18}),m,[x,y,z],[0,turn,0],null,true);}
function archFrame(w,h,t,d,x,y,z,m,turn=0){
 const s=pointedShape(w,h),inner=pointedShape(w-t*2,h-t*2).getPoints(24).reverse();
 const hole=new THREE.Path();inner.forEach((p,i)=>i?hole.lineTo(p.x,p.y+t):hole.moveTo(p.x,p.y+t));hole.closePath();s.holes.push(hole);
 solid(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:24}),m,[x,y,z],[0,turn,0],null,true);
}
function star(w,x,y,z,m=M.tileCream,turn=0){
 const s=new THREE.Shape();for(let i=0;i<16;i++){const a=Math.PI/2+i*Math.PI/8,r=i%2?w*.48:w;const px=Math.cos(a)*r,py=Math.sin(a)*r;i?s.lineTo(px,py):s.moveTo(px,py);}s.closePath();
 solid(new THREE.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false}),m,[x,y,z],[0,turn,0]);
}
function tileBand(x,y,z,w,turn=0){
 box(w,.20,.035,x,y,z,M.blue,true,null,[0,turn,0]);
 const n=Math.max(2,Math.floor(w/.28));for(let i=0;i<n;i++){const local=-w/2+(i+.5)*w/n;
  star(.077,x+Math.cos(turn)*local,y,z-Math.sin(turn)*local+.025,M.tileCream,turn);
 }
}
function carvedColumn(x,z,base,h,r=.075){
 cyl(r*1.42,r*1.68,.12,x,base+.06,z,M.woodDark,12);
 cyl(r,r*1.16,h-.26,x,base+h/2,z,M.wood,12);
 for(const yy of [base+.24,base+h*.48,base+h-.25]){cyl(r*1.15,r*1.15,.055,x,yy,z,M.woodLight,12);cyl(r*1.07,r*1.07,.022,x,yy+.054,z,M.teal,12);}
 cyl(r*1.54,r*1.15,.13,x,base+h-.065,z,M.woodLight,12);
 box(r*4,.07,r*3,x,base+h+.01,z,M.woodDark,true);
 for(const side of [-1,1])rod([x,base+h-.03,z],[x+side*.21,base+h+.15,z],.023,M.woodLight);
}
function carvedDoor(x,y,z,w,h,color=M.wood,turn=0){
 pointedPanel(w,h,.06,x,y,z,M.woodDark,turn);
 const g=new THREE.Group();g.position.set(x,y,z+.068);g.rotation.y=turn;scene.add(g);
 for(const side of [-1,1]){
  box(w*.42,h*.60,.038,side*w*.235,h*.33,0,color,true,g);
  for(const yy of [h*.15,h*.38,h*.56]){box(w*.31,.035,.024,side*w*.235,yy,.024,M.woodLight,false,g);}
  for(let j=0;j<3;j++){box(.016,h*.46,.02,side*w*.235+(j-1)*w*.085,h*.33,.024,M.woodDark,false,g);}
  torus(.043,.008,side*.055,h*.34,.055,M.ironLight,null,g);
 }
 freezeGroup(g);
 for(const side of [-1,1])for(const yy of [h*.19,h*.44])star(w*.072,x+side*w*.235,y+yy,z+.129,M.woodLight,turn);
 star(w*.13,x,y+h*.76,z+.075,M.tileCream,turn);
}
function arabicSign(text,w,h,bg='#20575c',fg='#eedab0',border=true){return tex(1024,256,(c,W,H)=>{
 c.fillStyle=bg;c.fillRect(0,0,W,H);
 if(border){c.strokeStyle='#619b95';c.lineWidth=5;c.strokeRect(16,16,W-32,H-32);c.strokeStyle='#b8a77c';c.lineWidth=2;c.strokeRect(27,27,W-54,H-54);
 for(const x of [68,W-68]){c.save();c.translate(x,H/2);c.rotate(Math.PI/4);c.strokeRect(-20,-20,40,40);c.strokeRect(-11,-11,22,22);c.restore();}}
 c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.font=`${text.length>10?90:142}px Uyghur`;c.fillStyle=fg;c.fillText(text,W/2,H*.48,W-200);
 });}
const signTex=arabicSign('دۇكان');
const signM=texMat(signTex,.65);
const atlas=tex(512,128,(c,w,h)=>{c.fillStyle='#335a58';c.fillRect(0,0,w,h);const colors=['#c3a369','#944e49','#6d9290','#d4c19d'];
 for(let i=0;i<12;i++){let x=i*44;for(let j=0;j<4;j++){c.fillStyle=colors[j];c.beginPath();c.moveTo(x+j*4,0);c.lineTo(x+18+j*4,h*.28);c.lineTo(x+6+j*4,h*.5);c.lineTo(x+28+j*4,h*.76);c.lineTo(x+13+j*4,h);c.lineTo(x+20+j*4,h);c.lineTo(x+35+j*4,h*.76);c.lineTo(x+13+j*4,h*.5);c.lineTo(x+25+j*4,h*.28);c.lineTo(x+7+j*4,0);c.fill();}}});
const atlasM=texMat(atlas);
const floorTex=tex(512,512,(c,w,h)=>{c.fillStyle='#b9aa8c';c.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=0;x<8;x++){
 c.fillStyle=(x+y)%2?'#b9aa8c':'#8b9e92';c.fillRect(x*64+1,y*64+1,62,62);c.strokeStyle='#6f867d';c.lineWidth=2;c.beginPath();c.moveTo(x*64+32,y*64+10);c.lineTo(x*64+53,y*64+32);c.lineTo(x*64+32,y*64+53);c.lineTo(x*64+11,y*64+32);c.closePath();c.stroke();}});
floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(3,2);
const tilesM=texMat(floorTex);
const plasterTex=tex(256,256,(c,w,h)=>{c.fillStyle='#e9dfc9';c.fillRect(0,0,w,h);for(let i=0;i<18000;i++){const a=rnd()*.12;c.fillStyle=`rgba(65,53,39,${a})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1);}});
plasterTex.wrapS=plasterTex.wrapT=THREE.RepeatWrapping;plasterTex.repeat.set(3,2);
M.plaster.map=plasterTex;M.plasterLight.map=plasterTex;M.plasterOld.map=plasterTex;

// Expanded square collectible base: the original shop corner now anchors a small village.
box(28,.6,28,0,-.13,0,M.woodDark,true);
box(27.9,.13,27.9,0,.235,0,M.stone,true);
box(28.07,.075,28.07,0,-.39,0,M.iron);
box(27.7,.085,27.7,0,.32,0,M.road);
box(11.7,.18,11,-1.95,.44,-2.2,M.stone,true);
box(1.02,.18,11.1,4.02,.44,-2.2,M.stoneLight,true);
box(10.72,.18,1.12,-.43,.44,2.39,M.stoneLight,true);
// Sidewalk slabs, stone texture and a few irregular chips along the curb.
for(let x=-5.5;x<4.25;x+=.56)for(let z=1.85;z<2.85;z+=.49)box(.525,.025,.455,x,.546,z,(Math.round(x*3+z*2)%3===0?M.stone:M.stoneLight));
for(let z=-7.35;z<2.6;z+=.52)for(let x=3.76;x<4.35;x+=.48)box(.43,.025,.48,x,.55,z,M.stoneLight);
for(let z=-3.9;z<2.65;z+=.53)for(let x=-4.5;x<-3.1;x+=.48)box(.445,.025,.495,x,.545,z,M.stone);
for(let x=-7.6;x<4.3;x+=.67)box(.62,.13,.18,x,.45,2.99,M.stone,true);
for(let z=-7.5;z<3;z+=.67)box(.18,.13,.62,4.56,.45,z,M.stone,true);
box(12,.02,.18,-1.5,.378,3.15,M.iron);
box(.18,.02,10.8,4.74,.378,-2.1,M.iron);
for(let x=-5;x<4;x+=2.4){box(.57,.025,.2,x,.397,3.16,M.ironLight);for(let k=0;k<7;k++)box(.028,.028,.19,x-.23+k*.077,.41,3.16,M.iron);}
for(let k=0;k<7;k++)box(.35,.016,2.05,-2.7+k*.59,.377,5.46,M.cream);
for(let k=0;k<5;k++)box(2.13,.016,.35,6.09,.377,.2+k*.58,M.cream);
// Two faded lane markers and road repair seams.
box(2.05,.007,.075,-5.58,.368,6.92,M.stone);
box(.075,.007,1.6,6.72,.368,-5.8,M.stone);
line([[-7,.374,4.32],[-4,.374,4.26],[-1.7,.374,4.43]],0x0b202b,.5);
line([[6.2,.374,-7],[6.13,.374,-4.7],[6.31,.374,-2.6]],0x0b202b,.5);

// Store volume: open front and side glazing, plaster piers and inset timber joinery.
box(6.6,.17,4.55,.45,.59,-1.08,M.woodDark,true);
box(6.42,.04,4.36,.45,.705,-1.08,tilesM);
box(6.6,3.02,.2,.45,2.18,-3.32,M.plaster,true);
box(.2,3.02,4.5,-2.84,2.18,-1.05,M.plaster,true);
box(6.6,.4,.22,.45,.86,1.17,M.plaster,true);
box(6.6,.19,.24,.45,3.58,1.17,M.plaster,true);
for(const x of [-2.84,-.41,1.24,3.73])box(.19,2.27,.21,x,2.0,1.17,M.plasterLight,true);
box(.2,.42,4.55,3.73,.88,-1.08,M.plaster,true);
box(.2,.19,4.55,3.73,3.58,-1.08,M.plaster,true);
for(const z of [-3.3,-2.5,-.15,1.18])box(.2,2.28,.19,3.73,2.02,z,M.plasterLight,true);
// Street-facing glass and wooden frames, kept almost clear to reveal everyday life.
function frontWindow(x,w,z=1.29){
 box(w+.12,.105,.17,x,1.16,z,M.wood,true);
 archFrame(w+.16,2.25,.075,.13,x,1.12,z-.045,M.wood);
 pointedPanel(w,2.10,.005,x,1.17,z+.013,M.glass);
 box(.052,1.58,.10,x,1.96,z+.042,M.woodDark,true);
 box(w-.11,.033,.055,x,2.30,z+.055,M.woodLight);
 archFrame(w-.12,2.00,.026,.034,x,1.22,z+.07,M.woodLight);
 star(.15,x,3.065,z+.065,M.teal);
}
frontWindow(-1.64,2.16);frontWindow(2.49,2.18);
function sideWindow(z,w){
 box(.17,.105,w+.08,3.84,1.16,z,M.wood,true);
 archFrame(w+.12,2.23,.06,.11,3.80,1.13,z,M.wood,Math.PI/2);
 pointedPanel(w,2.10,.005,3.86,1.17,z,M.glass,Math.PI/2);
 box(.10,1.6,.045,3.89,1.98,z,M.woodDark,true);
 box(.06,.033,w,3.9,2.29,z,M.woodLight);
 star(.11,3.92,3.06,z,M.teal,Math.PI/2);
}
sideWindow(-1.33,2.16);sideWindow(.48,.94);
// Sliding front doors use independently animated panel groups.
const doorPanels=[];
for(let i=0;i<2;i++){const g=new THREE.Group();g.position.set(.055+i*.755,0,1.31);scene.add(g);doorPanels.push(g);
 box(.73,.075,.09,0,.82,0,M.wood,true,g);box(.73,.075,.09,0,2.98,0,M.wood,true,g);
 box(.045,2.1,.095,-.342,1.9,0,M.wood,true,g);box(.045,2.1,.095,.342,1.9,0,M.wood,true,g);
 plane(.67,2.04,0,1.9,.006,M.glass,[0,0,0],g);rod([i?-.25:.25,1.45,.09],[i?-.25:.25,1.88,.09],.024,M.ironLight,g);}
box(1.65,.075,.19,.43,3.055,1.3,M.woodDark,true);
archFrame(1.91,2.95,.13,.16,.43,.74,1.25,M.woodLight);
archFrame(1.64,2.68,.044,.06,.43,.87,1.43,M.teal);
star(.145,.43,3.40,1.43,M.tileCream);
box(1.54,.03,.5,.43,.56,1.77,M.woodDark);
plane(1.46,.47,.43,.581,1.76,atlasM,[-Math.PI/2,0,0]);
// Subtle geometric tile borders set into the plaster, with carved corner rosettes.
for(let x=-2.7;x<3.75;x+=.24){box(.21,.18,.045,x,.967,1.301,Math.round(x*5)%2?M.tile:M.tileCream);}
for(let z=-3.1;z<1.2;z+=.24)box(.045,.18,.21,3.855,.967,z,Math.round(z*5)%2?M.tile:M.tileCream);
for(const x of [-2.8,-.41,1.25,3.72])for(let y=1.37;y<2.9;y+=.42){box(.11,.11,.023,x,y,1.302,M.teal,false,null,[0,0,Math.PI/4]);}
// Earthen flat roof, substantial parapets, brick rosettes and a raised arched sign plaque.
box(7.04,.17,4.98,.45,3.76,-1.08,M.woodDark,true);
box(6.82,.2,4.82,.45,3.91,-1.08,M.roof,true);
box(6.86,.38,.20,.45,4.11,-3.44,M.plaster,true);
box(.20,.38,4.86,-2.96,4.11,-1.08,M.plaster,true);
box(.20,.38,4.86,3.86,4.11,-1.08,M.plaster,true);
box(6.85,.35,.21,.45,4.10,1.40,M.plasterLight,true);
box(6.91,.07,.29,.45,4.305,1.4,M.brick2,true);
for(let x=-2.77;x<3.8;x+=.43){box(.23,.12,.22,x,4.42,1.40,M.plasterLight,true);star(.075,x,4.1,1.516,M.teal);}
for(let z=-3.26;z<1.2;z+=.42){box(.20,.11,.23,3.86,4.43,z,M.plasterLight,true);star(.075,3.973,4.10,z,M.teal,Math.PI/2);}
pointedPanel(2.02,1.29,.22,.43,3.53,1.47,M.plasterLight);
pointedPanel(1.69,1.08,.05,.43,3.61,1.70,M.teal);
archFrame(1.87,1.17,.054,.031,.43,3.58,1.763,M.tileCream);
plane(1.38,.38,.43,3.99,1.814,signM);
star(.085,.43,4.48,1.778,M.tileCream);
// A flat carved-timber porch replaces the broad low shop awning.
for(let x=-3.13;x<4.12;x+=.25)box(.245,.075,1.17,x,3.76,1.87,M.woodLight);
box(7.4,.16,.18,.45,3.63,2.42,M.woodDark,true);
box(7.38,.052,.24,.45,3.745,2.42,M.woodLight,true);
for(const x of [-3.11,-.47,1.35,4.0])carvedColumn(x,2.33,.55,2.51,.063);
for(const [x,w] of [[-1.79,2.68],[.44,1.86],[2.675,2.70]]){
 archFrame(w,2.46,.09,.095,x,1.18,2.31,M.wood);
 archFrame(w-.21,2.25,.034,.04,x,1.27,2.408,M.woodLight);
}
tileBand(.45,3.48,2.43,7.23);
plane(1.45,.10,.43,3.30,2.48,atlasM);
// Exposed rear brick repair, roof utilities and AC units.
for(let row=0;row<4;row++)for(let k=0;k<6;k++)box(.32,.16,.022,-2.36+k*.35+(row%2)*.13,.85+row*.18,-3.43,row%2?M.brick:M.brick2,true);
function aircon(x,y,z,turn=false){const g=new THREE.Group();g.position.set(x,y,z);if(turn)g.rotation.y=Math.PI/2;
 // Static bake these local parts after applying the group transform.
 const parts=[];function b(w,h,d,a,b,c,m){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(a,b,c);g.add(q);parts.push(q);}
 b(.9,.57,.36,0,0,0,M.cream);b(.47,.42,.02,-.13,0,.19,M.ironLight);
 for(let i=0;i<7;i++)b(.25,.018,.025,.27,-.18+i*.06,.2,M.iron);
 const fan=new THREE.Mesh(new THREE.TorusGeometry(.17,.011,6,20),M.iron);fan.position.set(-.13,0,.213);g.add(fan);
 for(let i=0;i<6;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.025,.29,.018),M.iron);blade.position.set(-.13,0,.214);blade.rotation.z=i*Math.PI/3;g.add(blade);}
 g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const gg=o.geometry.clone();gg.applyMatrix4(o.matrixWorld);solid(gg,o.material,[0,0,0]);}});
}
aircon(-2.84,2.5,-2.5,true);aircon(2.4,4.38,-2.61);
box(.8,.04,.53,2.4,4.065,-2.58,M.iron);
cyl(.24,.24,.5,-1.9,4.31,-2.35,M.ironLight,16);
cyl(.34,.34,.06,-1.9,4.59,-2.35,M.iron,16);
rod([2.74,4.45,-2.7],[3.6,4.45,-2.7],.02,M.ironLight);
rod([3.6,4.45,-2.7],[3.6,1.0,-2.7],.02,M.ironLight);

// Store shelves, hundreds of small stocked objects and recognizably Uyghur food.
function shelf(x,z,w=2.0,h=2.02,d=.38,turn=false){
 const g=new THREE.Group();g.position.set(x,.72,z);if(turn)g.rotation.y=Math.PI/2;
 function part(geo,m,p,r=null){const q=new THREE.Mesh(geo,m);q.position.set(...p);if(r)q.rotation.set(...r);g.add(q);return q;}
 for(const xx of [-w/2,w/2])part(new THREE.BoxGeometry(.06,h,.06),M.woodDark,[xx,h/2,0]);
 part(new THREE.BoxGeometry(w,h,.04),M.wood,[0,h/2,-d/2]);
 for(let row=0;row<4;row++){
 const yy=.12+row*(h-.22)/4;part(new THREE.BoxGeometry(w,.055,d),M.woodLight,[0,yy,0]);
 for(let j=0;j<Math.floor(w/.145);j++){
 const xx=-w/2+.09+j*.145;const choice=(row+j)%7;const col=[M.green,M.red,M.yellow,M.cream,M.teal,M.orange,M.milk][choice];
 if(row===2||row===0){part(new THREE.CylinderGeometry(.038,.044,.21,8),col,[xx,yy+.13,.015]);part(new THREE.CylinderGeometry(.018,.018,.065,8),M.cream,[xx,yy+.267,.015]);part(new THREE.BoxGeometry(.072,.075,.003),M.cream,[xx,yy+.145,.061]);}
 else{part(new THREE.BoxGeometry(.104,.20+(j%3)*.025,.12),col,[xx,yy+.13,.012]);part(new THREE.BoxGeometry(.065,.047,.008),M.cream,[xx,yy+.155,.078]);}
 }
 // Small shelf-edge price cards.
 for(let n=0;n<3;n++)part(new THREE.BoxGeometry(.12,.053,.008),M.cream,[-w*.3+n*w*.3,yy-.016,d/2+.006]);
 }
 g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh){const gg=o.geometry.clone();gg.applyMatrix4(o.matrixWorld);solid(gg,o.material,[0,0,0]);}});
}
shelf(-1.25,-3.05,2.56);shelf(1.71,-3.05,2.2);shelf(-2.5,-1.79,1.85,1.85,.38,true);
shelf(.1,-1.23,1.74,1.1,.44);
// Display table with bowls of raisins and dried fruit, plus round stamped naan.
box(2.0,.1,.66,-1.53,1.33,.6,M.woodLight,true);
for(const x of [-2.34,-.72])for(const z of [.37,.83])box(.07,.59,.07,x,1.0,z,M.woodDark);
function naan(x,y,z,r=.22,turn=0){
 cyl(r*.95,r,.054,x,y,z,M.bread,24,[turn,0,0]);
 torus(r*.73,.018,x,y+.032,z,M.breadDark,[Math.PI/2+turn,0,0]);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const rr=r*.38; sphere(.011,x+Math.cos(a)*rr,y+.033,z+Math.sin(a)*rr,M.breadDark,null,1,.24,1);}
 sphere(r*.35,x,y+.032,z,M.breadDark,null,1,.055,1);
 for(let i=0;i<9;i++){const a=i*2.4;const rr=r*.66; sphere(.009,x+Math.cos(a)*rr,y+.04,z+Math.sin(a)*rr,M.cream,null,1,.3,1);}
}
for(let i=0;i<4;i++)naan(-2.23+(i%2)*.45,1.42+Math.floor(i/2)*.064,.6,.217);
function bowl(x,y,z,r=.13,m=M.teal){cyl(r,r*.65,.1,x,y,z,m,18);torus(r,.012,x,y+.052,z,M.tileCream,[Math.PI/2,0,0]);}
for(let j=0;j<3;j++){bowl(-1.21+j*.3,1.40,.61,.13);for(let n=0;n<13;n++){let a=rnd()*Math.PI*2,rr=rnd()*.09;sphere(.021,-1.21+j*.3+Math.cos(a)*rr,1.465+Math.floor(n/5)*.01,.61+Math.sin(a)*rr,j===0?M.raisin:j===1?M.nuts:M.orange,null,1,.65,1.3);}}
// Counter, compact scale, old till, kettle and tea bowls.
box(1.78,.76,.59,2.53,1.10,.63,M.teal,true);
box(1.9,.085,.72,2.53,1.53,.63,M.woodLight,true);
plane(1.63,.40,2.53,1.17,.934,atlasM);
box(.38,.2,.32,2.78,1.67,.6,M.cream,true);box(.32,.035,.27,2.78,1.782,.58,M.ironLight,true);
box(.23,.2,.08,2.8,1.74,.76,M.iron,true);box(.15,.06,.01,2.8,1.78,.806,M.teal);
box(.28,.06,.23,3.13,1.61,.54,M.iron,true);
box(.22,.2,.05,3.13,1.75,.46,M.iron,true,null,[-.15,0,0]);plane(.17,.12,3.13,1.76,.488,M.darkGlass);
const kettlePos=new THREE.Vector3(1.99,1.72,.58);
sphere(.125,1.99,1.72,.58,M.ironLight,null,1,1.04,1);
cyl(.085,.085,.018,1.99,1.84,.58,M.iron);sphere(.025,1.99,1.87,.58,M.woodDark);
rod([2.08,1.74,.58],[2.20,1.80,.58],.027,M.ironLight);
torus(.12,.017,1.87,1.76,.58,M.woodDark,[0,Math.PI/2,0]);
for(let j=0;j<2;j++)bowl(1.93+j*.22,1.61,.86,.07,M.cream);
naan(2.38,1.604,.78,.18);
// Drink fridge with glass cabinet and rows of drinks.
box(.86,1.8,.56,2.93,1.64,-2.32,M.cream,true);
box(.76,1.56,.045,2.93,1.64,-2.012,M.woodDark,true);
box(.68,1.4,.018,2.93,1.68,-1.982,M.darkGlass);
const fridgeGlow=new THREE.MeshBasicMaterial({color:0xc5e7df});
box(.015,1.33,.014,2.615,1.68,-1.955,fridgeGlow);
for(let row=0;row<4;row++){
 box(.64,.026,.23,2.93,1.02+row*.34,-1.94,M.ironLight);
 for(let j=0;j<4;j++){cyl(.037,.04,.16,2.685+j*.157,1.13+row*.34,-1.94,[M.green,M.red,M.water,M.yellow][j],8);cyl(.015,.015,.048,2.685+j*.157,1.23+row*.34,-1.94,M.cream,8);}}
plane(.69,1.42,2.93,1.67,-1.81,M.glass);rod([3.21,1.4,-1.787],[3.21,1.84,-1.787],.016,M.ironLight);
// Chest freezer and small back-room refrigerator.
box(.97,.66,.58,.93,1.065,-2.45,M.cream,true);box(1,.06,.6,.93,1.423,-2.45,M.teal,true);
box(.77,.024,.4,.93,1.457,-2.45,M.darkGlass);rod([.72,1.46,-2.18],[1.15,1.46,-2.18],.018,M.ironLight);
box(.61,1.02,.53,-2.39,1.23,-2.63,M.cream,true);box(.57,.025,.02,-2.39,1.43,-2.353,M.ironLight);
rod([-2.17,1.21,-2.34],[-2.17,1.4,-2.34],.014,M.iron);
// Carved storage door on the back wall, framed with a small arch.
box(.68,1.79,.04,.32,1.615,-3.195,M.woodDark,true);
for(let j=0;j<5;j++)box(.102,1.72,.025,.08+j*.12,1.62,-3.165,M.wood);
for(let j=0;j<3;j++)box(.48,.035,.027,.32,1.0+j*.56,-3.14,M.woodLight);
sphere(.025,.56,1.52,-3.125,M.ironLight);
// Cardboard stock and a folded textile on an upper shelf.
for(let j=0;j<4;j++){box(.36,.25,.29,-.46+j*.41,.86,-2.17,M.cardboard,true);box(.05,.009,.29,-.46+j*.41,.99,-2.17,M.cream);}
box(.82,.055,.41,-2.32,2.75,-.83,M.woodDark);box(.55,.07,.28,-2.32,2.82,-.83,M.fabric);plane(.54,.26,-2.32,2.858,-.83,atlasM,[-Math.PI/2,0,0]);
const priceTex=tex(256,96,(c,w,h)=>{c.fillStyle='#e8dbc0';c.fillRect(0,0,w,h);c.fillStyle='#394b4c';c.font='35px Uyghur';c.direction='rtl';c.textAlign='center';c.fillText('نان',w/2,36);c.font='26px sans-serif';c.fillText('3.00',w/2,76);});
plane(.24,.09,-1.94,1.315,.948,texMat(priceTex));
const teaPoster=tex(256,384,(c,w,h)=>{c.fillStyle='#ab7954';c.fillRect(0,0,w,h);c.strokeStyle='#e4c79a';c.lineWidth=8;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#f1dfb3';c.direction='rtl';c.textAlign='center';c.font='58px Uyghur';c.fillText('چاي',w/2,85);c.beginPath();c.ellipse(w/2,230,65,31,0,0,Math.PI);c.fill();c.lineWidth=3;for(let j=0;j<3;j++){c.beginPath();c.moveTo(95+j*30,188);c.bezierCurveTo(80+j*30,163,120+j*30,147,105+j*30,125);c.stroke();}});
plane(.4,.6,-2.725,2.46,-.28,texMat(teaPoster),[0,Math.PI/2,0]);
// Three quiet pendant lamps.
const glows=[];
const glowTex=tex(128,128,(c,w,h)=>{const r=c.createRadialGradient(64,64,1,64,64,64);r.addColorStop(0,'rgba(255,225,174,.8)');r.addColorStop(.22,'rgba(255,199,116,.22)');r.addColorStop(1,'rgba(255,190,100,0)');c.fillStyle=r;c.fillRect(0,0,w,h);});
function glow(x,y,z,size=.85,opacity=.24){const m=new THREE.SpriteMaterial({map:glowTex,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});const s=new THREE.Sprite(m);s.userData.baseOpacity=opacity;s.position.set(x,y,z);s.scale.set(size,size,1);scene.add(s);glows.push(s);return s;}
for(const x of [-1.72,.35,2.32]){rod([x,3.62,-.52],[x,3.01,-.52],.009,M.iron);cyl(.055,.235,.13,x,2.955,-.52,M.cream,20);sphere(.065,x,2.87,-.52,M.light);glow(x,2.89,-.52,.62,.16);}

// Wooden and plastic fruit crates, protected from the rain beneath the overhang.
function crate(x,y,z,w=.58,d=.46,h=.37,m=M.woodLight,fruit=null){
 box(w,.046,d,x,y+.022,z,m,true);
 for(let i=0;i<3;i++){box(w,.07,.035,x,y+.08+i*.108,z-d/2,m,true);box(w,.07,.035,x,y+.08+i*.108,z+d/2,m,true);box(.035,.07,d,x-w/2,y+.08+i*.108,z,m);box(.035,.07,d,x+w/2,y+.08+i*.108,z,m);}
 for(const xx of [-w/2+.024,w/2-.024])for(const zz of [-d/2+.024,d/2-.024])box(.045,h,.045,x+xx,y+h/2,z+zz,M.woodDark);
 if(fruit)for(let i=0;i<12;i++)sphere(.065,x-w*.35+(i%4)*w*.23,y+h*.65+Math.floor(i/8)*.085,z-d*.25+(Math.floor(i/4)%2)*d*.42,fruit,null,1,.9,1);
}
crate(-2.22,.57,1.94,.68,.48,.38,M.woodLight,M.red);
crate(-1.48,.57,1.94,.66,.48,.38,M.woodLight,M.yellow);
crate(-2.32,.56,2.50,.69,.39,.30,M.teal);crate(-2.32,.89,2.50,.69,.39,.30,M.teal);
box(.63,.025,.35,-2.32,1.22,2.5,M.fabric,false,null,[0,.04,.04]);
crate(4.05,.55,-2.39,.48,.63,.4,M.woodLight);crate(4.05,.97,-2.39,.48,.63,.4,M.woodLight);
// Hand delivery trolley with small wheels and covered packages.
box(.64,.065,.95,-3.74,.78,1.74,M.iron,true);
for(const x of [-4.04,-3.44])for(const z of [1.41,2.10])torus(.14,.045,x,.67,z,M.rubber,[0,Math.PI/2,0]);
rod([-4.02,.82,1.33],[-4.02,1.65,1.33],.023,M.iron);rod([-3.47,.82,1.33],[-3.47,1.65,1.33],.023,M.iron);rod([-4.02,1.65,1.33],[-3.47,1.65,1.33],.025,M.wood);
box(.47,.36,.51,-3.74,1.005,1.81,M.cardboard,true);box(.42,.26,.37,-3.74,1.32,1.77,M.cardboard,true);box(.052,.012,.37,-3.74,1.457,1.77,M.cream);
// Umbrella basket with folded umbrellas.
cyl(.13,.115,.42,1.4,.785,1.96,M.iron,12);torus(.13,.015,1.4,1.006,1.96,M.ironLight,[Math.PI/2,0,0]);
for(let i=0;i<4;i++){const x=1.32+(i%2)*.12,z=1.89+Math.floor(i/2)*.11;rod([x,.8,z],[x+.04,1.55,z],.026,[M.blue,M.red,M.woodDark,M.teal][i]);torus(.045,.009,x+.045,1.57,z,M.woodLight,[0,0,.7]);}
// Potted plants in shade beneath the awning, plus ceramic bowls on the doorstep.
const plantLeaves=[];
function plant(x,y,z,sz=.4){cyl(sz*.23,sz*.17,sz*.44,x,y+sz*.22,z,M.brick,14);torus(sz*.23,.023,x,y+sz*.43,z,M.brick2,[Math.PI/2,0,0]);
 cyl(sz*.2,sz*.2,.017,x,y+sz*.45,z,M.woodDark,12);
 const group=new THREE.Group();group.position.set(x,y+sz*.45,z);scene.add(group);
 for(let i=0;i<7;i++){const a=i*2.4;rod([0,0,0],[Math.cos(a)*sz*.26,sz*.5,Math.sin(a)*sz*.26],.01,M.leaf,group);sphere(sz*.14,Math.cos(a)*sz*.3,sz*.5,Math.sin(a)*sz*.3,i%2?M.leaf:M.leaf2,group,.7,2,.4);}
 compactGroup(group);plantLeaves.push({group,phase:rnd()*6});
}
plant(-2.77,.56,2.3,.72);plant(3.48,.56,1.94,.66);plant(-3.1,.56,-.5,.53);
// Exterior wall lanterns are local household fixtures, small and warm.
function lantern(x,y,z,turn=0){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=turn;scene.add(g);
 box(.08,.27,.065,0,.15,-.16,M.iron,true,g);rod([0,.22,-.13],[0,.22,.06],.019,M.iron,g);
 box(.19,.22,.17,0,0,.09,M.light,false,g);box(.25,.04,.23,0,.13,.09,M.iron,true,g);box(.25,.035,.23,0,-.13,.09,M.iron,true,g);
 for(const xx of [-.09,.09])for(const zz of [0,.18])box(.015,.26,.015,xx,0,zz,M.iron,false,g);
 const p=new THREE.Vector3(0,0,.1).applyAxisAngle(new THREE.Vector3(0,1,0),turn).add(new THREE.Vector3(x,y,z));
 const light=rememberWarm(new THREE.PointLight(0xffc77a,4.8,4,2),4.8);light.position.copy(p);scene.add(light);glow(...p.toArray(),.75,.26);freezeGroup(g);return light;
}
const oldLight=lantern(-2.71,2.58,1.42);lantern(3.96,2.59,-.08,Math.PI/2);

// Residential homes with recessed carved portals, arched timber screens and earthen terraces.
function archPanel(w,h,depth,x,y,z,m,turn=0){const s=new THREE.Shape();const r=w/2,base=h-r;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,base);s.absarc(0,base,r,0,Math.PI,false);s.lineTo(-r,0);
 const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1,curveSegments:16});solid(g,m,[x,y,z],[0,turn,0],null,true);}
function home(x,z,w,d,h,wallM=M.plasterOld){
 const fz=z+d/2,roofY=.55+h,portalW=Math.min(1.32,w*.40),pierW=(w-portalW)/2;
 box(w,h,d-.34,x,.55+h/2,z-.17,wallM,true);
 for(const side of [-1,1])box(pierW,h,.34,x+side*(portalW/2+pierW/2),.55+h/2,fz-.17,wallM,true);
 box(w,.32,.38,x,roofY-.16,fz-.15,wallM,true);
 box(w+.16,.14,d+.12,x,roofY+.075,z,M.roof,true);
 box(w+.12,.37,.20,x,roofY+.29,fz+.015,M.plasterLight,true);
 box(w+.19,.065,.27,x,roofY+.51,fz+.015,M.brick2,true);
 for(let xx=x-w/2+.18;xx<x+w/2;xx+=.39){box(.20,.12,.20,xx,roofY+.60,fz,M.plasterLight,true);star(.067,xx,roofY+.30,fz+.127,M.teal);}
 // A deep threshold gives the portal a shaded, inhabited recess.
 box(portalW,.09,.62,x,.60,fz-.03,M.stoneLight,true);
 archFrame(portalW+.32,2.54,.12,.15,x,.62,fz-.055,M.plasterLight);
 archFrame(portalW+.13,2.35,.04,.035,x,.70,fz+.102,M.teal);
 carvedDoor(x,.67,fz-.245,portalW-.12,2.27,M.wood);
 for(const side of [-1,1]){
  carvedColumn(x+side*(portalW/2+.10),fz+.12,.62,1.48,.042);
  for(let yy=.95;yy<2.22;yy+=.3)star(.046,x+side*(portalW/2+.075),yy,fz+.148,M.tileCream);
 }
 star(.14,x,2.87,fz+.13,M.teal);
 // Arched residential windows use dense timber lattice above a painted sill.
 for(const xx of [x-w*.35,x+w*.35]){
  const wy=Math.max(1.52,roofY-1.66),ww=Math.min(.59,w*.18);
  pointedPanel(ww+.17,1.01,.07,xx,wy-.04,fz+.006,M.plasterLight);
  pointedPanel(ww,.88,.035,xx,wy,fz+.077,M.darkGlass);
  archFrame(ww+.10,.97,.054,.048,xx,wy-.035,fz+.118,M.woodLight);
  for(let j=0;j<5;j++){const yy=wy+.11+j*.105;for(const side of [-1,1])rod([xx-ww*.37,yy,fz+.171],[xx+ww*.37,yy+side*.25,fz+.171],.008,M.wood);}
  box(ww+.19,.075,.20,xx,wy-.03,fz+.10,M.teal,true);
  star(.069,xx,wy+.70,fz+.175,M.tileCream);
 }
 tileBand(x,1.0,fz+.038,w-.13);
 // Alternating brick bonds in the facade and deep returns, rather than bare cuboids.
 for(let row=0;row<3;row++)for(let j=0;j<Math.floor(w/.30);j++){
  const xx=x-w/2+.16+j*.30+(row%2)*.08;
  if(Math.abs(xx-x)<portalW*.60)continue;
  box(.255,.115,.033,xx,.66+row*.14,fz+.023,row%2?M.brick:M.brick2,true);
 }
 const sideX=x+w/2+.018;
 for(let j=0;j<2;j++){
  const zz=z-d*.20+j*d*.38,yy=roofY-1.54;
  pointedPanel(.66,1.03,.04,sideX,yy,zz,M.woodDark,Math.PI/2);
  archFrame(.73,1.09,.049,.042,sideX+.042,yy-.028,zz,M.teal,Math.PI/2);
  box(.048,.63,.024,sideX+.09,yy+.32,zz,M.woodLight);
  star(.09,sideX+.09,yy+.82,zz,M.tileCream,Math.PI/2);
 }
 box(.20,.37,d+.10,x-w/2-.025,roofY+.29,z,M.plasterLight,true);
 box(.20,.37,d+.10,x+w/2+.025,roofY+.29,z,M.plasterLight,true);
 box(w*.8,.06,d*.78,x,roofY+.19,z,M.stone);
 lantern(x+portalW*.64,2.02,fz+.23);
}
home(-5.62,-5.89,3.64,3.2,3.06,M.plasterOld);
home(-1.95,-6.09,3.1,2.78,2.6,M.plaster);
home(1.28,-6.31,2.8,2.3,3.38,M.plasterOld);
// A small carved aywan-style terrace, with a flat roof and a quiet tea setting.
box(2.41,.11,.87,-5.6,3.83,-4.98,M.woodLight,true);
for(const x of [-6.67,-5.60,-4.53])carvedColumn(x,-4.63,3.89,.79,.034);
box(2.53,.09,.96,-5.60,4.81,-4.99,M.woodDark,true);
box(2.55,.12,.12,-5.60,4.735,-4.53,M.woodLight,true);
for(const x of [-6.16,-5.065])archFrame(1.08,.76,.043,.04,x,3.98,-4.59,M.wood);
plane(1.10,.47,-5.56,3.894,-5.05,atlasM,[-Math.PI/2,0,0]);
cyl(.24,.24,.04,-5.51,4.03,-5.02,M.woodLight,20);
cyl(.06,.06,.12,-5.51,3.95,-5.02,M.wood,10);
bowl(-5.6,4.09,-4.99,.045,M.cream);bowl(-5.4,4.09,-5.03,.045,M.teal);
// A low terrace wall and modest household objects on the roofs.
for(const x of [-7.22,-4.03])box(.14,.43,3.08,x,3.95,-5.9,M.plasterOld,true);
box(3.34,.35,.14,-5.62,3.9,-7.4,M.plasterOld,true);
cyl(.30,.3,.61,-6.51,4.02,-6.41,M.ironLight,16);cyl(.32,.32,.035,-6.51,4.34,-6.41,M.iron,16);
rod([-4.55,3.78,-6.67],[-4.55,4.65,-6.67],.018,M.iron);rod([-4.97,4.42,-6.67],[-4.13,4.42,-6.67],.012,M.iron);
aircon(.21,3.32,-4.90);
// Courtyard boundary walls with patterned brick courses and a quiet blue gate.
box(.18,1.38,3.98,-7.28,1.25,-1.57,M.plasterOld,true);
box(.24,.075,4.10,-7.28,1.984,-1.57,M.brick2,true);
box(1.03,1.71,.30,-6.63,1.41,.46,M.plaster,true);
box(1.07,1.71,.30,-4.65,1.41,.46,M.plaster,true);
for(const x of [-6.59,-4.69])box(.89,.065,.38,x,2.3,.46,M.brick2,true);
archFrame(1.42,2.54,.17,.28,-5.64,.55,.31,M.plasterLight);
archFrame(1.09,2.22,.046,.043,-5.64,.70,.603,M.teal);
carvedDoor(-5.64,.59,.285,1.03,2.26,M.blue);
for(const x of [-6.27,-5.01]){box(.15,1.43,.08,x,1.285,.64,M.teal,true);for(let y=.84;y<2.0;y+=.27)star(.053,x,y,.69,M.tileCream);}
star(.14,-5.64,2.77,.63,M.teal);
box(1.64,.08,.42,-5.64,.59,.62,M.stoneLight,true);
for(const x of [-6.9,-4.18])cyl(.10,.13,.15,x,2.4,.52,M.brick2,12);
for(let r=0;r<3;r++)for(let j=0;j<9;j++){const x=-6.87+j*.3;if(x>-6.13&&x<-5.13)continue;box(.22,.115,.02,x,.70+r*.15,.616,r%2?M.brick:M.brick2);}
// Narrow alley visible between shop and courtyard, and rain-darkened storage bins.
box(1.46,.025,4.7,-3.82,.548,-1.82,M.road);
for(let j=0;j<2;j++){cyl(.17,.15,.51,-6.97+j*.41,.83,1.13,M.ironLight,14);cyl(.19,.19,.04,-6.97+j*.41,1.103,1.13,M.iron,14);rod([-7.08+j*.41,1.02,1.11],[-6.86+j*.41,1.02,1.11],.012,M.iron);}
// Community notice board and faded neighborhood posters. Actual script, no invented glyphs.
box(.81,.84,.07,-6.76,1.68,.66,M.woodDark,true);box(.73,.73,.025,-6.76,1.68,.711,M.cardboard);
const noticeTex=tex(256,256,(c,w,h)=>{c.fillStyle='#d5c6a2';c.fillRect(0,0,w,h);c.direction='rtl';c.textAlign='center';c.fillStyle='#385a5a';c.font='35px Uyghur';c.fillText('ئۇقتۇرۇش',w/2,55);c.strokeStyle='#807b63';c.lineWidth=3;for(let i=0;i<6;i++){c.beginPath();c.moveTo(33,85+i*23);c.lineTo(211-(i%3)*16,85+i*23);c.stroke();}});
plane(.30,.43,-6.95,1.73,.734,texMat(noticeTex));plane(.29,.39,-6.58,1.59,.735,texMat(teaPoster));
box(.015,.085,.03,-6.95,1.97,.741,M.iron);box(.02,.07,.03,-6.58,1.82,.742,M.iron);
// Bicycles: thin rims, spokes, frames, pedals, handlebars and rear luggage racks.
function bicycle(x,z,turn=0,old=false){
 const g=new THREE.Group();g.position.set(x,.60,z);g.rotation.set(0,turn,-.095);scene.add(g);
 const frame=old?M.woodDark:M.teal;
 for(const xx of [-.51,.51]){torus(.315,.027,xx,.32,0,M.rubber,null,g);torus(.284,.009,xx,.32,0,M.ironLight,null,g);
 for(let k=0;k<12;k++){const a=k*Math.PI/6;rod([xx,.32,0],[xx+Math.cos(a)*.284,.32+Math.sin(a)*.284,0],.0035,M.ironLight,g,4);}cyl(.035,.035,.08,xx,.32,0,M.ironLight,8,[Math.PI/2,0,0],g);}
 const A=[-.51,.32,0],B=[-.14,.34,0],C=[-.20,.80,0],D=[.37,.80,0],E=[.51,.32,0];
 for(const pair of [[A,B],[A,C],[B,C],[B,D],[C,D],[D,E]])rod(...pair,.02,frame,g);
 rod([.37,.8,0],[.35,1.01,0],.014,M.ironLight,g);rod([.35,1.01,-.17],[.35,1.01,.17],.018,M.ironLight,g);
 box(.06,.045,.115,.35,1.01,-.17,M.rubber,false,g);box(.06,.045,.115,.35,1.01,.17,M.rubber,false,g);
 rod([-.2,.8,0],[-.22,.9,0],.017,M.ironLight,g);box(.25,.065,.145,-.22,.93,0,M.woodDark,true,g);
 torus(.085,.012,-.14,.34,.055,M.ironLight,null,g);rod([-.14,.34,.055],[-.03,.42,.10],.012,M.ironLight,g);box(.10,.04,.045,-.03,.42,.11,M.rubber,false,g);
 rod([-.78,.75,0],[-.27,.75,0],.015,M.ironLight,g);rod([-.73,.74,0],[-.51,.34,0],.012,M.ironLight,g);
 if(!old){box(.26,.20,.25,.44,.84,0,M.woodLight,true,g);for(let k=0;k<4;k++)box(.27,.019,.27,.44,.77+k*.051,0,M.wood,false,g);}
 freezeGroup(g);
}
bicycle(4.36,-.92,Math.PI/2);bicycle(-6.10,1.20,.08,true);
// Sparse local-style railing at the corner, with diamond details.
for(let i=0;i<4;i++){box(.05,.63,.05,4.46,.85,1.44+i*.39,M.iron,true);sphere(.037,4.46,1.18,1.44+i*.39,M.ironLight);}
rod([4.46,1.13,1.43],[4.46,1.13,2.63],.024,M.iron);rod([4.46,.74,1.43],[4.46,.74,2.63],.016,M.iron);
for(let i=0;i<3;i++){let z=1.62+i*.39;rod([4.46,.80,z],[4.46,.94,z+.12],.008,M.ironLight);rod([4.46,.94,z+.12],[4.46,1.08,z],.008,M.ironLight);rod([4.46,1.08,z],[4.46,.94,z-.12],.008,M.ironLight);rod([4.46,.94,z-.12],[4.46,.80,z],.008,M.ironLight);}

// A leafy courtyard tree that moves only a little in the evening breeze.
const treeLeaves=[];
function tree(x,z,height=3.8){
 cyl(.15,.23,height,x,.55+height/2,z,M.wood,10);
 for(let j=0;j<6;j++){const a=j*2.4,yy=2.2+(j%3)*.43;rod([x,yy,z],[x+Math.cos(a)*.66,yy+.72,z+Math.sin(a)*.66],.065,M.wood);}
 const crown=new THREE.Group();crown.position.set(x,height*.87,z);scene.add(crown);
 for(let i=0;i<27;i++){const a=rnd()*6.28,rr=.25+rnd()*.77; sphere(.38+rnd()*.23,Math.cos(a)*rr,rnd()*1.27-.05,Math.sin(a)*rr,i%3?M.leaf:M.leaf2,crown,1,.72,1);}
 compactGroup(crown);treeLeaves.push(crown);
 torus(.72,.055,x,.60,z,M.brick2,[Math.PI/2,0,0]);cyl(.72,.72,.06,x,.575,z,M.woodDark,24);
}
tree(-6.12,-1.91,3.5);plant(-4.36,.56,-3.9,.6);plant(-1.96,3.25,-5.71,.68);

// The outer village: four raised residential parcels leave a winding loop of wet lanes.
box(20.6,.19,4.55,0,.46,-11.35,M.stone,true);
box(17.1,.19,4.55,2.05,.46,11.35,M.stone,true);
box(4.55,.19,15.7,-11.35,.46,-.55,M.stone,true);
box(4.55,.19,16.9,11.35,.46,.15,M.stone,true);
for(let x=-10.0;x<=10.0;x+=.62){box(.56,.035,.19,x,.575,-8.98,M.stoneLight);box(.56,.035,.19,x,.575,9.03,M.stoneLight);}
for(let z=-8.2;z<=8.5;z+=.62){box(.19,.035,.56,-9.0,.575,z,M.stoneLight);box(.19,.035,.56,9.0,.575,z,M.stoneLight);}

const villageRoofs=[];
let villageStructures=0;
function villageHome(x,z,turn=0,w=3.0,d=2.7,h=2.65,tone=M.plasterOld,accent=M.teal){
 const g=new THREE.Group();g.position.set(x,.56,z);g.rotation.y=turn;scene.add(g);
 const add=(geo,mat,px,py,pz,ry=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);o.rotation.y=ry;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const b=(ww,hh,dd,px,py,pz,mat=tone)=>add(new THREE.BoxGeometry(ww,hh,dd),mat,px,py,pz);
 const panel=(ww,hh,dd,px,py,pz,mat)=>add(new THREE.ExtrudeGeometry(pointedShape(ww,hh),{depth:dd,bevelEnabled:false,curveSegments:12}),mat,px,py,pz);
 const frame=(ww,hh,t,dd,px,py,pz,mat)=>{const s=pointedShape(ww,hh),pts=pointedShape(ww-t*2,hh-t*2).getPoints(18).reverse(),hole=new THREE.Path();pts.forEach((p,i)=>i?hole.lineTo(p.x,p.y+t):hole.moveTo(p.x,p.y+t));hole.closePath();s.holes.push(hole);return add(new THREE.ExtrudeGeometry(s,{depth:dd,bevelEnabled:false,curveSegments:16}),mat,px,py,pz);};
 b(w,h,d,0,h/2,0);b(w+.18,.14,d+.15,0,h+.07,0,M.roof);
 // Thick earth parapet with a broken geometric roofline.
 b(w+.12,.31,.20,0,h+.30,d/2-.02,M.plasterLight);
 b(w+.2,.07,.29,0,h+.49,d/2-.02,M.brick2);
 for(let xx=-w/2+.18;xx<w/2;xx+=.43)b(.23,.12,.21,xx,h+.58,d/2-.02,M.plasterLight);
 // Deep pointed entrance and carved double timber door.
 const doorW=Math.min(1.04,w*.37),fz=d/2+.012;
 panel(doorW+.30,2.22,.08,0,.02,fz-.07,M.plasterLight);
 frame(doorW+.16,2.06,.045,.045,0,.10,fz+.02,accent);
 panel(doorW,1.96,.035,0,.14,fz+.07,M.woodDark);
 for(const side of [-1,1]){
  b(doorW*.42,1.31,.026,side*doorW*.235,.47,fz+.12,M.wood);
  for(let j=0;j<3;j++)b(.018,1.12,.018,side*doorW*.235+(j-1)*.082,.55,fz+.145,M.woodLight);
  for(let yy=.32;yy<1.55;yy+=.37)b(doorW*.32,.034,.02,side*doorW*.235,yy,fz+.15,M.woodLight);
 }
 // Twin pointed lattice windows and turquoise sills.
 for(const side of [-1,1]){const wx=side*w*.34,wy=1.23;
  panel(.68,.98,.055,wx,wy-.36,fz-.02,M.woodDark);frame(.74,1.05,.047,.045,wx,wy-.40,fz+.04,accent);
  for(let j=-2;j<=2;j++)b(.018,.68,.025,wx+j*.09,wy-.02,fz+.095,M.woodLight);
  for(let yy=wy-.25;yy<wy+.47;yy+=.18)b(.51,.017,.025,wx,yy,fz+.098,M.woodLight);
  b(.84,.075,.18,wx,wy-.41,fz+.04,accent);
 }
 // Brick foundation and small eight-point tile medallions.
 for(let row=0;row<3;row++)for(let j=0;j<Math.floor(w/.31);j++){
  const xx=-w/2+.17+j*.31+(row%2)*.08;if(Math.abs(xx)<doorW*.58)continue;
  b(.26,.105,.032,xx,.09+row*.13,fz+.04,row%2?M.brick:M.brick2);
 }
 for(const xx of [-w*.42,0,w*.42]){const starShape=new THREE.Shape();for(let i=0;i<16;i++){const a=Math.PI/2+i*Math.PI/8,r=i%2?.052:.105;i?starShape.lineTo(Math.cos(a)*r,Math.sin(a)*r):starShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}starShape.closePath();add(new THREE.ExtrudeGeometry(starShape,{depth:.018,bevelEnabled:false}),M.tileCream,xx,h+.27,fz+.13);}
 // A rain-darkened courtyard wall and side gate make each home a compound.
 const wallSide=(x>0?-1:1);b(w*.58,1.22,.16,wallSide*w*.72,.61,d/2-.28,tone);
 b(.76,1.38,.18,wallSide*w*.43,.69,d/2-.28,M.woodDark);
 for(let j=-2;j<=2;j++)b(.10,1.18,.035,wallSide*w*.43+j*.13,.62,d/2-.17,accent);
 freezeGroup(g);
 const sw=Math.abs(Math.cos(turn))*w+Math.abs(Math.sin(turn))*d,sd=Math.abs(Math.sin(turn))*w+Math.abs(Math.cos(turn))*d;
 villageRoofs.push({x,z,h:h+.68,w:sw,d:sd});villageStructures++;
}

// Courtyard homes face the loop road from all four sides.
villageHome(-7.7,-11.15,0,3.4,3.25,2.75,M.plasterOld,M.teal);
villageHome(-3.8,-11.3,0,3.0,3.0,2.45,M.plaster,M.blue);
villageHome(4.2,-11.3,0,3.5,3.0,3.05,M.plasterOld,M.teal);
villageHome(8.2,-11.15,0,3.0,3.25,2.65,M.plasterLight,M.blue);
villageHome(-5.7,11.25,Math.PI,3.5,3.1,2.75,M.plasterOld,M.blue);
villageHome(-1.6,11.4,Math.PI,3.2,2.9,2.55,M.plaster,M.teal);
villageHome(6.4,11.25,Math.PI,3.7,3.2,3.0,M.plasterOld,M.blue);
villageHome(-11.35,-5.5,Math.PI/2,3.2,3.0,2.55,M.plasterOld,M.teal);
villageHome(-11.35,1.8,Math.PI/2,3.5,3.0,2.85,M.plaster,M.blue);
villageHome(11.35,-5.2,-Math.PI/2,3.3,3.0,2.55,M.plasterLight,M.teal);
villageHome(11.35,1.2,-Math.PI/2,3.5,3.1,2.95,M.plasterOld,M.blue);
villageHome(11.35,6.4,-Math.PI/2,3.0,2.8,2.5,M.plaster,M.teal);

// Modest neighborhood prayer house: Islamic identity at village scale, not a grand monument.
function prayerHouse(x,z){
 const g=new THREE.Group();g.position.set(x,.56,z);g.rotation.y=Math.PI;scene.add(g);
 const add=(geo,mat,px,py,pz)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const b=(w,h,d,px,py,pz,m)=>add(new THREE.BoxGeometry(w,h,d),m,px,py,pz);
 b(4.45,3.15,3.6,0,1.575,0,M.plasterLight);b(4.7,.17,3.85,0,3.19,0,M.roof);
 b(4.52,.38,.24,0,3.38,1.69,M.plaster);b(4.64,.07,.30,0,3.62,1.69,M.teal);
 for(let xx=-2.02;xx<2.1;xx+=.45)b(.24,.14,.25,xx,3.74,1.69,M.plasterLight);
 const door=pointedShape(1.24,2.62);add(new THREE.ExtrudeGeometry(door,{depth:.07,bevelEnabled:false,curveSegments:18}),M.woodDark,0,.02,1.81);
 const outer=pointedShape(1.62,2.93),pts=pointedShape(1.35,2.68).getPoints(20).reverse(),hole=new THREE.Path();pts.forEach((p,i)=>i?hole.lineTo(p.x,p.y+.12):hole.moveTo(p.x,p.y+.12));hole.closePath();outer.holes.push(hole);
 add(new THREE.ExtrudeGeometry(outer,{depth:.075,bevelEnabled:false,curveSegments:20}),M.teal,0,0,1.87);
 for(const side of [-1,1]){const wx=side*1.42;const s=pointedShape(.74,1.28);add(new THREE.ExtrudeGeometry(s,{depth:.06,bevelEnabled:false,curveSegments:15}),M.darkGlass,wx,1.16,1.82);for(let j=-2;j<=2;j++)b(.018,.79,.03,wx+j*.095,1.58,1.9,M.woodLight);}
 // Low turquoise dome and a short square lantern tower.
 b(1.25,.48,1.25,0,3.50,-.25,M.plasterLight);b(1.38,.08,1.38,0,3.76,-.25,M.teal);
 const dome=new THREE.SphereGeometry(.78,24,12,0,Math.PI*2,0,Math.PI/2);add(dome,M.tile,0,3.78,-.25);
 cyl(.07,.07,.62,x,5.18,z+.25,M.iron,10);sphere(.10,x,5.50,z+.25,M.light); // small crescent finial glow
 torus(.13,.022,x,5.66,z+.25,M.tileCream,[0,0,0]);sphere(.09,x+.085,5.66,z+.25,M.tile);
 freezeGroup(g);villageRoofs.push({x,z,h:4.6,w:4.8,d:4.0});villageStructures++;
 const warmPrayer=rememberWarm(new THREE.PointLight(0xffc477,14,8,2),14);warmPrayer.position.set(x,2.0,z-2.0);scene.add(warmPrayer);glow(x,2.1,z-2.05,.95,.17);
}
box(5.7,.19,4.65,-10.7,.46,10.7,M.stone,true);
for(let x=-13.15;x<-8.25;x+=.58)box(.52,.035,.19,x,.575,8.34,M.stoneLight);
prayerHouse(-10.7,10.7);

// Orchard courts, irrigation water and a timber footbridge complete the lived-in village edge.
for(const [x,z,h] of [[-7.4,6.1,3.0],[-5.5,6.8,3.3],[-3.6,6.1,2.9],[6.9,6.1,3.2],[8.2,7.4,2.8],[7.0,-9.2,2.7],[-8.1,-8.9,3.0]])tree(x,z,h);
box(.22,.18,8.2,8.58,.48,9.9,M.stone,true);box(.22,.18,8.2,7.55,.48,9.9,M.stone,true);
box(.82,.025,8.0,8.065,.575,9.9,M.water);
for(let z=7.2;z<12.7;z+=.24)box(1.33,.075,.19,8.07,.69,z,M.woodLight,true);
for(const x of [7.55,8.58])rod([x,.61,9.1],[x,.90,10.72],.025,M.wood);

// Clay ovens and stacked fuel belong to a shared courtyard kitchen.
cyl(.40,.52,.62,5.75,.88,7.45,M.brick2,18);torus(.38,.055,5.75,1.20,7.45,M.brick,[Math.PI/2,0,0]);cyl(.27,.27,.03,5.75,1.22,7.45,M.woodDark,18);
for(let i=0;i<8;i++)rod([4.9+(i%4)*.17,.62+Math.floor(i/4)*.11,7.6],[5.28+(i%4)*.17,.64+Math.floor(i/4)*.11,7.52],.035,M.wood);

// Streetlights and poles, overhead cables and a restrained residential street sign.
function streetlight(x,z,h=4.42){
 cyl(.053,.088,h,x,.38+h/2,z,M.iron,10);cyl(.12,.16,.29,x,.5,z,M.iron,10);
 rod([x,h+.36,z],[x-.43,h+.36,z],.04,M.iron);rod([x-.43,h+.36,z],[x-.52,h+.2,z],.035,M.iron);
 cyl(.07,.22,.095,x-.52,h+.13,z,M.iron,16);cyl(.16,.15,.035,x-.52,h+.065,z,M.light,16);glow(x-.52,h+.03,z,1.02,.26);
 const l=rememberWarm(new THREE.PointLight(0xffc57b,11.5,8,2),11.5);l.position.set(x-.52,h,z);scene.add(l);return l;
}
streetlight(4.67,3.08,4.2);streetlight(-6.94,3.13,3.8);
streetlight(-8.42,-8.35,4.15);streetlight(8.55,-8.2,4.15);
streetlight(-8.35,8.35,4.0);streetlight(8.45,8.45,4.0);
const cableEnds=[];
function utilityPole(x,z,h){cyl(.072,.115,h,x,.45+h/2,z,M.wood,10);box(1.05,.105,.1,x,h+.17,z,M.woodDark,true);for(const xx of [-.39,0,.39]){cyl(.033,.043,.16,x+xx,h+.28,z,M.cream,8);cyl(.065,.065,.02,x+xx,h+.30,z,M.iron,8);}cableEnds.push([x,h+.38,z]);}
utilityPole(-7.18,2.49,5.15);utilityPole(5.03,-6.49,5.23);utilityPole(-6.93,-6.79,4.9);
utilityPole(-12.85,-8.15,5.0);utilityPole(12.7,-8.4,5.1);utilityPole(12.6,8.25,5.05);utilityPole(-12.65,8.15,4.95);
const cables=[];
function cable(a,b,offset=0){const points=[];for(let i=0;i<=40;i++){const t=i/40;points.push([THREE.MathUtils.lerp(a[0],b[0],t)+offset,THREE.MathUtils.lerp(a[1],b[1],t)-Math.sin(t*Math.PI)*.63,THREE.MathUtils.lerp(a[2],b[2],t)]);}const l=line(points,0x14262c,.92);cables.push({l,points});}
for(const off of [-.37,0,.37]){cable(cableEnds[0],cableEnds[1],off);cable(cableEnds[1],cableEnds[2],off);}
for(const off of [-.34,0,.34]){cable(cableEnds[3],cableEnds[4],off);cable(cableEnds[4],cableEnds[5],off);cable(cableEnds[5],cableEnds[6],off);cable(cableEnds[6],cableEnds[3],off);}
const streetSign=texMat(arabicSign('كوچا',1,1,'#386b70','#dfd5ae',false));
box(.76,.27,.07,4.77,2.99,3.11,M.woodDark,true);plane(.72,.23,4.77,2.99,3.151,streetSign);
// Small traffic signal at the far end; no traffic or human characters in the miniature.
cyl(.033,.058,2.38,5.07,1.61,-7.00,M.iron,8);box(.18,.52,.19,5.07,2.83,-7,M.iron,true);
const traffic=[];
for(let i=0;i<3;i++){const m=new THREE.MeshStandardMaterial({color:[0x934844,0x9b8954,0x4c836c][i],emissive:[0xff5642,0xffbd50,0x79cd99][i],emissiveIntensity:i===0?.9:.025});const s=new THREE.Mesh(new THREE.SphereGeometry(.051,10,7),m);s.scale.z=.4;s.position.set(5.07,2.99-i*.15,-6.89);scene.add(s);traffic.push(s);}

// Merge static modeling by material: small-detail richness without thousands of draw calls.
for(const {mat,geos} of staticParts.values()){
 const geo=mergeGeometries(geos,false);if(!geo)throw new Error('Geometry merge failed');
 const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=mat!==M.glass;mesh.receiveShadow=true;scene.add(mesh);
 for(const g of geos)g.dispose();
}
staticParts.clear();
const edges=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(edgePts,3)),edgeMat);scene.add(edges);

// Real planar street reflection, broken up by shallow water and soft moving ripples.
const roadShape=new THREE.Shape();
roadShape.moveTo(-13.83,-13.83);roadShape.lineTo(13.83,-13.83);roadShape.lineTo(13.83,13.83);roadShape.lineTo(-13.83,13.83);roadShape.closePath();
const mirror=new Reflector(new THREE.ShapeGeometry(roadShape),{textureWidth:low?512:1024,textureHeight:low?512:1024,color:0x879caa,clipBias:.004,multisample:0});
mirror.rotation.x=-Math.PI/2;mirror.position.y=.374;
mirror.material.transparent=true;mirror.material.depthWrite=false;
mirror.material.uniforms.rainTime={value:0};
mirror.material.uniforms.wetness={value:1};
mirror.material.vertexShader=mirror.material.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 roadUv;').replace('vUv = textureMatrix * vec4( position, 1.0 );','vUv = textureMatrix * vec4( position, 1.0 ); roadUv=position.xy;');
mirror.material.fragmentShader=mirror.material.fragmentShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 roadUv; uniform float rainTime; uniform float wetness;');
mirror.material.fragmentShader=mirror.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec4 rippleUv=vUv;
 rippleUv.x+=sin(roadUv.y*27.0+rainTime*.9)*.0012*rippleUv.w;
 rippleUv.y+=sin(roadUv.x*19.0+rainTime*.7)*.0014*rippleUv.w;
 vec4 base=texture2DProj(tDiffuse,rippleUv);`);
mirror.material.fragmentShader=mirror.material.fragmentShader.replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',`float patch=.5+.5*sin(roadUv.x*.92+sin(roadUv.y*1.3))*sin(roadUv.y*.84+cos(roadUv.x*.9));
 float sheen=mix(.13,.43,smoothstep(.25,.78,patch));
 gl_FragColor=vec4(mix(base.rgb,blendOverlay(base.rgb,color),.32),sheen*wetness);`);
scene.add(mirror);
// Irregular puddle edges: shallow dark rims and delicate ripple rings.
const puddles=[];
function puddle(x,z,rx,rz){const shape=new THREE.Shape();for(let i=0;i<=30;i++){const a=i/30*Math.PI*2,r=1+Math.sin(a*5+.4)*.045+Math.cos(a*3)*.06;const xx=Math.cos(a)*rx*r,zz=Math.sin(a)*rz*r;if(!i)shape.moveTo(xx,zz);else shape.lineTo(xx,zz);}const g=new THREE.ShapeGeometry(shape);g.rotateX(-Math.PI/2);
 const mat=new THREE.MeshBasicMaterial({color:0x91bdc7,transparent:true,opacity:.065,depthWrite:false});const mesh=new THREE.Mesh(g,mat);mesh.position.set(x,.38,z);scene.add(mesh);
 puddles.push({x,z,rx,rz,mesh});
}
puddle(.6,3.8,2.05,.36);puddle(-4.1,4.5,1.05,.51);puddle(5.46,2.57,.52,1.00);puddle(6.37,-3.0,.65,1.45);puddle(2.8,6.95,.75,.33);puddle(-5.88,6.35,.91,.29);
puddle(-7.2,-8.45,1.25,.32);puddle(7.25,-8.5,1.10,.35);puddle(-8.45,6.25,.34,1.18);puddle(8.42,4.35,.36,1.30);puddle(2.1,8.45,1.40,.34);puddle(-1.5,-13.0,1.15,.30);
// Amber spill is a stretched soft reflection, kept below real mirror detail.
const spill=new THREE.MeshBasicMaterial({map:glowTex,color:0xeac38a,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending});
const spillMesh=new THREE.Mesh(new THREE.PlaneGeometry(7.3,3.0),spill);spillMesh.rotation.x=-Math.PI/2;spillMesh.position.set(.8,.381,4.05);scene.add(spillMesh);
const rings=[];
for(let i=0;i<(low?28:48);i++){
 const p=puddles[i%puddles.length],g=new THREE.RingGeometry(.94,1,28);g.rotateX(-Math.PI/2);
 const m=new THREE.MeshBasicMaterial({color:0xa7c1c6,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});const o=new THREE.Mesh(g,m);scene.add(o);
 rings.push({o,p,phase:rnd(),life:1.7+rnd()*1.8,x:p.x+(rnd()-.5)*p.rx*1.3,z:p.z+(rnd()-.5)*p.rz*1.3});
}
// Fine rain confined to the collectible's footprint. Streaks stop at roofs and awnings.
const rainCount=low?1150:1900;
const rainPos=new Float32Array(rainCount*6),rainInfo=[];
function rainFloor(x,z){if(x>-3.06&&x<3.98&&z>-3.58&&z<1.40)return 4.34;if(x>-3.28&&x<4.14&&z>1.4&&z<2.44)return Math.abs(x-.43)<1.04&&z<1.84?4.84:3.81;
 if(z<-4.20&&z>-7.7&&x>-7.5&&x<2.8)return x< -3.6?4.91:x<-.4?3.82:4.55;
 for(const r of villageRoofs)if(Math.abs(x-r.x)<r.w*.53&&Math.abs(z-r.z)<r.d*.53)return r.h+.56;
 return .39;}
for(let i=0;i<rainCount;i++){const x=(rnd()-.5)*27.4,z=(rnd()-.5)*27.4;rainInfo.push({x,z,y:rnd()*10.8,speed:3.2+rnd()*2.1,len:.14+rnd()*.15});}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainMat=new THREE.LineBasicMaterial({color:0x99b8c8,transparent:true,opacity:.25,depthWrite:false});
const rain=new THREE.LineSegments(rainGeo,rainMat);rain.frustumCulled=false;scene.add(rain);
// Snow uses soft points and its own slower, wind-driven motion.
const snowCount=low?650:1050,snowPos=new Float32Array(snowCount*3),snowInfo=[];
for(let i=0;i<snowCount;i++){const x=(rnd()-.5)*27.4,z=(rnd()-.5)*27.4,y=.6+rnd()*10.8;snowPos.set([x,y,z],i*3);snowInfo.push({x,z,y,speed:.36+rnd()*.58,drift:.18+rnd()*.36,phase:rnd()*6.28});}
const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const snowMat=new THREE.PointsMaterial({color:0xf1f4ed,size:low?.11:.095,transparent:true,opacity:.82,depthWrite:false,sizeAttenuation:true});
const snow=new THREE.Points(snowGeo,snowMat);snow.frustumCulled=false;snow.visible=false;scene.add(snow);
// Drips gathered along the awning and occasional tiny runoff splashes.
const drips=[];
for(let i=0;i<28;i++){const x=-3.13+rnd()*7.29;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const m=new THREE.LineBasicMaterial({color:0xa8c7d4,transparent:true,opacity:.4,depthWrite:false});const o=new THREE.LineSegments(g,m);scene.add(o);drips.push({o,x,z:2.42,phase:rnd()*3.8,delay:1.2+rnd()*2.8});}
const splashes=[];
for(let i=0;i<10;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.012,5,4),new THREE.MeshBasicMaterial({color:0xb5d2d9,transparent:true,opacity:.0}));scene.add(o);splashes.push({o,phase:rnd(),x:-2.8+rnd()*6.5,z:3.20+rnd()*.1});}
// Thin translucent tracks on window panes slide slowly rather than covering the interior.
const windowDrops=[];
const dropM=new THREE.MeshBasicMaterial({color:0xd0e5df,transparent:true,opacity:.14,depthWrite:false});
for(let i=0;i<20;i++){const x=(i<10?-2.7:1.44)+rnd()*2.15,center=i<10?-1.64:2.49;
 const maxY=1.17+2.10*(1-.44*Math.pow(Math.min(1,Math.abs(x-center)/1.08),1.5))-.10;
 const o=new THREE.Mesh(new THREE.PlaneGeometry(.008,.08+rnd()*.18),dropM);o.position.set(x,1.3+rnd()*(maxY-1.3),1.316);scene.add(o);windowDrops.push({o,maxY,phase:rnd()*12,speed:.06+rnd()*.04});}
// Tiny kettle steam puffs fade into the warm room; soft, never a game-like particle burst.
const steamTex=tex(64,64,(c,w,h)=>{const r=c.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(230,231,214,.6)');r.addColorStop(.7,'rgba(230,231,214,.13)');r.addColorStop(1,'rgba(230,231,214,0)');c.fillStyle=r;c.fillRect(0,0,w,h);});
const steam=[];for(let i=0;i<9;i++){const m=new THREE.SpriteMaterial({map:steamTex,transparent:true,opacity:0,depthWrite:false});const o=new THREE.Sprite(m);scene.add(o);steam.push({o,phase:i/9});}
// Ambient shadow under the square pedestal, keeping the model visually grounded.
const contact=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.MeshBasicMaterial({map:glowTex,color:0x000000,transparent:true,opacity:.50,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=-.46;scene.add(contact);

let last=0,elapsed=0,paused=false;
document.addEventListener('visibilitychange',()=>{paused=document.hidden;last=0;});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();paused=true;});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
canvas.addEventListener('keydown',e=>{
 if(cameraState.mode!=='free')setCameraMode('free');
 const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
 const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];if(!keys.includes(e.key))return;e.preventDefault();
 if(e.key==='ArrowLeft')spherical.theta-=.11;if(e.key==='ArrowRight')spherical.theta+=.11;
 if(e.key==='ArrowUp')spherical.phi-=.07;if(e.key==='ArrowDown')spherical.phi+=.07;
 if(e.key==='+'||e.key==='=')spherical.radius*=.91;if(e.key==='-')spherical.radius*=1.1;
 spherical.phi=THREE.MathUtils.clamp(spherical.phi,controls.minPolarAngle,controls.maxPolarAngle);spherical.radius=THREE.MathUtils.clamp(spherical.radius,controls.minDistance,controls.maxDistance);
 camera.position.setFromSpherical(spherical).add(controls.target);controls.update();
});
let width=innerWidth,height=innerHeight;
addEventListener('resize',()=>{const previousPortrait=height>width;width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
 if(previousPortrait!==(height>width))frameWholeModel();
});
// Floating-toolbar state changes the real scene, not merely its presentation layer.
const environment={time:'night',weather:'rain',season:'summer',seasonScale:1};
const environmentOptions={time:['day','night'],weather:['clear','rain','snow','fog'],season:['spring','summer','autumn','winter']};
const environmentInputs={time:document.getElementById('time-setting'),weather:document.getElementById('weather-setting'),season:document.getElementById('season-setting')};
try{const saved=JSON.parse(localStorage.getItem('uyghurVillageEnvironment')||'{}');for(const key of Object.keys(environment))if(environmentOptions[key]?.includes(saved[key]))environment[key]=saved[key];}catch{}
function applyEnvironment(){
 const day=environment.time==='day',isRain=environment.weather==='rain',isSnow=environment.weather==='snow';
 document.body.dataset.time=environment.time;document.body.dataset.weather=environment.weather;document.body.dataset.season=environment.season;
 ambient.color.setHex(day?0xd9ece8:0xabc9e5);ambient.groundColor.setHex(day?0x7d735b:0x394251);ambient.intensity=day?2.95:2.05;
 moon.color.setHex(day?0xffe4b0:0x9ec5e8);moon.intensity=day?4.25:3.1;renderer.toneMappingExposure=day?1.28:1.18;
 warmLights.forEach(light=>light.intensity=light.userData.nightIntensity*(day?.14:1));
 glows.forEach(sprite=>sprite.material.opacity=sprite.userData.baseOpacity*(day?.12:1));
 M.light.emissiveIntensity=day?.58:2.1;
 const density={clear:day?.005:.009,rain:day?.011:.018,snow:day?.014:.020,fog:day?.032:.042}[environment.weather];
 scene.fog.density=density;scene.fog.color.setHex(day?(environment.weather==='fog'?0xb8c5c2:0x91afb5):(environment.weather==='fog'?0x455660:0x142b3a));
 rain.visible=isRain;snow.visible=isSnow;dropM.opacity=isRain?.14:0;
 mirror.material.uniforms.wetness.value={clear:.18,rain:1,snow:.30,fog:.34}[environment.weather];
 puddles.forEach(p=>p.mesh.material.opacity=isRain?.065:environment.weather==='fog'?.025:.008);
 spill.opacity=(day?.025:.11)*(isRain?1:.48);
 const seasons={
  spring:{leaf:0x67955f,leaf2:0x91ad72,scale:.84},summer:{leaf:0x456d60,leaf2:0x638273,scale:1},
  autumn:{leaf:0xa2693f,leaf2:0xc39a52,scale:.88},winter:{leaf:0x74817a,leaf2:0x8d9892,scale:.22}
 }[environment.season];
 M.leaf.color.setHex(seasons.leaf);M.leaf2.color.setHex(seasons.leaf2);environment.seasonScale=seasons.scale;treeLeaves.forEach(g=>g.scale.setScalar(seasons.scale));
 for(const key of Object.keys(environmentInputs))environmentInputs[key].value=environment[key];
 try{localStorage.setItem('uyghurVillageEnvironment',JSON.stringify({time:environment.time,weather:environment.weather,season:environment.season}));}catch{}
}
for(const [key,input] of Object.entries(environmentInputs))input.addEventListener('change',()=>{if(environmentOptions[key].includes(input.value)){environment[key]=input.value;applyEnvironment();}});
// Cinematic camera modes: slow exterior orbit, high drone pass, lane-level walk and a blended tour.
const cameraSetting=document.getElementById('camera-setting');
const cameraModes=['free','orbit','drone','walk','tour'];
const cameraState={mode:'free',started:0};
const walkCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,1.55,6.6),new THREE.Vector3(7.65,1.55,7.45),new THREE.Vector3(8.15,1.55,.2),
 new THREE.Vector3(7.75,1.55,-7.9),new THREE.Vector3(1.2,1.55,-8.45),new THREE.Vector3(-7.65,1.55,-8.15),
 new THREE.Vector3(-8.25,1.55,-1.0),new THREE.Vector3(-7.85,1.55,7.8),new THREE.Vector3(-1.0,1.55,8.45)
],true,'catmullrom',.22);
function setCameraMode(mode){
 if(!cameraModes.includes(mode))return;
 cameraState.mode=mode;cameraState.started=elapsed;controls.enabled=mode==='free';cameraSetting.value=mode;
}
cameraSetting.addEventListener('change',()=>setCameraMode(cameraSetting.value));
canvas.addEventListener('pointerdown',()=>{if(cameraState.mode!=='free')setCameraMode('free');},{capture:true});
canvas.addEventListener('wheel',()=>{if(cameraState.mode!=='free')setCameraMode('free');},{capture:true,passive:true});
function updateCameraTour(dt,clock){
 if(cameraState.mode==='free')return;
 let mode=cameraState.mode,stage=Math.max(0,clock-cameraState.started);
 if(mode==='tour'){
  const cycle=stage%84;
  if(cycle<30){mode='orbit';stage=cycle;}
  else if(cycle<50){mode='drone';stage=cycle-30;}
  else{mode='walk';stage=cycle-50;}
 }
 const desired=new THREE.Vector3(),look=new THREE.Vector3();
 if(mode==='orbit'){
  const a=stage*.055-.72,r=35.5+Math.sin(stage*.11)*1.7;
  desired.set(Math.cos(a)*r,15.2+Math.sin(stage*.075)*2.0,Math.sin(a)*r);look.set(0,1.25,0);
 }else if(mode==='drone'){
  const a=stage*.038+.4,r=8.5+Math.sin(stage*.15)*4.2;
  desired.set(Math.cos(a)*r,27.5+Math.sin(stage*.12)*4.8,Math.sin(a)*r);look.set(Math.sin(stage*.06)*1.4,.7,Math.cos(stage*.05)*1.4);
 }else{
  const u=(stage*.014)%1,ahead=(u+.012)%1;
  desired.copy(walkCurve.getPointAt(u));look.copy(walkCurve.getPointAt(ahead));look.y=1.42;
 }
 const smooth=1-Math.exp(-Math.max(dt,.001)*(mode==='walk'?1.45:1.12));
 camera.position.lerp(desired,smooth);controls.target.lerp(look,smooth);camera.lookAt(controls.target);camera.updateMatrixWorld();
}
document.querySelector('.environment-toolbar').addEventListener('wheel',event=>event.stopPropagation(),{passive:true});
applyEnvironment();
// A narrow debug hook enables automated checks without adding more interface elements.
window.__diorama={scene,camera,controls,renderer,doors:doorPanels,rain,snow,ambient,moon,rainCount,snowCount,puddles,villageStructures,environment,cameraState,setEnvironment(next){Object.assign(environment,next);applyEnvironment();},setCameraMode,version:'5.0-cinematic-camera'};
function animate(now){requestAnimationFrame(animate);if(paused)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;
 const t=reduced?0:elapsed;
 if(cameraState.mode==='free')controls.update();else updateCameraTour(dt,reduced?cameraState.started:elapsed);mirror.material.uniforms.rainTime.value=t;
 if(!reduced){
 if(environment.weather==='rain')for(let i=0;i<rainCount;i++){
 const p=rainInfo[i];p.y-=dt*p.speed;const floor=rainFloor(p.x,p.z);if(p.y<floor)p.y=11.4+rnd()*1.2;
 const k=i*6;rainPos[k]=p.x;rainPos[k+1]=p.y;rainPos[k+2]=p.z;rainPos[k+3]=p.x-.022;rainPos[k+4]=p.y+p.len;rainPos[k+5]=p.z-.018;
 }rainGeo.attributes.position.needsUpdate=true;
 if(environment.weather==='snow')for(let i=0;i<snowCount;i++){const p=snowInfo[i];p.y-=dt*p.speed;const floor=rainFloor(p.x,p.z);if(p.y<floor)p.y=11.4+rnd()*1.3;const k=i*3;snowPos[k]=p.x+Math.sin(t*.45+p.phase)*p.drift;snowPos[k+1]=p.y;snowPos[k+2]=p.z+Math.cos(t*.31+p.phase)*p.drift*.45;}snowGeo.attributes.position.needsUpdate=true;
 for(const r of rings){const a=(t/r.life+r.phase)%1,s=.035+a*.28;r.o.position.set(r.x,.386,r.z);r.o.scale.setScalar(s);r.o.material.opacity=environment.weather==='rain'?Math.sin(a*Math.PI)*.14*(1-a):0;}
 for(const d of drips){const cycle=(t+d.phase)%d.delay;const fall=cycle<1.0;const y=3.64-cycle*3.2;const arr=d.o.geometry.attributes.position.array;arr.set([d.x,y,d.z,d.x,y+.10,d.z]);d.o.geometry.attributes.position.needsUpdate=true;d.o.visible=environment.weather==='rain'&&fall&&y>.55;}
 for(const s of splashes){const a=(t*.7+s.phase)%1;s.o.position.set(s.x+Math.sin(a*6.28)*.09,.39+Math.sin(a*Math.PI)*.085,s.z);s.o.material.opacity=environment.weather==='rain'&&a<.28?Math.sin(a/.28*Math.PI)*.36:0;}
 for(const d of windowDrops){d.o.position.y=d.maxY-((t*d.speed+d.phase)%(d.maxY-1.28));}
 for(let i=0;i<steam.length;i++){const s=steam[i],a=(t*.16+s.phase)%1;const envelope=Math.max(0,Math.sin(t*.17));s.o.position.set(kettlePos.x+.08+Math.sin(t*.55+i)*.055,kettlePos.y+.14+a*.60,kettlePos.z);s.o.scale.setScalar(.08+a*.17);s.o.material.opacity=Math.sin(a*Math.PI)*.09*envelope;}
 const period=t%23;let opening=0;if(period>12&&period<17)opening=period<13?(period-12):period>16?(17-period):1;opening=opening*opening*(3-2*opening);
 doorPanels[0].position.x=.055-opening*.40;doorPanels[1].position.x=.810+opening*.40;
 oldLight.intensity=4.8*(environment.time==='day'?.14:1)*(.94+.03*Math.sin(t*2.7)+.025*Math.sin(t*17.1));signM.emissiveIntensity=(environment.time==='day'?.12:.64)+.018*Math.sin(t*.71);
 spill.opacity=(environment.time==='day'?.025:.11)*(environment.weather==='rain'?1:.48)+.008*Math.sin(t*.51);spillMesh.scale.x=1+.012*Math.sin(t*.43);
 for(const c of cables){const a=c.l.geometry.attributes.position.array;for(let i=0;i<c.points.length;i++){const p=c.points[i],f=Math.sin(i/(c.points.length-1)*Math.PI);a[i*3]=p[0]+Math.sin(t*.43+i*.08)*.027*f;a[i*3+2]=p[2]+Math.sin(t*.51+i*.09)*.04*f;}c.l.geometry.attributes.position.needsUpdate=true;}
 for(const p of plantLeaves){p.group.rotation.z=Math.sin(t*.7+p.phase)*.014;p.group.rotation.x=Math.sin(t*.51+p.phase)*.01;}
 treeLeaves.forEach((g,i)=>{g.rotation.z=Math.sin(t*.42+i)*.01;g.rotation.y=Math.sin(t*.3+i)*.014;});
 const signal=Math.floor(t/13)%3;traffic.forEach((s,i)=>s.material.emissiveIntensity=i===signal?.8:.02);
 }
 renderer.render(scene,camera);
}
// Initialize weather before the first frame, also providing a composed still for reduced motion.
for(let i=0;i<rainCount;i++){const p=rainInfo[i];p.y=Math.max(p.y,rainFloor(p.x,p.z)+.2);const k=i*6;rainPos.set([p.x,p.y,p.z,p.x-.022,p.y+p.len,p.z-.018],k);}
rainGeo.attributes.position.needsUpdate=true;
for(let i=0;i<snowCount;i++){const p=snowInfo[i];p.y=Math.max(p.y,rainFloor(p.x,p.z)+.25);snowPos.set([p.x,p.y,p.z],i*3);}
snowGeo.attributes.position.needsUpdate=true;
requestAnimationFrame(animate);
}
