import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { PawMark } from '../components/Brand';

const IllusCoprispalle = () => (
  <svg viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M110 14 c 0 -8 12 -8 12 0 c 0 6 -12 6 -12 14" />
    <circle cx="110" cy="34" r="6" />
    <path d="M110 40 C 74 44 44 66 30 96 C 26 104 30 112 40 112 L 180 112 C 190 112 194 104 190 96 C 176 66 146 44 110 40 Z" />
    <path d="M40 112 L 44 176 C 44 182 48 186 54 186 L 166 186 C 172 186 176 182 176 176 L 180 112" />
    <path d="M58 132 L 162 132" strokeDasharray="6 8" />
    <path d="M64 158 L 156 158" strokeDasharray="6 8" opacity="0.55" />
  </svg>
);

const IllusPluriball = () => (
  <svg viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="40" y="46" width="140" height="140" rx="14" />
    <path d="M40 60 L 52 22 C 53 18 57 16 61 16 L 159 16 C 163 16 167 18 168 22 L 180 60" />
    {Array.from({ length: 4 }).map((_, r) =>
      Array.from({ length: 4 }).map((__, c) => (
        <circle key={`${r}-${c}`} cx={68 + c * 28} cy={76 + r * 28} r="9" opacity={r % 2 === c % 2 ? 1 : 0.5} />
      ))
    )}
  </svg>
);

const IllusCoprisedia = () => (
  <svg viewBox="0 0 220 200" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M70 16 C 70 10 76 8 82 8 L 138 8 C 144 8 150 10 150 16 L 150 96 L 70 96 Z" />
    <path d="M62 96 L 158 96 C 166 96 170 102 168 110 L 164 128 C 163 133 158 136 152 136 L 68 136 C 62 136 57 133 56 128 L 52 110 C 50 102 54 96 62 96 Z" />
    <path d="M64 136 L 58 186 M 156 136 L 162 186" />
    <path d="M84 30 L 136 30" strokeDasharray="6 8" opacity="0.55" />
    <path d="M84 52 L 136 52" strokeDasharray="6 8" opacity="0.55" />
    <path d="M150 22 C 168 30 174 44 172 60" opacity="0.5" />
  </svg>
);

const PRODUCTS = [
  {
    num: '01',
    name: 'CopriSpalle',
    desc: `Il coprispalle in polietilene protegge i capi appesi da polvere, luce e
      sfregamenti: la soluzione quotidiana di lavanderie, sartorie, retail e
      industria tessile. Disponibile in bobina o in fogli singoli, anche
      personalizzato con la tua grafica.`,
    tags: ['PE riciclato', 'In bobina o fogli', 'Personalizzabile'],
    Illus: IllusCoprispalle,
  },
  {
    num: '02',
    name: 'Bustine in Pluriball',
    desc: `Bustine a bolle d'aria che assorbono gli urti e vestono su misura oggetti
      fragili, componentistica ed e-commerce. Formati standard o a disegno,
      con o senza patella di chiusura.`,
    tags: ['Anti-urto', 'Su misura', 'Con patella'],
    Illus: IllusPluriball,
  },
  {
    num: '03',
    name: 'Coprisedie',
    desc: `Il coprisedia in film protettivo ripara sedute e imbottiti da polvere,
      graffi e umidità: ideale per eventi e catering, traslochi, logistica e
      industria del mobile imbottito.`,
    tags: ['Eventi & contract', 'Resistente', 'Riciclabile'],
    Illus: IllusCoprisedia,
  },
];

const Products = () => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: sezione pinnata, le card scorrono in orizzontale (scrub)
      mm.add('(min-width: 900px)', () => {
        const track = trackRef.current;
        const getDistance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });

      // Mobile: semplice reveal in sequenza
      mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray('.product-card').forEach((card) => {
          gsap.fromTo(card,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 88%' },
            }
          );
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="products" id="prodotti" ref={rootRef}>
      <div className="container products-head">
        <span className="eyebrow" data-reveal>I nostri prodotti</span>
        <h2 className="section-title" data-reveal>
          Tre specialità,<br />una sola <span className="accent">filiera green</span>.
        </h2>
        <p className="section-lead" data-reveal>
          Ogni prodotto nasce dalla linea Plastica Seconda Vita: polietilene
          proveniente da processi di riciclo, con tutta la value chain coinvolta
          in un'economia circolare degli imballaggi flessibili.
        </p>
      </div>
      <div className="container-track">
        <div className="products-track" ref={trackRef}>
          {PRODUCTS.map(({ num, name, desc, tags, Illus }) => (
            <article className="product-card" key={num}>
              <span className="product-num">{num}</span>
              <div className="product-illus">
                <Illus />
              </div>
              <h3>{name}</h3>
              <p>{desc}</p>
              <div className="product-tags">
                {tags.map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
              <div className="product-line">
                <PawMark size={22} /> Linea Tiger Film · Plastica Seconda Vita
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
