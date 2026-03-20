function SkeletonLoader({ lines = 3, variant = 'text' }) {
  const classes = {
    text: 'skeleton-line',
    card: 'skeleton-card',
    table: 'skeleton-table-row',
  }

  const lineClass = classes[variant] || classes.text

  return (
    <div className={`skeleton-wrap ${variant}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={lineClass} style={{ animationDelay: `${index * 80}ms` }} />
      ))}
    </div>
  )
}

export default SkeletonLoader
