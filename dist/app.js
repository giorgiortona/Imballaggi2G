document.documentElement.classList.add('js');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}},{threshold:.12});
document.querySelectorAll('.reveal, .technical-preview').forEach(el=>observer.observe(el));
const intro=document.querySelector('.intro');
intro.addEventListener('animationend',event=>{if(event.animationName==='introOut')intro.classList.add('finished')});
document.querySelector('.replay').addEventListener('click',()=>{intro.classList.remove('finished');intro.style.animation='none';void intro.offsetWidth;intro.style.animation='';});
const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#navigation');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Apri menu');nav.classList.remove('open')}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Chiudi menu':'Apri menu');nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();toggle.focus()}});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu()});
const mobile=matchMedia('(max-width: 760px)');mobile.addEventListener('change',closeMenu);
document.querySelector('#year').textContent=new Date().getFullYear();
let scheduled=false;
function updateScroll(){scheduled=false;if(reducedMotion.matches)return;const hero=document.querySelector('.hero');const bounds=hero.getBoundingClientRect();if(bounds.bottom>0){document.querySelector('.hero-media').style.transform=`translateY(${Math.max(0,-bounds.top)*.15}px) scale(1.035)`}const scene=document.querySelector('.technical-preview');const rect=scene.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight&&!mobile.matches){const progress=Math.max(-1,Math.min(1,(rect.top-innerHeight*.3)/innerHeight));document.querySelector('.drawing-lines').style.transform=`translateY(${progress*16}px) rotate(${progress*2}deg)`}}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
