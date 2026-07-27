import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';

const MILESTONES = [
  {
    label: 'Le origini',
    title: 'Una bottega del packaging nel Salento',
    text: `Imballaggi 2G nasce a Sannicola, in provincia di Lecce, in Zona
      Industriale: una realtà familiare che cresce servendo lavanderie,
      artigiani e imprese del territorio.`,
  },
  {
    label: "L'esperienza",
    title: "Decenni di estetica e innovazione",
    text: `Da decenni abbiamo a cuore l'estetica e l'innovazione nel campo degli
      imballaggi e del packaging di ogni genere, con una politica di
      interazione, attenzione e flessibilità alle esigenze di ogni cliente.`,
  },
  {
    label: 'La svolta green',
    title: 'Primi nel Salento a credere nella Green Economy',
    text: `Certifichiamo l'azienda e i prodotti: nasce la linea Plastica Seconda
      Vita, con polietilene proveniente da una filiera controllata di riciclo
      e il marchio Tiger Film per i progetti in ambito sostenibilità.`,
  },
  {
    label: 'Oggi',
    title: 'Una rete sul territorio: 2G Puglia',
    text: `Con il marchio 2G Puglia — Plastic Second Life consegniamo una targa
      alle aziende clienti che scelgono prodotti certificati: una rete di
      realtà amiche dell'ambiente, per rendere la nostra casa la casa di tutti.`,
  },
];

const Story = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      // la linea verde della timeline avanza con lo scroll
      gsap.to('.timeline-rail i', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 70%',
          end: 'bottom 55%',
          scrub: true,
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" id="storia" ref={rootRef}>
      <div className="container story-grid">
        <div className="story-sticky">
          <span className="eyebrow" data-reveal>La nostra storia</span>
          <h2 className="section-title" data-reveal>
            Dal Salento,<br />con il futuro <span className="accent">a cuore</span>.
          </h2>
          <p className="section-lead" data-reveal>
            Il nostro compito è permettere a chi ogni giorno confeziona, protegge
            e imballa di avere un fornitore capace di offrire prodotti
            certificati, provenienti da una filiera controllata di riciclo.
          </p>
          <blockquote className="story-quote" data-reveal>
            «Scegliere un'economia circolare vuol dire scegliere il Futuro.»
          </blockquote>
        </div>
        <div className="timeline">
          <div className="timeline-rail" aria-hidden="true"><i /></div>
          {MILESTONES.map((m, i) => (
            <div className="milestone" key={m.label} data-reveal data-reveal-delay={i * 0.05}>
              <span className="milestone-label">{m.label}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Story;
