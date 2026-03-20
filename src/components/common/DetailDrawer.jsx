function DetailDrawer({ open, title, onClose, children }) {
  return (
    <aside className={`detail-drawer ${open ? 'open' : ''}`}>
      <div className="detail-drawer-head">
        <h3>{title}</h3>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <div className="detail-drawer-body">{children}</div>
    </aside>
  )
}

export default DetailDrawer
