import { Navigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { token, user } = useAuth()

    if (!token) return <Navigate to="/" />
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />

    return children
}

export default ProtectedRoute