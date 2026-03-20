import { useCallback, useEffect, useState } from 'react'

export function useAutoRefresh(onRefresh, options = {}) {
  const { intervalMs = 45000, enabled = true } = options
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isActive, setIsActive] = useState(enabled)

  const refreshNow = useCallback(async () => {
    await onRefresh()
    setLastUpdated(Date.now())
  }, [onRefresh])

  useEffect(() => {
    if (!isActive) return undefined
    const timer = setInterval(() => {
      if (document.hidden) return
      refreshNow()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs, isActive, refreshNow])

  return {
    isActive,
    setIsActive,
    lastUpdated,
    refreshNow,
  }
}

export default useAutoRefresh
