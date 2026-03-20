function StatSparkline({ points = [] }) {
  if (!points.length) return null
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const mapped = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 100
    const y = 100 - ((point - min) / range) * 100
    return `${x},${y}`
  })

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={mapped.join(' ')} />
    </svg>
  )
}

export default StatSparkline
