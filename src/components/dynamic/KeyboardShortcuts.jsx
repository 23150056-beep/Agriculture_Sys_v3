function KeyboardShortcuts({ onOpenPalette }) {
  return (
    <button type="button" className="shortcut-pill" onClick={onOpenPalette}>
      Ctrl/Cmd + K
    </button>
  )
}

export default KeyboardShortcuts
