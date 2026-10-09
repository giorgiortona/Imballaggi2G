/* Procedural PE-film study. All geometry, lighting and material maps are generated
   locally; the sole image asset is the company's original logo. */
import * as THREE from './vendor/three.module.min.js';

const section = document.querySelector('[data-reel-3d]');
if (section) {
  const stage = section.querySelector('.reel3d-stage');
  const canvas = section.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = THREE.MathUtils.clamp;
  const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  let renderer, visible=false, frame=0, current=0, target=0, last=0, disposed=false;
  let resizePending=true, measurePending=true, start=0, travel=1, lastStep=-1;
  const ownedTextures=[];
  try {
    renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.6));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=.95;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(33,1,.1,70);
    const world=new THREE.Group();scene.add(world);
    function texture(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(t);return t;}
    function surface(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);return texture(c);}

    // A photographic studio expressed as light, not as a photographic background.
    const environment=surface(1024,512,(g,w,h)=>{
      const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#c8d0cd');bg.addColorStop(.5,'#777f7c');bg.addColorStop(1,'#272e2b');g.fillStyle=bg;g.fillRect(0,0,w,h);
      const panel=(x,y,pw,ph,alpha)=>{g.fillStyle=`rgba(255,255,255,${alpha})`;g.fillRect(x,y,pw,ph);};
      panel(80,55,130,340,1);panel(480,60,50,325,.95);panel(720,0,190,220,.85);panel(270,100,18,275,.6);
    });
    environment.mapping=THREE.EquirectangularReflectionMapping;
    const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(environment);scene.environment=env.texture;pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff,0x748277,1.35));
    const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(-3,6,5);scene.add(key);
    const edge=new THREE.DirectionalLight(0xe7f1eb,2.1);edge.position.set(5,3,-3);scene.add(edge);

    // Fine extrusion lines, generated with deterministic noise; never a stock texture.
    const striation=surface(512,512,(g,w,h)=>{
      g.fillStyle='#d3d8d5';g.fillRect(0,0,w,h);
      for(let i=0;i<512;i++){const a=.02+(Math.sin(i*17.31)*.5+.5)*.08;g.fillStyle=`rgba(255,255,255,${a})`;g.fillRect(0,i,w,1);}
      for(let i=0;i<16;i++){g.fillStyle='rgba(110,124,117,.035)';g.fillRect(i*33,0,1,h);}
    });
    const roll=new THREE.Group();world.add(roll);
    const filmMaterial=new THREE.MeshPhysicalMaterial({color:0xe2e9e3,map:striation,roughness:.22,metalness:.12,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:1.5});
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.63,.63,2.9,128,1,true),filmMaterial);roll.add(barrel);
    const endMaterial=new THREE.MeshStandardMaterial({color:0xe0e6db,roughness:.42,metalness:.12,side:THREE.DoubleSide});
    const coreMaterial=new THREE.MeshStandardMaterial({color:0x96724c,roughness:.94,side:THREE.DoubleSide});
    const core=new THREE.Mesh(new THREE.CylinderGeometry(.218,.218,2.96,64,1,true),coreMaterial);roll.add(core);
    const darkCore=new THREE.Mesh(new THREE.CircleGeometry(.216,64),new THREE.MeshBasicMaterial({color:0x3b3127,side:THREE.DoubleSide}));darkCore.rotation.x=-Math.PI/2;darkCore.position.y=.86;roll.add(darkCore);
    const layerPoints=[];
    for(const y of [-1.454,1.454]){
      const end=new THREE.Mesh(new THREE.RingGeometry(.247,.63,128),endMaterial);end.rotation.x=-Math.PI/2;end.position.y=y;roll.add(end);
      const lip=new THREE.Mesh(new THREE.RingGeometry(.215,.249,64),coreMaterial);lip.rotation.x=-Math.PI/2;lip.position.y=y+(y>0?.012:-.012);roll.add(lip);
      for(let ring=0;ring<48;ring++){const r=.25+ring*.00785;for(let j=0;j<128;j++){const a=j/128*Math.PI*2,b=(j+1)/128*Math.PI*2;layerPoints.push(r*Math.cos(a),y+.001,r*Math.sin(a),r*Math.cos(b),y+.001,r*Math.sin(b));}}
    }
    const layers=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(layerPoints,3)),new THREE.LineBasicMaterial({color:0x87968a,transparent:true,opacity:.28}));roll.add(layers);
    const seam=new THREE.Mesh(new THREE.CylinderGeometry(.632,.632,2.87,4,1,true,0,.012),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.6,roughness:.1}));roll.add(seam);

    // Floating brand plaque, later enclosed by the clear film.
    const brand=new THREE.Group();world.add(brand);
    const plaque=new THREE.Mesh(new THREE.BoxGeometry(3.15,1.23,.15),new THREE.MeshPhysicalMaterial({color:0xfafcf9,roughness:.3,metalness:.04,clearcoat:1}));brand.add(plaque);
    const logoMap=new THREE.TextureLoader().load('assets/logo-ink.webp',()=>wake());logoMap.colorSpace=THREE.SRGBColorSpace;logoMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());ownedTextures.push(logoMap);
    const logo=new THREE.Mesh(new THREE.PlaneGeometry(2.65,.76),new THREE.MeshBasicMaterial({map:logoMap,transparent:true,depthWrite:false}));logo.position.z=.084;brand.add(logo);

    const shadowTexture=surface(256,256,(g,w,h)=>{const gradient=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gradient.addColorStop(0,'rgba(24,40,30,.25)');gradient.addColorStop(.4,'rgba(24,40,30,.12)');gradient.addColorStop(1,'rgba(24,40,30,0)');g.fillStyle=gradient;g.fillRect(0,0,w,h);});
    function shadow(w,h){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=-1.52;world.add(mesh);return mesh;}
    const rollShadow=shadow(2.1,1.7),brandShadow=shadow(4.5,2.3);

    // A real deforming mesh: a loose leading edge straightens as the roll moves.
    const sheetGeometry=new THREE.PlaneGeometry(1,2.84,64,16);
    const sheetPositions=sheetGeometry.attributes.position;
    const clear=new THREE.MeshPhysicalMaterial({color:0xf0fff5,transparent:true,opacity:.18,roughness:.13,metalness:.12,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide,depthWrite:false,envMapIntensity:2.1});
    const sheet=new THREE.Mesh(sheetGeometry,clear);sheet.renderOrder=3;world.add(sheet);
    const highlights=new THREE.Group();world.add(highlights);
    const filamentMaterial=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false});
    const filaments=[];
    for(let i=0;i<9;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(65*3),3));const line=new THREE.Line(g,filamentMaterial);line.renderOrder=4;highlights.add(line);filaments.push(line);}

    // Final sleeve folds over the edges, creating recognisable layered protection.
    const sleeveGeometry=new THREE.BoxGeometry(3.3,1.39,.39);
    const sleeve=new THREE.Mesh(sleeveGeometry,new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:0,roughness:.09,metalness:.13,clearcoat:1,side:THREE.FrontSide,depthWrite:false,envMapIntensity:1.8}));sleeve.renderOrder=5;world.add(sleeve);
    const creaseMaterial=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0});
    const creasePoints=[-1.65,.69,.2,-1.39,.48,.2, 1.65,.69,.2,1.39,.48,.2, -1.65,-.69,.2,-1.39,-.48,.2, 1.65,-.69,.2,1.39,-.48,.2, -1.65,.69,.2,1.65,.69,.2, -1.65,-.69,.2,1.65,-.69,.2];
    const creases=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(creasePoints,3)),creaseMaterial);creases.renderOrder=6;world.add(creases);
    // Soft elongated specular reflection over the protected logo.
    const glintTexture=surface(128,32,(g,w,h)=>{const a=g.createLinearGradient(0,0,w,0);a.addColorStop(0,'rgba(255,255,255,0)');a.addColorStop(.48,'rgba(255,255,255,.65)');a.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=a;g.fillRect(0,0,w,h);});
    const glint=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.32),new THREE.MeshBasicMaterial({map:glintTexture,transparent:true,opacity:0,depthWrite:false}));glint.position.z=.205;glint.rotation.z=-.15;glint.renderOrder=7;world.add(glint);

    function measure(){const r=section.getBoundingClientRect();start=r.top+scrollY;travel=Math.max(1,section.offsetHeight-section.querySelector('.reel3d-pin').offsetHeight);measurePending=false;}
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const distance=Math.max(9.6,3.35/(Math.tan(THREE.MathUtils.degToRad(16.5))*camera.aspect));camera.position.set(2.8,2.6,10).normalize().multiplyScalar(distance);camera.lookAt(0,-.05,0);camera.updateProjectionMatrix();resizePending=false;measurePending=true;}
    function update(p){
      const unwind=smooth(.08,.72,p),reveal=smooth(.22,.55,p),wrap=smooth(.68,.96,p);
      const rx=THREE.MathUtils.lerp(-2.18,2.48,unwind);
      roll.position.set(rx,0,.02);roll.rotation.y=-unwind*9.5;roll.rotation.z=(1-unwind)*-.035;
      rollShadow.position.x=rx;
      brand.position.set(-.1,-.25*(1-reveal),-.9*(1-reveal));brand.scale.setScalar(.86+.14*reveal);brand.visible=reveal>.001;
      plaque.material.transparent=true;plaque.material.opacity=reveal;logo.material.opacity=reveal;brandShadow.material.opacity=reveal*.75;
      sleeve.position.copy(brand.position);creases.position.copy(brand.position);sleeve.material.opacity=wrap*.12;creaseMaterial.opacity=wrap*.68;
      glint.position.x=-1.8+wrap*3.6;glint.position.y=brand.position.y;glint.material.opacity=Math.sin(wrap*Math.PI)*.4;
      sheet.visible=unwind>.005;highlights.visible=sheet.visible;
      clear.opacity=.25*(1-wrap*.2);
      const left=-2.2+wrap*.45,width=Math.max(.002,rx-left),height=2.84-wrap*1.45;
      const point=(u,v)=>{
        const x=left+u*width,y=v*height;
        const loose=Math.sin(u*Math.PI)*Math.sin(v*3.4+u*5+unwind*3)*.095*(1-wrap);
        const fold=smooth(.34,.5,Math.abs(v));
        const z=.64-wrap*.39+loose+Math.sin(u*Math.PI)*.12*(1-wrap)-fold*wrap*.34;
        return [x,y,z];
      };
      for(let j=0;j<=16;j++)for(let i=0;i<=64;i++){const idx=j*65+i;const pt=point(i/64,.5-j/16);sheetPositions.setXYZ(idx,...pt);}
      sheetPositions.needsUpdate=true;sheetGeometry.computeVertexNormals();
      for(let n=0;n<filaments.length;n++){const a=filaments[n].geometry.attributes.position;const v=n===0?.5:n===1?-.5:(n-5)*.105;for(let i=0;i<=64;i++){const pt=point(i/64,v);a.setXYZ(i,pt[0],pt[1],pt[2]+.003);}a.needsUpdate=true;}
      filamentMaterial.opacity=.5*(1-wrap*.25);
      const step=p<.3?0:p<.73?1:2;
      if(step!==lastStep){lastStep=step;section.querySelectorAll('[data-reel-step]').forEach((el,i)=>el.classList.toggle('is-current',i===step));}
      canvas.dataset.progress=p.toFixed(3);
    }
    function tick(now){frame=0;if(disposed||document.hidden||!visible)return;if(resizePending)resize();if(measurePending)measure();target=reduced.matches?1:clamp((scrollY-start)/travel,0,1);
      const dt=Math.min((now-last)/1000||1/60,.05);last=now;
      current=reduced.matches?1:current+(target-current)*(1-Math.exp(-14*dt));
      if(Math.abs(current-target)<.00015)current=target;
      update(current);renderer.render(scene,camera);
      if(Math.abs(current-target)>.00015)frame=requestAnimationFrame(tick);
    }
    function wake(){if(!frame&&visible&&!document.hidden&&!disposed)frame=requestAnimationFrame(tick);}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){measurePending=true;last=performance.now();wake();}else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'150px'});observer.observe(section);
    const sizes=new ResizeObserver(()=>{resizePending=true;wake();});sizes.observe(stage);
    const scroll=()=>{measurePending=true;wake();};window.addEventListener('scroll',scroll,{passive:true});
    const layout=()=>{measurePending=true;wake();};window.addEventListener('resize',layout,{passive:true});window.addEventListener('load',layout,{once:true});document.fonts?.ready.then(layout);
    document.addEventListener('visibilitychange',()=>{last=performance.now();wake();});
    reduced.addEventListener('change',()=>{measurePending=true;wake();});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();section.classList.remove('reel3d-ready');if(frame)cancelAnimationFrame(frame);disposed=true;observer.disconnect();sizes.disconnect();});
    section.classList.add('reel3d-ready');resize();measure();update(reduced.matches?1:0);renderer.render(scene,camera);
  } catch(error) {
    section.classList.remove('reel3d-ready');renderer?.dispose();
    console.warn('La scena 3D non è disponibile; visualizzazione alternativa attiva.',error);
  }
}
