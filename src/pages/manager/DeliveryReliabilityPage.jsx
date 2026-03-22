import ScoreBadge from '../../components/reliability/ScoreBadge'

function DeliveryReliabilityPage() {
  return (
    <section>
      <h2>Delivery Reliability Board</h2>
      <p>Track on-time performance, POD quality, and completion health.</p>
      <ScoreBadge score={84.2} />
    </section>
  )
}

export default DeliveryReliabilityPage
