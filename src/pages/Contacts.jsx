import { MapPin, Phone, Mail } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="section container">
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 className="text-brand">Contatti</h1>
        <p className="text-secondary">Siamo a tua disposizione per qualsiasi informazione.</p>
      </div>

      <div className="grid grid-cols-2 gap-xl">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin className="text-brand" /> Dove Siamo
            </h3>
            <p className="text-secondary">
              Imballaggi 2G<br />
              Sannicola (LE)<br />
              Italia
            </p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone className="text-brand" /> Telefono
            </h3>
            <p className="text-secondary">0833 861000</p>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail className="text-brand" /> Email
            </h3>
            <p className="text-secondary">info@imballaggi2g.it</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-lg)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-muted">Mappa Placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
