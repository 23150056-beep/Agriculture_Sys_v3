import { useEffect } from 'react'

const isTypingTarget = (target) => {
  if (!target) return false
  const tag = target.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const onKeyDown = (event) => {
      shortcuts.forEach((shortcut) => {
        const ctrlOrMeta = shortcut.ctrlOrMeta ? (event.ctrlKey || event.metaKey) : true
        const shift = shortcut.shift ? event.shiftKey : !event.shiftKey
        const alt = shortcut.alt ? event.altKey : !event.altKey
        if (!ctrlOrMeta || !shift || !alt) return
        if (shortcut.ignoreInInputs !== false && isTypingTarget(event.target)) return
        if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return
        event.preventDefault()
        shortcut.handler(event)
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}

export default useKeyboardShortcuts
