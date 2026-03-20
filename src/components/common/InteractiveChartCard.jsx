import StatSparkline from './StatSparkline'

function InteractiveChartCard({ title, summary, points, range }) {
  return (
    <article className="card chart-card">
      <header className="chart-head">
        <h3>{title}</h3>
        <span>{range}</span>
      </header>
      <p className="chart-summary">{summary}</p>
      <StatSparkline points={points} />
    </article>
  )
}

export default InteractiveChartCard
