import { useState, useEffect } from 'react'
import { Truck, Plus, Pencil, Trash2, Search, X, Phone, Mail, MapPin, User, Pill, ShoppingCart, ChevronRight, Package } from 'lucide-react'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const SlidePanel = ({ open, onClose, title, children }) => {
    if (!open) return null
    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col z-50 border-l border-slate-100"
            style={{ animation: 'slideIn 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <X size={20} color="#64748b" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
    )
}

const Suppliers = () => {
    const { user } = useAuth()
    const isAdmin = user?.role === 'admin'
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showPanel, setShowPanel] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [deleteItem, setDeleteItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '', contact_person: '', phone: '', email: '', address: ''
    })

    // Detail panel state
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [detailTab, setDetailTab] = useState('medications') // 'medications' | 'orders'
    const [supplierMeds, setSupplierMeds] = useState([])
    const [supplierOrders, setSupplierOrders] = useState([])
    const [detailLoading, setDetailLoading] = useState(false)

    const fetchData = async () => {
        try {
            const res = await api.get('/suppliers')
            setSuppliers(res.data)
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

    // Called when user clicks a supplier card
    const openDetail = async (supplier) => {
        setSelectedSupplier(supplier)
        setDetailTab('medications')
        setDetailLoading(true)
        try {
            // Fetch all medications and filter by supplier_id
            // Also fetch orders for this supplier
            const [medsRes, ordersRes] = await Promise.all([
                api.get('/medications'),
                api.get(`/orders/supplier/${supplier.id}`)
            ])
            setSupplierMeds(medsRes.data.filter(m => m.supplier_id === supplier.id))
            setSupplierOrders(ordersRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setSelectedSupplier(null)
        setSupplierMeds([])
        setSupplierOrders([])
    }

    const openAdd = () => {
        setEditItem(null)
        setForm({ name: '', contact_person: '', phone: '', email: '', address: '' })
        setError('')
        setShowPanel(true)
    }

    const openEdit = (supplier, e) => {
        e.stopPropagation() // prevent card click from opening detail
        setEditItem(supplier)
        setForm({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || ''
        })
        setError('')
        setShowPanel(true)
    }

    const openDelete = (supplier, e) => {
        e.stopPropagation() // prevent card click from opening detail
        setDeleteItem(supplier)
    }

    const handleSubmit = async () => {
        if (!form.name) {
            setError('Supplier name is required')
            return
        }
        setSaving(true)
        try {
            if (editItem) {
                await api.put(`/suppliers/${editItem.id}`, form)
            } else {
                await api.post('/suppliers', form)
            }
            setShowPanel(false)
            fetchData()
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/suppliers/${deleteItem.id}`)
            setDeleteItem(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const getOrderStatusStyle = (status) => {
        if (status === 'received') return { bg: 'bg-emerald-100', text: 'text-emerald-600' }
        if (status === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-500' }
        return { bg: 'bg-orange-100', text: 'text-orange-500' }
    }

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Truck size={26} color="#10b981" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
                        <p className="text-slate-400 text-sm">{suppliers.length} suppliers registered</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={openAdd}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-emerald-200">
                        <Plus size={18} color="white" />
                        Add Supplier
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((supplier) => (
                        <div key={supplier.id}
                            onClick={() => openDetail(supplier)}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Truck size={22} color="#10b981" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{supplier.name}</h3>
                                        {supplier.contact_person && (
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                <User size={10} color="#94a3b8" />
                                                {supplier.contact_person}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 items-center">
                                    {isAdmin && (
                                        <>
                                            <button onClick={(e) => openEdit(supplier, e)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition">
                                                <Pencil size={14} color="#2563eb" />
                                            </button>
                                            <button onClick={(e) => openDelete(supplier, e)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={14} color="#ef4444" />
                                            </button>
                                        </>
                                    )}
                                    <ChevronRight size={16} color="#cbd5e1" className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {supplier.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Phone size={14} color="#94a3b8" />
                                        {supplier.phone}
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Mail size={14} color="#94a3b8" />
                                        {supplier.email}
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin size={14} color="#94a3b8" />
                                        {supplier.address}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-3 text-center py-16 text-slate-400">
                            <Truck size={40} color="#cbd5e1" className="mx-auto mb-3" />
                            <p className="font-medium">No suppliers found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Supplier Detail Panel */}
            <SlidePanel
                open={!!selectedSupplier}
                onClose={closeDetail}
                title={selectedSupplier?.name || ''}
            >
                {/* Supplier Info */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
                    {selectedSupplier?.contact_person && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User size={14} color="#94a3b8" />
                            {selectedSupplier.contact_person}
                        </div>
                    )}
                    {selectedSupplier?.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} color="#94a3b8" />
                            {selectedSupplier.phone}
                        </div>
                    )}
                    {selectedSupplier?.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} color="#94a3b8" />
                            {selectedSupplier.email}
                        </div>
                    )}
                    {selectedSupplier?.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={14} color="#94a3b8" />
                            {selectedSupplier.address}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
                    <button
                        onClick={() => setDetailTab('medications')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                            detailTab === 'medications'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        <Pill size={14} color={detailTab === 'medications' ? '#2563eb' : '#94a3b8'} />
                        Medications
                    </button>
                    <button
                        onClick={() => setDetailTab('orders')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                            detailTab === 'orders'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        <ShoppingCart size={14} color={detailTab === 'orders' ? '#2563eb' : '#94a3b8'} />
                        Order History
                    </button>
                </div>

                {/* Tab Content */}
                {detailLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : detailTab === 'medications' ? (
                    <div className="space-y-3">
                        {supplierMeds.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Pill size={32} color="#cbd5e1" className="mx-auto mb-2" />
                                <p className="text-sm">No medications from this supplier</p>
                            </div>
                        ) : (
                            supplierMeds.map(med => (
                                <div key={med.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Pill size={14} color="#2563eb" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">{med.brand_name}</p>
                                            <p className="text-xs text-slate-400">{med.dosage} · {med.form}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-700">{med.stock} units</p>
                                        <p className="text-xs text-slate-400">${Number(med.selling_price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {supplierOrders.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Package size={32} color="#cbd5e1" className="mx-auto mb-2" />
                                <p className="text-sm">No orders placed with this supplier</p>
                            </div>
                        ) : (
                            supplierOrders.map(order => {
                                const style = getOrderStatusStyle(order.status)
                                return (
                                    <div key={order.id} className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-slate-700">Order #{order.id}</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text} capitalize`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                        {order.notes && (
                                            <p className="text-xs text-slate-500 mt-1 italic">"{order.notes}"</p>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </SlidePanel>

            {/* Add/Edit Panel */}
            <SlidePanel
                open={showPanel}
                onClose={() => setShowPanel(false)}
                title={editItem ? 'Edit Supplier' : 'Add New Supplier'}
            >
                <div className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Company Name *</label>
                        <input type="text" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                            placeholder="e.g. Mersaco" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Contact Person</label>
                        <input type="text" value={form.contact_person}
                            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                            placeholder="e.g. Ahmad Hassoun" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Phone</label>
                            <input type="text" value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                                placeholder="01123456" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Email</label>
                            <input type="email" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                                placeholder="supplier@email.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Address</label>
                        <input type="text" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                            placeholder="Beirut, Lebanon" />
                    </div>
                    <button onClick={handleSubmit} disabled={saving}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
                        {saving ? 'Saving...' : editItem ? 'Update Supplier' : 'Add Supplier'}
                    </button>
                </div>
            </SlidePanel>

            {/* Delete Modal */}
            {deleteItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setDeleteItem(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} color="#ef4444" />
                            </div>
                            <p className="text-slate-600 mb-1">Delete supplier</p>
                            <p className="font-bold text-slate-800 mb-6">"{deleteItem.name}"?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteItem(null)}
                                    className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition">
                                    Cancel
                                </button>
                                <button onClick={handleDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Suppliers