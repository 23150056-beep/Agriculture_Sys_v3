import ActionCards from '../../components/guided-actions/ActionCards'

const demoActions = [
  { id: 1, title: 'Submit this week request', action_type: 'REQUEST_SUBMIT', priority: 90, is_done: false },
  { id: 2, title: 'Review reorder alert for tomatoes', action_type: 'REORDER_REVIEW', priority: 75, is_done: false },
]

function SmartRequestPage() {
  return (
    <section>
      <h2>Smart Request Assistant</h2>
      <p>Recommendation-driven request planning for distributors.</p>
      <ActionCards actions={demoActions} />
    </section>
  )
}

export default SmartRequestPage
