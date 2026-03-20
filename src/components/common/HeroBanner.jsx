function HeroBanner({ imageSrc, title, subtitle, actions, children }) {
  return (
    <section className="hero-banner">
      <img src={imageSrc} alt="Agriculture operations" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
      <div className="hero-overlay">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
        {children || null}
      </div>
    </section>
  )
}

export default HeroBanner
