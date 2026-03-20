import { useMemo, useState } from 'react'

const MODULE_FILTERS = ['ALL', 'demand', 'orders', 'logistics', 'ui']

function ActivityPanel({ items = [], title = 'Activity Stream' }) {
  const [moduleFilter, setModuleFilter] = useState('ALL')

  const filteredItems = useMemo(() => {
    if (moduleFilter === 'ALL') return items
    return items.filter((item) => `${item.module || ''}`.toLowerCase() === moduleFilter)
  }, [items, moduleFilter])

  return (
    <section className="card activity-panel">
      <div className="exception-head">
        <h3>{title}</h3>
        <span>{filteredItems.length} event{filteredItems.length === 1 ? '' : 's'}</span>
      </div>
      <div className="chip-row activity-filters">
        {MODULE_FILTERS.map((moduleKey) => (
          <button
            key={moduleKey}
            type="button"
            className={`chip ${moduleFilter === moduleKey ? 'active' : ''}`}
            onClick={() => setModuleFilter(moduleKey)}
          >
            {moduleKey}
          </button>
        ))}
      </div>
      <ul className="list">
        {filteredItems.map((item) => (
          <li key={item.id} className="activity-item">
            <p>{item.title || 'Activity event'}</p>
            <span>
              {item.module ? `${item.module} | ` : ''}
              {item.at ? new Date(item.at).toLocaleString() : '-'}
            </span>
          </li>
        ))}
      </ul>
      {filteredItems.length === 0 ? <p className="empty-description">No activity found for this module filter.</p> : null}
    </section>
  )
}

export default ActivityPanel
