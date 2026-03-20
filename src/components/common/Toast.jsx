function Toast({ message, type = 'success' }) {
  if (!message) return null
  return <p className={`toast toast-${type}`}>{message}</p>
}

export default Toast
