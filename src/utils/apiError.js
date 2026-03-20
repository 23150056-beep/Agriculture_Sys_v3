export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  const data = error?.response?.data
  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0]
    const firstValue = data[firstKey]
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
    if (typeof firstValue === 'string') {
      return firstValue
    }
  }

  return fallback
}
