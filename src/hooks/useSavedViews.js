import { useMemo, useState } from 'react'

const readViews = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeViews = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value))
}

export function useSavedViews(storageKey) {
  const [views, setViews] = useState(() => readViews(storageKey))
  const [selectedViewId, setSelectedViewId] = useState('')

  const selectedView = useMemo(
    () => views.find((item) => item.id === selectedViewId) || null,
    [views, selectedViewId],
  )

  const saveView = (name, filters) => {
    const entry = {
      id: `view-${Date.now()}`,
      name,
      filters,
      updatedAt: Date.now(),
    }
    const next = [entry, ...views].slice(0, 12)
    setViews(next)
    writeViews(storageKey, next)
    setSelectedViewId(entry.id)
  }

  const deleteView = (viewId) => {
    const next = views.filter((item) => item.id !== viewId)
    setViews(next)
    writeViews(storageKey, next)
    if (selectedViewId === viewId) setSelectedViewId('')
  }

  return {
    views,
    selectedView,
    selectedViewId,
    setSelectedViewId,
    saveView,
    deleteView,
  }
}

export default useSavedViews
