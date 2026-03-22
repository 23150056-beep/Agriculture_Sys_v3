function ExceptionTable({ items = [] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Entity</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Owner Role</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.exception_type}</td>
                <td>{row.entity_type}:{row.entity_id}</td>
                <td>{row.severity}</td>
                <td>{row.status}</td>
                <td>{row.owner_role || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No exceptions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ExceptionTable
