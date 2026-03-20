import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ui-density-mode'

const readInitialMode = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'compact' || saved === 'comfortable') return saved
  return 'comfortable'
}

export function useDensityMode() {
  const [mode, setMode] = useState(readInitialMode)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  return { mode, setMode }
}

export default useDensityMode
