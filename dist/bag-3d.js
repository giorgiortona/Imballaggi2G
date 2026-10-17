import * as T from './vendor/three.module.min.js';
const section=document.querySelector('[data-bag-scene]');
if(section){
 const canvas=section.querySelector('canvas'),stage=canvas.parentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=T.MathUtils.clamp,smooth=(a,b,p)=>{let t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t)};
 let renderer,active=false,raf=0,progress=0,last=0,dirty=true,dead=false;
 try{
 renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,60),world=new T.Group();scene.add(world);
 const studio=document.createElement('canvas');studio.width=1024;studio.height=512;const ctx=studio.getContext('2d');ctx.fillStyle='#65736e';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#ffffff';ctx.fillRect(50,30,180,390);ctx.fillRect(550,50,65,350);ctx.fillStyle='#cdded5';ctx.fillRect(800,0,170,300);
 const envtex=new T.CanvasTexture(studio);envtex.mapping=T.EquirectangularReflectionMapping;envtex.colorSpace=T.SRGBColorSpace;const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(envtex).texture;pm.dispose();
 scene.add(new T.HemisphereLight(0xffffff,0x485a50,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-4,5,7);scene.add(light);
 const glasses=new T.Group();world.add(glasses);
 const glassesMap=new T.TextureLoader().load('assets/realistic/sunglasses.webp',()=>wake());glassesMap.colorSpace=T.SRGBColorSpace;glassesMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const glassesPhoto=new T.Mesh(new T.PlaneGeometry(3.5,1.295),new T.MeshBasicMaterial({map:glassesMap,transparent:true,alphaTest:.01,depthWrite:false,toneMapped:false}));glassesPhoto.renderOrder=2;glasses.add(glassesPhoto);
 const bag=new T.Group();world.add(bag);
 const film=new T.MeshPhysicalMaterial({color:0xc9e4da,transparent:true,opacity:.14,roughness:.16,metalness:.12,clearcoat:1,side:T.DoubleSide,depthWrite:false});
 const frontGeo=new T.PlaneGeometry(4.1,2.5,40,28),front=new T.Mesh(frontGeo,film);front.position.y=-.73;front.renderOrder=3;bag.add(front);
 const back=new T.Mesh(new T.PlaneGeometry(4.1,2.5,1,1),film.clone());back.position.set(0,-.73,-.51);back.material.opacity=.025;bag.add(back);
 const pouchMap=new T.TextureLoader().load('assets/realistic/bubble-pouch.webp',()=>wake());pouchMap.colorSpace=T.SRGBColorSpace;pouchMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const pouchMaterial=new T.MeshBasicMaterial({map:pouchMap,transparent:true,opacity:.88,side:T.DoubleSide,depthWrite:false,toneMapped:false});
 pouchMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a *= 0.14 + 0.86 * smoothstep(0.22,0.85,max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)));\n#include <opaque_fragment>');};
 front.material=pouchMaterial;
 const rimMat=new T.LineBasicMaterial({color:0x557e6d,transparent:true,opacity:.08});
 function line(points,material=rimMat){const l=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),material);bag.add(l);return l;}
 line([[-2.05,.52,.12],[-2.05,-1.98,.12],[2.05,-1.98,.12],[2.05,.52,.12]]);
 for(let n=0;n<3;n++)line([[-2.01+n*.026,.52,.16],[-2.01+n*.026,-1.92+n*.025,.16],[2.01-n*.026,-1.92+n*.025,.16],[2.01-n*.026,.52,.16]],new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.10}));
 const mouth=line([[-2.05,.52,.2],[0,.52,.35],[2.05,.52,.2]]);
 const flap=new T.Group();flap.position.set(0,.52,-.5);bag.add(flap);const flapFilm=new T.Mesh(new T.PlaneGeometry(4.1,.95,24,4),film.clone());flapFilm.position.y=.275;flap.add(flapFilm);
 const flapMap=new T.TextureLoader().load('assets/realistic/stretch-film.webp',()=>wake());flapMap.colorSpace=T.SRGBColorSpace;flapFilm.material=new T.MeshBasicMaterial({map:flapMap,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const strip=new T.Mesh(new T.PlaneGeometry(3.95,.035),new T.MeshStandardMaterial({color:0x2b8f6c,roughness:.35,side:T.DoubleSide}));strip.position.set(0,.62,.01);flap.add(strip);
 // Contact shadows are procedural and remain soft as the object settles.
 const sh=document.createElement('canvas');sh.width=256;sh.height=256;const sc=sh.getContext('2d'),grad=sc.createRadialGradient(128,128,0,128,128,128);grad.addColorStop(0,'rgba(19,38,29,.24)');grad.addColorStop(1,'rgba(19,38,29,0)');sc.fillStyle=grad;sc.fillRect(0,0,256,256);
 const shadow=new T.Mesh(new T.PlaneGeometry(5.9,1.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(sh),transparent:true,depthWrite:false}));shadow.position.set(0,-2.1,-.8);world.add(shadow);
 function bulge(x,y,enter){return .18+enter*.22*Math.exp(-((x/1.5)**4)-((y+.55)/.7)**4)+.035*Math.sin(x*11+y*7)*(1-enter*.6)+.018*Math.sin(x*23-y*9+enter*4);}
 function draw(p){const enter=smooth(.08,.7,p),close=smooth(.74,.96,p);glasses.position.set(.16*(1-enter),2.22-enter*2.95,-.1);glasses.rotation.set(-.13*(1-enter),.08*(1-enter),-.13*(1-enter));
 world.position.y=.55*enter;world.rotation.y=-.12+.18*smooth(.65,1,p);world.rotation.x=.055;
 const a=frontGeo.attributes.position;for(let j=0;j<=28;j++)for(let i=0;i<=40;i++){const x=(i/40-.5)*4.1,y=(.5-j/28)*2.5;a.setXYZ(j*41+i,x,y,bulge(x,y-.73,enter));}a.needsUpdate=true;frontGeo.computeVertexNormals();
 // The flap first arcs over the opening, then lies against the front face.
 flap.rotation.x=close*Math.PI;flap.position.z=-.5+close*.77;
 mouth.geometry.attributes.position.setZ(1,.35-close*.08);mouth.geometry.attributes.position.needsUpdate=true;
 canvas.dataset.progress=p.toFixed(3);const step=p<.15?0:p<.74?1:2;section.querySelectorAll('[data-bag-step]').forEach((el,i)=>el.classList.toggle('is-current',i===step));renderer.render(scene,camera);}
 function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const d=Math.max(10.7,2.65/(Math.tan(16*Math.PI/180)*camera.aspect));camera.position.set(.3,.3,d);camera.lookAt(0,.3,0);camera.updateProjectionMatrix();dirty=false;}
 function tick(t){raf=0;if(!active||document.hidden||dead)return;if(dirty)size();const rect=section.getBoundingClientRect(),travel=Math.max(1,section.offsetHeight-section.querySelector('.bag-pin').offsetHeight),target=reduced.matches?1:clamp(-rect.top/travel,0,1);const dt=Math.min((t-last)/1000||1/60,.05);last=t;progress+= (target-progress)*(1-Math.exp(-12*dt));if(Math.abs(target-progress)<.0002)progress=target;draw(progress);if(progress!==target)raf=requestAnimationFrame(tick);}
 function wake(){if(active&&!raf&&!dead)raf=requestAnimationFrame(tick);}
 const observer=new IntersectionObserver(es=>{active=es[0].isIntersecting;if(active){last=performance.now();wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'150px'});observer.observe(section);const ro=new ResizeObserver(()=>{dirty=true;wake()});ro.observe(stage);window.addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{dirty=true;wake()});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;cancelAnimationFrame(raf);section.classList.remove('bag-ready');observer.disconnect();ro.disconnect();});section.classList.add('bag-ready');size();draw(reduced.matches?1:0);
 }catch(e){renderer?.dispose();section.classList.remove('bag-ready');console.warn('Anteprima busta statica attiva.',e);}
}
