import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const MODULE_FILTERS = ['ALL', 'demand', 'orders', 'logistics', 'ui']

function ActivityPanel({ items = [], title = 'Activity Stream' }) {
  const [moduleFilter, setModuleFilter] = useState('ALL')

  const filteredItems = useMemo(() => {
    if (moduleFilter === 'ALL') return items
    return items.filter((item) => `${item.module || ''}`.toLowerCase() === moduleFilter)
  }, [items, moduleFilter])

  const getQuickActions = (item) => {
    const metadata = item.metadata || {}
    const actions = []

    if (metadata.order_id) {
      actions.push({ label: `Order #${metadata.order_id}`, href: `/orders/${metadata.order_id}` })
    }
    if (metadata.shipment_id) {
      actions.push({ label: `Shipment #${metadata.shipment_id}`, href: `/logistics/shipment-tracking?q=${encodeURIComponent(metadata.shipment_id)}` })
    }
    if (metadata.demand_post_id) {
      actions.push({ label: `Demand #${metadata.demand_post_id}`, href: `/demand-board?q=${encodeURIComponent(metadata.demand_post_id)}` })
    }
    if (metadata.trip_id) {
      actions.push({ label: `Trip #${metadata.trip_id}`, href: '/logistics/trip-planner' })
    }

    return actions
  }

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
            {getQuickActions(item).length > 0 ? (
              <div className="activity-actions">
                {getQuickActions(item).map((action) => (
                  <Link key={`${item.id}-${action.label}`} className="chip" to={action.href}>{action.label}</Link>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {filteredItems.length === 0 ? <p className="empty-description">No activity found for this module filter.</p> : null}
    </section>
  )
}

export default ActivityPanel
