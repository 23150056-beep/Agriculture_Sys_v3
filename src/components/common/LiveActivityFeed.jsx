function LiveActivityFeed({ items = [] }) {
  return (
    <section className="card activity-feed">
      <h3>Live Activity</h3>
      <ul className="list">
        {items.map((item) => (
          <li key={item.id} className="activity-item">
            <p>{item.title}</p>
            <span>{item.timeLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LiveActivityFeed
