export const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}
