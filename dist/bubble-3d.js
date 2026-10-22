/* Pluriball: a cut-crystal glass rests on a bubble sheet; the sheet rolls around it while the section crosses the viewport. */
import * as T from './vendor/three.module.min.js';
const section=document.querySelector('[data-bubble-scene]');
if(section){
 const stage=section.querySelector('.bubble-window'),canvas=stage.querySelector('canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=T.MathUtils.clamp,smooth=(a,b,p)=>{let t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t)};
 let renderer,visible=false,raf=0,progress=0,last=0,dirty=true,dead=false;
 try{
 renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 function paint(w,h,draw,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=aniso;return t;}
 function field(w,h,write){return paint(w,h,g=>{const img=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=(y*w+x)*4;write(x,y,img.data,o);img.data[o+3]=255;}g.putImageData(img,0,0);});}
 const radial=stops=>paint(256,256,(g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);stops.forEach(([o,c])=>r.addColorStop(o,c));g.fillStyle=r;g.fillRect(0,0,s,s);},true);

 // Light product studio, matching the site's other 3D scenes: soft boxes for reflections, soft shadow on the floor.
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,1,.1,60),bundle=new T.Group();scene.add(bundle);
 scene.background=paint(512,512,(g,w,h)=>{const r=g.createRadialGradient(w*.5,h*.42,0,w*.5,h*.5,w*.78);r.addColorStop(0,'#fbfaf7');r.addColorStop(.62,'#e6e5df');r.addColorStop(1,'#d5d5ce');g.fillStyle=r;g.fillRect(0,0,w,h);},true);
 // HDR soft boxes: real glass and film only read through bright reflections, beyond what an 8-bit canvas can hold.
 const EW=256,EH=128,env=new Float32Array(EW*EH*4);
 const boxes=[[.1,.28,.08,.4,7],[.56,.62,.2,.62,4.5],[.82,.9,.06,.32,3],[.3,.42,.55,.62,.6]];
 for(let y=0;y<EH;y++)for(let x=0;x<EW;x++){const u=x/EW,v=y/EH,o=(y*EW+x)*4;let c=.08+.16*(1-v)+.1*Math.max(0,Math.sin(u*Math.PI*6))*(1-v);for(const [u0,u1,v0,v1,k] of boxes){const e=Math.min(u-u0,u1-u,v-v0,v1-v);if(e>0)c+=k*Math.min(1,e*60);}env[o]=c*.97;env[o+1]=c;env[o+2]=c*.99;env[o+3]=1;}
 const studio=new T.DataTexture(env,EW,EH,T.RGBAFormat,T.FloatType);studio.flipY=true;studio.needsUpdate=true;
 studio.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(studio).texture;pm.dispose();
 scene.add(new T.HemisphereLight(0xdfe9e4,0x0e1412,.55));
 const key=new T.DirectionalLight(0xffffff,2.1);key.position.set(-2.4,6,3.4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:1,far:14});key.shadow.camera.updateProjectionMatrix();key.shadow.radius=7;key.shadow.intensity=.5;key.shadow.bias=-.0005;key.shadow.normalBias=.02;scene.add(key);
 const rim=new T.DirectionalLight(0xcfe6dc,1.5);rim.position.set(3,2.4,-4);scene.add(rim);
 const floor=new T.Mesh(new T.PlaneGeometry(14,14),new T.ShadowMaterial({color:0x1d2b24,opacity:.32}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const pool=new T.Mesh(new T.PlaneGeometry(9,9),new T.MeshBasicMaterial({map:radial([[0,'rgba(255,255,255,.35)'],[1,'rgba(255,255,255,0)']]),transparent:true,depthWrite:false,toneMapped:false}));pool.rotation.x=-Math.PI/2;pool.position.y=-.003;scene.add(pool);
 const blob=new T.Mesh(new T.PlaneGeometry(3.2,1.7),new T.MeshBasicMaterial({map:radial([[0,'rgba(24,40,32,.32)'],[1,'rgba(24,40,32,0)']]),transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.002;scene.add(blob);

 // Highball in cut crystal: lathe profile with a thick base, diamond facets on the lower half.
 const GR=.42,GL=1.92,RW=GR+.046,RB=RW+.052;
 const prof=[[0,0],[.36,0],[.405,.012],[GR,.05]];for(let i=1;i<=24;i++)prof.push([GR,.05+(GL-.08)*i/24]);
 prof.push([GR-.004,GL-.008],[GR-.014,GL],[GR-.024,GL-.006],[GR-.028,GL-.03]);for(let i=1;i<=12;i++)prof.push([GR-.028,GL-.03-(GL-.2)*i/12]);prof.push([GR-.06,.155],[0,.15]);
 const glassGeo=new T.LatheGeometry(prof.map(([r,y])=>new T.Vector2(r,y)),96);{const p=glassGeo.attributes.position,uv=glassGeo.attributes.uv;for(let i=0;i<p.count;i++)uv.setY(i,p.getY(i)/GL);}
 glassGeo.translate(0,-GL/2,0);glassGeo.rotateZ(-Math.PI/2);
 const CUT_U=2*Math.PI*GR/10,CUT_V=.14*GL,CUT_D=.05;
 const cutMap=field(512,512,(x,y,d,o)=>{const u=(x+.5)/512,v=1-(y+.5)/512;let nx=0,ny=0;
  if(v>.06&&v<.5){const a=u*10+v/.14,b=u*10-v/.14,fa=a-Math.floor(a)-.5,fb=b-Math.floor(b)-.5;let ha=0,hb=0;if(Math.abs(fa)>Math.abs(fb))ha=-2*Math.sign(fa);else hb=-2*Math.sign(fb);nx=-(ha+hb)/CUT_U*CUT_D;ny=-(ha-hb)/CUT_V*CUT_D;}
  else if(v>=.5&&v<.53){ny=Math.cos((v-.5)/.03*Math.PI)*.35;}
  const l=Math.hypot(nx,ny,1);d[o]=(nx/l*.5+.5)*255;d[o+1]=(ny/l*.5+.5)*255;d[o+2]=(1/l*.5+.5)*255;});
 // Blended rather than transmissive glass, so the film behind and beneath it stays visible through the crystal.
 const crystal=new T.MeshPhysicalMaterial({color:0xb3c7be,metalness:0,roughness:.02,ior:1.52,specularIntensity:1,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:3,transparent:true,opacity:.26,depthWrite:false,normalMap:cutMap,side:T.BackSide});
 const glassBack=new T.Mesh(glassGeo,crystal),glassFront=new T.Mesh(glassGeo,crystal.clone()),glass=new T.Group();glassFront.material.side=T.FrontSide;glassFront.material.opacity=.34;
 glassBack.renderOrder=3.4;glassFront.renderOrder=3.6;glassFront.castShadow=true;glass.add(glassBack,glassFront);bundle.add(glass);

 // Bubble film: hexagonal 10 mm cells, domes facing the object, milky film with the teal print line seen on the real roll.
 const A=.13,TW=128,TH=222,BR=.4*TW,DISP=.042,PX=A/TW;
 const centres=[[0,0],[TW,0],[0,TH],[TW,TH],[TW/2,TH/2]];
 function cell(x,y){let best=1e9,dx=0,dy=0;for(const [cx,cy] of centres){const ex=x+.5-cx,ey=y+.5-cy,r=ex*ex+ey*ey;if(r<best){best=r;dx=ex;dy=ey;}}return [dx,dy,Math.sqrt(best)];}
 const bubbleTile=write=>{const t=field(TW,TH,(x,y,d,o)=>write(cell(x,y),d,o));t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
 const dispMap=bubbleTile(([,,r],d,o)=>{const q=Math.min((r/BR)**2,1),h=r<BR?Math.pow(1-q,.45):0;d[o]=d[o+1]=d[o+2]=h*255;});
 const normMap=bubbleTile(([dx,dy,r],d,o)=>{let nx=0,ny=0;if(r<BR&&r>0){const q=Math.min((r/BR)**2,.985),dh=-.45*Math.pow(1-q,-.55)*2*r/(BR*BR),s=dh*DISP/PX;nx=-s*dx/r;ny=s*dy/r;}const l=Math.hypot(nx,ny,1);d[o]=(nx/l*.5+.5)*255;d[o+1]=(ny/l*.5+.5)*255;d[o+2]=(1/l*.5+.5)*255;});
 const alphaMap=bubbleTile(([,,r],d,o)=>{const k=r/BR,a=k<1?.3+.3*Math.pow(k,8):k<1.08?.6:.38;d[o]=d[o+1]=d[o+2]=a*255;});
 const SX=2.62,LF=Math.PI*RW*1.06,LB=Math.PI*RB*1.18,SS=LF+LB,STEP=.018,nf=Math.round(LF/STEP),nb=Math.round(LB/STEP),NW=nf+nb+1,NX=Math.round(SX/STEP)+1,sf=LF/nf,sb=LB/nb;
 for(const m of [dispMap,normMap,alphaMap])m.repeat.set(SX/A,SS/(A*Math.sqrt(3)));
 const stripeAt=(LF+LB*.62)/SS,stripe=paint(8,2048,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#13897f';g.fillRect(0,(1-stripeAt)*h-5,w,10);},true);
 const sheetGeo=new T.BufferGeometry(),P=new Float32Array(NX*NW*3),N=new Float32Array(NX*NW*3),UV=new Float32Array(NX*NW*2),idx=[];
 const ws=new Float32Array(NW);for(let j=0;j<NW;j++)ws[j]=j<=nf?-LF+j*sf:(j-nf)*sb;
 for(let j=0;j<NW;j++)for(let i=0;i<NX;i++){const k=j*NX+i;UV[k*2]=i/(NX-1);UV[k*2+1]=(ws[j]+LF)/SS;if(i<NX-1&&j<NW-1)idx.push(k,k+1,k+NX,k+1,k+NX+1,k+NX);}
 sheetGeo.setAttribute('position',new T.BufferAttribute(P,3).setUsage(T.DynamicDrawUsage));sheetGeo.setAttribute('normal',new T.BufferAttribute(N,3).setUsage(T.DynamicDrawUsage));sheetGeo.setAttribute('uv',new T.BufferAttribute(UV,2));sheetGeo.setIndex(idx);
 const filmMat=new T.MeshPhysicalMaterial({color:0xaebdb6,map:stripe,transparent:true,alphaMap,roughness:.2,metalness:0,clearcoat:1,clearcoatRoughness:.1,specularIntensity:1,envMapIntensity:1.6,normalMap:normMap,displacementMap:dispMap,displacementScale:DISP,depthWrite:false,side:T.BackSide});
 const back=new T.Mesh(sheetGeo,filmMat),front=new T.Mesh(sheetGeo,filmMat.clone());front.material.side=T.FrontSide;back.renderOrder=3;front.renderOrder=4;front.castShadow=true;back.frustumCulled=front.frustumCulled=false;bundle.add(back,front);

 // Shipping box in kraft corrugated board, colour sampled from the warehouse photo (lit liner ≈ rgb 185,137,91; cut edges show the darker flute).
 const BT=.045,IL=2.86,IW=1.2,IH=1.18,BL=IL+2*BT,BW=IW+2*BT,BH=IH+BT,rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647;})();
 const kraftMap=paint(1024,1024,(g,w,h)=>{g.fillStyle='rgb(152,102,58)';g.fillRect(0,0,w,h);
  for(let k=0;k<6;k++){const f=1+Math.floor(rnd()*3),ph=rnd()*6.28,a=.035*rnd();for(let x=0;x<w;x+=4){const v=Math.sin(x/w*Math.PI*2*f+ph);g.fillStyle=v>0?`rgba(255,236,205,${a*v})`:`rgba(70,42,20,${-a*v})`;g.fillRect(x,0,4,h);}}
  for(let y=0;y<h;y+=2){const v=Math.sin(y/h*Math.PI*2*40);g.fillStyle=v>0?`rgba(255,240,215,${.035*v})`:`rgba(60,36,16,${-.03*v})`;g.fillRect(0,y,w,2);}
  for(let k=0;k<26000;k++){const x=rnd()*w,y=rnd()*h,l=2+rnd()*9,a=rnd()*Math.PI;g.strokeStyle=rnd()<.5?`rgba(95,60,30,${.05+rnd()*.12})`:`rgba(206,160,110,${.05+rnd()*.12})`;g.lineWidth=.6+rnd();for(const ox of [-w,0,w])for(const oy of [-h,0,h]){g.beginPath();g.moveTo(x+ox,y+oy);g.lineTo(x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);g.stroke();}}
  for(let k=0;k<900;k++){g.fillStyle=`rgba(${rnd()<.7?'60,38,20':'40,30,22'},${.25+rnd()*.4})`;g.fillRect(rnd()*w,rnd()*h,1+rnd()*1.6,1+rnd()*1.6);}},true);
 kraftMap.wrapS=kraftMap.wrapT=T.RepeatWrapping;
 const fluteMap=paint(256,64,(g,w,h)=>{g.fillStyle='rgb(74,48,28)';g.fillRect(0,0,w,h);g.strokeStyle='rgb(156,108,64)';g.lineWidth=5;g.beginPath();for(let x=0;x<=w;x++){const y=h/2+(h/2-11)*Math.sin(x/w*Math.PI*8);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.fillStyle='rgb(162,112,66)';g.fillRect(0,0,w,7);g.fillRect(0,h-7,w,7);},true);
 fluteMap.wrapS=T.RepeatWrapping;
 const kraft=new T.MeshStandardMaterial({map:kraftMap,bumpMap:kraftMap,bumpScale:.6,roughness:.86,metalness:0,envMapIntensity:.55}),flute=new T.MeshStandardMaterial({map:fluteMap,roughness:.92,envMapIntensity:.4});
 function board(sx,sy,sz){const geo=new T.BoxGeometry(sx,sy,sz),p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,dims=[sx,sy,sz];
  for(let i=0;i<p.count;i++){const c=[p.getX(i),p.getY(i),p.getZ(i)],a=[0,1,2].reduce((m,k)=>Math.abs([n.getX(i),n.getY(i),n.getZ(i)][k])>Math.abs([n.getX(i),n.getY(i),n.getZ(i)][m])?k:m,0),[b,e]=a===0?[2,1]:a===1?[0,2]:[0,1];
   if(Math.min(dims[b],dims[e])<=BT*1.01){const th=dims[b]<=BT*1.01?b:e,ln=th===b?e:b;uv.setXY(i,c[ln]/.26,c[th]/BT+.5);}else uv.setXY(i,c[b]/2+.37,c[e]/2+.11);}
  geo.groups.forEach((gr,i)=>{const a=i>>1,o=[0,1,2].filter(k=>k!==a);gr.materialIndex=Math.min(dims[o[0]],dims[o[1]])<=BT*1.01?1:0;});
  const m=new T.Mesh(geo,[kraft,flute]);m.castShadow=m.receiveShadow=true;return m;}
 const box=new T.Group();
 const at=(m,x,y,z)=>{m.position.set(x,y,z);return m;};
 box.add(at(board(BL,BT,BW),0,BT/2,0),at(board(BL,BH,BT),0,BH/2,BW/2-BT/2),at(board(BL,BH,BT),0,BH/2,-BW/2+BT/2),at(board(BT,BH,IW),BL/2-BT/2,BH/2,0),at(board(BT,BH,IW),-BL/2+BT/2,BH/2,0));
 // Four top flaps hinged on the walls: the short ones fold first, the long ones close over them and meet on the centre line.
 const endFlaps=[1,-1].map(sx=>{const pivot=at(new T.Group(),sx*(BL/2-BT/2),BH,0),d=BW/2-.03;pivot.add(at(board(d,BT,IW-.02),-sx*d/2,-BT/2,0));pivot.userData.s=sx;box.add(pivot);return pivot;});
 const sideFlaps=[1,-1].map(sz=>{const pivot=at(new T.Group(),0,BH,sz*(BW/2-BT/2)),d=BW/2-BT/2-.004;pivot.add(at(board(BL-.01,BT,d),0,BT/2,-sz*d/2));pivot.userData.s=sz;box.add(pivot);return pivot;});
 const ink=paint(512,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle=g.fillStyle='rgba(48,32,20,.82)';g.lineWidth=7;g.lineCap='round';
  g.beginPath();g.moveTo(40,30);g.lineTo(120,30);g.quadraticCurveTo(120,118,80,124);g.quadraticCurveTo(40,118,40,30);g.stroke();g.beginPath();g.moveTo(80,124);g.lineTo(80,196);g.moveTo(52,200);g.lineTo(108,200);g.stroke();
  g.beginPath();g.moveTo(66,60);g.lineTo(84,80);g.lineTo(72,92);g.lineTo(92,112);g.stroke();
  g.font='700 64px Manrope, system-ui, sans-serif';g.textBaseline='middle';g.fillText('FRAGILE',160,86);g.font='600 30px Manrope, system-ui, sans-serif';g.fillText('MANEGGIARE CON CURA',162,150);
  for(const x of [400,452]){g.beginPath();g.moveTo(x,236);g.lineTo(x,186);g.moveTo(x-16,202);g.lineTo(x,184);g.lineTo(x+16,202);g.stroke();}},true);
 const label=at(new T.Mesh(new T.PlaneGeometry(1.1,.55),new T.MeshStandardMaterial({map:ink,transparent:true,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2})),.5,BH*.55,BW/2+.0015);label.receiveShadow=true;box.add(label);
 const tapeMat=new T.MeshPhysicalMaterial({color:0xf1e6cf,transparent:true,opacity:.34,roughness:.12,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
 const tapeTop=new T.Mesh(new T.PlaneGeometry(1,.46),tapeMat);tapeTop.rotation.x=-Math.PI/2;tapeTop.position.y=BH+BT+.004;tapeTop.renderOrder=5;box.add(tapeTop);
 const tapeEnds=[1,-1].map(sx=>{const m=new T.Mesh(new T.PlaneGeometry(.46,1),tapeMat);m.rotation.y=sx*Math.PI/2;m.position.set(sx*(BL/2+.004),BH,0);m.renderOrder=5;box.add(m);return m;});
 const boxBlob=new T.Mesh(new T.PlaneGeometry(BL*1.5,BW*2.1),blob.material.clone());boxBlob.rotation.x=-Math.PI/2;boxBlob.position.y=.0025;box.add(boxBlob);
 const root=new T.Group();scene.remove(bundle);root.add(bundle,box);scene.add(root);

 // One flap of film: wrapped on the cylinder up to length L, the free part bends under its own weight and rests on the floor.
 const cy=new Float32Array(NW),cz=new Float32Array(NW),cny=new Float32Array(NW),cnz=new Float32Array(NW);
 function flap(d,R,L,n,step,full,t,at){let y=0,z=0,a=0;const lifting=Math.sin(Math.PI*clamp(L/full,0,1));
  for(let k=0;k<=n;k++){const s=k*step;
   if(s<=L){a=s/R;y=R-R*Math.cos(a);z=d*R*Math.sin(a);}
   else{a+=(-1.7*Math.cos(a)+.9*lifting*Math.sin(s*2.6-t*1.7)*Math.min(1,(s-L)*2))*step;y+=Math.sin(a)*step;z+=d*Math.cos(a)*step;
    if(y<0){y=0;a=0;}const ey=y-R,dist=Math.hypot(ey,z);if(dist<R){y=R+ey/dist*R;z=z/dist*R;}}
   const j=at(k);cy[j]=y;cz[j]=z;cny[j]=Math.cos(a);cnz[j]=-d*Math.sin(a);}}
 function shape(lf,lb,t){
  flap(1,RW,lf,nf,sf,LF,t,k=>nf-k);flap(-1,RB,lb,nb,sb,LB,t,k=>nf+k);
  const wrap=Math.min(lf/LF,lb/LB);
  for(let j=0;j<NW;j++)for(let i=0;i<NX;i++){const k=(j*NX+i)*3,x=-SX/2+i*SX/(NX-1),flare=.07*smooth(GL/2,SX/2,Math.abs(x))*wrap,wrinkle=.006*Math.sin(x*5.3+ws[j]*3.1)*Math.sin(ws[j]*1.7-x*2.2)-flare;
   P[k]=x;P[k+1]=cy[j]+cny[j]*wrinkle;P[k+2]=cz[j]+cnz[j]*wrinkle;N[k]=0;N[k+1]=cny[j];N[k+2]=cnz[j];}
  sheetGeo.attributes.position.needsUpdate=true;sheetGeo.attributes.normal.needsUpdate=true;}

 const steps=[...section.querySelectorAll('[data-bubble-step]')];
 // Timeline: glass settles, film wraps it, the bundle is lifted, the box slides under it, the bundle goes in, flaps close, tape seals.
 const LIFT=1.98,HALF=Math.PI*110/180,mix=(a,b,k)=>a+(b-a)*k;
 // The glass first stands upright beside the sheet, then tips over its base rim and lies down on the bubbles.
 const TIP_PIVOT=new T.Vector2(-GL/2,0),TIP_EDGE=new T.Vector2(-GL/2,-GR),tipV=new T.Vector2();glass.rotation.order='ZYX';
 function draw(p,t){
  const q=clamp(.14+(p-.24)*.86/.76,0,1),k=clamp((p-.13)/.12,0,1),fall=k<.8?(k/.8)**2:1,bounce=k>.8?.06*Math.sin((k-.8)/.2*Math.PI):0,ang=Math.PI/2*(1-fall)+bounce,upright=1-smooth(.12,.24,p);
  tipV.copy(TIP_EDGE).rotateAround(new T.Vector2(),ang);glass.position.set(TIP_PIVOT.x-tipV.x,TIP_PIVOT.y-tipV.y+(RW-GR)*(1-ang/(Math.PI/2)),0);glass.rotation.set(.9,0,ang);
  p=q;
  const lift=smooth(.46,.56,p),slide=smooth(.48,.64,p),lower=smooth(.62,.75,p),ends=smooth(.75,.84,p),sideA=smooth(.82,.91,p),sideB=smooth(.86,.95,p),tape=smooth(.94,.995,p),boxed=smooth(.44,.62,p);
  shape(LF*smooth(.14,.36,p),LB*smooth(.26,.46,p),t);
  bundle.position.y=LIFT*lift-(LIFT-BT)*lower;bundle.rotation.set(0,0,.06*lift*(1-lower)+.012*Math.sin(t*1.1)*lift*(1-lower));
  blob.material.opacity=1-lift;
  box.position.x=6*(1-slide);box.visible=slide>0;
  endFlaps.forEach(f=>{f.rotation.z=-f.userData.s*HALF*(1-ends);});
  sideFlaps.forEach((f,i)=>{f.rotation.x=f.userData.s*HALF*(1-(i?sideB:sideA));});
  const len=(BL+.02)*tape;tapeTop.visible=tape>0;tapeTop.scale.x=Math.max(len,.001);tapeTop.position.x=-BL/2-.01+len/2;
  tapeEnds.forEach((m,i)=>{const k=smooth(i?.94:.985,i?.97:1,p);m.visible=k>0;m.scale.y=Math.max(.32*k,.001);m.position.y=BH+BT-.16*k;});
  root.rotation.y=-.2+.24*p+.03*Math.sin(t*.35);
  // The camera rises a little once the box arrives, so the bundle can be seen going in.
  view.copy(viewLow).lerp(viewHigh,boxed).normalize();const aloft=lift*(1-lower);camera.position.copy(view).multiplyScalar(dist*(mix(1,1.24,boxed)+.16*aloft));camera.lookAt(-.55*upright,mix(.42,.95,boxed)+.5*aloft+.45*upright,0);
  scene.environmentRotation.y=t*.05;
  const step=p<.14?0:p<.46?1:p<.76?2:3;steps.forEach((el,i)=>el.classList.toggle('is-current',i===step));canvas.dataset.progress=p.toFixed(3);
  renderer.render(scene,camera);}
 const viewLow=new T.Vector3(.46,.5,.74).normalize(),viewHigh=new T.Vector3(.44,.7,.62).normalize(),view=new T.Vector3();let dist=8;
 function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;dist=Math.max(7.2,(camera.aspect<1?2.15:2.75)/(Math.tan(14*Math.PI/180)*camera.aspect));camera.updateProjectionMatrix();dirty=false;}
 // The section stays in the page flow: progress runs from the stage entering the viewport to its centre reaching 40% of it.
 // The stage waits until it is fully on screen, then stays pinned while the scroll drives the whole sequence.
 const track=section.querySelector('.bubble-track')||stage;
 function target(){if(reduced.matches)return .7;const stick=parseFloat(getComputedStyle(stage).top)||0,run=Math.max(1,track.offsetHeight-stage.offsetHeight);return clamp((stick-track.getBoundingClientRect().top)/run,0,1);}
 function tick(now){raf=0;if(!visible||document.hidden||dead)return;if(dirty)size();const goal=target(),dt=Math.min((now-last)/1000||1/60,.2);last=now;progress+=(goal-progress)*(1-Math.exp(-6*dt));if(Math.abs(goal-progress)<.0002)progress=goal;draw(progress,reduced.matches?0:now/1000);if(!reduced.matches||progress!==goal)raf=requestAnimationFrame(tick);}
 function wake(){if(visible&&!raf&&!dead)raf=requestAnimationFrame(tick);}
 const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){last=performance.now();wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'120px'});observer.observe(stage);
 const ro=new ResizeObserver(()=>{dirty=true;wake()});ro.observe(stage);window.addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{dirty=true;wake()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;cancelAnimationFrame(raf);section.classList.remove('bubble-ready');observer.disconnect();ro.disconnect();});
 section.classList.add('bubble-ready');size();progress=target();draw(progress,0);
 }catch(e){renderer?.dispose();section.classList.remove('bubble-ready');console.warn('Anteprima pluriball statica attiva.',e);}
}
