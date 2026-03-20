import { useCallback, useEffect, useMemo, useState } from 'react'
import { clearActivityLog, getActivityLog, syncActivityLogFromServer } from '../utils/activityLog'

function useActivityLog() {
  const [entries, setEntries] = useState(() => getActivityLog())

  const latest = useMemo(() => entries.slice(0, 12), [entries])

  const refresh = useCallback(() => {
    syncActivityLogFromServer()
      .then((remote) => setEntries(remote))
      .catch(() => setEntries(getActivityLog()))
  }, [])

  const clear = useCallback(() => {
    clearActivityLog()
    refresh()
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    entries: latest,
    refresh,
    clear,
  }
}

export default useActivityLog
