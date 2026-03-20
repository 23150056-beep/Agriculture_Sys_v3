import { useEffect, useMemo, useState } from 'react'

function AnimatedKPI({ value = 0, duration = 700 }) {
  const target = useMemo(() => Number(value) || 0, [value])
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const initial = 0
    const delta = target - initial
    let frame

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplay(initial + delta * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return <>{Math.round(display)}</>
}

export default AnimatedKPI
