function KpiCard({ label, value, hint, onClick }) {
  return (
    <article className={`card kpi-card ${onClick ? 'kpi-clickable' : ''}`} onClick={onClick}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value ?? 0}</p>
      {hint ? <p className="kpi-hint">{hint}</p> : null}
    </article>
  )
}

export default KpiCard
