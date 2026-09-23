/* ============================================================
   Imballaggi 2G — interazioni e movimento
   Tutto degrada con grazia: senza JS la pagina resta leggibile,
   con prefers-reduced-motion il movimento si spegne.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReduced = function () { return reduced.matches; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- titoli: rivelazione riga per riga ---------- */
  document.querySelectorAll('[data-lines]').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    if (parts.length < 1) return;
    el.innerHTML = parts.map(function (line, i) {
      return '<span class="line"><span class="line-in" style="--i:' + i + '">' + line + '</span></span>';
    }).join('');
  });

  /* ---------- indici per gli ingressi scaglionati ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });
  document.querySelectorAll('.menu-nav a, .menu-block').forEach(function (el, i) {
    el.style.setProperty('--i', i % 8);
  });

  /* ---------- osservatore unico per le rivelazioni ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible', 'in');
      if (el.hasAttribute('data-count')) countUp(el);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .technical-preview, [data-lines], [data-stagger], [data-count]')
    .forEach(function (el) { revealObserver.observe(el); });

  /* ---------- contatori percentuali ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) {
      node = document.createTextNode('0');
      el.insertBefore(node, el.firstChild);
    }
    if (isReduced()) { node.nodeValue = String(target); return; }
    var duration = 1400;
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      node.nodeValue = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- intro ---------- */
  var intro = document.querySelector('.intro');
  var curtain = intro && intro.querySelector('.intro-curtain');
  var introCount = intro && intro.querySelector('.intro-count b');

  function runIntroCount() {
    if (!introCount || isReduced()) return;
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / 1500);
      introCount.textContent = String(Math.round(p * 100));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (intro && curtain) {
    if (isReduced()) {
      intro.classList.add('finished');
    } else {
      runIntroCount();
      curtain.addEventListener('animationend', function (event) {
        if (event.animationName === 'introOut') intro.classList.add('finished');
      });
    }
  }

  var replay = document.querySelector('.replay');
  if (replay && intro) {
    replay.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
      intro.classList.remove('finished');
      [intro.querySelector('.intro-inner'), curtain, intro.querySelector('.intro-track span')]
        .forEach(function (el) {
          if (!el) return;
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
      runIntroCount();
    });
  }

  /* ---------- menu a schermo intero ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('#menu');
  var header = document.querySelector('#header');
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('locked', open);
    if (open) {
      var first = menu.querySelector('a');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 380);
    }
  }

  if (burger && menu && header) {
    menu.setAttribute('inert', '');
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    // Un clic sullo sfondo scuro chiude il menu.
    var menuBg = menu.querySelector('.menu-bg');
    if (menuBg) menuBg.addEventListener('click', function () { setMenu(false); burger.focus(); });
  }

  /* ---------- header, avanzamento, torna su ---------- */
  var progress = document.querySelector('.scroll-progress span');
  var toTop = document.querySelector('.to-top');
  var heroMedia = document.querySelector('.hero-media');
  var hero = document.querySelector('.hero');
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var lastY = window.scrollY;
  var ticking = false;

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
    });
  }

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

    if (header) {
      header.classList.toggle('solid', y > 60);
      var goingDown = y > lastY && y > 320;
      header.classList.toggle('hidden', goingDown && !menuOpen);
    }
    if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 0.9);

    if (!isReduced()) {
      if (hero && heroMedia) {
        var bounds = hero.getBoundingClientRect();
        if (bounds.bottom > 0) {
          heroMedia.style.transform = 'translateY(' + (Math.max(0, -bounds.top) * 0.16) + 'px) scale(1.04)';
        }
      }
      parallaxItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var amount = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -amount;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }

    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- disegno tecnico: deriva leggera allo scroll ---------- */
  var scene = document.querySelector('.technical-preview');
  var lines = document.querySelector('.drawing-lines');
  if (scene && lines) {
    window.addEventListener('scroll', function () {
      if (isReduced() || window.innerWidth < 900) return;
      var rect = scene.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var p = Math.max(-1, Math.min(1, (rect.top - window.innerHeight * 0.3) / window.innerHeight));
      lines.style.transform = 'translateY(' + (p * 16) + 'px) rotate(' + (p * 2) + 'deg)';
    }, { passive: true });
  }

  /* ---------- pulsanti magnetici ---------- */
  if (finePointer.matches && !isReduced()) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (event) {
        var rect = el.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * 0.18;
        var y = (event.clientY - rect.top - rect.height / 2) * 0.28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- accordion: una voce aperta per gruppo ---------- */
  document.querySelectorAll('.details-list').forEach(function (list) {
    var items = list.querySelectorAll('details');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  });

  /* ---------- anno corrente ---------- */
  var year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
