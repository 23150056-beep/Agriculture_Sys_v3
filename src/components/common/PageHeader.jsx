function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <header className="page-header">
      <div className="page-title-wrap">
        {Icon ? <Icon size={20} /> : null}
        <h2 className="page-title">{title}</h2>
      </div>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </header>
  )
}

export default PageHeader
