function ActionCards({ actions = [] }) {
  if (!actions.length) {
    return <p>No guided actions available.</p>
  }

  return (
    <div className="card-grid">
      {actions.map((item) => (
        <article key={item.id} className="card">
          <h4>{item.title}</h4>
          <p>Type: {item.action_type}</p>
          <p>Priority: {item.priority}</p>
          <p>Status: {item.is_done ? 'Done' : 'Pending'}</p>
        </article>
      ))}
    </div>
  )
}

export default ActionCards
