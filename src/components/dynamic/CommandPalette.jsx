import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

function CommandPalette({ open, onClose, actions }) {
  const [query, setQuery] = useState('')

  const filteredActions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return actions
    return actions.filter((action) => {
      const tags = `${action.label} ${action.hint || ''} ${(action.keywords || []).join(' ')}`.toLowerCase()
      return tags.includes(term)
    })
  }, [actions, query])

  if (!open) return null

  return (
    <div className="palette-overlay" onClick={onClose} role="presentation">
      <div className="palette-panel" onClick={(event) => event.stopPropagation()}>
        <div className="palette-search">
          <Search size={16} />
          <input
            autoFocus
            placeholder="Type a command or page..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ul className="palette-list">
          {filteredActions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="palette-item"
                onClick={() => {
                  action.onSelect()
                  setQuery('')
                  onClose()
                }}
              >
                <span>{action.label}</span>
                <small>{action.hint || ''}</small>
              </button>
            </li>
          ))}
          {filteredActions.length === 0 ? <li className="palette-empty">No matching command</li> : null}
        </ul>
      </div>
    </div>
  )
}

export default CommandPalette
