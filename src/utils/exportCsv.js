const escapeCsv = (value) => {
  const str = String(value ?? '')
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

export function exportRowsToCsv(filename, columns, rows) {
  const headerLine = columns.map((column) => escapeCsv(column.label)).join(',')
  const bodyLines = rows.map((row) => (
    columns.map((column) => escapeCsv(row[column.key])).join(',')
  ))
  const csv = [headerLine, ...bodyLines].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export default exportRowsToCsv
