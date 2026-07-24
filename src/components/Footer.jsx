import { Package, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid grid grid-cols-4 gap-xl">
          <div className="footer-col">
            <Link to="/" className="footer-logo">
              <Package className="logo-icon" />
              <span className="logo-text">Imballaggi 2G</span>
            </Link>
            <p className="footer-desc text-muted">
              Soluzioni di imballaggio moderne e formali. Qualità, esperienza e passione dal produttore al consumatore.
            </p>
            <div className="social-links flex gap-md">
              <a href="https://www.facebook.com/imballaggigiuri/" target="_blank" rel="noreferrer" className="social-link">
                <FaFacebook size={20} />
              </a>
              <a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noreferrer" className="social-link">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Navigazione</h4>
            <ul className="footer-links">
              <li><Link to="/">Azienda</Link></li>
              <li><Link to="/prodotti">Prodotti</Link></li>
              <li><Link to="/preventivo">Preventivo</Link></li>
              <li><Link to="/media">Media</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contatti</h4>
            <ul className="footer-contact-list text-muted">
              <li className="flex gap-sm items-center">
                <MapPin size={16} className="text-brand" />
                Sannicola (LE)
              </li>
              <li className="flex gap-sm items-center">
                <Phone size={16} className="text-brand" />
                0833 861000
              </li>
              <li className="flex gap-sm items-center">
                <Mail size={16} className="text-brand" />
                info@imballaggi2g.it
              </li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading">Richiedi Preventivo</h4>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Hai bisogno di soluzioni su misura per il tuo business?
            </p>
            <Link to="/preventivo" className="btn btn-primary">Contattaci</Link>
          </div>
        </div>
        
        <div className="footer-bottom flex justify-between items-center">
          <p className="text-muted">&copy; {new Date().getFullYear()} Imballaggi 2G. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
