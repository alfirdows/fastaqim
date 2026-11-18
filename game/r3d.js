/* Road Run, 3D look: a Three.js scene under the 2D canvas. The 2D canvas keeps particles, floating text, speed lines and the countdown.
   Game rules, menus and saving are untouched. If WebGL is missing or fails, the old 2D look stays. */
(function(){
"use strict";
if(!window.THREE||!window.T3X)return;
const T=THREE,{EffectComposer,RenderPass,UnrealBloomPass,OutputPass,RoundedBoxGeometry,RoomEnvironment,BGU}=T3X;
let R;
try{R=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',stencil:false});if(!R.getContext())throw 0}catch(e){return}
const draw2d=draw,P2=P,HQ=/[?&]hq\b/.test(location.search);
const LS=1.45,RW=2.2,SLOT=5,NS=25,SPAN=NS*SLOT,OFF=.6;
const el=R.domElement;el.id='gl';el.style.cssText='position:fixed;inset:0;width:100%;height:100%;display:block';document.body.insertBefore(el,document.body.firstChild);
R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.02;
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
let PR=Math.min(2,devicePixelRatio||1);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,320);
let envT=null;try{const pm=new T.PMREMGenerator(R);envT=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();scene.environment=envT}catch(e){}
let comp=null,bloom=null,useBloom=true;
function mkComp(){comp=new EffectComposer(R);comp.addPass(new RenderPass(scene,cam));bloom=new UnrealBloomPass(new T.Vector2(256,256),.28,.35,1.05);comp.addPass(bloom);comp.addPass(new OutputPass())}
try{mkComp()}catch(e){comp=null;useBloom=false}
/* camera views: [height, distance behind, look-at distance ahead, look-at height]; 'high' is the default */
const VIEWS={close:[2.2,3.7,-10,.7],classic:[3.3,4.6,-9,.4],high:[5.0,3.6,-5.5,0],top:[7.2,2.2,-4.4,0]};const VW=()=>VIEWS[ST.view]||VIEWS.close;
function fitCam(){const a=innerWidth/innerHeight,v=VW(),D=Math.hypot(v[0],v[1]),half=VIEWS[ST.view]&&ST.view!=='close'?(ST.view==='classic'?2.15:2.45):2.0;let f=2*Math.atan(half/(D*a))*180/Math.PI;cam.userData.f0=Math.max(40,Math.min(80,f));cam.userData.vk=ST.view}
function rs(){const w=innerWidth,h=innerHeight;R.setPixelRatio(PR);R.setSize(w,h,false);cam.aspect=w/h;fitCam();cam.fov=cam.userData.f0;cam.updateProjectionMatrix();if(comp){comp.setPixelRatio(PR);comp.setSize(w,h)}}
addEventListener('resize',rs);

/* ---------- small helpers ---------- */
const col=c=>new T.Color(c);
function sh(c,k){const o=col(c),h={};o.getHSL(h,T.SRGBColorSpace);o.setHSL(h.h,h.s,Math.max(0,Math.min(1,h.l+k)),T.SRGBColorSpace);return '#'+o.getHexString()}
const MAT={};let DISP=[];
function std(c,r=.6,m=0,o={}){const k=o.map?null:c+r+m+JSON.stringify(o);if(k&&MAT[k])return MAT[k];const mt=new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m,envMapIntensity:m>.5?1:.45},o));DISP.push(mt);if(k)MAT[k]=mt;return mt}
function phy(c,o={}){const k='p'+c+JSON.stringify(o);if(MAT[k])return MAT[k];const mt=new T.MeshPhysicalMaterial(Object.assign({color:c,roughness:.3,metalness:.1,clearcoat:.8,clearcoatRoughness:.08,envMapIntensity:.85},o));DISP.push(mt);return MAT[k]=mt}
function glow(c,i=2){return std(c,.4,0,{emissive:c,emissiveIntensity:i})}
function cTex(w,h,fn,rx=1,ry=1,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());DISP.push(t);return t}
function speck(g,w,h,n,cols,sz){for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];const s=sz*(.4+Math.random());g.fillRect(Math.random()*w,Math.random()*h,s,s)}}
const M=(geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m};
const box=(w,h,d)=>new T.BoxGeometry(w,h,d),rbox=(w,h,d,r=.08,s=3)=>new RoundedBoxGeometry(w,h,d,s,Math.min(r,w/2-.001,h/2-.001,d/2-.001)),
 cyl=(a,b,h,s=16)=>new T.CylinderGeometry(a,b,h,s),sph=(r,a=20,b=14)=>new T.SphereGeometry(r,a,b),ico=(r,d=1)=>new T.IcosahedronGeometry(r,d);
function bake(grp,cast=true){grp.updateMatrixWorld(true);const by=new Map();
 grp.traverse(o=>{if(!o.isMesh)return;let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
  for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='uv')g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  if(!g.attributes.normal)g.computeVertexNormals();
  const k=o.material.uuid;if(!by.has(k))by.set(k,{m:o.material,gs:[]});by.get(k).gs.push(g)});
 const out=new T.Group();for(const {m,gs} of by.values()){const mg=BGU.mergeGeometries(gs,false);gs.forEach(g=>g.dispose());DISP.push(mg);const me=new T.Mesh(mg,m);me.castShadow=cast&&!m.transparent;me.receiveShadow=true;out.add(me)}return out}
/* scenery: merge a whole kit into a few meshes with vertex colours (keeps draw calls low on phones) */
let VCM=null;
function vcMats(){if(VCM)return VCM;VCM={std:new T.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0,envMapIntensity:.45}),
 gloss:new T.MeshPhysicalMaterial({vertexColors:true,roughness:.3,metalness:.05,clearcoat:.7,clearcoatRoughness:.1,envMapIntensity:.85}),
 metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.8,envMapIntensity:1}),
 ds:new T.MeshStandardMaterial({vertexColors:true,roughness:.75,side:T.DoubleSide,envMapIntensity:.45}),
 glow:new T.MeshBasicMaterial({vertexColors:true,color:new T.Color(2.6,2.6,2.6),toneMapped:true})};DISP.push(...Object.values(VCM));return VCM}
function bakeVC(grp,cast=true){grp.updateMatrixWorld(true);const V=vcMats(),by={};
 grp.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m.transparent||m.map){return}
  const cls=m.emissiveIntensity>1&&m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)>0?'glow':m.side===T.DoubleSide?'ds':(curW==='toy'||curW==='crystal'?'gloss':'std');
  let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
  for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();
  const n=g.attributes.position.count,c=new Float32Array(n*3),cc=cls==='glow'?m.emissive:m.color;for(let i=0;i<n;i++){c[i*3]=cc.r;c[i*3+1]=cc.g;c[i*3+2]=cc.b}g.setAttribute('color',new T.BufferAttribute(c,3));
  (by[cls]||(by[cls]=[])).push(g)});
 const out=new T.Group();for(const k in by){const mg=BGU.mergeGeometries(by[k],false);by[k].forEach(g=>g.dispose());DISP.push(mg);const me=new T.Mesh(mg,V[k]);me.castShadow=cast&&k!=='glow';me.receiveShadow=k!=='glow';out.add(me)}
 grp.traverse(o=>{if(o.isMesh&&(o.material.transparent||o.material.map)){const c=o.clone();o.updateMatrixWorld(true);c.matrixAutoUpdate=false;c.matrix.copy(o.matrixWorld);out.add(c)}});
 return out}

/* ---------- real CC0 models (Kenney / Quaternius) loaded on demand ---------- */
const GL={},GLP={};let gltfL=null;
function glbFix(root){const seen=new Set();root.traverse(o=>{if(!o.isMesh||seen.has(o.geometry))return;seen.add(o.geometry);const g=o.geometry;
 for(const k of Object.keys(g.attributes)){const a=g.attributes[k];if(a.array instanceof Float32Array&&!a.normalized)continue;const n=a.count,sz=a.itemSize,f=new Float32Array(n*sz);
  for(let i=0;i<n;i++)for(let j=0;j<sz;j++)f[i*sz+j]=a.getComponent?a.getComponent(i,j):[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)][j];g.setAttribute(k,new T.BufferAttribute(f,sz))}
 const m0=o.material;if(m0&&!m0.map&&m0.color){const nm=(m0.name||'').toLowerCase(),NC={leafsdark:'#2e6a3b',leafsgreen:'#4a9a3e',grass:'#58a443',woodbarkdark:'#6e4a32',woodbark:'#8a5a3a'};for(const k in NC)if(nm.startsWith(k)){m0.color.set(NC[k]);break}}
 const m=o.material;if(m&&m.isMeshBasicMaterial){const nm=new T.MeshStandardMaterial({color:m.color,map:m.map,roughness:.8});o.material=nm}
 else if(m&&m.isMeshStandardMaterial){m.roughness=Math.max(.5,m.roughness);m.metalness=Math.min(.2,m.metalness)}});return root}
function glbLoad(names){if(!window.T3G)return Promise.resolve();if(!gltfL){gltfL=new T3G.GLTFLoader();gltfL.setMeshoptDecoder(T3G.MeshoptDecoder)}
 return Promise.all(names.map(n=>GLP[n]||(GLP[n]=new Promise(r=>gltfL.load('game/models/'+n+'.glb',g=>{GL[n]=glbFix(g.scene);r()},undefined,()=>{GL[n]=null;r()})))))}
const glbHas=names=>names.every(n=>n in GL);
/* a fresh copy sized by height (or by length with byLen), standing on y=0, centred */
function gm(n,size,byLen){const src=GL[n];if(!src)return new T.Group();const o=src.clone(true),w=new T.Group();w.add(o);
 const b=new T.Box3().setFromObject(o),sz=b.getSize(new T.Vector3()),s=size/(byLen?Math.max(sz.z,sz.x):sz.y);o.scale.setScalar(s);
 const b2=new T.Box3().setFromObject(o),c=b2.getCenter(new T.Vector3());o.position.set(-c.x,-b2.min.y,-c.z);return w}
function starShape(r1,r2,n=5){const s=new T.Shape();for(let i=0;i<n*2;i++){const a=i*Math.PI/n+Math.PI/2,r=i%2?r2:r1;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r)}s.closePath();return s}
function radTex(inner,outer){return cTex(128,128,(g,w)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,inner);gr.addColorStop(1,outer);g.fillStyle=gr;g.fillRect(0,0,w,w)})}
function emojiTex(s,bg){return cTex(128,128,(g)=>{if(bg){g.fillStyle=bg;g.beginPath();g.arc(64,64,60,0,7);g.fill()}g.font='84px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(s,64,70)})}

/* ---------- per-world 3D settings ---------- */
const W3={
 gold:{sky:['#3f7fd4','#97c3ee','#f8e3c4'],sun:'#ffe1a6',sunI:2.9,hS:'#d9e8ff',hG:'#86965f',hI:.95,exp:1.0,sh1:'#eadcc0',sh2:'#d3c19d',curb:['#c63b2c','#f3efe6'],fogN:60,fogF:210},
 toy:{sky:['#3a98ec','#8fd0ff','#e6f5ff'],sun:'#fff4d8',sunI:2.6,hS:'#e3f3ff',hG:'#73c47c',hI:1.0,exp:1.0,sh1:'#ffe27a',sh2:'#f7c948',curb:['#ff5a5f','#ffffff'],fogN:60,fogF:210},
 blos:{sky:['#86aeea','#d7c6ef','#ffe8f1'],sun:'#fff1f5',sunI:2.1,hS:'#fdeefe',hG:'#b9dcc3',hI:.95,exp:.94,sh1:'#fff6fa',sh2:'#f6dce9',curb:['#ff9fc8','#ffffff'],fogN:80,fogF:260}};

/* ---------- static scene: lights + sky ---------- */
const hemi=new T.HemisphereLight(0xffffff,0x888888,1);scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,2.6);sun.castShadow=true;const SM=HQ||PR>1.5?2048:1024;sun.shadow.mapSize.set(SM,SM);
{const c=sun.shadow.camera;c.left=-9;c.right=9;c.top=12;c.bottom=-12;c.near=1;c.far=70}sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;
scene.add(sun,sun.target);
const SKU={top:{value:col('#4a86d6')},mid:{value:col('#9cc8ee')},hor:{value:col('#fde6c4')},sunC:{value:col('#fff3c4')},sunD:{value:new T.Vector3(-.42,.2,-1).normalize()}};
const sky=new T.Mesh(new T.SphereGeometry(260,32,16),new T.ShaderMaterial({uniforms:SKU,side:T.BackSide,depthWrite:false,fog:false,
 vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,mid,hor,sunC,sunD;varying vec3 vP;void main(){float h=vP.y;vec3 c=mix(hor,mid,smoothstep(0.,.16,h));c=mix(c,top,smoothstep(.14,.6,h));float s=max(dot(normalize(vP),sunD),0.);c+=sunC*(smoothstep(.9985,.9992,s)*3.+pow(s,24.)*.45+pow(s,4.)*.12);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));
sky.renderOrder=-1;scene.add(sky);

/* ---------- world (rebuilt when the world changes) ---------- */
let carKey='',WG=null,curW=null,roadT,grassT,shT,curbG,slots=[],KITS=[],farG,car=null,carParts=null,blob,shieldM,magM,POOL={},PROTO={},gateTex={};
function disposeWorld(){if(WG){scene.remove(WG);WG=null}VCM=null;for(const d of DISP)try{d.dispose()}catch(e){}DISP=[];for(const k in MAT)delete MAT[k];POOL={};PROTO={};gateTex={};slots=[];KITS=[];
 if(G)for(const o of G.objs)o._m=null}
function buildWorld(key){disposeWorld();curW=key;const w=WORLDS[key]||WORLDS.gold,s=W3[key]||w.w3||W3.gold;
 {const nd=wkNeeds(key);const ck=(ST.car||'').startsWith('k:')?[ST.car.slice(2)]:[];if(!glbHas(nd.concat(ck)))glbLoad(nd.concat(ck)).then(()=>{if(curW===key)curW=null})}WG=new T.Group();scene.add(WG);
 const sk=s.sky||w.sky;SKU.top.value.set(sk[0]);SKU.mid.value.set(sk[1]);SKU.hor.value.set(sk[2]);SKU.sunC.value.set(w.sun);
 scene.fog=new T.Fog(col(sk[2]).lerp(col(sk[1]),.3),s.fogN,s.fogF);
 hemi.color.set(s.hS);hemi.groundColor.set(s.hG);hemi.intensity=s.hI;sun.color.set(s.sun);sun.intensity=s.sunI;R.toneMappingExposure=s.exp;
 /* grass with mowing stripes */
 grassT=cTex(256,256,(g,W_,H_)=>{g.fillStyle=w.ground[0];g.fillRect(0,0,W_,H_);g.fillStyle=sh(w.ground[1],.02);g.fillRect(0,0,W_,H_/2);speck(g,W_,H_,2600,[sh(w.ground[0],-.06),sh(w.ground[1],.05),sh(w.ground[0],.03)],2.2)},40,30);
 const gr=M(new T.PlaneGeometry(320,240).rotateX(-Math.PI/2),std('#ffffff',1,0,{map:grassT}),0,-.02,-105);gr.castShadow=false;WG.add(gr);
 /* road: asphalt, edge lines, dashed lane lines */
 roadT=cTex(256,512,(g,W_,H_)=>{const ux=W_/(RW*2),uy=H_/8;g.fillStyle=w.road;g.fillRect(0,0,W_,H_);speck(g,W_,H_,3800,[sh(w.road,.025),sh(w.road,-.03),sh(w.road,.045)],1.4);
  g.fillStyle='rgba(0,0,0,.08)';for(const c of[-LS,0,LS])for(const o of[-.32,.32])g.fillRect((RW+c+o)*ux-.12*ux,0,.24*ux,H_);
  g.fillStyle=w.line;for(const sd of[-1,1])g.fillRect((RW+sd*(RW-.17))*ux-.05*ux,0,.1*ux,H_);
  for(const lx of[-LS/2,LS/2])for(const y0 of[0,4])g.fillRect((RW+lx)*ux-.05*ux,y0*uy,.1*ux,2.4*uy)},1,240/8);
 const rd=M(new T.PlaneGeometry(RW*2,240).rotateX(-Math.PI/2),std('#ffffff',.78,0,{map:roadT}),0,0,-105);rd.castShadow=false;WG.add(rd);
 /* shoulders / pavements */
 shT=cTex(128,256,(g,W_,H_)=>{g.fillStyle=s.sh1;g.fillRect(0,0,W_,H_);speck(g,W_,H_,900,[sh(s.sh1,-.04),sh(s.sh1,.04)],1.6);g.fillStyle=s.sh2;for(let y=0;y<H_;y+=H_/5)g.fillRect(0,y,W_,2);for(let i=0;i<5;i++)for(let x0=(i%2)*W_/6;x0<W_;x0+=W_/3)g.fillRect(x0,i*H_/5,2,H_/5)},1,240/4);
 for(const sd of[-1,1]){const p=M(new T.PlaneGeometry(2.6,240).rotateX(-Math.PI/2),std('#ffffff',.9,0,{map:shT}),sd*(RW+.28+1.3),.005,-105);p.castShadow=false;WG.add(p)}
 /* striped curbs (instanced, slide by 2 units and snap) */
 curbG=new T.Group();WG.add(curbG);const N=110,cm=new T.InstancedMesh(rbox(.26,.16,1,.04,2),std('#ffffff',.55),N*2),mm=new T.Matrix4(),c0=col(s.curb[0]),c1=col(s.curb[1]);
 for(let i=0;i<N*2;i++){const sd=i<N?-1:1,k=i%N;mm.makeTranslation(sd*(RW+.13),.08,12-k);cm.setMatrixAt(i,mm);cm.setColorAt(i,k%2?c0:c1)}cm.castShadow=false;cm.receiveShadow=true;curbG.add(cm);
 /* scenery kits */
 KITS=kitsFor(key);for(let i=0;i<NS*2;i++){const sd=i<NS?-1:1,g0=new T.Group();g0.scale.x=sd;WG.add(g0);const sl={g:g0,i:i%NS,sd,lz:1e9};slots.push(sl);pickKit(sl)}
 farG=farFor(key);WG.add(farG);
 /* the car */
 car=mkCar(ST.car||w.car,ST.carC||w.carC);carKey=(ST.car||'')+(ST.carC||'');WG.add(car);
 blob=new T.Mesh(new T.PlaneGeometry(1.5,2.3).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:radTex('rgba(0,0,0,.55)','rgba(0,0,0,0)'),transparent:true,depthWrite:false}));blob.position.y=.012;DISP.push(blob.material,blob.geometry);WG.add(blob);
 shieldM=new T.Mesh(sph(1.05,28,18),new T.MeshStandardMaterial({color:'#7cc6ff',emissive:'#3b82f6',emissiveIntensity:.6,transparent:true,opacity:.22,depthWrite:false,roughness:.1}));shieldM.scale.set(1,.72,1.25);DISP.push(shieldM.material);WG.add(shieldM);
 magM=new T.Mesh(new T.TorusGeometry(1.0,.03,8,48).rotateX(Math.PI/2),glow('#ff6b6b',2.2));WG.add(magM)}
function pickKit(sl){sl.g.clear();const k=KITS[Math.floor(Math.random()*KITS.length)];sl.g.add(k.clone())}

/* ---------- builders: scenery ---------- */
function frond(len,wid){const g=new T.PlaneGeometry(wid,len,1,8),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=(p.getY(i)+len/2)/len,xx=p.getX(i)*(Math.sin(Math.PI*Math.min(1,u*1.15))*1.15+.08);p.setXYZ(i,xx,(u*.55-u*u*1.05)*len*.55-Math.abs(xx)*.35,u*len)}g.computeVertexNormals();return g}
function palm(h,lean){const G0=new T.Group(),b1=std('#8b6a45',.95),b2=std('#6f5236',.95),lf=std('#3f8f3e',.75,0,{side:T.DoubleSide}),lf2=std('#5aa548',.75,0,{side:T.DoubleSide}),nut=std('#5d4126',.8);
 const n=8,sl=h/n;let px=0;for(let i=0;i<n;i++){const t=i/n,x1=Math.sin(t*1.3)*lean;const c=M(cyl(.1-t*.03+.02,.12-t*.03+.02,sl*1.02,9),i%2?b1:b2,(px+x1)/2,i*sl+sl/2,0);c.rotation.z=-(x1-px)/sl*.9;G0.add(c);px=x1}
 for(let i=0;i<9;i++){const f=new T.Mesh(frond(1.7+Math.random()*.4,.42),i%2?lf:lf2);f.position.set(px,h,0);f.rotation.y=i/9*Math.PI*2+Math.random()*.2;G0.add(f)}
 for(let i=0;i<3;i++)G0.add(M(sph(.09,10,8),nut,px+Math.cos(i*2.1)*.12,h-.1,Math.sin(i*2.1)*.12));return G0}
function lamp(){const G0=new T.Group(),m=std('#535c68',.45,.8);G0.add(M(cyl(.05,.07,3.2,10),m,0,1.6,0));const a=M(box(.8,.05,.07),m,-.38,3.15,0);G0.add(a);G0.add(M(rbox(.32,.1,.2,.04),m,-.72,3.1,0));const b=M(box(.24,.04,.14),glow('#fff1c2',3.2),-.72,3.04,0);b.castShadow=false;G0.add(b);G0.add(M(cyl(.12,.14,.25,10),m,0,.12,0));return G0}
function bush(c1,c2,s=1){const G0=new T.Group();for(let i=0;i<4;i++)G0.add(M(ico(.38*s*(.7+Math.random()*.5),1),std(i%2?c1:c2,.85),(Math.random()-.5)*.8*s,.25*s+Math.random()*.15,(Math.random()-.5)*.8*s));return G0}
function dome(r,c,fin){const G0=new T.Group();const d=M(new T.SphereGeometry(r,28,14,0,Math.PI*2,0,Math.PI/2),phy(c,{roughness:.35,metalness:.2,clearcoat:.6}),0,0,0);d.scale.y=1.25;G0.add(d);
 G0.add(M(cyl(r*1.02,r*1.02,r*.28,28),std('#f4ecdc',.8),0,-r*.12,0));G0.add(M(cyl(.025,.04,r*.7,8),fin,0,r*1.25+r*.3,0));G0.add(M(sph(r*.1,12,8),fin,0,r*1.25+r*.12,0));return G0}
function house(h,wc,face){const G0=new T.Group(),wall=std(wc,.88),trim=std(sh(wc,-.12),.85),win=phy('#2a4e5e',{roughness:.12,metalness:.3}),gold=std('#d9a93a',.35,.9);
 G0.add(M(box(3.2,h,3.2),wall,0,h/2,0));G0.add(M(box(3.4,.18,3.4),trim,0,h,0));
 for(let r=0;r<Math.floor(h/1.3);r++)for(const zz of[-.9,0,.9]){const wn=M(rbox(.06,.6,.42,.03),win,-1.62,.9+r*1.3,zz);G0.add(wn)}
 if(face>.5){const d=dome(1.15,face>.8?'#2f8f9d':'#e9dcc0',gold);d.position.y=h+.32;G0.add(d)}else{G0.add(M(box(.8,.9,.8),wall,.6,h+.45,.6));}
 return G0}
function minaret(h){const G0=new T.Group(),w=std('#f3ead8',.85),t=std('#2f8f9d',.4,.2),gd=std('#d9a93a',.35,.9);G0.add(M(cyl(.32,.4,h,12),w,0,h/2,0));G0.add(M(cyl(.55,.45,.25,12),w,0,h*.72,0));G0.add(M(cyl(.26,.3,h*.22,12),w,0,h+h*.11,0));
 const c=M(new T.ConeGeometry(.34,1.1,12),t,0,h*1.22+.55,0);G0.add(c);G0.add(M(sph(.07,8,6),gd,0,h*1.22+1.15,0));return G0}
function wall(c){const G0=new T.Group(),m=std(c,.92),cap=std(sh(c,-.08),.85);G0.add(M(box(.35,.55,4.7),m,0,.275,0));G0.add(M(box(.45,.1,4.75),cap,0,.6,0));G0.add(M(box(.55,.85,.55),cap,0,.42,2.35));return G0}
const TOYC=['#ff5a5f','#ffd23f','#2f7bf6','#3ccf6e','#ff9f1c','#a66bff'];
function plastic(c){return phy(c,{roughness:.28,metalness:0,clearcoat:.7,clearcoatRoughness:.12})}
function brick(w,h,d,c){const G0=new T.Group(),m=plastic(c);G0.add(M(rbox(w,h,d,.05),m,0,h/2,0));const nx=Math.max(1,Math.round(w/.3)),nz=Math.max(1,Math.round(d/.3));for(let i=0;i<nx;i++)for(let k=0;k<nz;k++)G0.add(M(cyl(.08,.08,.08,12),m,-w/2+(i+.5)*w/nx,h+.04,-d/2+(k+.5)*d/nz));return G0}
function blockStack(){const G0=new T.Group();let y=0;for(let i=0;i<3+Math.floor(Math.random()*2);i++){const s=.9-i*.12,b=brick(s,s*.62,s,TOYC[Math.floor(Math.random()*TOYC.length)]);b.position.set((Math.random()-.5)*.2,y,(Math.random()-.5)*.2);b.rotation.y=(Math.random()-.5)*.6;G0.add(b);y+=s*.62}return G0}
function lolly(c){const G0=new T.Group();G0.add(M(cyl(.05,.05,1.6,8),std('#fff7ec',.5),0,.8,0));G0.add(M(sph(.55,24,16),plastic(c),0,1.95,0));G0.add(M(new T.TorusGeometry(.56,.05,8,32).rotateY(Math.PI/2),plastic('#ffffff'),0,1.95,0));return G0}
function toyHouse(c,r){const G0=new T.Group();G0.add(M(rbox(2.2,1.8,2.2,.12),plastic(c),0,.9,0));const roof=M(new T.ConeGeometry(1.75,1.3,4).rotateY(Math.PI/4),plastic(r),0,2.45,0);G0.add(roof);
 G0.add(M(rbox(.08,.62,.55,.03),plastic('#ffffff'),-1.12,1.05,-.45));G0.add(M(rbox(.08,.62,.55,.03),plastic('#ffffff'),-1.12,1.05,.45));G0.add(M(rbox(.08,.9,.6,.03),plastic(sh(c,-.2)),-1.12,.45,0));return G0}
function blossomTree(pal){const G0=new T.Group(),tr=std('#9a6b4f',.9);const t=M(cyl(.12,.18,1.6,9),tr,0,.8,0);t.rotation.z=.08;G0.add(t);const b=M(cyl(.06,.09,.8,7),tr,.25,1.55,0);b.rotation.z=-.7;G0.add(b);
 for(let i=0;i<8;i++){const a=i*.8,r=.45+Math.random()*.25;G0.add(M(ico(r,2),std(pal[i%pal.length],.7),Math.cos(a)*.55,1.95+Math.sin(i*1.7)*.3+Math.random()*.2,Math.sin(a)*.55))}return G0}
function flowers(){const G0=new T.Group(),st=std('#4f9a5b',.8);G0.add(M(new T.SphereGeometry(.7,16,8,0,Math.PI*2,0,Math.PI/2),std('#8fcf95',.9),0,0,0));
 const fc=['#ff8fb8','#ffffff','#ffd36b','#c9a7f2','#ff6f9f'];for(let i=0;i<9;i++){const a=i*2.4,r=.15+Math.random()*.42,x0=Math.cos(a)*r,z0=Math.sin(a)*r;G0.add(M(cyl(.015,.015,.35,5),st,x0,.4,z0));G0.add(M(sph(.07,10,8),std(fc[i%5],.6),x0,.6,z0))}return G0}
function fence(c){const G0=new T.Group(),m=std(c,.6);for(let i=0;i<6;i++){G0.add(M(box(.08,.7,.12),m,0,.35,-2.2+i*.88));G0.add(M(new T.ConeGeometry(.07,.12,4),m,0,.76,-2.2+i*.88))}G0.add(M(box(.05,.07,4.8),m,0,.5,0));G0.add(M(box(.05,.07,4.8),m,0,.24,0));return G0}
function pastelLamp(){const G0=new T.Group(),m=std('#ffffff',.4,.1);G0.add(M(cyl(.04,.06,2.4,10),m,0,1.2,0));G0.add(M(sph(.2,16,12),glow('#fff3c9',2.8),0,2.5,0));G0.add(M(new T.ConeGeometry(.26,.2,12),std('#ff9fc8',.5),0,2.72,0));return G0}

/* ---------- model worlds: which models each world uses and how the roadside is laid out ---------- */
const BLD=['building_a','building_b','building_c','building_d','building_e','building_f','building_g','building_h'],SKY=['skyscraper_a','skyscraper_b','skyscraper_c'];
const WK={
 city:{m:[...BLD,...SKY,'bush','tree_oak'],traffic:'truck'},night:{m:[...BLD,...SKY,'bush'],traffic:'delivery_van'},
 forest:{m:['tree_pine','tree_pine_tall','bush','rock_small','log','stump'],traffic:'truck'},snow:{m:['tree_pine','tree_pine_tall','rock_large','rock_small'],traffic:'suv'},
 desert:{m:['cactus','rock_large','rock_small','rock_tall'],traffic:'truck'},autumn:{m:['tree_autumn','tree_oak','fence','bush','log','stump'],traffic:'van'},
 sunset:{m:['tree_palm','rock_small','bush','bush_large'],traffic:'van'},canyon:{m:['rock_tall','rock_large','rock_small','cactus'],traffic:'truck'},
 crystal:{m:['crystal','crystal_rock','rock_tall','rock_small'],traffic:'race_car_future'},farm:{m:['tree_fat','tree_oak','fence','flower_red','bush','tractor'],traffic:'tractor'},
 jungle:{m:['tree_palm','bush_large','tree_dark','bush','log'],traffic:'suv'},mountain:{m:['tree_pine','tree_pine_tall','rock_tall','rock_large'],traffic:'truck'}};
const wkOf=k=>WK[(WORLDS[k]||{}).kit];
function wkNeeds(k){const s=wkOf(k);return s?[...s.m,s.traffic]:[]}
/* recolour a model (snow on trees, autumn leaves) by swapping its materials for tinted copies */
function tint(g,fn){g.traverse(o=>{if(o.isMesh&&o.material&&!o.material.map){o.material=o.material.clone();fn(o.material.color);DISP.push(o.material)}});return g}
const isLeaf=c=>c.g>c.r*1.05&&c.g>=c.b*.8;
const snowy=c=>{if(isLeaf(c)){c.lerp(col('#2f5d46'),.55).lerp(col('#ffffff'),.28)}else if(c.r>.45&&c.g>.35)c.lerp(col('#f3f6fa'),.6)};
const fall=c=>{if(isLeaf(c))c.set(['#e07a2f','#d9542b','#f0b23a','#c9682e'][Math.floor(Math.random()*4)])};
const deep=c=>{if(isLeaf(c))c.lerp(col('#2f7a3a'),.55)};
const crys=c=>{if(!(c.b>c.g&&c.r>c.g))c.lerp(col('#8b7bd8'),.5)};
function modelKits(k){const out=[],wrap=fn=>{const g0=new T.Group();fn(g0);out.push(bakeVC(g0))},R0=Math.random,pk=a=>a[Math.floor(R0()*a.length)];
 const put=(g0,o,x,z,ry=0)=>{o.position.set(x,0,z);o.rotation.y=ry;g0.add(o);return o};
 const kit=WORLDS[k].kit;
 for(let v=0;v<6;v++)wrap(g0=>{
  if(kit==='city'||kit==='night'){put(g0,gm(pk(BLD),6+R0()*4),8.2,0,Math.PI/2);if(v%2===0)put(g0,lamp(),2.75,1.6);if(v%3===1)put(g0,gm(kit==='city'?'tree_oak':'bush',kit==='city'?2.6:.7),4.4,-1.2)}
  else if(kit==='forest'||kit==='snow'||kit==='mountain'){const f=kit==='snow'?snowy:null,tr=n=>f?tint(gm(n,3.6+R0()*2.4),f):gm(n,3.6+R0()*2.4);
   put(g0,tr(pk(['tree_pine','tree_pine_tall'])),3.9,-1+R0()*2,R0()*6);put(g0,tr(pk(['tree_pine','tree_pine_tall'])),6.6,R0()*2-1,R0()*6);put(g0,tr('tree_pine_tall'),9,R0()*2-1,R0()*6);
   if(kit==='mountain'&&v%2)put(g0,gm('rock_tall',4+R0()*3),7.8,1.6,R0()*6);else if(kit==='forest'&&v%3===0)put(g0,gm(pk(['log','stump']),.6),4.6,1.8,R0()*6);
   else put(g0,f?tint(gm('rock_small',.6),f):gm(kit==='forest'?'bush':'rock_small',.7),4.7,1.6,R0()*6)}
  else if(kit==='desert'){put(g0,gm('cactus',1.6+R0()*1.2),4.2,-1+R0()*2,R0()*6);if(v%2)put(g0,gm('rock_large',1.4+R0()),7.4,R0()*2-1,R0()*6);else put(g0,gm('cactus',2.2+R0()),8.2,0,R0()*6);put(g0,gm('rock_small',.5),5.2,1.7,R0()*6)}
  else if(kit==='autumn'){put(g0,tint(gm(pk(['tree_autumn','tree_oak']),3.4+R0()*1.6),fall),4.1,-1+R0()*2,R0()*6);put(g0,gm('fence',.9,true),5.4,0,Math.PI/2);if(v%2)put(g0,tint(gm('tree_oak',4.5+R0()),fall),8.2,0,R0()*6);if(v%3===0)put(g0,gm(pk(['log','stump']),.6),3.4,1.8,R0()*6)}
  else if(kit==='sunset'||kit==='jungle'){const j=kit==='jungle';put(g0,gm('tree_palm',4+R0()*1.6),3.9,-1+R0()*2,R0()*6);if(j){put(g0,tint(gm('bush_large',1.4+R0()*.6),deep),5.6,1.4,R0()*6);put(g0,tint(gm('tree_dark',5+R0()*2),deep),8,0,R0()*6)}
   else{if(v%2)put(g0,gm('rock_small',.6),4.9,1.6,R0()*6);put(g0,gm('tree_palm',5+R0()*1.5),8.4,0,R0()*6)}}
  else if(kit==='canyon'){put(g0,gm('rock_tall',4+R0()*4),7.6,R0()*2-1,R0()*6);put(g0,gm(pk(['rock_large','rock_small']),.9+R0()),4.4,R0()*2-1,R0()*6);if(v%3===0)put(g0,gm('cactus',1.6),5.2,1.8,R0()*6)}
  else if(kit==='crystal'){put(g0,gm('crystal',1.4+R0()*1.6),4.3,-1+R0()*2,R0()*6);put(g0,tint(gm('rock_tall',3+R0()*3),crys),7.8,0,R0()*6);if(v%2)put(g0,gm('crystal_rock',1),5.4,1.7,R0()*6)}
  else if(kit==='farm'){put(g0,gm('fence',.9,true),5.4,0,Math.PI/2);put(g0,gm(pk(['tree_fat','tree_oak']),3+R0()*1.5),3.9,-1+R0()*2,R0()*6);if(v===2)put(g0,gm('tractor',1.7,true),7.6,0,Math.PI/2+.4);else put(g0,gm('tree_fat',3.5+R0()),8.4,0,R0()*6);put(g0,gm('flower_red',.5),4.8,1.8,R0()*6)}
 });return out}
function modelFar(k,g0){const kit=WORLDS[k].kit,R0=Math.random;
 const add=(o,x,z,ry=0)=>{o.position.set(x,0,z);o.rotation.y=ry;g0.add(o)};
 if(kit==='city'||kit==='night')for(let i=0;i<20;i++)add(gm(i%3?SKY[i%3]:BLD[i%8],i%3?18+R0()*16:9+R0()*5),(i-10)*10+(R0()-.5)*4,-150-R0()*14,R0()*6);
 else if(kit==='forest'||kit==='autumn'||kit==='farm')for(let i=0;i<26;i++){const o=gm(kit==='farm'?'tree_fat':kit==='autumn'?'tree_autumn':'tree_pine_tall',9+R0()*6);if(kit==='autumn')tint(o,fall);add(o,(i-13)*8+(R0()-.5)*4,-135-R0()*16,R0()*6)}
 else if(kit==='desert'||kit==='canyon')for(let i=0;i<9;i++)add(gm('rock_tall',16+R0()*16),(i-4)*28+(R0()-.5)*10,-150-R0()*20,R0()*6);
 else if(kit==='crystal')for(let i=0;i<9;i++)add(gm('crystal',10+R0()*12),(i-4)*28+(R0()-.5)*10,-150-R0()*20,R0()*6);
 if(kit==='snow'||kit==='mountain')for(let i=0;i<8;i++){const h=34+R0()*26,m=new T.Group(),r=h*.8;m.add(M(new T.ConeGeometry(r,h,7),std(kit==='snow'?'#dfe7f0':'#8f9aa6',.95),0,h/2,0));
  m.add(M(new T.ConeGeometry(r*.36,h*.36,7),std('#ffffff',.9),0,h-h*.18+.05,0));add(m,(i-3.5)*38+(R0()-.5)*12,-175-R0()*20,R0()*6)}
 if(kit==='sunset'||kit==='jungle'&&false){const sea=M(new T.PlaneGeometry(420,90).rotateX(-Math.PI/2),phy('#2f6fae',{roughness:.12,metalness:.1,clearcoat:1}),0,.02,-160);sea.castShadow=false;g0.add(sea)}}
function kitsFor(k){if(wkOf(k))return glbHas(wkNeeds(k))?modelKits(k):[new T.Group()];const out=[],wrap=(fn)=>{const g0=new T.Group();fn(g0);out.push(bakeVC(g0))};
 const put=(g0,o,x,z,ry=0,s=1)=>{o.position.set(x,0,z);o.rotation.y=ry;o.scale.setScalar(s);g0.add(o)};
 if(k==='gold'){
  for(let v=0;v<6;v++)wrap(g0=>{put(g0,wall('#e6d6b8'),5.3,0);put(g0,palm(3.2+Math.random()*1.3,.25+Math.random()*.3),3.9,-1+Math.random()*2,Math.random()*6);
   if(v%2===0)put(g0,lamp(),2.75,1.6);if(v%3===1)put(g0,bush('#3e8a3c','#5aa548',.9),4.6,1.8);
   if(v<4)put(g0,house(3+Math.random()*3.5,['#f2e8d5','#eadcc0','#f6efe2'][v%3],Math.random()),8.4,0);else put(g0,minaret(5+Math.random()*2),8.2,0)})}
 else if(k==='toy'){
  for(let v=0;v<6;v++)wrap(g0=>{put(g0,brick(.4,.35,4.6,TOYC[v%6]),5.2,0);if(v%2)put(g0,blockStack(),3.7,0,Math.random()*3);else put(g0,lolly(TOYC[(v+2)%6]),3.7,0);
   if(v%3===0)put(g0,lolly(TOYC[(v+4)%6]),4.6,1.9,0,.8);if(v<3)put(g0,toyHouse(TOYC[(v+1)%6],TOYC[(v+3)%6]),8.2,0,0,1+Math.random()*.4);else put(g0,blockStack(),7.5,-.5,0,1.6)})}
 else{const P1=['#ffc2dc','#ff9fc8','#ffe1ee'],P2=['#e7d2ff','#c9a7f2','#f7ecff'];
  for(let v=0;v<6;v++)wrap(g0=>{put(g0,fence('#ffffff'),5.2,0);put(g0,blossomTree(v%2?P1:P2),3.9,0,Math.random()*6,1+Math.random()*.25);if(v%2===0)put(g0,pastelLamp(),2.75,1.8);
   put(g0,flowers(),4.4,1.8+Math.random()*.4);if(v%3===0)put(g0,blossomTree(v%2?P2:P1),7.6,-1,0,1.3)})}
 return out}
function farFor(k){const out=new T.Group(),g0=new T.Group(),w=WORLDS[k];if(wkOf(k)&&glbHas(wkNeeds(k)))modelFar(k,g0);
 for(let i=0;i<9;i++){const h=M(sph(1,24,12),std(w.hill[i%2],.95),(i-4)*34+(Math.random()-.5)*12,-3,-118-Math.random()*30);h.scale.set(26+Math.random()*14,9+Math.random()*7,16);h.castShadow=false;g0.add(h)}
 if(k==='gold'){for(let i=0;i<22;i++){const x0=(i-11)*9+(Math.random()-.5)*4,h=4+Math.random()*9,b=house(h,['#f2e8d5','#e5d5b8','#f6efe2'][i%3],Math.random());b.position.set(x0,0,-150-Math.random()*12);b.scale.setScalar(1.6);b.rotation.y=Math.PI/2;g0.add(b)}
  for(const x0 of[-38,26,58]){const m0=minaret(9);m0.position.set(x0,0,-146);m0.scale.setScalar(1.5);g0.add(m0)}}
 else if(k==='toy'){for(let i=0;i<16;i++){const b=blockStack();b.position.set((i-8)*11,0,-140-Math.random()*20);b.scale.setScalar(4+Math.random()*3);g0.add(b)}
  for(let i=0;i<5;i++){const bl=new T.Group(),c=TOYC[i%6];bl.add(M(sph(2,24,18),plastic(c)));const st=M(new T.SphereGeometry(2.02,24,18,0,.5),plastic('#ffffff'));bl.add(st);
   const st2=st.clone();st2.rotation.y=Math.PI;bl.add(st2);bl.add(M(rbox(1,.7,1,.1),std('#b07a3c',.8),0,-3.2,0));bl.children[0].scale.y=1.15;bl.position.set(-50+i*25,16+Math.random()*10,-110-Math.random()*25);bl.userData.b=Math.random()*6;out.add(bl)}}
 else if(!wkOf(k)){const c=new T.Group(),wl=std('#fff4f9',.8),r1='#ffb3d1',r2='#c9a7f2',gd=std('#f5c84c',.35,.8);c.add(M(box(16,6,4),wl,0,3,0));
  for(const [tx,hh,cc] of[[-9,10,r2],[-4,13,r1],[4,13,r1],[9,10,r2],[0,16,r1]]){c.add(M(cyl(1.4,1.5,hh,20),wl,tx,hh/2,0));const d=dome(1.6,cc,gd);d.position.set(tx,hh+.2,0);c.add(d)}
  c.position.set(30,0,-150);c.scale.setScalar(1.4);g0.add(c);
}
 /* soft clouds (sprites) */
 const ct=cTex(256,128,(g)=>{for(let i=0;i<9;i++){const x0=40+Math.random()*176,y0=60+Math.random()*30,r=22+Math.random()*26,gr=g.createRadialGradient(x0,y0,0,x0,y0,r);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.6,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x0,y0,r,0,7);g.fill()}});
 for(let i=0;i<9;i++){const s=new T.Sprite(new T.SpriteMaterial({map:ct,fog:false,transparent:true,depthWrite:false,opacity:.92}));DISP.push(s.material);s.scale.set(42+Math.random()*24,18,1);s.position.set(-120+i*30+Math.random()*12,34+Math.random()*24,-200);s.userData.c=Math.random()*.6+.4;out.add(s)}
 out.add(bakeVC(g0,false));return out}

/* ---------- builders: the car ---------- */
function plateTex(){return cTex(256,80,(g)=>{g.fillStyle='#f8fafc';g.fillRect(0,0,256,80);g.strokeStyle='#0f172a';g.lineWidth=5;g.strokeRect(4,4,248,72);g.fillStyle='#0f172a';g.font='900 44px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FASTAQIM',128,43)})}
function wheel(r,wd,rim){const g0=new T.Group(),tire=std('#15171b',.85),hub=std(rim,.2,1);const t=M(cyl(r,r,wd,28).rotateZ(Math.PI/2),tire);g0.add(t);const h=M(cyl(r*.62,r*.62,wd+.01,20).rotateZ(Math.PI/2),hub);g0.add(h);
 for(let i=0;i<5;i++){const sp=M(box(wd+.02,r*1.05,r*.16),hub);sp.rotation.x=i*Math.PI/5;g0.add(sp)}g0.add(M(cyl(r*.16,r*.16,wd+.03,10).rotateZ(Math.PI/2),std('#2b2f36',.4,.8)));return g0}
function mkCar(kind,C){if(kind&&kind.startsWith('k:')){const n=kind.slice(2);if(GL[n]){const g0=new T.Group(),body=gm(n,2.0,true);body.rotation.y=Math.PI;g0.add(body);const wh=[];body.traverse(o=>{if(/^wheel/.test(o.name||''))wh.push(o)});
  const b=new T.Box3().setFromObject(body);g0.traverse(o=>{if(o.isMesh){o.castShadow=true;if(o.material&&!o.material._fq){o.material=o.material.clone();o.material._fq=1;o.material.color.set('#c4c4c4');o.material.roughness=.42;o.material.metalness=.15;o.material.envMapIntensity=.6;DISP.push(o.material)}}});g0.userData={body,wh:wh.length?wh:[],H0:b.max.y};return g0}kind='sleek'}const g0=new T.Group(),body=new T.Group();g0.add(body);
 const paint=phy(C[0],{metalness:.5,roughness:.32,clearcoat:1,clearcoatRoughness:.04}),paint2=phy(C[1],{metalness:.5,roughness:.35,clearcoat:1}),dark=std('#121418',.55,.3),glass=phy('#0d1622',{roughness:.04,metalness:.4,clearcoat:1}),
  tail=std('#ff2a2a',.3,0,{emissive:'#ff1f1f',emissiveIntensity:2.6}),chrome=std('#e3e7ec',.12,1),plate=new T.MeshStandardMaterial({map:plateTex(),roughness:.5});DISP.push(plate);
 const wh=[];let H0;
 if(kind==='sleek'){body.add(M(rbox(1.04,.32,1.98,.13,4),paint,0,.34,0));body.add(M(rbox(1.0,.12,1.86,.05),dark,0,.2,0));
  body.add(M(rbox(.82,.3,1.02,.13,4),glass,0,.6,.12));body.add(M(rbox(.7,.06,.66,.03),paint,0,.765,.14));body.add(M(rbox(.86,.1,.5,.05),paint,0,.5,-.7));
  body.add(M(rbox(1.04,.05,.22,.02),paint2,0,.66,.92));for(const sx of[-.32,.32])body.add(M(box(.05,.14,.06),dark,sx,.58,.9));
  for(const sx of[-.3,.3])body.add(M(rbox(.3,.075,.04,.02),tail,sx,.42,.99));body.add(M(box(.36,.022,.02),tail,0,.43,.995));
  const pl=new T.Mesh(new T.PlaneGeometry(.3,.094),plate);pl.position.set(0,.3,1.0);body.add(pl);body.add(M(box(.82,.09,.07),dark,0,.17,.97));
  for(const sx of[-.24,.24])body.add(M(cyl(.04,.04,.1,12).rotateX(Math.PI/2),chrome,sx,.18,1.0));
  for(const sx of[-.53,.53])body.add(M(rbox(.08,.06,.14,.02),paint2,sx,.56,-.34));
  for(const [sx,sz] of[[-.5,-.66],[.5,-.66],[-.5,.64],[.5,.64]]){const w=wheel(.21,.2,'#cfd5dc');w.position.set(sx,.21,sz);g0.add(w);wh.push(w)}H0=.78}
 else{body.add(M(rbox(1.04,.46,1.6,.2,4),paint,0,.43,0));body.add(M(rbox(1.08,.1,1.5,.05),paint2,0,.24,0));
  const bub=M(sph(.4,28,20),phy(kind==='cute'?'#ffe6f2':'#d6ecff',{roughness:.05,metalness:.1,clearcoat:1,transparent:true,opacity:.9}),0,.68,.05);bub.scale.set(1,.68,1.15);body.add(bub);
  const orn=new T.Mesh(kind==='cute'?(()=>{const s=new T.Shape();s.moveTo(-.2,0);s.lineTo(-.2,.16);s.lineTo(-.1,.07);s.lineTo(0,.2);s.lineTo(.1,.07);s.lineTo(.2,.16);s.lineTo(.2,0);s.closePath();return new T.ExtrudeGeometry(s,{depth:.06,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2})})():new T.ExtrudeGeometry(starShape(.17,.075),{depth:.06,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2}),std('#f5c84c',.25,.9));
  orn.position.set(0,kind==='cute'?.92:.98,.04);orn.castShadow=true;body.add(orn);
  for(const sx of[-.3,.3])body.add(M(sph(.07,14,10),tail,sx,.48,.8));const pl=new T.Mesh(new T.PlaneGeometry(.3,.094),plate);pl.position.set(0,.34,.805);body.add(pl);
  for(const [sx,sz] of[[-.52,-.5],[.52,-.5],[-.52,.5],[.52,.5]]){const w=wheel(.25,.22,kind==='cute'?'#ffd1e6':'#ffd23f');w.position.set(sx,.25,sz);g0.add(w);wh.push(w)}H0=1.05}
 g0.userData={body,wh,H0};g0.traverse(o=>{if(o.isMesh){o.castShadow=true}});return g0}

/* ---------- builders: obstacles, coins, power-ups, arches ---------- */
function hazardTex(a,b){return cTex(256,64,(g)=>{g.fillStyle=a;g.fillRect(0,0,256,64);g.fillStyle=b;for(let i=-2;i<12;i++){g.beginPath();g.moveTo(i*32,64);g.lineTo(i*32+16,64);g.lineTo(i*32+48,0);g.lineTo(i*32+32,0);g.fill()}})}
function proto(k){if(PROTO[k])return PROTO[k];const w=WORLDS[curW],g0=new T.Group();let p;
 if(k==='coin'){const gm=std('#ffc21a',.28,.55,{emissive:'#b97800',emissiveIntensity:.55,envMapIntensity:1.2}),gm2=std('#fff0a8',.22,.5,{emissive:'#d29a00',emissiveIntensity:.6,envMapIntensity:1.2});
  g0.add(new T.Mesh(cyl(.3,.3,.07,32).rotateX(Math.PI/2),gm));const rim=new T.Mesh(new T.TorusGeometry(.29,.025,8,32),gm2);g0.add(rim);
  for(const s of[1,-1]){const st=new T.Mesh(new T.ExtrudeGeometry(starShape(.16,.07),{depth:.015,bevelEnabled:false}),gm2);st.position.z=s*.035;if(s<0)st.rotation.y=Math.PI;g0.add(st)}
  const cm=new T.MeshStandardMaterial({vertexColors:true,roughness:.26,metalness:.55,emissive:'#b97800',emissiveIntensity:.55,envMapIntensity:1.2});DISP.push(cm);
  const v=bakeVC(g0,true);v.children.forEach(c=>{c.material=cm});p=v}
 else if(k==='low'){if(w.obs==='cone'){const con=std('#f3f1ec',.85),red=std('#d63a2c',.5);const s=new T.Shape();s.moveTo(-.28,0);s.lineTo(.28,0);s.lineTo(.12,.2);s.lineTo(.09,.62);s.lineTo(-.09,.62);s.lineTo(-.12,.2);s.closePath();
   const e=new T.Mesh(new T.ExtrudeGeometry(s,{depth:1.3,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:1}).translate(0,0,-.65).rotateY(Math.PI/2),con);g0.add(e);
   for(const xx of[-.42,.42])g0.add(M(box(.06,.3,.06),std('#e5e7eb',.5,.4),xx,.76,0));const bd=M(rbox(1.36,.28,.07,.03),new T.MeshStandardMaterial({map:hazardTex('#d62f22','#ffffff'),roughness:.45}),0,.98,0);DISP.push(bd.material);g0.add(bd);
   for(const xx of[-.6,.6])g0.add(M(cyl(.055,.055,.07,12),glow('#ffb020',3.2),xx,1.16,0));p=bake(g0)}
  else if(w.obs==='block'){for(let i=0;i<3;i++){const b=brick(.42,.42,.42,TOYC[(i*2)%6]);b.position.x=-.44+i*.44;g0.add(b)}p=bake(g0)}
  else{g0.add(M(rbox(1.25,.48,.5,.2,4),phy('#ffb3d1',{roughness:.6,clearcoat:.3}),0,.24,0));for(let i=0;i<4;i++)g0.add(M(sph(.07,12,10),phy('#ffffff',{roughness:.15,clearcoat:1}),-.42+i*.28,.5,0));p=bake(g0)}}
 else if(k==='high'){const met=std('#7b8794',.35,.85),hb=w.obs==='cone'?.64:.82;g0.add(M(cyl(.06,.07,hb+.3,12),met,-.7,(hb+.3)/2,0));g0.add(M(cyl(.06,.07,hb+.3,12),met,.7,(hb+.3)/2,0));
  for(const xx of[-.7,.7])g0.add(M(cyl(.12,.14,.06,12),met,xx,.03,0));
  const ht=hazardTex(w.obs==='heart'?'#c084fc':w.obs==='block'?'#2f7bf6':'#f59e0b','#ffffff');g0.add(M(rbox(1.56,.28,.16,.04),new T.MeshStandardMaterial({map:ht,roughness:.5}),0,hb+.14,0));DISP.push(g0.children[g0.children.length-1].material);
  const ar=cTex(128,128,(g)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,128,128);g.fillStyle='#fff';g.beginPath();g.moveTo(34,40);g.lineTo(94,40);g.lineTo(64,96);g.closePath();g.fill()});
  const sg=new T.Mesh(new T.PlaneGeometry(.34,.34),new T.MeshBasicMaterial({map:ar,transparent:true,color:'#ffffff',toneMapped:false}));sg.position.set(0,hb+.62,.02);DISP.push(sg.material);
  const pn=M(rbox(.46,.42,.06,.06),std('#0f172a',.4),0,hb+.62,-.02);p=bake(g0);p.add(pn,sg);
  for(const xx of[-.7,.7]){const l=M(sph(.06,10,8),glow('#ff3b3b',3.2),xx,hb+.36,0);l.castShadow=false;p.add(l)}}
 else if(k==='block'&&wkOf(curW)&&GL[wkOf(curW).traffic]){const tn=wkOf(curW).traffic,o=gm(tn,tn==='tractor'?2.4:tn==='race_car_future'?2.6:3.6,true);o.rotation.y=Math.PI;o.position.z=-1.7;g0.add(o);p=g0;p.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}})}
 else if(k==='block'){if(w.obs==='cone'){const sk=phy('#f4f1ea',{metalness:.35,roughness:.3,clearcoat:.8}),st=phy('#1d6f8a',{metalness:.3,roughness:.3,clearcoat:.8}),gl=phy('#13202c',{roughness:.05,metalness:.5,clearcoat:1}),dk=std('#23272e',.6,.4);
   g0.add(M(rbox(1.34,1.5,4.4,.24,4),sk,0,1.04,-2.05));g0.add(M(rbox(1.36,.42,4.3,.05),st,0,.5,-2.05));g0.add(M(box(1.37,.05,4.3),std('#d9a93a',.3,.9),0,.74,-2.05));
   g0.add(M(rbox(1.36,.5,3.9,.08),gl,0,1.25,-2.1));g0.add(M(rbox(.86,.66,.05,.06),gl,0,1.22,.16));g0.add(M(rbox(.9,.16,1.6,.06),std('#cfd5dc',.4,.6),0,1.86,-2.05));
   for(const xx of[-.44,.44])g0.add(M(rbox(.18,.1,.04,.03),glow('#ff3030',2.6),xx,.5,.18));for(const zz of[-.6,-3.5])g0.add(M(box(1.0,.3,1.0),dk,0,.15,zz));
   g0.add(M(box(1.28,.06,.06),std('#ffd23f',.4),0,.3,.16));p=bake(g0)}
  else if(w.obs==='block'){for(let r=0;r<2;r++)for(let c=0;c<2;c++){const b=brick(.62,.62,.62,TOYC[(r*2+c+1)%6]);b.position.set(-.32+c*.64,r*.66,0);b.rotation.y=(r+c)%2?.06:-.06;g0.add(b)}p=bake(g0)}
  else{const bx=(s,y0,c,rc)=>{g0.add(M(rbox(s,s*.7,s,.08),phy(c,{roughness:.45,clearcoat:.5}),0,y0+s*.35,0));g0.add(M(box(s+.02,s*.72,.12),std(rc,.35,.3),0,y0+s*.35,0));g0.add(M(box(.12,s*.72,s+.02),std(rc,.35,.3),0,y0+s*.35,0));g0.add(M(rbox(s+.08,.1,s+.08,.04),phy(c,{roughness:.45}),0,y0+s*.7,0))};
   bx(1.25,0,'#e7d2ff','#f5c84c');bx(.85,.92,'#ffb3d1','#ffffff');const bw=M(new T.TorusGeometry(.13,.05,8,16),std('#ffffff',.4),0,1.62,0);g0.add(bw);p=bake(g0)}}
 else if(['mag','shield','x2','boost'].includes(k)){const c={mag:'#ef4444',shield:'#3b82f6',x2:'#f59e0b',boost:'#8b5cf6'}[k];
  const core=new T.Mesh(sph(.3,28,20),new T.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:.55,roughness:.12,clearcoat:1,transparent:true,opacity:.92}));DISP.push(core.material);g0.add(core);
  const ring=new T.Mesh(new T.TorusGeometry(.44,.028,8,40),glow('#ffffff',2.2));g0.add(ring);
  const ic=new T.Sprite(new T.SpriteMaterial({map:emojiTex({mag:'🧲',shield:'🛡️',x2:'×2',boost:'⚡'}[k]),depthTest:false,toneMapped:false}));ic.scale.set(.38,.38,1);ic.renderOrder=5;DISP.push(ic.material);g0.add(ic);
  const hal=new T.Sprite(new T.SpriteMaterial({map:radTex(c+'cc',c+'00'),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));hal.scale.set(1.7,1.7,1);DISP.push(hal.material);g0.add(hal);p=g0}
 else if(k==='gem'){const gm=new T.MeshPhysicalMaterial({color:'#19c3a3',emissive:'#0b7f69',emissiveIntensity:.45,roughness:.08,metalness:.1,clearcoat:1,flatShading:true,envMapIntensity:1.6});DISP.push(gm);
  const m1=new T.Mesh(new T.OctahedronGeometry(.3,0).scale(1,1.3,1),gm);m1.castShadow=true;g0.add(m1);
  const hal=new T.Sprite(new T.SpriteMaterial({map:radTex('#5eead4aa','#5eead400'),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));hal.scale.set(1.3,1.3,1);g0.add(hal);p=g0}
 else if(k==='star5'){const gm=std('#ffc21a',.25,.6,{emissive:'#d08a00',emissiveIntensity:.7,envMapIntensity:1.3});
  const m1=new T.Mesh(new T.ExtrudeGeometry(starShape(.42,.19),{depth:.1,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2}).translate(0,0,-.05),gm);m1.castShadow=true;g0.add(m1);
  const hal=new T.Sprite(new T.SpriteMaterial({map:radTex('#ffd257aa','#ffd25700'),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));hal.scale.set(1.6,1.6,1);g0.add(hal);p=g0}
 else if(k==='gift'){const bx=phy('#ec4899',{roughness:.35,clearcoat:.8}),rb=phy('#fde047',{roughness:.3,clearcoat:.6});
  g0.add(M(rbox(.56,.46,.56,.05),bx,0,0,0));g0.add(M(rbox(.62,.13,.62,.04),bx,0,.27,0));g0.add(M(box(.12,.6,.58),rb,0,.03,0));g0.add(M(box(.58,.6,.12),rb,0,.03,0));
  for(const a of[-1,1]){const bw=M(new T.TorusGeometry(.1,.035,8,16),rb,a*.09,.42,0);bw.rotation.y=Math.PI/2;bw.rotation.x=a*.5;g0.add(bw)}
  const hal=new T.Sprite(new T.SpriteMaterial({map:radTex('#f9a8d4aa','#f9a8d400'),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));hal.scale.set(1.6,1.6,1);g0.add(hal);p=g0}
 else if(k==='gate'||k==='finish'){const pc=k==='finish'?std('#111827',.4,.3):phy('#fb923c',{roughness:.35,clearcoat:.6});for(const xx of[-2.4,2.4]){g0.add(M(cyl(.1,.12,2.9,14),pc,xx,1.45,0));g0.add(M(sph(.16,14,10),k==='finish'?std('#fde047',.3,.6):glow('#fff1c2',2),xx,2.95,0))}
  g0.add(M(rbox(4.9,.12,.14,.04),pc,0,2.72,-.02));g0.add(M(rbox(4.9,.12,.14,.04),pc,0,1.98,-.02));p=bake(g0);
  const sg=new T.Mesh(new T.PlaneGeometry(4.7,.7),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}));sg.position.set(0,2.35,.06);DISP.push(sg.material,sg.geometry);p.add(sg);p._sign=sg;
  if(k==='finish'){sg.material.map=cTex(512,72,(g)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#111827':'#ffffff';g.fillRect(i*16,j*18,16,18)}});sg.material.needsUpdate=true}}
 if(!p)return PROTO[k]=proto('coin');
 return PROTO[k]=p}
function gateTexFor(i,txt){if(gateTex[i])return gateTex[i];return gateTex[i]=cTex(1024,152,(g)=>{g.fillStyle='#fff7ed';g.fillRect(0,0,1024,152);g.strokeStyle='#fb923c';g.lineWidth=12;g.strokeRect(6,6,1012,140);
 g.fillStyle='#9a3412';let fs=92;const t='🚩 '+txt;g.textAlign='center';g.textBaseline='middle';if(/[֐-ࣿ]/.test(txt))try{g.direction='rtl'}catch(e){}
 do{g.font=`800 ${fs}px Inter,"IBM Plex Sans Arabic",system-ui,sans-serif`;fs-=4}while(g.measureText(t).width>960&&fs>26);let s2=t;while(g.measureText(s2).width>960&&s2.length>4)s2=s2.slice(0,-2);if(s2!==t)s2=s2.slice(0,-1)+'…';g.fillText(s2,512,80)})}
const KIND=ob=>ob.k==='star5'&&ob.mys?'gift':ob.k;
function acquire(k){const pool=POOL[k]||(POOL[k]=[]);for(const m of pool)if(!m.userData.used){m.userData.used=true;m.visible=true;return m}
 const p=proto(k),m=p.clone();m.userData={k,used:true};if(p._sign){m._sign=m.children.find(c=>c.geometry===p._sign.geometry);if(k==='gate'){m._sign.material=p._sign.material.clone();DISP.push(m._sign.material)}}
 if(['mag','shield','x2','boost'].includes(k))m._ring=m.children[1];WG.add(m);pool.push(m);return m}

/* ---------- per-frame sync ---------- */
let frame=0,tPrev=0,carRoll=0,carYaw=0,sq=1,wSpin=0,pY=0,landT=0;const tv=new T.Vector3();
function sync(t,noW){const g=G,dt=Math.min(.05,Math.max(0,t-tPrev));tPrev=t;frame++;
 if(!noW&&(curW!==ST.world||!WG||carKey!==(ST.car||'')+(ST.carC||'')))buildWorld(ST.world);
 const dist=g?g.dist:t*6,sp=g?g.speed*(g.boost>0?1.6:1):6;
 roadT.offset.y=(dist/8)%1;grassT.offset.y=(dist/8)%1;shT.offset.y=(dist/4)%1;curbG.position.z=dist%2;
 for(const s of slots){let z=((s.i*SLOT+(s.sd>0?2.5:0)-dist)%SPAN+SPAN)%SPAN-12;if(z>s.lz+SPAN/2)pickKit(s);s.lz=z;s.g.position.set(0,0,-z)}
 if(farG)for(const c of farG.children){if(c.isSprite){c.position.x+=dt*c.userData.c*.8;if(c.position.x>150)c.position.x=-150}else if(c.userData.b!=null)c.position.y+=Math.sin(t*.6+c.userData.b)*.01}
 /* car */
 const cx=(g?g.x:0)*LS,cy=g?g.y:0,tgt=g?[-1,0,1][g.lane]*LS:0,dv=tgt-cx;carRoll+=(dv*.12-carRoll)*Math.min(1,dt*10);carYaw+=(-dv*.2-carYaw)*Math.min(1,dt*10);
 const u=car.userData,ducking=g&&g.duck>0;sq+=((ducking?.6:1)-sq)*Math.min(1,dt*18);
 car.position.set(cx,cy+(g&&state==='play'&&cy===0?Math.sin(t*22)*.006:0),0);car.rotation.set(cy>0?-Math.min(.12,(g.vy||0)*.008):0,carYaw,carRoll);if(pY>.05&&cy===0)landT=.3;pY=cy;landT=Math.max(0,landT-dt);const lb=landT>0?Math.sin((1-landT/.3)*Math.PI)*.16:0;u.body.scale.set(1+(1-sq)*.12+lb*.45,sq*(1-lb),1+(1-sq)*.08+lb*.3);
 wSpin-=sp*dt/.22;for(const w of u.wh)w.rotation.x=wSpin;
 car.visible=!(g&&g.inv>0&&g.boost<=0&&Math.floor(g.t*14)%2);
 blob.position.x=cx;const bs=1-Math.min(.5,cy*.18);blob.scale.set(bs,1,bs);blob.material.opacity=1-Math.min(.6,cy*.2);
 shieldM.visible=!!(g&&g.shield);shieldM.position.set(cx,cy+.5,0);magM.visible=!!(g&&g.mag>0);magM.position.set(cx,cy+.45,0);magM.scale.setScalar(1+.08*Math.sin(t*8));
 /* objects */
 if(g)for(const ob of g.objs){const d=ob.z-g.dist;if(ob.got||d>FAR+4||d<-8){continue}
  let m=ob._m;if(!m||m.userData.ob!==ob){m=acquire(KIND(ob));m.userData.ob=ob;ob._m=m;
   if(ob.k==='gate'&&m._sign){const s2=g.steps[ob.i];m._sign.material.map=gateTexFor(ob.i,s2?s2.text:'');m._sign.material.needsUpdate=true}}
  m.userData.f=frame;const X=(ob.ln-1)*LS,Z=-(d+OFF),fade=d>FAR-12?Math.max(.01,(FAR+4-d)/16):1;
  if(ob.k==='coin'){m.position.set(X,.48+(ob.h||0),Z);m.rotation.y=t*3.2+ob.z;m.scale.setScalar(fade)}
  else if(['mag','shield','x2','boost'].includes(ob.k)){m.position.set(X,.72+(ob.h||0)*.2+Math.sin(t*4)*.08,Z);if(m._ring){m._ring.rotation.x=t*2;m._ring.rotation.y=t*1.3}m.scale.setScalar(fade)}
  else if(ob.k==='gem'||ob.k==='star5'){m.position.set(X,.62+(ob.h||0)+Math.sin(t*3+ob.z)*.07,Z);m.rotation.y=t*2.2+ob.z;m.scale.setScalar(fade)}
  else if(ob.k==='gate'||ob.k==='finish'){m.position.set(0,0,Z);m.scale.setScalar(1)}
  else{m.position.set(X,0,Z);m.scale.setScalar(fade)}}
 for(const k in POOL)for(const m of POOL[k])if(m.userData.used&&m.userData.f!==frame){m.userData.used=false;m.visible=false;if(m.userData.ob)m.userData.ob._m=null;m.userData.ob=null}
 /* camera */
 if(cam.userData.vk!==ST.view){fitCam();cam.fov=cam.userData.f0;cam.updateProjectionMatrix()}const V=VW(),sk=g&&g.shake>0?g.shake:0,camX=cx*.5;cam.position.set(camX+(Math.random()-.5)*sk*.7,V[0]+cy*.22+(Math.random()-.5)*sk*.45,V[1]);cam.lookAt(camX*.55,V[3]+cy*.18,V[2]);
 const fv=cam.userData.f0+(g&&g.boost>0?7:0)+(g?Math.min(4,(sp-6)*.35):0);if(Math.abs(cam.fov-fv)>.05){cam.fov+=(fv-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix()}
 sun.position.set(cx+6,13,12);sun.target.position.set(cx,0,-4);sky.position.copy(cam.position)}

/* ---------- adaptive quality: keep it smooth on older phones ---------- */
let q=0,acc=0,nf=0;
function setQ(n){q=n;if(q>=1)useBloom=false;if(q>=2){PR=Math.min(PR,1.5);rs()}if(q>=3){PR=1;rs();R.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true})}}
function perf(ms){if(HQ||state!=='play'||document.hidden)return;acc+=ms;nf++;if(nf>=90){const a=acc/nf;acc=0;nf=0;if(a>38&&q<3)setQ(q+1)}}

/* ---------- overlay on the 2D canvas ---------- */
let lastNow=0;const SL=[...Array(26)].map(()=>({a:Math.random()*Math.PI*2,l:Math.random()}));
function overlay(t){x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,W,H);try{x.direction='ltr'}catch(e){}
 if(G){const g=G,sp=g.speed*(g.boost>0?1.6:1);
  const vp=P(0,40,1);const k=state==='play'?(g.boost>0?1:Math.max(0,Math.min(.55,(sp-9)/9))):0;
  if(k>0){x.lineCap='round';for(const s of SL){if(Math.random()<.35){s.a=Math.random()*Math.PI*2;s.l=Math.random()}const r0=Math.max(W,H)*(.34+s.l*.12),r1=r0+Math.max(W,H)*(.22+.18*s.l)*k;x.strokeStyle=`rgba(255,255,255,${(.18+.3*s.l)*k})`;x.lineWidth=1+s.l*2.2;x.beginPath();x.moveTo(vp.x+Math.cos(s.a)*r0,vp.y+Math.sin(s.a)*r0*.8);x.lineTo(vp.x+Math.cos(s.a)*r1,vp.y+Math.sin(s.a)*r1*.8);x.stroke()}}
  for(const p of g.parts){x.globalAlpha=Math.max(0,Math.min(1,p.life*1.8));x.fillStyle=p.col;if(p.c){x.save();x.translate(p.x,p.y);x.rotate(p.r2);x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()}else{x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()}}x.globalAlpha=1;
  for(const f of g.fl){x.globalAlpha=Math.min(1,f.life*1.6);x.textAlign='center';x.textBaseline='middle';x.font=f.ar?'28px FQ,"Scheherazade New",serif':'900 24px Inter,system-ui';x.lineWidth=5;x.strokeStyle='rgba(15,60,40,.75)';x.strokeText(f.t,f.x,f.y);x.fillStyle=f.col;x.fillText(f.t,f.x,f.y)}x.globalAlpha=1;
  if(g.inv>1&&g.boost<=0){const gr=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(220,38,38,0)');gr.addColorStop(1,'rgba(220,38,38,.32)');x.fillStyle=gr;x.fillRect(0,0,W,H)}
  if(g.boost>0){const gr=x.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.8);gr.addColorStop(0,'rgba(139,92,246,0)');gr.addColorStop(1,'rgba(139,92,246,.22)');x.fillStyle=gr;x.fillRect(0,0,W,H)}}
 if(G&&G.cd>0&&state==='play'){const n=Math.ceil(G.cd*1.25-.2);if(n>0){const f=G.cd*1.25-.2-Math.floor(G.cd*1.25-.2),s=1+f*.35;x.save();x.translate(W/2,H*.42);x.scale(s,s);x.font='900 96px Inter,system-ui';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(15,23,42,.55)';x.strokeText(String(n),0,0);x.fillStyle='#fff';x.fillText(String(n),0,0);x.restore()}}}

/* ---------- world pictures in the menu: real 3D snapshots (taken once, kept for the visit) ---------- */
let TH=null,needTh=false;const THI={};try{TH=JSON.parse(sessionStorage.getItem('fastaqim.g3th1')||'null')}catch(e){}
function thImg(k){if(!TH||!TH[k])return null;if(!THI[k]){const im=new Image();im.src=TH[k];THI[k]=im}return THI[k]}
const wt2=worldThumb;
worldThumb=function(c,k){const im=thImg(k);if(im&&im.complete&&im.naturalWidth){c.width=360;c.height=192;c.getContext('2d').drawImage(im,0,0,360,192)}else{wt2(c,k);if(im)im.onload=()=>worldThumb(c,k);else needTh=true}};
function capThumbs(t){const keep=ST.world,out={},w=180,h=96,cv0=R.domElement;
 for(const k of['gold','toy','blos']){buildWorld(k);sync(t,1);cam.position.set(0,2.0,4.4);cam.lookAt(0,.75,-8);const a=cam.aspect,f=cam.fov;cam.aspect=w/h;cam.fov=46;cam.updateProjectionMatrix();
  R.setRenderTarget(null);R.setScissorTest(true);R.setViewport(0,0,w,h);R.setScissor(0,0,w,h);R.render(scene,cam);
  const c=document.createElement('canvas');c.width=w*2;c.height=h*2;c.getContext('2d').drawImage(cv0,0,cv0.height-h*PR,w*PR,h*PR,0,0,w*2,h*2);out[k]=c.toDataURL('image/jpeg',.85);
  R.setScissorTest(false);R.setViewport(0,0,innerWidth,innerHeight);cam.aspect=a;cam.fov=f;cam.updateProjectionMatrix()}
 buildWorld(keep);TH=out;try{sessionStorage.setItem('fastaqim.g3th1',JSON.stringify(out))}catch(e){}
 document.querySelectorAll('[data-th]').forEach(c=>worldThumb(c,c.dataset.th))}

/* ---------- hook into the game ---------- */
const pv=new T.Vector3(),pw=new T.Vector3();
const P3=(X,d,h=0)=>{pw.set(X*LS,h,-d);pv.copy(pw).project(cam);const dep=Math.max(.6,pw.distanceTo(cam.position));return {x:(pv.x+1)/2*W,y:(1-pv.y)/2*H,s:(H/2)/(Math.tan(cam.fov*Math.PI/360)*dep)}};
P=P3;
let dead=false,lost=false,errs=0;
draw=function(t){if(dead||lost)return draw2d(t);const n=performance.now();if(lastNow)perf(n-lastNow);lastNow=n;
 try{if(needTh&&state==='menu'&&frame>3){needTh=false;capThumbs(t)}sync(t);if(useBloom&&comp)comp.render();else R.render(scene,cam);overlay(t);errs=0}catch(e){console.error(e);if(++errs>3)fail()}};
function fail(){dead=true;P=P2;el.style.display='none';draw=draw2d}
/* iPhone Safari drops the 3D view when the app goes to the background or memory is low: show the flat look for a moment, then bring 3D back */
el.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;P=P2;el.style.display='none'});
el.addEventListener('webglcontextrestored',()=>{try{try{const pm=new T.PMREMGenerator(R);envT=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();scene.environment=envT}catch(e){}
 try{mkComp()}catch(e){comp=null;useBloom=false}buildWorld(ST.world);rs();P=P3;el.style.display='block';lost=false}catch(e){console.error(e);fail()}});
rs();
document.querySelectorAll('[data-th]').forEach(c=>worldThumb(c,c.dataset.th));
window.__r3={q:()=>q,setQ,scene,cam,R,meshes:()=>{let n=0;scene.traverseVisible(o=>{if(o.isMesh||o.isSprite)n++});return n},stats:()=>({calls:R.info.render.calls,tris:R.info.render.triangles,geo:R.info.memory.geometries,tex:R.info.memory.textures})};
})();
