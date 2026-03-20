import { useMemo, useState } from 'react'
import { clearActivityLog, getActivityLog } from '../utils/activityLog'

function useActivityLog() {
  const [entries, setEntries] = useState(() => getActivityLog())

  const latest = useMemo(() => entries.slice(0, 12), [entries])

  const refresh = () => {
    setEntries(getActivityLog())
  }

  const clear = () => {
    clearActivityLog()
    refresh()
  }

  return {
    entries: latest,
    refresh,
    clear,
  }
}

export default useActivityLog
