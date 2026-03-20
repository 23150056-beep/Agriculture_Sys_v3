const STORAGE_KEY = 'activity-log-v1'

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
}

export const getActivityLog = () => readLog()

export const clearActivityLog = () => {
  localStorage.removeItem(STORAGE_KEY)
}
