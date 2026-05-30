import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="orders-state" style={{ paddingTop: 200 }}>
        <div className="loader-spinner" style={{ margin: '0 auto' }} />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
