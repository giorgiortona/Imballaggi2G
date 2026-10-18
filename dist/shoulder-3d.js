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
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,3));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(0,0,7.8);
  const model=new THREE.Group(),garment=new THREE.Group();scene.add(model);model.add(garment);
  const filmMeshes=[],clothMeshes=[],loader=new THREE.TextureLoader();
  const concealed={value:0};
  const vec=new THREE.Vector3();
  function prepare(map){map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();return map;}
  function surface(map,back,isFilm){
   const geo=new THREE.PlaneGeometry(isFilm?3.6:2.60,5.4,48,64),pos=geo.attributes.position;
   const bases=Float32Array.from(pos.array);
   if(back){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}
   const mat=new THREE.MeshBasicMaterial({map:prepare(map),transparent:true,alphaTest:.001,side:back?THREE.BackSide:THREE.FrontSide,depthWrite:false,toneMapped:false});
   // Preserve the lossless source. Cubic filtering avoids a visible texel grid in close-ups.
   mat.onBeforeCompile=shader=>{
    shader.uniforms.concealed=concealed;
    shader.uniforms.sourceSize={value:new THREE.Vector2(map.image.width,map.image.height)};
    shader.fragmentShader=`uniform float concealed;
     uniform vec2 sourceSize;
     vec4 cubicWeights(float t){
      float t2=t*t,t3=t2*t;
      return vec4(-.5*t+t2-.5*t3,1.-2.5*t2+1.5*t3,.5*t+2.*t2-1.5*t3,-.5*t2+.5*t3);
     }
     vec4 productSample(sampler2D tex,vec2 uv){
      vec2 footprint=fwidth(uv)*sourceSize;
      if(max(footprint.x,footprint.y)>1.)return texture2D(tex,uv);
      vec2 pixel=uv*sourceSize-.5,base=floor(pixel),f=fract(pixel);
      vec4 wx=cubicWeights(f.x),wy=cubicWeights(f.y),sum=vec4(0.);
      for(int y=0;y<4;y++)for(int x=0;x<4;x++){
       vec4 c=texture2D(tex,(base+vec2(float(x)-1.,float(y)-1.)+.5)/sourceSize);
       c.rgb*=c.a;sum+=c*wx[x]*wy[y];
      }
      sum=clamp(sum,0.,1.);sum.rgb/=max(sum.a,.0001);return sum;
     }
    `+shader.fragmentShader;
    let fragment=THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','productSample( map, vMapUv )');
    if(!isFilm)fragment+=`
float bodyMask=1.0-smoothstep(0.89,0.93,vMapUv.y);
     diffuseColor.a *= 1.0-0.97*concealed*bodyMask;`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',fragment);
   };
   mat.customProgramCacheKey=()=>isFilm?'product-cubic-film':'product-cubic-cloth';
   const mesh=new THREE.Mesh(geo,mat);mesh.userData={bases,back};
   (isFilm?model:garment).add(mesh);(isFilm?filmMeshes:clothMeshes).push(mesh);
  }
  Promise.all(['coprispalla-originale-lossless.png','giacca-fronte.webp','giacca-retro.webp'].map(file=>loader.loadAsync('assets/realistic/'+file))).then(maps=>{
   surface(maps[0],false,true);surface(maps[0],true,true);
   surface(maps[1],false,false);surface(maps[2],true,false);
   ready=true;configure();
  }).catch(()=>{renderer.dispose();});
  function measure(){const r=section.getBoundingClientRect();target=clamp(-r.top/Math.max(1,r.height-innerHeight),0,1);}
  function track(values){
   const beats=[0,.12,.36,.52,.70,.86,1];let i=0;
   while(i<beats.length-2&&current>beats[i+1])i++;
   return THREE.MathUtils.lerp(values[i],values[i+1],smooth(beats[i],beats[i+1],current));
  }
  function deform(insert){
   // The collar and shoulders follow the hanger; lower fabric lags slightly while lifted.
   const travel=smooth(.12,.35,current);
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
   const insert=smooth(.12,.35,current);
   const reveal=smooth(.12,.21,current)*(1-smooth(.36,.44,current));
   concealed.value=smooth(.82,1,insert)*(1-reveal);deform(insert);
   filmMeshes.forEach(mesh=>{mesh.material.opacity=1-(stageW<=700?.32:.58)*reveal;});
   // A composed sequence: settle for insertion, tilt towards the viewer, then pull back.
   const turn=track([-.025,0,0,.035,-.06,.025,-.025]);
   model.rotation.set(track([.06,0,0,.09,-.04,.03,.06]),turn*Math.PI*2,
    THREE.MathUtils.degToRad(track([-19,-10,-10,3,-24,-6,-19])));
   const viewHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
   const narrow=stageW<=700;
   model.position.set(-viewHeight*camera.aspect*.215+track([-1.4,-1.5,-1.5,-1.75,-1.1,-1.55,-1.4]),
    track([-1.75,-1.1,-1.1,-1.50,-.65,-1.2,-1.75]),0);
   if(narrow)model.position.x=track([-1.25,-1.0,-1.0,-1.4,-.85,-1.1,-1.25]);
   const tiltedHeight=5.4*Math.abs(Math.cos(model.rotation.z))+3.6*Math.abs(Math.sin(model.rotation.z));
   const fill=track([2.60,2.22,2.22,2.48,2.04,2.38,2.60]);
   model.scale.setScalar(viewHeight*fill/tiltedHeight);
   const front=Math.cos(turn*Math.PI*2)>=0;
   filmMeshes.forEach(mesh=>{mesh.renderOrder=(mesh.userData.back===!front)?3:0;});
   clothMeshes.forEach(mesh=>{mesh.renderOrder=1;});
   renderer.render(scene,camera);annotate(turn);
   stage.dataset.reveal=reveal.toFixed(3);stage.dataset.progress=current.toFixed(3);
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
