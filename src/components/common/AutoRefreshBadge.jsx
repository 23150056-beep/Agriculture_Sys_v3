function AutoRefreshBadge({ seconds = 45, active = true }) {
  return (
    <span className={`auto-refresh-badge ${active ? 'active' : ''}`}>
      {active ? `Live refresh ${seconds}s` : 'Refresh paused'}
    </span>
  )
}

export default AutoRefreshBadge
