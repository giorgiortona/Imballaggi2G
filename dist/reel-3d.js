/* A dimensional roll lays a continuous tensioned ribbon around the brand. */
import * as T from './vendor/three.module.min.js';
const section=document.querySelector('[data-reel-3d]');
if(section){
 const stage=section.querySelector('.reel3d-stage'),canvas=stage.querySelector('canvas'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=T.MathUtils.clamp,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 let renderer,raf=0,visible=false,current=0,target=0,last=0,dirty=true,dead=false;
 try{
  renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,60),world=new T.Group();scene.add(world);
  function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
  const studio=texture(1024,512,(g,w,h)=>{g.fillStyle='#39423e';g.fillRect(0,0,w,h);for(const [x,y,a,b] of [[60,30,110,420],[440,0,230,190],[800,80,45,350]]){const v=g.createLinearGradient(x,0,x+a,0);v.addColorStop(0,'#53645c');v.addColorStop(.25,'#ffffff');v.addColorStop(.8,'#ffffff');v.addColorStop(1,'#53645c');g.fillStyle=v;g.fillRect(x,y,a,b);}});
  studio.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer),env=pm.fromEquirectangular(studio);scene.environment=env.texture;pm.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0x6a736c,.9));
  const key=new T.DirectionalLight(0xfffaf0,2.2);key.position.set(-3,5,5);scene.add(key);
  const rim=new T.DirectionalLight(0xd7eee3,2.4);rim.position.set(4,2,-4);scene.add(rim);
  // Fine, deterministic manufacturing texture; no photographic billboard.
  let seed=23;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const grain=texture(512,512,(g,w,h)=>{g.fillStyle='#b49a75';g.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const v=Math.floor(110+random()*85);g.fillStyle=`rgba(${v+30},${v+10},${v-20},.22)`;g.fillRect(random()*w,random()*h,1+random()*3,1);}g.strokeStyle='#8c7454';g.lineWidth=2;g.beginPath();g.moveTo(0,h);g.lineTo(w,0);g.stroke();});
  grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(2,1);
  const striae=texture(1024,512,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.strokeStyle=`rgba(255,255,255,${random()*.18})`;g.beginPath();const y=random()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+random()*2,w*.7,y-2,w,y);g.stroke();}});
  const roll=new T.Group();world.add(roll);
  const bodyMat=new T.MeshPhysicalMaterial({color:0xb5bfb1,metalness:.48,roughness:.17,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:2.2,bumpMap:striae,bumpScale:.018});
  const body=new T.Mesh(new T.CylinderGeometry(.48,.48,1.76,128,1,true),bodyMat);roll.add(body);
  const layerMat=new T.LineBasicMaterial({color:0xf2f3e5,transparent:true,opacity:.25});
  for(let i=0;i<44;i++){
   const radius=.214+i*.006,points=[];
   for(let j=0;j<=128;j++){const a=j/128*Math.PI*2;points.push(new T.Vector3(Math.cos(a)*radius,.883,Math.sin(a)*radius));}
   roll.add(new T.Line(new T.BufferGeometry().setFromPoints(points),layerMat));
  }
  const outer=new T.Mesh(new T.CylinderGeometry(.482,.482,1.762,128,1,true),new T.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.16,roughness:.08,metalness:.25,clearcoat:1,depthWrite:false,envMapIntensity:2}));roll.add(outer);
  const kraft=new T.MeshStandardMaterial({map:grain,roughness:.87,side:T.DoubleSide});
  roll.add(new T.Mesh(new T.CylinderGeometry(.19,.19,1.88,80,1,true),kraft));
  const rings=texture(1024,1024,(g,w,h)=>{g.fillStyle='#dce0d3';g.fillRect(0,0,w,h);for(let r=200;r<515;r+=1.1){g.strokeStyle=`rgba(80,98,83,${.05+random()*.13})`;g.lineWidth=.6;g.beginPath();g.arc(w/2,h/2,r,0,Math.PI*2);g.stroke();}});
  for(const sign of [-1,1]){
   const face=new T.Mesh(new T.RingGeometry(.205,.48,128),new T.MeshStandardMaterial({map:rings,color:0xc8cebd,roughness:.4,side:T.DoubleSide}));face.rotation.x=sign*Math.PI/2;face.position.y=sign*.88;roll.add(face);
   const lip=new T.Mesh(new T.RingGeometry(.19,.212,96),kraft);lip.rotation.x=sign*Math.PI/2;lip.position.y=sign*.94;roll.add(lip);
  }
  // The mark is printed on a solid object, giving the film real edges to turn around.
  const brand=new T.Group();world.add(brand);
  const block=new T.Mesh(new T.BoxGeometry(2.9,1.15,.86),new T.MeshPhysicalMaterial({color:0xf4f2e9,roughness:.38,clearcoat:.3}));brand.add(block);
  const logoMap=new T.TextureLoader().load('assets/logo-ink.webp',wake);logoMap.colorSpace=T.SRGBColorSpace;logoMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const logo=new T.Mesh(new T.PlaneGeometry(2.45,.70),new T.MeshBasicMaterial({map:logoMap,transparent:true,toneMapped:false}));logo.position.z=.436;brand.add(logo);
  // Rounded rectangular winding route. Positive z is the face of the package.
  const path=new T.CurvePath(),v=(x,z)=>new T.Vector3(x,0,z);
  function line(a,b,c,d){path.add(new T.LineCurve3(v(a,b),v(c,d)));}
  function bend(a,b,c,d,e,f){path.add(new T.QuadraticBezierCurve3(v(a,b),v(c,d),v(e,f)));}
  line(1.45,.49,-1.45,.49);bend(-1.45,.49,-1.58,.49,-1.58,.36);line(-1.58,.36,-1.58,-.36);bend(-1.58,-.36,-1.58,-.49,-1.45,-.49);line(-1.45,-.49,1.45,-.49);bend(1.45,-.49,1.58,-.49,1.58,-.36);line(1.58,-.36,1.58,.36);bend(1.58,.36,1.58,.49,1.45,.49);
  const filmMat=new T.MeshPhysicalMaterial({color:0xf0fff8,metalness:.08,roughness:.13,transparent:true,opacity:.14,clearcoat:1,clearcoatRoughness:.06,side:T.DoubleSide,depthWrite:false,envMapIntensity:2.1,bumpMap:striae,bumpScale:.025});
  const geometry=new T.PlaneGeometry(1,1,180,12),film=new T.Mesh(geometry,filmMat);world.add(film);
  const edgeMat=new T.LineBasicMaterial({color:0xe4fff1,transparent:true,opacity:.6});
  const edges=[0,1].map(()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(181*3),3));const m=new T.Line(g,edgeMat);world.add(m);return m;});
  const feedGeo=new T.PlaneGeometry(1,1,20,12),feed=new T.Mesh(feedGeo,filmMat);world.add(feed);
  const shadowMap=texture(128,128,(g,w,h)=>{const a=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);a.addColorStop(0,'rgba(0,0,0,.4)');a.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=a;g.fillRect(0,0,w,h);});
  const shadow=new T.Mesh(new T.PlaneGeometry(7,4),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.04;world.add(shadow);
  function route(t){return path.getPointAt(clamp(t,0,1));}
  function normal(t){const tangent=path.getTangentAt(clamp(t,0,1));return new T.Vector3(tangent.z,0,-tangent.x).normalize();}
  function update(p){
   const reveal=smooth(.04,.28,p),wind=smooth(.24,.88,p),finish=smooth(.88,1,p),q=route(wind),n=normal(wind);
   roll.position.copy(q).addScaledVector(n,.49);roll.rotation.y=-wind*path.getLength()/.48;
   roll.position.x+=finish*.55;roll.rotation.z=-.035*(1-reveal);
   brand.scale.setScalar(.85+.15*reveal);brand.position.y=-.25*(1-reveal);brand.visible=reveal>.001;
   const pos=geometry.attributes.position;
   for(let j=0;j<=12;j++)for(let i=0;i<=180;i++){
    const u=i/180,t=u*wind,a=route(t),out=normal(t),y=(.5-j/12)*1.52;
    const wrinkle=(Math.sin(t*115+y*8)*.003+Math.sin(t*41-y*11)*.004)*Math.pow(Math.abs(y)/.76,3);
    a.addScaledVector(out,wrinkle);pos.setXYZ(j*181+i,a.x,y,a.z);
    if(j===0||j===12)edges[j===0?0:1].geometry.attributes.position.setXYZ(i,a.x,y,a.z);
   }
   pos.needsUpdate=true;geometry.computeVertexNormals();edges.forEach(e=>{e.geometry.attributes.position.needsUpdate=true;e.visible=wind>.002;});film.visible=wind>.002;
   // Short, tensioned span remains attached to the outside of the rotating roll.
   const end=q.clone().addScaledVector(n,.05),feedPos=feedGeo.attributes.position;
   for(let j=0;j<=12;j++)for(let i=0;i<=20;i++){const u=i/20,a=q.clone().lerp(end,u);a.y=(.5-j/12)*1.52;feedPos.setXYZ(j*21+i,a.x,a.y,a.z);}
   feedPos.needsUpdate=true;feedGeo.computeVertexNormals();feed.visible=wind>.002&&wind<.999;
   const mobile=innerWidth<=700,wide=mobile?10:5.7,dist=T.MathUtils.lerp(mobile?6.2:5.0,wide,reveal);
   camera.position.set(1.8,2.35,dist);camera.lookAt(T.MathUtils.lerp(roll.position.x,0,reveal),0,roll.position.z*(1-reveal));
   world.rotation.y=-.08+finish*.22;
   const step=p<.24?0:p<.88?1:2;section.querySelectorAll('[data-reel-step]').forEach((el,i)=>el.classList.toggle('is-current',i===step));canvas.dataset.progress=p.toFixed(3);
  }
  function frame(now){raf=0;if(!visible||dead||document.hidden)return;if(dirty){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=false;}
   const r=section.getBoundingClientRect(),pin=section.querySelector('.reel3d-pin');target=reduced.matches?1:clamp(-r.top/Math.max(1,section.offsetHeight-pin.offsetHeight),0,1);
   const dt=Math.min(.05,(now-last)/1000||1/60);last=now;current+=(target-current)*(1-Math.exp(-9*dt));if(Math.abs(target-current)<.0001)current=target;
   update(current);renderer.render(scene,camera);if(current!==target)raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&visible&&!dead&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(section);
  new ResizeObserver(()=>{dirty=true;wake();}).observe(stage);
  addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{dirty=true;wake();},{passive:true});reduced.addEventListener('change',wake);document.addEventListener('visibilitychange',wake);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;cancelAnimationFrame(raf);section.classList.remove('reel3d-ready');});
  section.classList.add('reel3d-ready');
 }catch(error){renderer?.dispose();section.classList.remove('reel3d-ready');console.warn('Visualizzazione alternativa della bobina.',error);}
}
