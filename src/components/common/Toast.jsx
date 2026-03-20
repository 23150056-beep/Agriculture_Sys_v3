import { useEffect, useReducer, useRef } from 'react'

function reducer(state, action) {
  if (action.type === 'add') return [...state, action.payload].slice(-4)
  if (action.type === 'remove') return state.filter((item) => item.id !== action.id)
  return state
}

function Toast({ message, type = 'success', duration = 3200 }) {
  const [items, dispatch] = useReducer(reducer, [])
  const timersRef = useRef({})

  useEffect(() => {
    if (!message) return

    const next = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message,
      type,
    }

    dispatch({ type: 'add', payload: next })

    timersRef.current[next.id] = setTimeout(() => {
      dispatch({ type: 'remove', id: next.id })
      delete timersRef.current[next.id]
    }, duration)

    return () => {
      if (timersRef.current[next.id]) {
        clearTimeout(timersRef.current[next.id])
        delete timersRef.current[next.id]
      }
    }
  }, [message, type, duration])

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer))
      timersRef.current = {}
    }
  }, [])

  const dismiss = (id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
    dispatch({ type: 'remove', id })
  }

  if (items.length === 0) return null

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          <span>{item.message}</span>
          <button type="button" className="toast-close" onClick={() => dismiss(item.id)}>x</button>
        </div>
      ))}
    </div>
  )
}

export default Toast
