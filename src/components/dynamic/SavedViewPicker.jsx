import { useState } from 'react'

function SavedViewPicker({ views, selectedViewId, onSelect, onSave, onDelete }) {
  const [name, setName] = useState('')

  return (
    <div className="saved-views">
      <select value={selectedViewId} onChange={(event) => onSelect(event.target.value)}>
        <option value="">Saved views</option>
        {views.map((view) => (
          <option key={view.id} value={view.id}>{view.name}</option>
        ))}
      </select>
      <input
        placeholder="Save current filters as..."
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          if (!name.trim()) return
          onSave(name.trim())
          setName('')
        }}
      >
        Save View
      </button>
      {selectedViewId ? (
        <button type="button" onClick={() => onDelete(selectedViewId)}>Delete</button>
      ) : null}
    </div>
  )
}

export default SavedViewPicker
