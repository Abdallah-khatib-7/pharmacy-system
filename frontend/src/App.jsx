import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PharmacistDashboard from './pages/PharmacistDashboard'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './context/useAuth'

const RoleRouter = () => {
    const { user } = useAuth()
    if (user?.role === 'admin') return <Navigate to="/admin" />
    return <Navigate to="/dashboard" />
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RoleRouter />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <Layout><AdminDashboard /></Layout>
                    </ProtectedRoute>
                } />

                {/* Pharmacist Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout><PharmacistDashboard /></Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App