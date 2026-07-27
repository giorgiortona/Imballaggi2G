import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';

const TIGER = [
  { name: 'Tiger Film · Eco Converting', note: 'converting da riciclo' },
  { name: 'Tiger Film · Eco Manuale', note: 'applicazione manuale' },
  { name: 'Tiger Film · Automatico', note: 'linee automatiche' },
];

const STATS = [
  { value: 99, suffix: '%', text: 'delle estinzioni attuali è attribuibile all\'attività antropica: ridurre la plastica vergine è una responsabilità.' },
  { value: 100, suffix: '%', text: 'dei prodotti della linea Plastica Seconda Vita proviene da una filiera controllata di riciclo.' },
  { value: 3, suffix: '', text: 'linee a marchio Tiger Film, nate per dare identità ai progetti di Imballaggi 2G in ambito sostenibilità.' },
];

// Anello dell'economia circolare: Produrre → Utilizzare → Riciclare
const CycleDiagram = () => (
  <svg className="cycle" viewBox="0 0 300 300" aria-hidden="true">
    <g className="cycle-ring" style={{ transformOrigin: '150px 150px' }}>
      {[0, 120, 240].map((rot) => (
        <g key={rot} transform={`rotate(${rot} 150 150)`}>
          <path
            d="M 150 40 A 110 110 0 0 1 245 95"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.9"
          />
          <polygon points="245,95 228,78 224,102" fill="currentColor" />
        </g>
      ))}
    </g>
    <g
      fontFamily="Outfit, sans-serif"
      fontSize="13"
      fontWeight="700"
      letterSpacing="2.5"
      fill="var(--text-2)"
      textAnchor="middle"
    >
      <text x="150" y="16">PRODURRE</text>
      <text x="272" y="235">UTILIZZARE</text>
      <text x="30" y="235">RICICLARE</text>
    </g>
  </svg>
);

const Sustainability = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      // l'anello ruota seguendo lo scroll
      gsap.to('.cycle-ring', {
        rotation: 160,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cycle-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // contatori
      gsap.utils.toArray('.stat-num b').forEach((el) => {
        const target = parseInt(el.dataset.value, 10);
        gsap.fromTo(el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // "TU FAI PARTE DI QUEL PUZZLE" parola per parola
      gsap.fromTo('.puzzle-statement .word',
        { opacity: 0, y: 60, rotateX: -50 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.puzzle-statement', start: 'top 78%' },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="sustain section" id="sostenibilita" ref={rootRef}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" data-reveal>Sostenibilità</span>
          <h2 className="section-title" data-reveal>
            Dall'economia lineare<br />all'<span className="accent">economia circolare</span>.
          </h2>
          <p className="section-lead" data-reveal>
            Sfruttare, produrre, gettare: il modello lineare consuma il pianeta.
            Noi abbiamo scelto il cerchio: produrre, utilizzare, riciclare — e
            ricominciare.
          </p>
        </div>

        <div className="sustain-grid">
          <div className="cycle-wrap" data-reveal>
            <CycleDiagram />
            <div className="cycle-center">
              Economia circolare
              <small>Plastica Seconda Vita</small>
            </div>
          </div>
          <div>
            <h3 data-reveal style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>
              La linea Plastica Seconda Vita
            </h3>
            <p className="section-lead" data-reveal>
              Una linea di prodotti con contenuto di polietilene proveniente da
              processi di riciclo, che coinvolge tutta la value chain nella
              creazione di un'economia circolare per gli imballaggi flessibili.
              Il marchio Tiger Film dà identità ai progetti sviluppati da
              Imballaggi 2G: materiale da fonti rinnovabili o proveniente da
              processi di riciclo.
            </p>
            <div className="tiger-list">
              {TIGER.map((t, i) => (
                <div className="tiger-item" key={t.name} data-reveal data-reveal-delay={i * 0.08}>
                  <strong>{t.name}</strong>
                  <span>{t.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sustain-stats">
          {STATS.map((s, i) => (
            <div className="stat" key={i} data-reveal data-reveal-delay={i * 0.08}>
              <div className="stat-num">
                <b data-value={s.value}>0</b>
                <sup>{s.suffix}</sup>
              </div>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="puzzle-statement">
          <h3 aria-label="Tu fai parte di quel puzzle">
            {'Tu fai parte di quel puzzle'.split(' ').map((w, i) => (
              <span className={`word ${i > 2 ? 'accent' : ''}`} key={i}>{w}</span>
            ))}
          </h3>
          <p data-reveal>
            Ogni specie è un pezzo del puzzle della vita sul pianeta: quando una
            si estingue, quel pezzo va perso per sempre. Scegliere imballaggi in
            plastica riciclata significa custodire la biodiversità — a partire
            dal mare della nostra Puglia e dalle tartarughe che lo abitano.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Sustainability;
