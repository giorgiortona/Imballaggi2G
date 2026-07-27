import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollTrigger, scrollToSection } from '../lib/motion';
import { LogoFull } from './Brand';

const NAV = [
  { label: 'Prodotti', href: '#prodotti' },
  { label: 'Storia', href: '#storia' },
  { label: 'Sostenibilità', href: '#sostenibilita' },
  { label: 'Certificazioni', href: '#certificazioni' },
  { label: 'Contatti', href: '#contatti' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const triggers = NAV.map(({ href }) =>
      ScrollTrigger.create({
        trigger: href,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) {
            setActive(href);
          } else {
            setActive((prev) => (prev === href ? '' : prev));
          }
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(href);
  };

  const links = (extra = '') =>
    NAV.map(({ label, href }) => (
      <a
        key={href}
        href={href}
        onClick={(e) => go(e, href)}
        className={`nav-link ${active === href ? 'is-active' : ''} ${extra}`}
      >
        {label}
      </a>
    ));

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <a href="#top" onClick={(e) => go(e, '#top')} aria-label="Imballaggi 2G — home">
            <LogoFull compact />
          </a>
          <nav className="nav-desktop" aria-label="Navigazione principale">
            {links()}
            <a
              href="#contatti"
              onClick={(e) => go(e, '#contatti')}
              className="btn btn-primary nav-cta"
            >
              Richiedi preventivo
            </a>
          </nav>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={open}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>
      <nav className={`nav-mobile ${open ? 'is-open' : ''}`} aria-label="Menu mobile">
        {links()}
      </nav>
    </>
  );
};

export default Header;
