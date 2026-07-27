import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Un solo linguaggio di motion per tutto il sito
export const EASE = 'power3.inOut';
export const EASE_OUT = 'power3.out';
export const DURATION = { fast: 0.3, base: 0.6, slow: 1.1 };

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;

export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function destroySmoothScroll() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
}

export function scrollToSection(target) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
}

/*
 * Sistema globale di reveal e parallax:
 *  - [data-reveal] entra dal basso quando incontra il viewport
 *    (data-reveal-delay per lo stagger manuale)
 *  - [data-parallax="0.2"] scorre più lento/veloce dello scroll (scrub)
 */
export function initScrollFX(root = document) {
  if (prefersReducedMotion()) {
    document.documentElement.classList.add('no-motion');
    return () => {};
  }

  const ctx = gsap.context(() => {
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          delay: parseFloat(el.dataset.revealDelay || 0),
          ease: EASE_OUT,
          scrollTrigger: { trigger: el, start: 'top 86%' },
        }
      );
    });

    root.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || 0.2);
      gsap.to(el, {
        yPercent: speed * -100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  });

  return () => ctx.revert();
}

export { gsap, ScrollTrigger };
