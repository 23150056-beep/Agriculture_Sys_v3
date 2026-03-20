function EmptyIllustrationState({ imageSrc, title, description }) {
  return (
    <div className="card empty-illustration">
      <img src={imageSrc} alt="Empty state illustration" loading="lazy" />
      <p className="empty-title">{title}</p>
      <p className="empty-description">{description}</p>
    </div>
  )
}

export default EmptyIllustrationState
