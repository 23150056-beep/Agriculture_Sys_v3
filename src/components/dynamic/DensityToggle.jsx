function DensityToggle({ mode, onChange }) {
  return (
    <div className="density-toggle" role="group" aria-label="Display density">
      <button
        type="button"
        className={mode === 'comfortable' ? 'active' : ''}
        onClick={() => onChange('comfortable')}
      >
        Cozy
      </button>
      <button
        type="button"
        className={mode === 'compact' ? 'active' : ''}
        onClick={() => onChange('compact')}
      >
        Compact
      </button>
    </div>
  )
}

export default DensityToggle
