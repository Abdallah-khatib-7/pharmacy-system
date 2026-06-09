import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PharmacistDashboard from './pages/PharmacistDashboard'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './context/useAuth'
import Medications from './pages/Medications'
import Suppliers from './pages/Suppliers'
import Orders from './pages/Orders'
import PurchaseEntry from './pages/PurchaseEntry'
import Alerts from './pages/Alerts'

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
                <Route path="/medications" element={
    <ProtectedRoute>
        <Layout><Medications /></Layout>
    </ProtectedRoute>
} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <Layout><AdminDashboard /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/suppliers" element={
    <ProtectedRoute>
        <Layout><Suppliers /></Layout>
    </ProtectedRoute>
} />


<Route path="/orders" element={
    <ProtectedRoute>
        <Layout><Orders /></Layout>
    </ProtectedRoute>
} />

<Route path="/orders/:id/purchase-entry" element={
    <ProtectedRoute>
        <Layout><PurchaseEntry /></Layout>
    </ProtectedRoute>
} />


<Route path="/alerts" element={
    <ProtectedRoute>
        <Layout><Alerts /></Layout>
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