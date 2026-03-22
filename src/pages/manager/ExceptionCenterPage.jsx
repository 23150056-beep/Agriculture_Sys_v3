import ExceptionTable from '../../components/exceptions/ExceptionTable'

const demoExceptions = [
  { id: 101, exception_type: 'POD_INTEGRITY', entity_type: 'delivery_proof', entity_id: 55, severity: 'HIGH', status: 'OPEN', owner_role: 'MANAGER' },
]

function ExceptionCenterPage() {
  return (
    <section>
      <h2>Exception Center</h2>
      <p>Centralized issue queue for operations anomalies and delivery risks.</p>
      <ExceptionTable items={demoExceptions} />
    </section>
  )
}

export default ExceptionCenterPage
