function EmptyState({ title = 'No data yet', description, action }) {
  return (
    <div className="card empty-state">
      <p className="empty-title">{title}</p>
      {description ? <p className="empty-description">{description}</p> : null}
      {action || null}
    </div>
  )
}

export default EmptyState
