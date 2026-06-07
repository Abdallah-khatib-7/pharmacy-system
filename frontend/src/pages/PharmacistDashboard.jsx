import { useState, useEffect } from 'react'
import { Pill, AlertTriangle, CalendarClock, FileText, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const PharmacistDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [lowStockItems, setLowStockItems] = useState([])
    const [expiringItems, setExpiringItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lowStock, expiring] = await Promise.all([
                    api.get('/medications/alerts/low-stock'),
                    api.get('/medications/alerts/expiring-soon'),
                ])
                setLowStockItems(lowStock.data.slice(0, 5))
                setExpiringItems(expiring.data.slice(0, 5))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const quickActions = [
        { label: 'New Prescription', icon: FileText, path: '/prescriptions', color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Search Medications', icon: Search, path: '/ingredients', color: '#2563eb', bg: '#eff6ff' },
        { label: 'View Inventory', icon: Pill, path: '/medications', color: '#10b981', bg: '#f0fdf4' },
        { label: 'View Alerts', icon: AlertTriangle, path: '/alerts', color: '#f97316', bg: '#fff7ed' },
    ]

    return (
        <div>
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-1">
                    Good day, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-300 text-sm">Here's what needs your attention today</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left group"
                    >
                        <div style={{ backgroundColor: action.bg, borderRadius: 12, padding: 10, width: 'fit-content' }} className="mb-3">
                            <action.icon size={22} color={action.color} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition">
                            {action.label}
                        </p>
                    </button>
                ))}
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} color="#f97316" />
                        <h3 className="font-bold text-slate-700">Low Stock</h3>
                    </div>
                    {loading ? (
                        <p className="text-slate-400 text-sm">Loading...</p>
                    ) : lowStockItems.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-500">
                            <span className="text-sm font-medium">All stocks are good</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{item.brand_name}</p>
                                        <p className="text-xs text-slate-400">{item.ingredient_name} · {item.dosage}</p>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                                        {item.stock} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarClock size={18} color="#ef4444" />
                        <h3 className="font-bold text-slate-700">Expiring Soon</h3>
                    </div>
                    {loading ? (
                        <p className="text-slate-400 text-sm">Loading...</p>
                    ) : expiringItems.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-500">
                            <span className="text-sm font-medium">No expiring medications</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expiringItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{item.brand_name}</p>
                                        <p className="text-xs text-slate-400">{item.ingredient_name} · {item.dosage}</p>
                                    </div>
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                                        {new Date(item.expiry).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PharmacistDashboard