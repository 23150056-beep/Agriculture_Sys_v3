import { clearActivityEvents, createActivityEvent, getActivityEvents } from '../api/dashboardApi'

const STORAGE_KEY = 'activity-log-v1'

const asDisplayEntry = (entry) => ({
  id: entry.id || `log-${Date.now()}`,
  at: entry.created_at || entry.at || new Date().toISOString(),
  title: entry.message || entry.title || 'Activity event',
  module: entry.module || 'ui',
  action: entry.action || 'event',
})

const readLog = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLog = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export const addActivityLog = (entry) => {
  const next = [
    {
      id: `log-${Date.now()}`,
      at: new Date().toISOString(),
      ...entry,
    },
    ...readLog(),
  ].slice(0, 40)

  writeLog(next)

  // Fire-and-forget sync to backend when available.
  createActivityEvent({
    module: entry.module || 'ui',
    action: entry.action || 'event',
    message: entry.title || 'Activity event',
    metadata: entry.metadata || {},
  })
    .catch(() => {})
}

export const getActivityLog = () => readLog()

export const syncActivityLogFromServer = async () => {
  const { data } = await getActivityEvents()
  const mapped = Array.isArray(data) ? data.map(asDisplayEntry) : []
  writeLog(mapped)
  return mapped
}

export const clearActivityLog = () => {
  localStorage.removeItem(STORAGE_KEY)

  clearActivityEvents().catch(() => {})
}
