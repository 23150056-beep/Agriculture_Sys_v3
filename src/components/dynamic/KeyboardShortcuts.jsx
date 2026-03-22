function KeyboardShortcuts({ onOpenPalette }) {
  return (
    <button type="button" className="shortcut-pill" onClick={onOpenPalette} title="Open Command Palette (Ctrl/Cmd + K)">
      Ctrl/Cmd K
    </button>
  )
}

export default KeyboardShortcuts
