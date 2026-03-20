const RANGES = ['Today', '7d', '30d']

function TimeRangeToggle({ value, onChange }) {
  return (
    <div className="range-toggle" role="tablist" aria-label="Time range">
      {RANGES.map((item) => (
        <button
          key={item}
          type="button"
          className={`range-btn ${value === item ? 'active' : ''}`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeToggle
