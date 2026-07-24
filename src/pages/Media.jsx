const Media = () => {
  return (
    <div className="section container text-center">
      <h1 className="text-brand">Media</h1>
      <p className="text-secondary" style={{ marginBottom: '3rem' }}>I nostri video e contenuti multimediali.</p>
      
      <div className="grid grid-cols-2 gap-lg">
        {/* Placeholder for YouTube videos based on old site */}
        <div style={{ backgroundColor: 'var(--color-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-surface-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
             <span className="text-muted">Video Placeholder 1</span>
          </div>
          <h3 style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Auguri a tutti i nostri clienti</h3>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-surface-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
             <span className="text-muted">Video Placeholder 2</span>
          </div>
          <h3 style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Ritorneremo più forti di prima</h3>
        </div>
      </div>
    </div>
  );
};

export default Media;
