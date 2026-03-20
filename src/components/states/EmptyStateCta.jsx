import EmptyState from '../common/EmptyState'

function EmptyStateCta({ title, description, ctaLabel, onClick }) {
  return <EmptyState title={title} description={description} action={onClick ? <button type="button" onClick={onClick}>{ctaLabel}</button> : null} />
}

export default EmptyStateCta
