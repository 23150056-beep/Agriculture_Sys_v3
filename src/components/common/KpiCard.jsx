import AnimatedKPI from './AnimatedKPI'

function KpiCard({ label, value, hint, onClick, trend = 0 }) {
  const trendText = trend > 0 ? `+${trend}%` : `${trend}%`

  return (
    <article className={`card kpi-card ${onClick ? 'kpi-clickable' : ''}`} onClick={onClick}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value"><AnimatedKPI value={value ?? 0} /></p>
      <p className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>{trend >= 0 ? '▲' : '▼'} {trendText}</p>
      {hint ? <p className="kpi-hint">{hint}</p> : null}
    </article>
  )
}

export default KpiCard
