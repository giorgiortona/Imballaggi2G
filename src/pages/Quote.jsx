import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Quote = () => {
  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="section container flex justify-center">
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h1 className="text-brand">Richiedi Preventivo</h1>
          <p className="text-secondary">Compila il modulo per ricevere un'offerta personalizzata.</p>
        </div>

        <form 
          ref={formRef}
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex-col gap-sm">
            <label htmlFor="name" style={{ fontWeight: 500 }}>Nome e Cognome / Azienda</label>
            <input type="text" id="name" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-tertiary)' }} placeholder="Inserisci il tuo nome" />
          </div>
          
          <div className="flex-col gap-sm">
            <label htmlFor="email" style={{ fontWeight: 500 }}>Email</label>
            <input type="email" id="email" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-tertiary)' }} placeholder="iltuo@indirizzo.it" />
          </div>
          
          <div className="flex-col gap-sm">
            <label htmlFor="details" style={{ fontWeight: 500 }}>Dettagli Richiesta</label>
            <textarea id="details" rows="5" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-tertiary)', resize: 'vertical' }} placeholder="Descrivi le tue necessità..."></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Invia Richiesta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Quote;
