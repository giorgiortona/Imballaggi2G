/* Scroll choreography: jacket on its hanger enters the sleeve from its open hem. */
import * as THREE from './vendor/three.module.min.js';
const section=document.querySelector('.shoulder-story');
if(section){
 const stage=section.querySelector('.shoulder-visual'),canvas=section.querySelector('canvas');
 const chapters=[...section.querySelectorAll('.shoulder-chapter')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const word=section.querySelector('.shoulder-word');
 let renderer,raf=0,visible=false,target=0,current=0,last=0,resize=true,ready=false;
 let stageW=1,stageH=1,insertion=0,insertionTarget=0;
 const clamp=THREE.MathUtils.clamp,smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,3));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(0,0,7.8);
  const model=new THREE.Group(),garment=new THREE.Group();scene.add(model);model.add(garment);
  const filmMeshes=[],clothMeshes=[],loader=new THREE.TextureLoader();
  const concealed={value:0},slitStrength={value:0};
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
    shader.uniforms.slitStrength=slitStrength;
    shader.uniforms.sourceSize={value:new THREE.Vector2(map.image.width,map.image.height)};
    shader.fragmentShader=`uniform float concealed;
     uniform vec2 sourceSize;
     uniform float slitStrength;
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
    if(isFilm&&!back)fragment+=`
     // A fine incision with closed tips, unequal flexible lips and a soft inner shadow.
     float t=clamp((vMapUv.y-.61)/.14,0.,1.);
     float span=smoothstep(.607,.613,vMapUv.y)*(1.-smoothstep(.747,.753,vMapUv.y));
     float bow=pow(max(0.,sin(t*3.14159265)),.85);
     float center=.5+.0012*sin(t*6.28318)*bow;
     float x=vMapUv.x-center;
     float aa=max(fwidth(vMapUv.x),.00018);
     float left=-.00035-.0011*bow;
     float right=.00035+.0022*bow;
     float opening=smoothstep(left-aa,left+aa,x)*(1.-smoothstep(right-aa,right+aa,x))*span;
     float depth=clamp((x-left)/max(right-left,.0001),0.,1.);
     vec3 inside=mix(vec3(.16,.17,.165),vec3(.43,.45,.43),depth);
     diffuseColor.rgb=mix(diffuseColor.rgb,inside,opening*slitStrength*.84);
     float lip=exp(-pow((x-right-.0010)/(.0007+aa),2.))*span*bow;
     float edgeShadow=exp(-pow((x-left+.0017)/.0022,2.))*span*bow;
     float fold=exp(-pow((x-right-.0048)/.0035,2.))*span*bow;
     diffuseColor.rgb*=1.-slitStrength*(edgeShadow*.12+fold*.045);
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.),lip*slitStrength*.65);
`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',fragment);
   };
   mat.customProgramCacheKey=()=>isFilm?(back?'product-film-back':'product-film-slit'):'product-cubic-cloth';
   const mesh=new THREE.Mesh(geo,mat);mesh.userData={bases,back};
   (isFilm?model:garment).add(mesh);(isFilm?filmMeshes:clothMeshes).push(mesh);
  }
  Promise.all(['coprispalla-originale-lossless.png','giacca-fronte.webp','giacca-retro.webp'].map(file=>loader.loadAsync('assets/realistic/'+file))).then(maps=>{
   surface(maps[0],false,true);surface(maps[0],true,true);
   surface(maps[1],false,false);surface(maps[2],true,false);
   ready=true;configure();
  }).catch(()=>{renderer.dispose();});
  function measure(){
   const trigger=stageW<=700?stage.getBoundingClientRect().bottom+90:innerHeight*.62;
   let next=0;
   chapters.forEach((chapter,i)=>{if((stageW<=700?chapter.querySelector("h2,h3"):chapter).getBoundingClientRect().top<=trigger)next=i;});
   target=next;
   // Insertion has its own timeline: it never changes the editorial pose.
   insertionTarget=next>0||chapters[0].getBoundingClientRect().top<innerHeight*.2?1:0;
   section.dataset.chapter=String(next);
  }
  function track(values){
   const i=Math.min(values.length-2,Math.floor(current));
   return THREE.MathUtils.lerp(values[i],values[i+1],smooth(i,i+1,current));
  }
  function deform(insert){
   // The collar and shoulders follow the hanger; lower fabric lags slightly while lifted.
   const travel=insertion;
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
  function paint(){
   if(resize){stageW=stage.clientWidth;stageH=stage.clientHeight;renderer.setSize(stageW,stageH,false);camera.aspect=stageW/stageH;camera.updateProjectionMatrix();resize=false;}
   slitStrength.value=.16+.84*smooth(1,2,current);
   const insert=smooth(0,.82,insertion);
   const reveal=smooth(0,.25,insertion)*(1-smooth(.80,1,insertion));
   concealed.value=smooth(.82,1,insert)*(1-reveal);deform(insert);
   clothMeshes.forEach(mesh=>{mesh.material.opacity=1-smooth(.88,1,insertion);});
   filmMeshes.forEach(mesh=>{mesh.material.opacity=1-(stageW<=700?.32:.58)*reveal;});
   // A composed sequence: settle for insertion, tilt towards the viewer, then pull back.
   const arrival=(1-insertion)*(1-smooth(0,.8,current));
   const turn=track([-.045,.055,-.02]);
   model.rotation.set(track([.03,.07,0]),turn*Math.PI*2,
    THREE.MathUtils.degToRad(track([-17,11,-7])-7*arrival));
   const viewHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
   const narrow=stageW<=700;
   model.position.set(-viewHeight*camera.aspect*.215+track([-.12,.12,-.08]),
    track([-1.1,-1.25,-.8]),0);
   if(narrow)model.position.set(0,0,0);
   const tiltedHeight=5.4*Math.abs(Math.cos(model.rotation.z))+3.6*Math.abs(Math.sin(model.rotation.z));
   const fill=narrow?track([.83,.77,.86]):track([2.15,1.92,2.28])+.10*arrival;
   model.scale.setScalar(viewHeight*fill/tiltedHeight);
   // Keep the hook and both shoulders physically inside the stage, below the header.
   model.updateMatrixWorld(true);
   let highest=-Infinity;
   for(const [x,y] of [[0,2.75],[-1.4,1.5],[1.4,1.5]]){
    vec.set(x,y,.25);model.localToWorld(vec);vec.project(camera);highest=Math.max(highest,vec.y);
   }
   const ceiling=1-48/stageH;
   if(highest>ceiling){model.position.y-=(highest-ceiling)*viewHeight*.5;model.updateMatrixWorld(true);}
   const front=Math.cos(turn*Math.PI*2)>=0;
   filmMeshes.forEach(mesh=>{mesh.renderOrder=(mesh.userData.back===!front)?3:0;});
   clothMeshes.forEach(mesh=>{mesh.renderOrder=1;});
   renderer.render(scene,camera);
   word.style.transform=`translate3d(${track([0,18,-8])}px,${track([0,-12,6])}px,0)`;
   stage.dataset.reveal=reveal.toFixed(3);stage.dataset.progress=current.toFixed(3);
   stage.dataset.rotation=String(Math.round(turn*360));stage.dataset.insertion=insert.toFixed(3);
  }
  function frame(now){raf=0;const dt=Math.min(.05,(now-last)/1000||.016);last=now;current+=(target-current)*(1-Math.exp(-3.2*dt));insertion+=(insertionTarget-insertion)*(1-Math.exp(-2.8*dt));if(Math.abs(target-current)<.0001)current=target;if(Math.abs(insertionTarget-insertion)<.0001)insertion=insertionTarget;paint();if(visible&&(current!==target||insertion!==insertionTarget))raf=requestAnimationFrame(frame);}
  function wake(){if(!ready||reduced.matches||document.hidden||!visible)return;measure();if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  function configure(){cancelAnimationFrame(raf);raf=0;section.classList.toggle('shoulder-ready',ready&&!reduced.matches);if(ready&&!reduced.matches){resize=true;measure();current=target;insertion=target>0?insertionTarget:0;paint();wake();}}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'150px'}).observe(stage);
  new ResizeObserver(()=>{resize=true;wake();}).observe(stage);
  addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{resize=true;wake();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});reduced.addEventListener('change',configure);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;ready=false;section.classList.remove('shoulder-ready');});
 }catch(error){section.classList.remove('shoulder-ready');renderer?.dispose();}
}
