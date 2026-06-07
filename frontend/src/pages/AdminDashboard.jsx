import { useState, useEffect } from 'react'
import { Pill, AlertTriangle, CalendarClock, Truck,  FileText, TrendingUp } from 'lucide-react'
import api from '../api/axios'

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
            <div style={{ backgroundColor: `${color}15`, borderRadius: 12, padding: 10 }}>
                <Icon size={22} color={color} />
            </div>
            <span className="text-3xl font-bold text-slate-800">
                {loading ? '...' : value}
            </span>
        </div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className="mt-3 h-1 rounded-full bg-slate-100">
            <div className="h-1 rounded-full w-2/3" style={{ backgroundColor: color }}></div>
        </div>
    </div>
)

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalMedications: 0,
        lowStock: 0,
        expiringSoon: 0,
        totalSuppliers: 0,
        totalPrescriptions: 0,
    })
    const [lowStockItems, setLowStockItems] = useState([])
    const [expiringItems, setExpiringItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [medications, lowStock, expiring, suppliers, prescriptions] = await Promise.all([
                    api.get('/medications'),
                    api.get('/medications/alerts/low-stock'),
                    api.get('/medications/alerts/expiring-soon'),
                    api.get('/suppliers'),
                    api.get('/prescriptions'),
                ])
                setStats({
                    totalMedications: medications.data.length,
                    lowStock: lowStock.data.length,
                    expiringSoon: expiring.data.length,
                    totalSuppliers: suppliers.data.length,
                    totalPrescriptions: prescriptions.data.length,
                })
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

    const statCards = [
        { title: 'Total Medications', value: stats.totalMedications, icon: Pill, color: '#2563eb' },
        { title: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: '#f97316' },
        { title: 'Expiring Soon', value: stats.expiringSoon, icon: CalendarClock, color: '#ef4444' },
        { title: 'Suppliers', value: stats.totalSuppliers, icon: Truck, color: '#10b981' },
        { title: 'Prescriptions', value: stats.totalPrescriptions, icon: FileText, color: '#8b5cf6' },
    ]

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={24} color="white" />
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-blue-100 text-sm">Full system overview and management</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <StatCard key={i} {...card} loading={loading} />
                ))}
            </div>

            {/* Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} color="#f97316" />
                        <h3 className="font-bold text-slate-700">Low Stock Alerts</h3>
                    </div>
                    {loading ? (
                        <p className="text-slate-400 text-sm">Loading...</p>
                    ) : lowStockItems.length === 0 ? (
                        <p className="text-slate-400 text-sm">No low stock items</p>
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
                        <p className="text-slate-400 text-sm">No expiring medications</p>
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

export default AdminDashboard