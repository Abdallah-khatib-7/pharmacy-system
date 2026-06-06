import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalMedications: 0,
        lowStock: 0,
        expiringSoon: 0,
        totalSuppliers: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [medications, lowStock, expiring, suppliers] = await Promise.all([
                    api.get('/medications'),
                    api.get('/medications/alerts/low-stock'),
                    api.get('/medications/alerts/expiring-soon'),
                    api.get('/suppliers')
                ])
                setStats({
                    totalMedications: medications.data.length,
                    lowStock: lowStock.data.length,
                    expiringSoon: expiring.data.length,
                    totalSuppliers: suppliers.data.length
                })
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const cards = [
        {
            title: 'Total Medications',
            value: stats.totalMedications,
            icon: '💊',
            bg: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-200'
        },
        {
            title: 'Low Stock',
            value: stats.lowStock,
            icon: '⚠️',
            bg: 'from-orange-400 to-orange-500',
            shadow: 'shadow-orange-200'
        },
        {
            title: 'Expiring Soon',
            value: stats.expiringSoon,
            icon: '📅',
            bg: 'from-red-400 to-red-500',
            shadow: 'shadow-red-200'
        },
        {
            title: 'Suppliers',
            value: stats.totalSuppliers,
            icon: '🏭',
            bg: 'from-green-400 to-green-500',
            shadow: 'shadow-green-200'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💊</span>
                        <span className="text-xl font-bold text-blue-700">PharmaCare</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Welcome, <span className="font-semibold text-gray-700">{user?.name}</span>
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                            {user?.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Overview of your pharmacy</p>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${card.bg} rounded-2xl p-6 text-white shadow-lg ${card.shadow} hover:scale-105 transition-transform duration-300 cursor-pointer`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{card.icon}</span>
                                    <span className="bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                                        {card.value}
                                    </span>
                                </div>
                                <p className="text-white text-opacity-90 text-sm font-medium">{card.title}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Medications', icon: '💊', path: '/medications' },
                            { label: 'Prescriptions', icon: '📋', path: '/prescriptions' },
                            { label: 'Suppliers', icon: '🏭', path: '/suppliers' },
                            { label: 'Alerts', icon: '🔔', path: '/alerts' },
                        ].map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                                    {action.icon}
                                </span>
                                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard