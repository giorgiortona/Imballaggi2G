/* Inline illustrations follow scroll with time-based damping, then rest. */
(()=>{
 const mobile=matchMedia('(max-width:700px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const states=new Map([...document.querySelectorAll('[data-mobile-product]')].map(card=>[card,{
  card,index:Number(card.dataset.mobileProduct),motion:card.querySelector('.mobile-product-motion'),
  jacket:card.querySelector('.mobile-jacket'),cover:card.querySelector('.mobile-cover'),current:null,target:0
 }]));
 const active=new Set();let raf=0,last=0,measure=true;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function frame(now){
  raf=0;if(!mobile.matches||document.hidden){last=0;return;}
  const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
  // Batch geometry reads before transforms; image transforms never change these boxes.
  if(measure){for(const s of active){const r=s.card.getBoundingClientRect();s.target=clamp((innerHeight-r.top)/(innerHeight+r.height));if(s.current===null)s.current=s.target;}measure=false;}
  let moving=false;
  for(const s of active){
   const difference=s.target-s.current;
   s.current=reduced.matches||Math.abs(difference)<.0001?s.target:s.current+difference*(1-Math.exp(-12*dt));
   moving ||= Math.abs(s.target-s.current)>=.0001;
   const p=s.current,t=p*p*(3-2*p),angle=reduced.matches?0:(s.index%2?-1:1)*(-8+16*t),scale=reduced.matches?1:.92+.10*Math.sin(t*Math.PI);
   s.motion.style.transform=`translate3d(0,${reduced.matches?0:14-28*t}px,0) rotate(${angle}deg) scale(${scale})`;
   if(s.jacket){const u=clamp((p-.1)/.5),entry=u*u*(3-2*u);s.jacket.style.transform=`translate3d(0,${reduced.matches?0:25*(1-entry)}%,0)`;s.jacket.style.opacity=String(reduced.matches?1:entry);s.cover.style.opacity=String(reduced.matches?1:1-.48*Math.sin(entry*Math.PI));}
  }
  if(moving)raf=requestAnimationFrame(frame);else last=0;
 }
 function wake(){measure=true;if(!raf&&mobile.matches&&!document.hidden)raf=requestAnimationFrame(frame);}
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=states.get(e.target);if(e.isIntersecting)active.add(s);else{active.delete(s);s.current=null;}}wake();},{rootMargin:'160px'});
 states.forEach(s=>observer.observe(s.card));
 addEventListener('scroll',wake,{passive:true});addEventListener('resize',wake,{passive:true});
 mobile.addEventListener('change',wake);reduced.addEventListener('change',wake);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();});
})();
