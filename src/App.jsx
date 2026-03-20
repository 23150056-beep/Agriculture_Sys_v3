import AppRouter from './app/router'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading } = useAuth()
  return <AppRouter user={user} loading={loading} />
}

export default App
