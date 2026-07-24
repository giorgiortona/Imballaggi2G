import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const products = [
  { id: 1, name: 'Scatole di Cartone', desc: 'Imballaggi classici e resistenti per spedizioni.' },
  { id: 2, name: 'Imballaggi Alimentari', desc: 'Soluzioni sicure e certificate per il food.' },
  { id: 3, name: 'Nastri Adesivi', desc: 'Nastri personalizzati per sigillare in sicurezza.' },
  { id: 4, name: 'Pluriball e Protezioni', desc: 'Materiale protettivo per oggetti fragili.' },
  { id: 5, name: 'Scatole Fustellate', desc: 'Design personalizzato e chiusure ad incastro.' },
  { id: 6, name: 'Shopper Carta', desc: 'Buste ecologiche per negozi e boutique.' },
];

const Products = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current.children;
    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="section container">
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 className="text-brand">I Nostri Prodotti</h1>
        <p className="text-secondary">Esplora il nostro catalogo di soluzioni per l'imballaggio.</p>
      </div>

      <div className="grid grid-cols-3 gap-md" ref={gridRef}>
        {products.map(product => (
          <div key={product.id} style={{
            padding: '2rem',
            backgroundColor: 'var(--color-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            transition: 'transform var(--transition-fast)'
          }}
          className="hover-card"
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -5, duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.name}</h3>
            <p className="text-muted">{product.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
