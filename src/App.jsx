import { useEffect, useState } from 'react';
import './styles/site.css';
import { initSmoothScroll, destroySmoothScroll, initScrollFX, ScrollTrigger } from './lib/motion';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Hero from './sections/Hero';
import Products from './sections/Products';
import Story from './sections/Story';
import Sustainability from './sections/Sustainability';
import Certifications from './sections/Certifications';
import Contact from './sections/Contact';
import Footer from './components/Footer';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  // Reveal e parallax globali partono solo a intro conclusa
  useEffect(() => {
    if (!ready) return undefined;
    const cleanup = initScrollFX();
    ScrollTrigger.refresh();
    return cleanup;
  }, [ready]);

  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Header />
      <main>
        <Hero ready={ready} />
        <Products />
        <Story />
        <Sustainability />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
