import InteractiveChartCard from '../common/InteractiveChartCard'

function DrilldownChartCard({ title, summary, points, range, labels = [], onPointSelect }) {
  return (
    <div className="drilldown-chart-card">
      <InteractiveChartCard title={title} summary={summary} points={points} range={range} />
      {labels.length > 0 ? (
        <div className="drilldown-actions">
          {labels.map((label, index) => (
            <button key={label} type="button" onClick={() => onPointSelect(index, label)}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default DrilldownChartCard
