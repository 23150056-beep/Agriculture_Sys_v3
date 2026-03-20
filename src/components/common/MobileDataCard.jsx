function MobileDataCard({ title, rows, actions }) {
  return (
    <article className="card mobile-data-card">
      <h3>{title}</h3>
      <div className="mobile-kv">
        {rows.map((entry) => (
          <p key={entry.label}><strong>{entry.label}:</strong> {entry.value}</p>
        ))}
      </div>
      {actions ? <div className="mobile-card-actions">{actions}</div> : null}
    </article>
  )
}

export default MobileDataCard
