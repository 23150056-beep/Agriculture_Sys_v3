function ScoreBadge({ score }) {
  const safeScore = Number(score ?? 0)
  const tone = safeScore >= 80 ? 'good' : safeScore >= 60 ? 'warn' : 'risk'

  return <span className={`status-chip ${tone}`}>Reliability: {safeScore.toFixed(1)}</span>
}

export default ScoreBadge
