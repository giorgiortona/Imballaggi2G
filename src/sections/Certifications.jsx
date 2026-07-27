import { useEffect, useRef } from 'react';
import { Award, Globe, Landmark, BookOpen } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { Turtle } from '../components/Brand';

const CERTS = [
  {
    Icon: Award,
    title: 'Plastica Seconda Vita — IPPR',
    text: `La prima etichetta ecologica creata in Italia e in Europa per materiali
      e prodotti in plastica riciclata, promossa dall'Istituto per la
      Promozione delle Plastiche da Riciclo (nato da Unionplast, Plastics
      Europe Italia e Corepla).`,
    norms: ['UNI UNIPLAST 10667', 'EN 15343'],
  },
  {
    Icon: BookOpen,
    title: 'Rintracciabilità certificata',
    text: `La certificazione applica il concetto di rintracciabilità dei materiali
      riciclati e ne calcola il contenuto secondo la norma UNI EN ISO 14021,
      con verifiche di parte terza operate da enti di certificazione
      accreditati.`,
    norms: ['UNI EN ISO 14021', 'Verifiche di parte terza'],
  },
  {
    Icon: Globe,
    title: 'PolyCert Europe',
    text: `Aderiamo alla piattaforma europea di certificazione dei polimeri
      riciclati: una garanzia riconosciuta a livello continentale
      sull'origine e sul contenuto di riciclato dei nostri film.`,
    norms: ['Piattaforma europea', 'Polimeri riciclati'],
  },
  {
    Icon: Landmark,
    title: 'CAM — Criteri Ambientali Minimi',
    text: `I nostri prodotti rispondono ai requisiti ambientali per gli Acquisti
      Pubblici Verdi (GPP): il Codice dei contratti (D.lgs. 36/2023, art. 57)
      rende obbligatoria l'applicazione dei CAM nelle gare pubbliche.`,
    norms: ['D.lgs. 36/2023 art. 57', 'GPP'],
  },
];

const Certifications = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      // la tartaruga del marchio si disegna entrando nel viewport
      gsap.to('.puglia-turtle .t-part', {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.08,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.puglia-panel', start: 'top 75%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" id="certificazioni" ref={rootRef}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" data-reveal>Certificazioni</span>
          <h2 className="section-title" data-reveal>
            Qualificati, tracciati,<br /><span className="accent">certificati</span>.
          </h2>
          <p className="section-lead" data-reveal>
            Abbiamo certificato la nostra azienda per dare a chi confeziona,
            protegge e imballa un fornitore capace di garantire prodotti da una
            filiera controllata di riciclo.
          </p>
        </div>

        <div className="certs-grid">
          {CERTS.map(({ Icon, title, text, norms }, i) => (
            <article className="cert-card" key={title} data-reveal data-reveal-delay={(i % 2) * 0.08}>
              <span className="cert-icon"><Icon size={26} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="cert-norms">
                {norms.map((n) => <span className="tag" key={n}>{n}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className="puglia-panel" data-reveal>
          <div className="puglia-turtle">
            <Turtle size={150} className="turtle-draw" title="Tartaruga del marchio 2G Puglia" />
          </div>
          <div>
            <div className="puglia-mark">
              2G Puglia
              <small>Plastic Second Life</small>
            </div>
            <p>
              Il nostro marchio certifica che la tua azienda è amica
              dell'ambiente: ai clienti che adottano una politica di acquisto di
              prodotti certificati Plastica Seconda Vita consegniamo
              un'attestazione e una targa da esporre — per identificare e creare
              una rete sul territorio, e rendere la nostra casa la casa di tutti.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
