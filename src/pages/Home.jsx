import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Box, Recycle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    // Hero Animations
    const heroElements = heroRef.current.children;
    gsap.fromTo(heroElements, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );

    // Features Animations on Scroll
    const featureCards = featuresRef.current.querySelectorAll('.feature-card');
    gsap.fromTo(featureCards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        }
      }
    );

  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="section flex items-center justify-center" style={{ minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
        <div className="container text-center" ref={heroRef} style={{ zIndex: 1 }}>
          <h1 style={{ marginBottom: '1.5rem' }}>
            Soluzioni di <span className="text-brand">Imballaggio</span><br />
            Professionali per il tuo Business
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Produzione e fornitura di scatole e imballaggi personalizzati. 
            Qualità artigianale, precisione industriale.
          </p>
          <div className="flex gap-md justify-center">
            <Link to="/prodotti" className="btn btn-primary">
              Scopri i Prodotti <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/preventivo" className="btn btn-outline">
              Richiedi Preventivo
            </Link>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(154,205,128,0.15) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0, borderRadius: '50%'
        }}></div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <h2>Perché Scegliere <span className="text-brand">Imballaggi 2G</span></h2>
            <p className="text-secondary">Affidabilità e innovazione al servizio della tua logistica.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-lg" ref={featuresRef}>
            <div className="feature-card flex flex-col items-center text-center p-6" style={{ padding: '2rem', backgroundColor: 'var(--color-surface-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(154,205,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Box size={32} className="text-brand" />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Qualità Premium</h3>
              <p className="text-secondary">Materiali resistenti e design curato per proteggere al meglio i tuoi prodotti.</p>
            </div>

            <div className="feature-card flex flex-col items-center text-center p-6" style={{ padding: '2rem', backgroundColor: 'var(--color-surface-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(154,205,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Recycle size={32} className="text-brand" />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Ecosostenibile</h3>
              <p className="text-secondary">Imballaggi progettati con un occhio di riguardo per l'ambiente e il riciclo.</p>
            </div>

            <div className="feature-card flex flex-col items-center text-center p-6" style={{ padding: '2rem', backgroundColor: 'var(--color-surface-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(154,205,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldCheck size={32} className="text-brand" />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Affidabilità</h3>
              <p className="text-secondary">Consegne puntuali e assistenza dedicata per un servizio senza pensieri.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
