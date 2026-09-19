/* Imballaggi 2G — motion enhancement. Navigation and scrolling stay native. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  var clamp = function(v,a,b){return Math.min(b,Math.max(a,v));};
  root.classList.add('js');
  var storage;
  try { storage = sessionStorage; } catch(e) { storage = null; }
  function remembered(key){try{return storage && storage.getItem(key);}catch(e){return null;}}
  function remember(key,value){try{if(storage)storage.setItem(key,value);}catch(e){}}

  // Clone DOM ranges rather than cutting HTML strings across emphasis tags.
  document.querySelectorAll('[data-lines]').forEach(function(el){
    var breaks=Array.from(el.querySelectorAll('br')), fragments=[], range=document.createRange();
    range.setStart(el,0);
    breaks.forEach(function(br){range.setEndBefore(br);fragments.push(range.cloneContents());range.setStartAfter(br);});
    range.setEnd(el,el.childNodes.length);fragments.push(range.cloneContents());
    el.replaceChildren();
    fragments.forEach(function(fragment,i){var line=document.createElement('span'),inside=document.createElement('span');line.className='line';inside.className='line-in';inside.style.setProperty('--i',i);inside.append(fragment);line.append(inside);el.append(line);});
  });
  document.querySelectorAll('[data-stagger]').forEach(function(group){Array.from(group.children).forEach(function(child,i){child.style.setProperty('--i',Math.min(i,5));});});
  var revealObserver = new IntersectionObserver(function(entries){entries.forEach(function(entry){
    if(!entry.isIntersecting)return;
    entry.target.classList.add('visible','in');
    if(entry.target.hasAttribute('data-count'))countUp(entry.target);
    revealObserver.unobserve(entry.target);
  });},{threshold:0,rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.reveal,.technical-preview,[data-lines],[data-stagger],[data-count],.material-experience,.eco-story').forEach(function(el){revealObserver.observe(el);});
  function countUp(el){var target=Number(el.dataset.count)||0,node=el.firstChild;
    if(!node||node.nodeType!==3){node=document.createTextNode(String(target));el.prepend(node);}
    if(reduced.matches){node.nodeValue=target;return;}
    var start=performance.now();function step(now){var p=clamp((now-start)/1000,0,1);node.nodeValue=Math.round(target*(1-Math.pow(1-p,3)));if(p<1&&!reduced.matches)requestAnimationFrame(step);else node.nodeValue=target;}requestAnimationFrame(step);
  }

  /* Intro: one cancellable timeline, no scroll lock, no delayed navigation. */
  var intro=document.querySelector('.intro'), entry=document.querySelector('.section-entry');
  var introTimer, entryTimer;
  function finishIntro(){clearTimeout(introTimer);if(intro){intro.classList.remove('is-playing');intro.classList.add('finished');}root.style.setProperty('--intro','0s');}
  function finishEntry(){clearTimeout(entryTimer);if(entry)entry.classList.remove('is-playing');root.style.setProperty('--entry-delay','0s');}
  function playIntro(){if(!intro||reduced.matches)return;finishIntro();intro.classList.remove('finished');void intro.offsetWidth;intro.classList.add('is-playing');introTimer=setTimeout(finishIntro,3850);}
  var navType=performance.getEntriesByType('navigation')[0];
  if(intro && !reduced.matches && !remembered('2g-intro-v17') && (!navType||navType.type!=='back_forward') && !location.hash){
    remember('2g-intro-v17','1');root.style.setProperty('--intro','1.6s');playIntro();
  }else finishIntro();
  if(entry&&!reduced.matches&&(!navType||navType.type!=='back_forward')&&!location.hash){
    entry.classList.add('is-playing');root.style.setProperty('--entry-delay',entry.dataset.scene==='sostenibilita'?'1.1s':'.55s');entryTimer=setTimeout(finishEntry,entry.dataset.scene==='sostenibilita'?1800:1150);
  }
  var replay=document.querySelector('.replay');if(replay)replay.addEventListener('click',playIntro);
  document.querySelectorAll('[data-replay-entry]').forEach(function(button){button.addEventListener('click',function(){if(!entry||reduced.matches)return;finishEntry();void entry.offsetWidth;entry.classList.add('is-playing');entryTimer=setTimeout(finishEntry,1800);});});
  ['wheel','touchstart','pointerdown'].forEach(function(type){window.addEventListener(type,function(event){if(event.target.closest&&event.target.closest('.replay,[data-replay-entry]'))return;finishIntro();finishEntry();},{passive:true});});
  document.addEventListener('keydown',function(e){if(['Escape','Tab','PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(e.key)){finishIntro();finishEntry();}});

  /* Menu: compensate scrollbar, retain the exact reading position, restore focus. */
  var burger=document.querySelector('.burger'),menu=document.querySelector('#menu'),header=document.querySelector('#header');
  var menuOpen=false,lockedY=0,focusTimer;
  var main=document.querySelector('main'),footer=document.querySelector('.site-footer'),onward=document.querySelector('.onward');
  function setMenu(open,returnFocus){
    if(!burger||!menu||menuOpen===open)return;
    clearTimeout(focusTimer);menuOpen=open;
    burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));menu.inert=!open;
    header.classList.toggle('menu-open',open);header.classList.remove('hidden');
    [main,footer,onward].forEach(function(el){if(el)el.inert=open;});
    if(open){lockedY=window.scrollY;root.style.setProperty('--scrollbar-gap',(innerWidth-document.documentElement.clientWidth)+'px');document.body.style.top=-lockedY+'px';document.body.classList.add('locked');
      focusTimer=setTimeout(function(){if(menuOpen){var first=menu.querySelector('a');if(first)first.focus({preventScroll:true});}},300);
    }else{document.body.classList.remove('locked');document.body.style.top='';root.style.removeProperty('--scrollbar-gap');window.scrollTo({top:lockedY,behavior:'instant'});if(returnFocus)burger.focus({preventScroll:true});schedule();}
  }
  if(menu&&burger){menu.inert=true;burger.addEventListener('click',function(){setMenu(!menuOpen,true);});
    var bg=menu.querySelector('.menu-bg');if(bg)bg.addEventListener('click',function(){setMenu(false,true);});
    document.addEventListener('keydown',function(event){if(!menuOpen)return;if(event.key==='Escape'){setMenu(false,true);return;}
      if(event.key==='Tab'){var focusables=[burger].concat(Array.from(menu.querySelectorAll('a,button')));var index=focusables.indexOf(document.activeElement);if(event.shiftKey&&(index<=0)){event.preventDefault();focusables[focusables.length-1].focus();}else if(!event.shiftKey&&(index===focusables.length-1||index===-1)){event.preventDefault();burger.focus();}}
    });
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(event){if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&event.button===0)setMenu(false,false);});});
  }
  window.addEventListener('pagehide',function(){setMenu(false,false);finishIntro();finishEntry();});
  window.addEventListener('pageshow',function(event){if(event.persisted){setMenu(false,false);finishIntro();finishEntry();}schedule();});
  // No click interception: modified clicks, anchors, downloads, Back and Forward keep browser semantics.

  var claim=document.querySelector('.nav-claim span'),claimTimer,claimDefault=claim?claim.textContent:'';
  function setClaim(text){if(!claim)return;clearTimeout(claimTimer);claim.parentElement.classList.add('swap');claimTimer=setTimeout(function(){claim.textContent=text;claim.parentElement.classList.remove('swap');},140);}
  document.querySelectorAll('.slat').forEach(function(slat){['mouseenter','focus'].forEach(function(ev){slat.addEventListener(ev,function(){setClaim(slat.dataset.claim||claimDefault);});});['mouseleave','blur'].forEach(function(ev){slat.addEventListener(ev,function(){setClaim(claimDefault);});});});

  /* Photo-based material studies: one bounded scene, native scroll, explicit controls. */
  var studies=Array.from(document.querySelectorAll('[data-material-study]'));
  studies.forEach(function(study){
    var buttons=Array.from(study.querySelectorAll('[data-step]')),panels=Array.from(study.querySelectorAll('.study-panel'));study._manual=false;
    study._show=function(index){if(study._index===index)return;study._index=index;panels.forEach(function(panel,i){panel.classList.toggle('is-active',i===index);panel.setAttribute('aria-hidden',String(i!==index));});buttons.forEach(function(button,i){button.setAttribute('aria-pressed',String(i===index));});};
    buttons.forEach(function(button,i){button.addEventListener('click',function(){study._manual=true;study._show(i);});});study._show(0);
  });
  document.querySelectorAll('.bubble-study').forEach(function(study){
    var input=study.querySelector('input'), image=study.querySelector('.bubble-photo'),output=study.querySelector('output');
    function zoom(){var p=Number(input.value)/100;study.style.setProperty('--detail',p);image.style.transform='scale('+(1+p*.65)+')';output.value=p>.65?'La trama':p>.25?'Le bolle':'La superficie';}
    input.addEventListener('input',zoom);zoom();
    var again=study.querySelector('[data-replay-material]');if(again)again.addEventListener('click',function(){study.classList.remove('in');void study.offsetWidth;study.classList.add('in');});
  });
  document.querySelectorAll('.eco-story').forEach(function(story){var replay=story.querySelector('button');if(replay)replay.addEventListener('click',function(){story.classList.remove('in');void story.offsetWidth;story.classList.add('in');});});

  var progress=document.querySelector('.scroll-progress span'),toTop=document.querySelector('.to-top');
  var hero=document.querySelector('.home-hero'),heroMedia=document.querySelector('.hero-media');
  var parallax=Array.from(document.querySelectorAll('[data-parallax]')).map(function(el){return {el:el,anchor:el.parentElement};});
  var lastY=window.scrollY,direction=0,distance=0,ticking=false;
  if(toTop)toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});});
  function schedule(){if(!ticking){ticking=true;requestAnimationFrame(render);}}
  function render(){ticking=false;if(menuOpen)return;var y=Math.max(0,window.scrollY),vh=innerHeight,max=root.scrollHeight-vh,delta=y-lastY;
    if(progress)progress.style.transform='scaleX('+(max>0?clamp(y/max,0,1):0)+')';
    if(header){header.classList.toggle('solid',y>60);var nextDirection=delta>0?1:delta<0?-1:direction;if(nextDirection!==direction){distance=0;direction=nextDirection;}distance+=Math.abs(delta);if(y<120)header.classList.remove('hidden');else if(distance>18){header.classList.toggle('hidden',direction===1&&y>320);distance=0;}}
    if(toTop)toTop.classList.toggle('show',y>vh*.9);
    if(!reduced.matches){if(hero&&heroMedia){var rect=hero.getBoundingClientRect();if(rect.bottom>0)heroMedia.style.transform='translate3d(0,'+Math.min(vh*.12,Math.max(0,-rect.top)*.12)+'px,0) scale(1.04)';}
      parallax.forEach(function(item){var r=item.anchor.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;item.el.style.transform='translate3d(0,'+clamp((r.top+r.height/2-vh/2)*-.035,-28,28)+'px,0)';});
    }
    studies.forEach(function(study){var r=study.getBoundingClientRect();if(r.bottom<=0||r.top>=vh){study._manual=false;return;}if(!study._manual&&!reduced.matches){var p=clamp((vh*.75-r.top)/(r.height+vh*.1),0,1);study._show(p<.34?0:p<.68?1:2);}});
    lastY=y;
  }
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  reduced.addEventListener('change',function(){finishIntro();finishEntry();if(reduced.matches){parallax.forEach(function(item){item.el.style.transform='';});if(heroMedia)heroMedia.style.transform='';}schedule();});
  // Details remain independent: closing content above the reader caused unexpected jumps.
  document.querySelectorAll('details').forEach(function(el){el.addEventListener('toggle',schedule);});
  document.querySelectorAll('img').forEach(function(img){if(!img.complete)img.addEventListener('load',schedule,{once:true});});
  if(document.fonts)document.fonts.ready.then(schedule);schedule();
  var year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
})();
