import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Pill, AlertTriangle, CalendarClock, 
    Truck, LogOut, LayoutDashboard,
    ChevronRight, Bell
} from 'lucide-react'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const StatCard = ({ title, value, icon: Icon, gradient, loading }) => (
    <div className={`rounded-2xl p-6 text-white ${gradient} shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer`}>
        <div className="flex items-center justify-between mb-4">
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
                <Icon size={22} color="white" />
            </div>
            <span className="text-4xl font-bold">
                {loading ? '...' : value}
            </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>{title}</p>
    </div>
)

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

    const statCards = [
        { title: 'Total Medications', value: stats.totalMedications, icon: Pill, gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
        { title: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, gradient: 'bg-gradient-to-br from-orange-400 to-orange-600' },
        { title: 'Expiring Soon', value: stats.expiringSoon, icon: CalendarClock, gradient: 'bg-gradient-to-br from-red-400 to-red-600' },
        { title: 'Suppliers', value: stats.totalSuppliers, icon: Truck, gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    ]

    const quickActions = [
        { label: 'Medications', icon: Pill, path: '/medications', desc: 'Manage inventory' },
        { label: 'Prescriptions', icon: Bell, path: '/prescriptions', desc: 'View & create' },
        { label: 'Suppliers', icon: Truck, path: '/suppliers', desc: 'Manage suppliers' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts', desc: 'Stock & expiry' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 rounded-xl p-2">
                            <Pill size={20} color="white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">PharmaCare</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <span style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 14 }}>
                                {user?.name?.charAt(0)}
                            </span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-1 text-sm transition hover:opacity-70">
                            <LogOut size={16} color="#ef4444" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <LayoutDashboard size={28} color="#2563eb" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-400 text-sm">Pharmacy overview</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, i) => (
                        <StatCard key={i} {...card} loading={loading} />
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-base font-bold text-slate-700 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 rounded-lg p-2 transition">
                                        <action.icon size={18} color="#64748b" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{action.label}</p>
                                        <p className="text-xs text-slate-400">{action.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="#cbd5e1" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard