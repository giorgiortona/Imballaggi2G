/* Two photographic surfaces on a curved envelope, synchronized to native scroll. */
import * as THREE from './vendor/three.module.min.js';
const section=document.querySelector('.shoulder-story');
if(section){
 const stage=section.querySelector('.shoulder-visual'),canvas=section.querySelector('canvas');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const label=section.querySelector('[data-shoulder-label]');
 const chapters=[...section.querySelectorAll('.shoulder-chapter')];
 const labels=['Il profilo della spalla','Il volume, da ogni lato','46 cm · varianti di formato','La linea certificata PSV'];
 let renderer,raf=0,visible=false,target=0,current=0,last=0,resize=true,ready=false;
 const clamp=THREE.MathUtils.clamp;
 const smooth=(a,b,p)=>{let t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);
  camera.position.set(0,0,7.8);
  const model=new THREE.Group();scene.add(model);
  const loader=new THREE.TextureLoader();
  function envelope(map,back){
   map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   const geo=new THREE.PlaneGeometry(3.6,5.4,64,80),pos=geo.attributes.position;
   for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i);
    // The film bows around the hanger; the hook itself stays near the centre plane.
    const body=1-smooth(1.65,2.3,y);
    const dome=Math.pow(Math.max(0,1-(x/1.8)**2),.65);
    const ripple=Math.sin(x*10+y*3)*.018*body;
    pos.setZ(i,(.03+.23*dome*body+ripple)*(back?-1:1));
   }
   geo.computeVertexNormals();
   if(back){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}
   const mat=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.08,side:back?THREE.BackSide:THREE.FrontSide,depthWrite:true,toneMapped:false});
   const mesh=new THREE.Mesh(geo,mat);model.add(mesh);
  }
  Promise.all(['coprispalla-studio.webp','coprispalla-retro.webp'].map(file=>loader.loadAsync('assets/realistic/'+file))).then(maps=>{
   envelope(maps[0],false);envelope(maps[1],true);ready=true;configure();
  }).catch(()=>{renderer.dispose();});
  function measure(){
   const r=section.getBoundingClientRect();target=clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);
   let best=0,distance=Infinity;
   chapters.forEach((el,i)=>{const box=el.getBoundingClientRect();const d=Math.abs(box.top+box.height/2-innerHeight*.5);if(d<distance){distance=d;best=i;}});
   label.textContent=labels[best];
  }
  function paint(){
   if(resize){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();resize=false;}
   const turn=smooth(.13,.87,current);
   model.rotation.y=turn*Math.PI*2;
   model.rotation.z=THREE.MathUtils.degToRad(-18+36*Math.sin(current*Math.PI*2-.3));
   model.rotation.x=.11*Math.sin(current*Math.PI*2);
   const mobile=innerWidth<=700;
   const scale=(mobile?1.04:1.13)+.20*(1-Math.sin(current*Math.PI));
   model.scale.setScalar(scale);
   model.position.x=(mobile?-.08:-.22)+Math.sin(current*Math.PI*2)*.38;
   model.position.y=.1+Math.sin(current*Math.PI*2)*.42;
   model.position.z=.3+.55*Math.sin(current*Math.PI);
   renderer.render(scene,camera);
   stage.dataset.rotation=String(Math.round(turn*360));
  }
  function frame(now){
   raf=0;const dt=Math.min(.05,(now-last)/1000||.016);last=now;
   current+=(target-current)*(1-Math.exp(-10*dt));if(Math.abs(target-current)<.0001)current=target;
   paint();if(visible&&Math.abs(target-current)>.0001)raf=requestAnimationFrame(frame);
  }
  function wake(){
   if(!ready||reduced.matches||document.hidden||!visible)return;
   measure();if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}
  }
  function configure(){
   cancelAnimationFrame(raf);raf=0;section.classList.toggle('shoulder-ready',ready&&!reduced.matches);
   if(ready&&!reduced.matches){resize=true;measure();current=target;paint();wake();}
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'150px'}).observe(stage);
  new ResizeObserver(()=>{resize=true;wake();}).observe(stage);
  addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{resize=true;wake();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
  reduced.addEventListener('change',configure);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;ready=false;section.classList.remove('shoulder-ready');});
 }catch(error){section.classList.remove('shoulder-ready');renderer?.dispose();}
}
