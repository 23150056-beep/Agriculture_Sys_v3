function Timeline({ items }) {
  if (!items || items.length === 0) return null

  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.id || `${item.from_status}-${item.to_status}-${item.changed_at}`} className="timeline-item">
          <p className="timeline-title">{item.from_status || 'START'} to {item.to_status}</p>
          {item.changed_by_name ? <p className="timeline-meta">By {item.changed_by_name}</p> : null}
          {item.changed_at ? <p className="timeline-meta">{new Date(item.changed_at).toLocaleString()}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export default Timeline
