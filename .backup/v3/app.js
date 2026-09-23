/* ============================================================
   Imballaggi 2G — interazioni e movimento
   Senza JS la pagina resta leggibile; con prefers-reduced-motion
   il movimento si spegne e le animazioni mostrano lo stato finale.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReduced = function () { return reduced.matches; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

  /* ---------- titoli: rivelazione riga per riga ---------- */
  document.querySelectorAll('[data-lines]').forEach(function (el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (line, i) {
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
    el.style.setProperty('--i', i % 9);
  });
  document.querySelectorAll('.intro-tag span').forEach(function (el, i) {
    el.style.setProperty('--li', i);
  });

  /* ---------- osservatore delle rivelazioni ---------- */
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
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / 1400);
      node.nodeValue = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- intro: il logo si costruisce ---------- */
  var intro = document.querySelector('.intro');

  function restart(el) {
    var all = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    all.forEach(function (n) { n.style.animation = 'none'; });
    void el.offsetWidth;
    all.forEach(function (n) { n.style.animation = ''; });
  }

  if (intro) {
    if (isReduced()) {
      intro.classList.add('finished');
    } else {
      intro.addEventListener('animationend', function (event) {
        if (event.animationName === 'introOpen') intro.classList.add('finished');
      });
    }
  }

  var replay = document.querySelector('.replay');
  if (replay && intro) {
    replay.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
      if (isReduced()) return;
      intro.classList.remove('finished');
      restart(intro);
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
    var menuBg = menu.querySelector('.menu-bg');
    if (menuBg) menuBg.addEventListener('click', function () { setMenu(false); burger.focus(); });
  }

  /* ---------- indice a punti ---------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var dotsNav = document.querySelector('.dots');
  var dots = [];

  if (dotsNav && panels.length) {
    panels.forEach(function (panel) {
      var label = panel.getAttribute('data-nav');
      var a = document.createElement('a');
      a.href = '#' + panel.id;
      a.setAttribute('aria-label', 'Vai a ' + label);
      a.innerHTML = '<span class="dot-label">' + label + '</span><span class="dot-mark"></span>';
      dotsNav.appendChild(a);
      dots.push(a);
    });
    dotsNav.classList.add('ready');
  }

  // Un pannello è "scuro" se il suo fondo lo è: serve a scegliere il colore dei punti.
  function isDarkPanel(el) {
    var bg = window.getComputedStyle(el).backgroundColor;
    var m = bg.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return false;
    if (m.length > 3 && parseFloat(m[3]) < 0.5) return false;
    var lum = (+m[0] * 299 + +m[1] * 587 + +m[2] * 114) / 1000;
    return lum < 125;
  }
  var panelDark = panels.map(isDarkPanel);

  /* ---------- pluriball: la bobina si srotola ---------- */
  var wrap = document.querySelector('#pluriball');
  var wrapParts = null;

  if (wrap) {
    var SHEET = { x0: 60, x1: 892, y0: 110, y1: 360 };
    var bubblesGroup = wrap.querySelector('.bubbles');
    var bubbles = [];
    var NS = 'http://www.w3.org/2000/svg';

    for (var row = 0; row < 4; row++) {
      var cy = SHEET.y0 + 26 + row * 52;
      var offset = (row % 2) * 26;
      for (var cx = SHEET.x0 + 26 + offset; cx < SHEET.x1 - 10; cx += 52) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', cy);
        c.setAttribute('r', 17);
        c.setAttribute('fill', 'url(#bubbleGrad)');
        c.setAttribute('stroke', 'rgba(255,255,255,.22)');
        bubblesGroup.appendChild(c);
        bubbles.push({ el: c, cx: cx });
      }
    }

    wrapParts = {
      clip: wrap.querySelector('.sheet-clip'),
      edge: wrap.querySelector('.sheet-edge'),
      spin: wrap.querySelector('.roll-spin'),
      bar: wrap.querySelector('.wrap-bar span'),
      captions: Array.prototype.slice.call(wrap.querySelectorAll('.wrap-caption')),
      bubbles: bubbles,
      sheet: SHEET
    };
  }

  function updateWrap() {
    if (!wrapParts) return;
    var p;
    if (isReduced()) {
      p = 1;
    } else {
      var travel = wrap.offsetHeight - window.innerHeight;
      p = travel > 40 ? clamp(-wrap.getBoundingClientRect().top / travel, 0, 1) : 1;
    }

    var s = wrapParts.sheet;
    var w = (s.x1 - s.x0) * p;
    var edge = s.x1 - w;

    wrapParts.clip.setAttribute('x', edge.toFixed(1));
    wrapParts.clip.setAttribute('width', w.toFixed(1));
    wrapParts.edge.setAttribute('d', 'M' + edge.toFixed(1) + ' ' + s.y0 + ' V' + s.y1);
    wrapParts.spin.style.transform = 'rotate(' + (-p * 680).toFixed(1) + 'deg) scale(' + (1 - p * 0.3).toFixed(3) + ')';
    wrapParts.bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';

    wrapParts.bubbles.forEach(function (b) {
      var t = clamp((b.cx - edge - 4) / 70, 0, 1);
      b.el.style.opacity = t.toFixed(2);
      b.el.style.transform = 'scale(' + (0.35 + 0.65 * t).toFixed(3) + ')';
    });

    var active = p < 0.32 ? 0 : (p < 0.68 ? 1 : 2);
    wrapParts.captions.forEach(function (cap, i) { cap.classList.toggle('is-on', i === active); });
  }

  /* ---------- scroll: header, avanzamento, punti, parallax ---------- */
  var progress = document.querySelector('.scroll-progress span');
  var toTop = document.querySelector('.to-top');
  var heroMedia = document.querySelector('.hero-media');
  var hero = document.querySelector('.hero');
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var lastY = window.scrollY;
  var ticking = false;
  var activeDot = -1;

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: isReduced() ? 'auto' : 'smooth' });
    });
  }

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;

    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

    if (header) {
      header.classList.toggle('solid', y > 60);
      header.classList.toggle('hidden', y > lastY && y > 320 && !menuOpen);
    }
    if (toTop) toTop.classList.toggle('show', y > vh * 0.9);

    // pannello corrente
    var current = -1;
    for (var i = 0; i < panels.length; i++) {
      var r = panels[i].getBoundingClientRect();
      if (r.top <= vh * 0.42 && r.bottom > vh * 0.42) { current = i; break; }
    }
    if (current !== activeDot && current > -1) {
      activeDot = current;
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      if (dotsNav) dotsNav.classList.toggle('on-dark', panelDark[current]);
    }

    updateWrap();

    if (!isReduced()) {
      if (hero && heroMedia) {
        var b = hero.getBoundingClientRect();
        if (b.bottom > 0) heroMedia.style.transform = 'translateY(' + (Math.max(0, -b.top) * 0.16) + 'px) scale(1.04)';
      }
      parallaxItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var amount = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        el.style.transform = 'translate3d(0,' + ((rect.top + rect.height / 2 - vh / 2) * -amount).toFixed(1) + 'px,0)';
      });
    }

    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', function () {
    panelDark = panels.map(isDarkPanel);
    activeDot = -1;
    onScroll();
  });
  onScroll();

  /* ---------- disegno tecnico: deriva leggera allo scroll ---------- */
  var scene = document.querySelector('.technical-preview');
  var lines = document.querySelector('.drawing-lines');
  if (scene && lines) {
    window.addEventListener('scroll', function () {
      if (isReduced() || window.innerWidth < 900) return;
      var rect = scene.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var p = clamp((rect.top - window.innerHeight * 0.3) / window.innerHeight, -1, 1);
      lines.style.transform = 'translateY(' + (p * 16) + 'px) rotate(' + (p * 2) + 'deg)';
    }, { passive: true });
  }

  /* ---------- pulsanti magnetici ---------- */
  if (finePointer.matches && !isReduced()) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (event) {
        var rect = el.getBoundingClientRect();
        el.style.transform = 'translate(' +
          ((event.clientX - rect.left - rect.width / 2) * 0.18).toFixed(1) + 'px,' +
          ((event.clientY - rect.top - rect.height / 2) * 0.28).toFixed(1) + 'px)';
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
