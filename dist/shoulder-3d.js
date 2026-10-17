/* Scroll choreography: jacket on its hanger enters the sleeve from its open hem. */
import * as THREE from './vendor/three.module.min.js';
const section=document.querySelector('.shoulder-story');
if(section){
 const stage=section.querySelector('.shoulder-visual'),canvas=section.querySelector('canvas');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const label=section.querySelector('[data-shoulder-label]');
 const annotation=section.querySelector('.shoulder-annotation'),note=annotation.querySelector('.shoulder-note');
 const dot=annotation.querySelector('circle'),leader=annotation.querySelector('line');
 const points=[
  {at:[.92,1.35,.3],title:'La forma della spalla',text:'Il taglio sagomato segue il profilo del supporto.'},
  {at:[.75,-1.45,.3],title:'Dal fondo aperto',text:'La giacca sale sulla gruccia, all’interno del film.'},
  {at:[0,2.06,.3],title:'Il passaggio del gancio',text:'L’apertura superiore lascia libera la gruccia.'},
  {at:[-.8,.1,.3],title:'Un velo protettivo',text:'Il film si dispone intorno al capo e ne segue il volume.'},
  {at:[.8,-.9,.3],title:'46 cm di larghezza',text:'Lunghezze e finiture si scelgono nella scheda tecnica.'}
 ];
 let renderer,raf=0,visible=false,target=0,current=0,last=0,resize=true,ready=false,active=-1;
 let stageW=1,stageH=1;
 const clamp=THREE.MathUtils.clamp,smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(0,0,7.8);
  const model=new THREE.Group(),garment=new THREE.Group();scene.add(model);model.add(garment);
  const filmMeshes=[],clothMeshes=[],loader=new THREE.TextureLoader();
  const vec=new THREE.Vector3();
  function prepare(map){map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return map;}
  function surface(map,back,isFilm){
   const geo=new THREE.PlaneGeometry(isFilm?3.6:2.78,5.4,48,64),pos=geo.attributes.position;
   const bases=Float32Array.from(pos.array);
   if(back){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}
   const mat=new THREE.MeshBasicMaterial({map:prepare(map),transparent:true,alphaTest:.025,side:back?THREE.BackSide:THREE.FrontSide,depthWrite:false,toneMapped:false});
   if(isFilm){
    // Keep bright folds and seams, but let the real cloth texture show through the film.
    mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     float crease=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
     diffuseColor.a *= mix(0.18,0.55,smoothstep(0.62,1.0,crease));`);};
   }
   const mesh=new THREE.Mesh(geo,mat);mesh.userData={bases,back};
   (isFilm?model:garment).add(mesh);(isFilm?filmMeshes:clothMeshes).push(mesh);
  }
  Promise.all(['coprispalla-vuoto.webp','giacca-fronte.webp','giacca-retro.webp'].map(file=>loader.loadAsync('assets/realistic/'+file))).then(maps=>{
   surface(maps[0],false,true);surface(maps[0],true,true);
   surface(maps[1],false,false);surface(maps[2],true,false);
   ready=true;configure();
  }).catch(()=>{renderer.dispose();});
  function measure(){const r=section.getBoundingClientRect();target=clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);}
  function track(values){
   const beats=[0,.12,.38,.50,.67,.84,1];let i=0;while(i<beats.length-2&&current>beats[i+1])i++;
   const t=clamp((current-beats[i])/(beats[i+1]-beats[i]),0,1),e=.08*t+.92*t*t*(3-2*t);
   return THREE.MathUtils.lerp(values[i],values[i+1],e);
  }
  function deform(insert){
   // The collar and shoulders follow the hanger; lower fabric lags slightly while lifted.
   const travel=smooth(.12,.40,current);
   const sway=Math.sin(travel*Math.PI*2)*Math.sin(travel*Math.PI)*.055;
   garment.position.y=-5.55*(1-insert);garment.rotation.z=0;
   for(const mesh of clothMeshes){
    const pos=mesh.geometry.attributes.position,b=mesh.userData.bases,sign=mesh.userData.back?-1:1;
    for(let i=0;i<pos.count;i++){
     const x=b[i*3],y=b[i*3+1],lower=1-smooth(-2,1.7,y);
     pos.setXYZ(i,x+sway*lower,y,sign*(.025+.055*Math.max(0,1-(x/1.39)**2)));
    }pos.needsUpdate=true;
   }
   const contact=smooth(.55,1,insert);
   for(const mesh of filmMeshes){
    const pos=mesh.geometry.attributes.position,b=mesh.userData.bases,sign=mesh.userData.back?-1:1;
    for(let i=0;i<pos.count;i++){
     const x=b[i*3],y=b[i*3+1],body=1-smooth(1.65,2.3,y),dome=Math.pow(Math.max(0,1-(x/1.8)**2),.65);
     const wave=Math.sin(y*4+x*7-travel*4)*.018*Math.sin(travel*Math.PI)*body;
     pos.setXYZ(i,x+wave,y,sign*(.13+(.10+.10*contact)*dome*body));
    }pos.needsUpdate=true;
   }
  }
  function annotate(turn){
   const index=current<.12?0:current<.34?1:current<.51?2:current<.8?3:4;
   if(index!==active){active=index;note.querySelector('strong').textContent=points[index].title;note.querySelector('p').textContent=points[index].text;label.textContent=points[index].title;}
   const back=Math.cos(turn*Math.PI*2)<0;
   const p=points[index].at;vec.set(p[0],p[1],back?-p[2]:p[2]);model.localToWorld(vec);vec.project(camera);
   const x=(vec.x*.5+.5)*stageW,y=(-vec.y*.5+.5)*stageH;
   annotation.hidden=x<12||x>stageW-12||y<75||y>stageH-35||Math.abs(Math.cos(turn*Math.PI*2))<.18;
   if(annotation.hidden)return;
   const mobile=stageW<500,w=mobile?170:220;
   const nx=clamp(x+(x<stageW*.5?40:-w-40),18,stageW-w-18),ny=clamp(y-65,90,stageH-155);
   note.style.transform=`translate(${nx}px,${ny}px)`;
   dot.setAttribute('cx',x);dot.setAttribute('cy',y);
   leader.setAttribute('x1',x);leader.setAttribute('y1',y);leader.setAttribute('x2',nx+(x<nx?0:w));leader.setAttribute('y2',ny+35);
  }
  function paint(){
   if(resize){stageW=stage.clientWidth;stageH=stage.clientHeight;renderer.setSize(stageW,stageH,false);camera.aspect=stageW/stageH;camera.updateProjectionMatrix();resize=false;}
   const insert=smooth(.12,.40,current);deform(insert);
   const turn=track([0,0,0,.07,.48,.93,1]);
   model.rotation.y=turn*Math.PI*2;
   model.rotation.z=THREE.MathUtils.degToRad(track([-11,0,0,7,-18,15,-10]));
   model.rotation.x=track([.02,0,0,.03,-.05,.04,0]);
   model.position.set(track([-.05,0,0,.04,-.1,.12,0]),track([-.10,.1,.1,-.15,-.1,.05,-.12]),track([.22,0,0,.25,.35,.28,.22]));
   const viewHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*(camera.position.z-model.position.z);
   const tiltedHeight=5.4*Math.abs(Math.cos(model.rotation.z))+3.6*Math.abs(Math.sin(model.rotation.z));
   // Wider hero framing returns after the insertion, when the garment is seated.
   const fill=track([1.28,.96,.96,1.20,1.34,1.24,1.27]);model.scale.setScalar(viewHeight*fill/tiltedHeight);
   const front=Math.cos(turn*Math.PI*2)>=0;
   filmMeshes.forEach(mesh=>{mesh.renderOrder=(mesh.userData.back===!front)?3:0;});
   clothMeshes.forEach(mesh=>{mesh.renderOrder=1;});
   renderer.render(scene,camera);annotate(turn);
   stage.dataset.rotation=String(Math.round(turn*360));stage.dataset.insertion=insert.toFixed(3);
  }
  function frame(now){raf=0;const dt=Math.min(.05,(now-last)/1000||.016);last=now;current+=(target-current)*(1-Math.exp(-10*dt));if(Math.abs(target-current)<.0001)current=target;paint();if(visible&&Math.abs(target-current)>.0001)raf=requestAnimationFrame(frame);}
  function wake(){if(!ready||reduced.matches||document.hidden||!visible)return;measure();if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  function configure(){cancelAnimationFrame(raf);raf=0;section.classList.toggle('shoulder-ready',ready&&!reduced.matches);annotation.hidden=true;if(ready&&!reduced.matches){resize=true;measure();current=target;paint();wake();}}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'150px'}).observe(stage);
  new ResizeObserver(()=>{resize=true;wake();}).observe(stage);
  addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{resize=true;wake();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});reduced.addEventListener('change',configure);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;ready=false;annotation.hidden=true;section.classList.remove('shoulder-ready');});
 }catch(error){section.classList.remove('shoulder-ready');annotation.hidden=true;renderer?.dispose();}
}
