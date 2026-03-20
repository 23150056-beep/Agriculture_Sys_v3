import { Bell, CheckCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

function NotificationCenter({ items = [], onOpenItem, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [readMap, setReadMap] = useState({})

  const unreadCount = useMemo(
    () => items.filter((item) => !readMap[item.id]).length,
    [items, readMap],
  )

  const markAllRead = () => {
    const next = {}
    items.forEach((item) => {
      next[item.id] = true
    })
    setReadMap(next)
  }

  const markRead = (itemId) => {
    setReadMap((prev) => ({ ...prev, [itemId]: true }))
  }

  return (
    <div className="notification-wrap">
      <button type="button" className="icon-button" onClick={() => setOpen((prev) => !prev)}>
        <Bell size={16} />
        {unreadCount > 0 ? <span className="badge-dot">{unreadCount}</span> : null}
      </button>
      {open ? (
        <section className="notification-panel">
          <header>
            <strong>Notifications</strong>
            <div className="notification-actions">
              {onRefresh ? <button type="button" className="ghost-button" onClick={onRefresh}>Refresh</button> : null}
              <button type="button" className="ghost-button" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all
              </button>
            </div>
          </header>
          <ul>
            {items.map((item) => (
              <li key={item.id} className={readMap[item.id] ? 'read' : ''}>
                <button
                  type="button"
                  className="notification-item"
                  onClick={() => {
                    markRead(item.id)
                    if (onOpenItem) onOpenItem(item)
                    setOpen(false)
                  }}
                >
                  <p>{item.title}</p>
                  <small>{item.timeLabel}</small>
                </button>
              </li>
            ))}
            {items.length === 0 ? <li className="read">No notifications</li> : null}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default NotificationCenter
