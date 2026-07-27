import { LogoFull, Turtle } from './Brand';

const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-inner">
      <LogoFull compact />
      <div className="footer-links">
        <a href="#prodotti">Prodotti</a>
        <a href="#storia">Storia</a>
        <a href="#sostenibilita">Sostenibilità</a>
        <a href="#certificazioni">Certificazioni</a>
      </div>
      <span className="footer-turtle" aria-hidden="true"><Turtle size={34} /></span>
      <p className="footer-meta">
        © {new Date().getFullYear()} Imballaggi 2G srls · Zona Industriale, Sannicola (LE) · Tutti i diritti riservati
      </p>
    </div>
  </footer>
);

export default Footer;
