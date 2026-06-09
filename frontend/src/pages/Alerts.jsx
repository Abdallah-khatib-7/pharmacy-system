import { useState, useEffect } from 'react'
import { AlertTriangle, CalendarClock, Filter, Download, X, ChevronDown, Bell, Clock, Pill } from 'lucide-react'
import api from '../api/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getDaysColor = (days) => {
    if (days <= 30) return { bg: 'bg-red-100', text: 'text-red-700', label: `${days} days` }
    if (days <= 60) return { bg: 'bg-orange-100', text: 'text-orange-700', label: `${days} days` }
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: `${days} days` }
}

const getStockColor = (stock) => {
    if (stock <= 5) return { bg: 'bg-red-100', text: 'text-red-700' }
    if (stock <= 10) return { bg: 'bg-orange-100', text: 'text-orange-700' }
    return { bg: 'bg-yellow-100', text: 'text-yellow-700' }
}

const Alerts = () => {
    const [activeTab, setActiveTab] = useState('low-stock')
    const [lowStock, setLowStock] = useState([])
    const [expiring, setExpiring] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterSupplier, setFilterSupplier] = useState('')
    const [filterIngredient, setFilterIngredient] = useState('')
    const [sortBy, setSortBy] = useState('default')
    const [dismissModal, setDismissModal] = useState(null)
    const [dismissDays, setDismissDays] = useState(7)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [ls, ex] = await Promise.all([
                api.get('/alerts/low-stock'),
                api.get('/alerts/expiring')
            ])
            setLowStock(ls.data)
            setExpiring(ex.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDismiss = async () => {
        try {
            await api.post('/alerts/dismiss', {
                medication_id: dismissModal.id,
                alert_type: activeTab === 'low-stock' ? 'low_stock' : 'expiry',
                days: dismissDays
            })
            setDismissModal(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const currentData = activeTab === 'low-stock' ? lowStock : expiring

    // Unique suppliers and ingredients for filters
    const suppliers = [...new Set(currentData.map(m => m.supplier_name).filter(Boolean))]
    const ingredients = [...new Set(currentData.map(m => m.ingredient_name).filter(Boolean))]

    // Apply filters
    let filtered = currentData
        .filter(m => filterSupplier ? m.supplier_name === filterSupplier : true)
        .filter(m => filterIngredient ? m.ingredient_name === filterIngredient : true)

    // Apply sort
    if (activeTab === 'low-stock') {
        if (sortBy === 'stock-asc') filtered = [...filtered].sort((a, b) => a.stock - b.stock)
        else if (sortBy === 'stock-desc') filtered = [...filtered].sort((a, b) => b.stock - a.stock)
        else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.brand_name.localeCompare(b.brand_name))
        else if (sortBy === 'supplier') filtered = [...filtered].sort((a, b) => (a.supplier_name || '').localeCompare(b.supplier_name || ''))
    } else {
        if (sortBy === 'days-asc') filtered = [...filtered].sort((a, b) => a.days_remaining - b.days_remaining)
        else if (sortBy === 'days-desc') filtered = [...filtered].sort((a, b) => b.days_remaining - a.days_remaining)
        else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.brand_name.localeCompare(b.brand_name))
        else if (sortBy === 'supplier') filtered = [...filtered].sort((a, b) => (a.supplier_name || '').localeCompare(b.supplier_name || ''))
    }

    const handlePDF = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(18)
        doc.setTextColor(37, 99, 235)
        doc.text('PharmaCare', 14, 20)

        doc.setFontSize(13)
        doc.setTextColor(30, 41, 59)
        doc.text(activeTab === 'low-stock' ? 'Low Stock Alert Report' : 'Expiring Medications Report', 14, 30)

        // Filters info
        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        let filterText = `Generated: ${new Date().toLocaleDateString()}`
        if (filterSupplier) filterText += ` | Supplier: ${filterSupplier}`
        if (filterIngredient) filterText += ` | Ingredient: ${filterIngredient}`
        doc.text(filterText, 14, 38)

        // Table
        if (activeTab === 'low-stock') {
            autoTable(doc, {
                startY: 45,
                head: [['Medication', 'Ingredient', 'Form', 'Dosage', 'Stock', 'Supplier', 'Supplier Phone']],
                body: filtered.map(m => [
                    m.brand_name,
                    m.ingredient_name,
                    m.form,
                    m.dosage,
                    m.stock,
                    m.supplier_name || 'N/A',
                    m.supplier_phone || 'N/A'
                ]),
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [241, 245, 249] },
                styles: { fontSize: 9, cellPadding: 4 }
            })
        } else {
            autoTable(doc, {
                startY: 45,
                head: [['Medication', 'Ingredient', 'Form', 'Dosage', 'Expiry Date', 'Days Left', 'Supplier', 'Phone']],
                body: filtered.map(m => [
                    m.brand_name,
                    m.ingredient_name,
                    m.form,
                    m.dosage,
                    new Date(m.expiry).toLocaleDateString(),
                    m.days_remaining,
                    m.supplier_name || 'N/A',
                    m.supplier_phone || 'N/A'
                ]),
                headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [241, 245, 249] },
                styles: { fontSize: 9, cellPadding: 4 }
            })
        }

        const filename = `${activeTab === 'low-stock' ? 'low-stock' : 'expiring'}-${filterSupplier || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(filename)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell size={26} color="#f97316" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
                        <p className="text-slate-400 text-sm">
                            {lowStock.length} low stock · {expiring.length} expiring soon
                        </p>
                    </div>
                </div>
                <button
                    onClick={handlePDF}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg"
                >
                    <Download size={18} color="white" />
                    Export PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-1">Critical Stock</p>
                    <p className="text-3xl font-bold text-red-600">{lowStock.filter(m => m.stock <= 5).length}</p>
                    <p className="text-xs text-red-400 mt-1">5 units or less</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-orange-400 uppercase mb-1">Low Stock</p>
                    <p className="text-3xl font-bold text-orange-600">{lowStock.filter(m => m.stock > 5 && m.stock <= 15).length}</p>
                    <p className="text-xs text-orange-400 mt-1">6 to 15 units</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase mb-1">Expiring &lt;30 days</p>
                    <p className="text-3xl font-bold text-red-600">{expiring.filter(m => m.days_remaining <= 30).length}</p>
                    <p className="text-xs text-red-400 mt-1">Urgent attention</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-yellow-600 uppercase mb-1">Expiring 30-90d</p>
                    <p className="text-3xl font-bold text-yellow-600">{expiring.filter(m => m.days_remaining > 30).length}</p>
                    <p className="text-xs text-yellow-500 mt-1">Plan ahead</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setActiveTab('low-stock'); setFilterSupplier(''); setFilterIngredient(''); setSortBy('default') }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                        activeTab === 'low-stock'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                    }`}
                >
                    <AlertTriangle size={16} color={activeTab === 'low-stock' ? 'white' : '#f97316'} />
                    Low Stock ({lowStock.length})
                </button>
                <button
                    onClick={() => { setActiveTab('expiring'); setFilterSupplier(''); setFilterIngredient(''); setSortBy('default') }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                        activeTab === 'expiring'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-red-300'
                    }`}
                >
                    <CalendarClock size={16} color={activeTab === 'expiring' ? 'white' : '#ef4444'} />
                    Expiring Soon ({expiring.length})
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Filter size={14} color="#94a3b8" />
                        Filters:
                    </div>

                    {/* Supplier Filter */}
                    <div className="relative">
                        <select
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-600"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Ingredient Filter */}
                    <div className="relative">
                        <select
                            value={filterIngredient}
                            onChange={(e) => setFilterIngredient(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-600"
                        >
                            <option value="">All Ingredients</option>
                            {ingredients.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-600"
                        >
                            <option value="default">Default Sort</option>
                            {activeTab === 'low-stock' ? (
                                <>
                                    <option value="stock-asc">Stock: Low to High</option>
                                    <option value="stock-desc">Stock: High to Low</option>
                                </>
                            ) : (
                                <>
                                    <option value="days-asc">Expiry: Nearest First</option>
                                    <option value="days-desc">Expiry: Furthest First</option>
                                </>
                            )}
                            <option value="name">Name A-Z</option>
                            <option value="supplier">By Supplier</option>
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {(filterSupplier || filterIngredient || sortBy !== 'default') && (
                        <button
                            onClick={() => { setFilterSupplier(''); setFilterIngredient(''); setSortBy('default') }}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                            <X size={14} color="#ef4444" /> Clear
                        </button>
                    )}

                    <span className="ml-auto text-sm text-slate-400">
                        Showing {filtered.length} of {currentData.length}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Bell size={40} color="#cbd5e1" className="mx-auto mb-3" />
                        <p className="font-medium">No alerts found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Medication</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingredient</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Form</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Supplier</th>
                                    {activeTab === 'low-stock' ? (
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                                    ) : (
                                        <>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Days Left</th>
                                        </>
                                    )}
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((med) => (
                                    <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Pill size={14} color="#f97316" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">{med.brand_name}</p>
                                                    <p className="text-xs text-slate-400">{med.dosage}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{med.ingredient_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg capitalize">{med.form}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{med.supplier_name || 'N/A'}</p>
                                                {med.supplier_phone && <p className="text-xs text-slate-400">{med.supplier_phone}</p>}
                                            </div>
                                        </td>
                                        {activeTab === 'low-stock' ? (
                                            <td className="px-6 py-4">
                                                <span className={`${getStockColor(med.stock).bg} ${getStockColor(med.stock).text} text-xs font-bold px-3 py-1 rounded-full`}>
                                                    {med.stock} units
                                                </span>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(med.expiry).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`${getDaysColor(med.days_remaining).bg} ${getDaysColor(med.days_remaining).text} text-xs font-bold px-3 py-1 rounded-full`}>
                                                        {getDaysColor(med.days_remaining).label}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setDismissModal(med)}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <Clock size={12} color="#94a3b8" />
                                                Dismiss
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Dismiss Modal */}
            {dismissModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setDismissModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
                        <h3 className="font-bold text-slate-800 mb-2">Dismiss Alert</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Dismiss alert for <span className="font-semibold text-slate-700">{dismissModal.brand_name}</span> for how many days?
                        </p>
                        <div className="flex gap-2 mb-4">
                            {[3, 7, 14, 30].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDismissDays(d)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                                        dismissDays === d
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDismissModal(null)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Alerts