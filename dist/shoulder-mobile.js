/* Inline product illustrations: only visible cards animate, with no pinning. */
(()=>{
 const cards=[...document.querySelectorAll('[data-mobile-product]')];
 const mobile=matchMedia('(max-width:700px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const active=new Set();let raf=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function paint(){raf=0;if(!mobile.matches)return;
  for(const card of active){
   const r=card.getBoundingClientRect(),p=clamp((innerHeight-r.top)/(innerHeight+r.height)),t=p*p*(3-2*p);
   const i=Number(card.dataset.mobileProduct),motion=card.querySelector('.mobile-product-motion');
   const angle=reduced.matches?0:(i%2?-1:1)*(-8+16*t);
   const scale=reduced.matches?1:.92+.10*Math.sin(t*Math.PI);
   motion.style.transform=`translateY(${reduced.matches?0:14-28*t}px) rotate(${angle}deg) scale(${scale})`;
   const jacket=card.querySelector('.mobile-jacket');
   if(jacket){const entry=clamp((p-.1)/.5);jacket.style.transform=`translateY(${reduced.matches?0:25*(1-entry)}%)`;jacket.style.opacity=String(reduced.matches?1:entry);card.querySelector('.mobile-cover').style.opacity=String(reduced.matches?1:1-.48*Math.sin(entry*Math.PI));}
  }
 }
 function wake(){if(!raf&&mobile.matches)raf=requestAnimationFrame(paint);}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?active.add(e.target):active.delete(e.target);wake();},{rootMargin:'120px'});
 cards.forEach(c=>observer.observe(c));addEventListener('scroll',wake,{passive:true});addEventListener('resize',wake,{passive:true});mobile.addEventListener('change',wake);reduced.addEventListener('change',wake);
})();
