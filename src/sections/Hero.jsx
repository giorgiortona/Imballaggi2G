import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, EASE_OUT, prefersReducedMotion, scrollToSection } from '../lib/motion';
import { Turtle } from '../components/Brand';

const MARQUEE = [
  'Plastica Seconda Vita',
  'Economia Circolare',
  'Tiger Film',
  '2G Puglia — Plastic Second Life',
  'Sannicola · Salento',
];

const Hero = ({ ready }) => {
  const rootRef = useRef(null);

  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        size: 12 + ((i * 37) % 46),
        duration: 12 + ((i * 53) % 14),
        delay: -((i * 29) % 18),
      })),
    []
  );

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.set('.hero-title .line > span, .hero-sub, .hero-ctas, .hero-eyebrow', {
          opacity: 0,
          yPercent: 100,
        });
        gsap.set('.hero-turtle, .hero-scrollhint, .marquee', { opacity: 0 });
      }
      if (!ready || reduced) return;

      gsap.timeline({ defaults: { ease: EASE_OUT } })
        .to('.hero-eyebrow', { opacity: 1, yPercent: 0, duration: 0.7 }, 0.05)
        .to('.hero-title .line > span', {
          opacity: 1,
          yPercent: 0,
          duration: 1.1,
          stagger: 0.12,
        }, 0.15)
        .to('.hero-sub', { opacity: 1, yPercent: 0, duration: 0.8 }, 0.55)
        .to('.hero-ctas', { opacity: 1, yPercent: 0, duration: 0.8 }, 0.7)
        .to('.hero-turtle', { opacity: 1, duration: 1.4 }, 0.8)
        .to('.hero-scrollhint, .marquee', { opacity: 1, duration: 0.9 }, 1);
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="hero" id="top" ref={rootRef}>
      <span className="hero-watermark" aria-hidden="true">2g</span>
      <div className="hero-bubbles" aria-hidden="true">
        {bubbles.map((b, i) => (
          <span
            key={i}
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-turtle" data-parallax="0.25" aria-hidden="true">
        <Turtle size={190} />
      </div>

      <div className="container hero-content">
        <span className="eyebrow hero-eyebrow">Imballaggi flessibili · dal Salento</span>
        <h1 className="hero-title">
          <span className="line"><span>Alla plastica</span></span>
          <span className="line"><span>diamo una</span></span>
          <span className="line"><span className="accent">seconda vita.</span></span>
        </h1>
        <p className="hero-sub">
          Coprispalle, bustine in pluriball e coprisedie prodotti con polietilene
          proveniente da filiera controllata di riciclo. Siamo i primi nel Salento
          ad aver creduto nella Green Economy dell'industria del packaging.
        </p>
        <div className="hero-ctas">
          <a
            href="#prodotti"
            className="btn btn-primary"
            onClick={(e) => { e.preventDefault(); scrollToSection('#prodotti'); }}
          >
            Scopri i prodotti <ArrowRight size={17} />
          </a>
          <a
            href="#contatti"
            className="btn btn-ghost"
            onClick={(e) => { e.preventDefault(); scrollToSection('#contatti'); }}
          >
            Richiedi un preventivo
          </a>
        </div>
      </div>

      <div className="hero-scrollhint">Scorri</div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-inner">
          {[0, 1].map((dup) => (
            <span className="marquee-item" key={dup}>
              {MARQUEE.map((item) => (
                <span className="marquee-item" key={item}>
                  {item} <i />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
