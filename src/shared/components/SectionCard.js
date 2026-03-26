function SectionCard({ title, children, actions }) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h2>{title}</h2>
        <div>{actions}</div>
      </div>
      <div className="section-card-body">{children}</div>
    </section>
  );
}

export default SectionCard;

