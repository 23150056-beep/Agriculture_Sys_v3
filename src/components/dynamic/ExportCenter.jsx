import { exportRowsToCsv } from '../../utils/exportCsv'

function ExportCenter({ title = 'Export', filename, columns, rows }) {
  return (
    <button
      type="button"
      className="chip"
      disabled={!rows?.length}
      onClick={() => exportRowsToCsv(filename, columns, rows)}
      title={rows?.length ? `Export ${rows.length} rows` : 'No data to export'}
    >
      {title}
    </button>
  )
}

export default ExportCenter
