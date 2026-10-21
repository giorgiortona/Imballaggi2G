/* Three held editorial poses: bubble wrap, its surface, then the film formats. */
(()=>{
 const section=document.querySelector('.shoulder-variants');if(!section)return;
 const stage=section.querySelector('.variants-stage'),chapters=[...section.querySelectorAll('.variant-chapter')];
 const bubble=section.querySelector('.bubble-product'),family=section.querySelector('.film-family');
 const formats=[...section.querySelectorAll('.film-format')],word=section.querySelector('.variant-word');
 const pin=section.querySelector('.variant-pin'),caption=section.querySelector('.variant-visual-caption');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
 let pose=0,target=0,raf=0,last=0,visible=false;
 function track(values){const i=Math.min(values.length-2,Math.floor(pose));return values[i]+(values[i+1]-values[i])*smooth(i,i+1,pose);}
 function measure(){let n=0;const trigger=innerWidth<=700?stage.getBoundingClientRect().bottom+90:innerHeight*.62;chapters.forEach((c,i)=>{if((innerWidth<=700?c.querySelector("h2,h3"):c).getBoundingClientRect().top<trigger)n=i;});target=n;section.dataset.variant=String(n);}
 function paint(){
  const mobile=innerWidth<=700,leave=smooth(1.12,1.85,pose);
  bubble.style.transform=`translate3d(${track(mobile?[0,0,24]:[0,22,50])}%,${track(mobile?[0,1,0]:[0,-5,2])}%,0) rotate(${track([-9,8,17])}deg) scale(${track(mobile?[.92,1.03,.88]:[1,1.30,1.05])})`;
  bubble.style.opacity=String(1-leave);bubble.style.visibility=leave===1?'hidden':'visible';
  const enter=smooth(1.3,1.95,pose);family.style.opacity=String(enter);family.style.visibility=enter>0?'visible':'hidden';
  formats.forEach((f,i)=>{const t=smooth(1.28+i*.13,1.74+i*.13,pose);f.style.transform=`translate3d(${(1-t)*(60+i*15)}%,${(1-t)*25+(mobile?0:i*8)}px,0) rotate(${(1-t)*(10-i*3)}deg)`;f.style.opacity=String(t);});
  word.style.opacity=String((1-leave)*.65);word.style.transform=`translate3d(${track([0,-8,12])}%,0,0)`;
  pin.style.opacity=String(smooth(.8,1,pose)*(1-smooth(1.1,1.45,pose)));
  caption.textContent=pose>1.6?'Formati in film · rappresentazione illustrativa':'Coprispalla in pluriball · ricostruzione illustrativa';
  stage.dataset.pose=pose.toFixed(3);
 }
 function frame(now){raf=0;const dt=Math.min(.05,(now-last)/1000||.016);last=now;pose+=(target-pose)*(1-Math.exp(-4.1*dt));if(Math.abs(pose-target)<.0001)pose=target;paint();if(visible&&pose!==target)raf=requestAnimationFrame(frame);}
 function wake(){if(reduced.matches||!visible||document.hidden)return;measure();if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
 function configure(){cancelAnimationFrame(raf);raf=0;section.classList.toggle('variants-ready',!reduced.matches);if(reduced.matches){for(const el of [bubble,family,word,...formats])el.removeAttribute('style');return;}measure();pose=target;paint();wake();}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(stage);
 addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{measure();paint();wake();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
 reduced.addEventListener('change',configure);configure();
})();
