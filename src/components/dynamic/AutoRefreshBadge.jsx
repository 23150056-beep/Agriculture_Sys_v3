import useLiveTimestamp from '../../hooks/useLiveTimestamp'

function DynamicAutoRefreshBadge({ active, seconds, lastUpdated, onToggle, onRefresh }) {
  useLiveTimestamp(1000, active)

  return (
    <span className={`auto-refresh-badge ${active ? 'active' : ''}`}>
      {active ? `Live refresh ${seconds}s` : 'Refresh paused'}
      {lastUpdated ? ` • Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ''}
      <button type="button" className="mini-action" onClick={onToggle}>{active ? 'Pause' : 'Resume'}</button>
      <button type="button" className="mini-action" onClick={onRefresh}>Refresh</button>
    </span>
  )
}

export default DynamicAutoRefreshBadge
