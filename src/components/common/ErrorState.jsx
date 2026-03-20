function ErrorState({ message = 'Something went wrong.' }) {
  return <p className="error-state">{message}</p>
}

export default ErrorState
