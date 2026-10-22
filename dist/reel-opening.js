/* Opening curtain: the roll turns about its own axis and releases a sheet. */
import * as T from './vendor/three.module.min.js';
const root=document.querySelector('[data-reel-opening]');
if(root&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 const canvas=root.querySelector('canvas'),art=root.querySelector('.reel-opening-art'),content=root.querySelector('.reel-opening-content'),logo=root.querySelector('.reel-opening-logo');
 let renderer,raf=0,visible=false,p=0,last=0,resize=true,ready=false;
 const smooth=(a,b,v)=>{const t=T.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 try{
  renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,50);camera.position.set(0,0,10);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight(0xffffff,0x777d76,2));const light=new T.DirectionalLight(0xffffff,2);light.position.set(-2,4,6);scene.add(light);
  const roll=new T.Group(),spin=new T.Group();scene.add(roll);roll.add(spin);
  const loader=new T.TextureLoader();
  loader.load('assets/realistic/roll-reference-v54.png',photo=>{
   // Unwrap the photographed film surface across the cylindrical wall.
   const c=document.createElement('canvas');c.width=1024;c.height=1024;const g=c.getContext('2d'),im=photo.image;
   g.drawImage(im,im.width*.29,im.height*.16,im.width*.42,im.height*.68,0,0,1024,1024);
   const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.MirroredRepeatWrapping;map.repeat.x=2;map.anisotropy=renderer.capabilities.getMaxAnisotropy();
   const body=new T.Mesh(new T.CylinderGeometry(.48,.48,5.2,128,1,true),new T.MeshBasicMaterial({map}));body.rotation.z=Math.PI/2;spin.add(body);
   const paper=new T.MeshStandardMaterial({color:0x967954,roughness:1,side:T.DoubleSide});
   const tube=new T.Mesh(new T.CylinderGeometry(.19,.19,5.35,64,1,true),paper);tube.rotation.z=Math.PI/2;spin.add(tube);
   for(const side of [-1,1]){
    const face=new T.Mesh(new T.RingGeometry(.20,.48,100),new T.MeshStandardMaterial({color:0xe1e3d5,roughness:.5,side:T.DoubleSide}));face.rotation.y=Math.PI/2;face.position.x=side*2.6;spin.add(face);
    const lip=new T.Mesh(new T.RingGeometry(.19,.215,64),paper);lip.rotation.y=Math.PI/2;lip.position.x=side*2.675;spin.add(lip);
    for(let i=0;i<36;i++){const points=[],r=.216+i*.007;for(let n=0;n<=80;n++){const a=n/80*Math.PI*2;points.push(new T.Vector3(side*2.603,Math.cos(a)*r,Math.sin(a)*r));}spin.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xadb3a3,transparent:true,opacity:.28})));}
   }
   ready=true;root.classList.add('opening-ready');resize=true;wake();
  },undefined,()=>{root.classList.remove('opening-ready');});
  const geo=new T.PlaneGeometry(1,1,70,45),film=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0xf0f0e8,transparent:true,opacity:.68,roughness:.3,metalness:.07,side:T.DoubleSide,depthWrite:false,clearcoat:1}));scene.add(film);
  const edgeGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(new Float32Array(71*3),3));const edge=new T.Line(edgeGeo,new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.8}));scene.add(edge);
  function draw(){
   // Travel and angular displacement share the same distance: no slipping.
   const travel=smooth(.02,.70,p),exit=smooth(.80,.98,p);
   const viewH=2*Math.tan(T.MathUtils.degToRad(16))*10,viewW=viewH*camera.aspect;
   const scale=viewH*1.13/5.2,radius=.48*scale;
   const start=-viewW/2-radius*1.4,end=viewW/2+radius*1.4;
   const x=T.MathUtils.lerp(start,end,travel),left=-viewW*.56;
   roll.scale.setScalar(scale);roll.position.set(x,0,0);
   roll.rotation.set(0,0,Math.PI/2);spin.rotation.x=(x-start)/radius;
   const positions=geo.attributes.position;
   for(let j=0;j<=45;j++)for(let i=0;i<=70;i++){
    const u=i/70,v=j/45;
    const px=T.MathUtils.lerp(left,x,u),py=(.5-v)*viewH*1.15;
    const tension=Math.sin(u*Math.PI);
    const z=-.13+tension*(Math.sin(v*35+u*9-travel*3)*.022+Math.sin(v*83-u*13)*.009);
    positions.setXYZ(j*71+i,px,py,z);
    if(j===45)edgeGeo.attributes.position.setXYZ(i,px,py,z);
   }
   positions.needsUpdate=true;geo.computeVertexNormals();edgeGeo.attributes.position.needsUpdate=true;
   film.visible=edge.visible=travel>.001&&x>left;film.material.opacity=.24;
   art.style.opacity=String(1-exit);art.style.transform='none';
   const reveal=T.MathUtils.clamp((x/viewW+.5)*100,0,100);
   logo.style.clipPath=`inset(0 ${100-reveal}% 0 0)`;
   logo.style.opacity=String((1-exit)*smooth(.03,.15,p));
   logo.style.transform=`scale(${1+smooth(.35,.78,p)*.035})`;
   const show=smooth(.83,1,p);
   content.style.opacity=String(show);content.style.transform=`translate3d(0,${(1-show)*35}px,0)`;
   content.style.pointerEvents=show>.8?'auto':'none';
   root.dataset.progress=p.toFixed(3);
   document.body.classList.toggle('reel-intro-visible',p<.9&&visible);
   renderer.render(scene,camera);
  }
  function frame(now){raf=0;if(!visible||document.hidden||!ready)return;
   if(resize){const w=art.clientWidth,h=art.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();resize=false;}
   const r=root.getBoundingClientRect(),target=T.MathUtils.clamp(-r.top/Math.max(1,root.offsetHeight-root.querySelector('.reel-opening-pin').offsetHeight),0,1),dt=Math.min(.05,(now-last)/1000||.016);last=now;p+=(target-p)*(1-Math.exp(-10*dt));if(Math.abs(p-target)<.0001)p=target;draw();if(p!==target)raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(frame);}}
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(!visible)document.body.classList.remove('reel-intro-visible');if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(root);
  new ResizeObserver(()=>{resize=true;wake();}).observe(art);addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',wake);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);ready=false;root.classList.remove('opening-ready');document.body.classList.remove('reel-intro-visible');content.removeAttribute('style');});
 }catch(e){renderer?.dispose();ready=false;root.classList.remove('opening-ready');document.body.classList.remove('reel-intro-visible');content.removeAttribute('style');}
}
