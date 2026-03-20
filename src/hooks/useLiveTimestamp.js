import { useEffect, useState } from 'react'

export function useLiveTimestamp(tickMs = 1000, active = true) {
  const [current, setCurrent] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return undefined
    const timer = setInterval(() => setCurrent(Date.now()), tickMs)
    return () => clearInterval(timer)
  }, [tickMs, active])

  return current
}

export default useLiveTimestamp
