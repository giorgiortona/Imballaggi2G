import { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const [form, setForm] = useState({
    nome: '', azienda: '', email: '', telefono: '', prodotto: 'CopriSpalle', messaggio: '',
  });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Richiesta preventivo — ${form.prodotto}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nAzienda: ${form.azienda}\nEmail: ${form.email}\nTelefono: ${form.telefono}\nProdotto: ${form.prodotto}\n\n${form.messaggio}`
    );
    window.location.href = `mailto:info@imballaggi2g.it?subject=${subject}&body=${body}`;
  };

  return (
    <section className="contact section" id="contatti">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow" data-reveal>Contatti & preventivi</span>
          <h2 className="section-title" data-reveal>
            Parliamo del tuo <span className="accent">imballaggio</span>.
          </h2>
          <p className="section-lead" data-reveal>
            Raccontaci cosa devi proteggere: ti rispondiamo con una soluzione su
            misura, certificata e sostenibile.
          </p>
          <ul className="contact-list" data-reveal>
            <li className="contact-item">
              <MapPin size={20} />
              <span>Zona Industriale, 73017 Sannicola (LE) — Puglia</span>
            </li>
            <li className="contact-item">
              <Phone size={20} />
              <a href="tel:+390833861000">0833 86 10 00</a>
            </li>
            <li className="contact-item">
              <Mail size={20} />
              <a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a>
            </li>
          </ul>
          <div className="contact-socials" data-reveal>
            <a className="social-btn" href="https://www.facebook.com/imballaggigiuri/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF size={17} />
            </a>
            <a className="social-btn" href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a className="social-btn" href="https://wa.me/390833861000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>

        <form className="quote-form" onSubmit={submit} data-reveal>
          <div className="form-field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" required value={form.nome} onChange={update} placeholder="Il tuo nome" />
          </div>
          <div className="form-field">
            <label htmlFor="azienda">Azienda</label>
            <input id="azienda" name="azienda" value={form.azienda} onChange={update} placeholder="La tua azienda" />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={update} placeholder="nome@azienda.it" />
          </div>
          <div className="form-field">
            <label htmlFor="telefono">Telefono</label>
            <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={update} placeholder="+39 ..." />
          </div>
          <div className="form-field is-full">
            <label htmlFor="prodotto">Prodotto di interesse</label>
            <select id="prodotto" name="prodotto" value={form.prodotto} onChange={update}>
              <option>CopriSpalle</option>
              <option>Bustine in Pluriball</option>
              <option>Coprisedie</option>
              <option>Altro / soluzione su misura</option>
            </select>
          </div>
          <div className="form-field is-full">
            <label htmlFor="messaggio">Messaggio</label>
            <textarea id="messaggio" name="messaggio" rows="4" value={form.messaggio} onChange={update} placeholder="Quantità, misure, personalizzazioni..." />
          </div>
          <button type="submit" className="btn btn-primary">
            Invia richiesta <Send size={16} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
