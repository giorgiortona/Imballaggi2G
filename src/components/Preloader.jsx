import { useEffect, useRef } from 'react';
import { gsap, EASE_OUT, prefersReducedMotion } from '../lib/motion';
import { Turtle, LogoFull } from './Brand';

/*
 * Intro cinematica: la tartaruga si disegna tratto per tratto,
 * il logo compare, il contatore corre a 100% e il pannello
 * scivola via rivelando la pagina (min ~2.4s, come da linee guida).
 */
const Preloader = ({ onDone }) => {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (prefersReducedMotion()) {
      doneRef.current?.();
      return undefined;
    }

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: EASE_OUT },
        onComplete: () => doneRef.current?.(),
      });

      tl.to(counter, {
        v: 100,
        duration: 2.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = `${Math.floor(counter.v)}%`;
          }
        },
      }, 0)
        .to('.t-part', {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: 0.07,
          ease: 'power2.inOut',
        }, 0.1)
        .fromTo('.preloader-logo',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.8 },
          1.2
        )
        .to('.preloader-inner', {
          y: -60,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
        }, 2.35)
        .to(rootRef.current, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
        }, 2.55);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader-inner">
        <Turtle className="turtle-draw" />
        <div className="preloader-logo">
          <LogoFull />
        </div>
      </div>
      <span className="preloader-tag">Plastica Seconda Vita — Sannicola, Salento</span>
      <span className="preloader-count" ref={countRef}>0%</span>
    </div>
  );
};

export default Preloader;
