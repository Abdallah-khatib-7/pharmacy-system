import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, X, CheckCircle, XCircle, Clock, ChevronDown, Truck, Pill } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const getStatusStyle = (status) => {
    switch (status) {
        case 'received': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, color: '#15803d' }
        case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, color: '#b91c1c' }
        default: return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, color: '#c2410c' }
    }
}

const SlidePanel = ({ open, onClose, title, children }) => (
    <>
        {open && (
            <div className="fixed inset-0 z-50 flex">
                <div className="absolute inset-0 " onClick={onClose} />
                <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10"
                    style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
                            <X size={20} color="#64748b" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">{children}</div>
                </div>
            </div>
        )}
    </>
)

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [medications, setMedications] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPanel, setShowPanel] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderDetail, setOrderDetail] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const [form, setForm] = useState({
        supplier_id: '',
        notes: '',
        items: []
    })
   const navigate = useNavigate()
    const fetchData = async () => {
        try {
            const [ord, sup, meds] = await Promise.all([
                api.get('/orders'),
                api.get('/suppliers'),
                api.get('/medications')
            ])
            setOrders(ord.data)
            setSuppliers(sup.data)
            setMedications(meds.data)
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

    const openOrderDetail = async (order) => {
        setSelectedOrder(order)
        try {
            const res = await api.get(`/orders/${order.id}`)
            setOrderDetail(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status })
            setSelectedOrder(null)
            setOrderDetail(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { medication_id: '', quantity: '', unit_price: '' }]
        }))
    }

    const removeItem = (index) => {
        setForm(f => ({
            ...f,
            items: f.items.filter((_, i) => i !== index)
        }))
    }

    const updateItem = (index, field, value) => {
        setForm(f => {
            const items = [...f.items]
            items[index] = { ...items[index], [field]: value }

            // Auto fill unit price from medication purchase price
            if (field === 'medication_id') {
                const med = medications.find(m => m.id === parseInt(value))
                if (med) items[index].unit_price = med.purchase_price
            }

            return { ...f, items }
        })
    }

    const handleSubmit = async () => {
        if (!form.supplier_id || form.items.length === 0) {
            setError('Supplier and at least one item are required')
            return
        }
        const invalidItem = form.items.some(i => !i.medication_id || !i.quantity || !i.unit_price)
        if (invalidItem) {
            setError('All item fields are required')
            return
        }
        setSaving(true)
        try {
            await api.post('/orders', form)
            setShowPanel(false)
            setForm({ supplier_id: '', notes: '', items: [] })
            fetchData()
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    const filteredMedsBySupplier = form.supplier_id
        ? medications.filter(m => m.supplier_id === parseInt(form.supplier_id))
        : medications

    const filtered = orders.filter(o =>
        filterStatus ? o.status === filterStatus : true
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
                    <ShoppingCart size={26} color="#8b5cf6" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
                        <p className="text-slate-400 text-sm">{orders.length} total orders</p>
                    </div>
                </div>
                <button onClick={() => { setShowPanel(true); setError('') }}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-violet-200">
                    <Plus size={18} color="white" />
                    New Order
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
                {['', 'pending', 'received', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                            filterStatus === status
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'
                        }`}
                    >
                        {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => {
                        const style = getStatusStyle(order.status)
                        const StatusIcon = style.icon
                        return (
                            <div
                                key={order.id}
                                onClick={() => openOrderDetail(order)}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer hover:border-violet-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                                            <Truck size={20} color="#7c3aed" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{order.supplier_name}</p>
                                            <p className="text-sm text-slate-400">
                                                {order.item_count} items · Ordered by {order.ordered_by_name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`flex items-center gap-1.5 ${style.bg} ${style.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                                            <StatusIcon size={12} color={style.color} />
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <ShoppingCart size={40} color="#cbd5e1" className="mx-auto mb-3" />
                            <p className="font-medium">No orders found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Detail Panel */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 " onClick={() => { setSelectedOrder(null); setOrderDetail(null) }} />
                    <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10"
                        style={{ animation: 'slideIn 0.3s ease-out' }}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Order Details</h2>
                                <p className="text-sm text-slate-400">{selectedOrder.supplier_name}</p>
                            </div>
                            <button onClick={() => { setSelectedOrder(null); setOrderDetail(null) }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition">
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {!orderDetail ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Order Info */}
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Supplier</span>
                                            <span className="font-semibold text-slate-700">{orderDetail.supplier_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Ordered by</span>
                                            <span className="font-semibold text-slate-700">{orderDetail.ordered_by_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Date</span>
                                            <span className="font-semibold text-slate-700">{new Date(orderDetail.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Status</span>
                                            <span className={`font-semibold capitalize ${getStatusStyle(orderDetail.status).text}`}>
                                                {orderDetail.status}
                                            </span>
                                        </div>
                                        {orderDetail.notes && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Notes</span>
                                                <span className="font-semibold text-slate-700">{orderDetail.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <h3 className="font-bold text-slate-700 mb-3">Order Items</h3>
                                        <div className="space-y-2">
                                            {orderDetail.items?.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                                            <Pill size={14} color="#7c3aed" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-700">{item.brand_name}</p>
                                                            <p className="text-xs text-slate-400">{item.ingredient_name} · {item.dosage}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-700">x{item.quantity}</p>
                                                        <p className="text-xs text-slate-400">${Number(item.unit_price).toFixed(2)} each</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="bg-violet-50 rounded-xl p-4 flex justify-between items-center">
                                        <span className="font-semibold text-slate-700">Total Value</span>
                                        <span className="text-xl font-bold text-violet-700">
                                            ${orderDetail.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    {orderDetail.status === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
    onClick={() => navigate(`/orders/${orderDetail.id}/purchase-entry`)}
    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
>
    <CheckCircle size={18} color="white" />
    Process Receipt
</button>
                                            <button
                                                onClick={() => handleStatusChange(orderDetail.id, 'cancelled')}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} color="white" />
                                                Cancel Order
                                            </button>
                                        </div>
                                    )}
                                    {orderDetail.status === 'received' && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                            <p className="text-green-700 font-semibold text-sm">Order received — stock has been updated automatically</p>
                                        </div>
                                    )}
                                    {orderDetail.status === 'cancelled' && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                            <p className="text-red-700 font-semibold text-sm">This order was cancelled</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New Order Panel */}
            <SlidePanel
                open={showPanel}
                onClose={() => { setShowPanel(false); setForm({ supplier_id: '', notes: '', items: [] }) }}
                title="Create New Order"
            >
                <div className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
                    )}

                    {/* Supplier */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Supplier</label>
                        <div className="relative">
                            <select
                                value={form.supplier_id}
                                onChange={(e) => setForm({ ...form, supplier_id: e.target.value, items: [] })}
                                className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                            >
                                <option value="">Select supplier...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} color="#94a3b8" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {form.supplier_id && (
                            <p className="text-xs text-slate-400 mt-1">
                                Showing only medications from this supplier
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Notes (optional)</label>
                        <input
                            type="text"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                            placeholder="Any special instructions..."
                        />
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-600">Order Items</label>
                            <button onClick={addItem}
                                className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium">
                                <Plus size={14} color="#7c3aed" /> Add Item
                            </button>
                        </div>

                        {form.items.length === 0 && (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">No items added yet</p>
                                <button onClick={addItem} className="text-sm text-violet-600 font-medium mt-1">+ Add first item</button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-slate-500">Item {index + 1}</span>
                                        <button onClick={() => removeItem(index)}>
                                            <X size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <select
                                            value={item.medication_id}
                                            onChange={(e) => updateItem(index, 'medication_id', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        >
                                            <option value="">Select medication...</option>
                                            {filteredMedsBySupplier.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.brand_name} — {m.dosage} ({m.form})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                placeholder="Quantity"
                                                min="1"
                                            />
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                placeholder="Unit price $"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Preview */}
                    {form.items.length > 0 && (
                        <div className="bg-violet-50 rounded-xl p-4 flex justify-between">
                            <span className="font-semibold text-slate-700">Estimated Total</span>
                            <span className="font-bold text-violet-700">
                                ${form.items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <button onClick={handleSubmit} disabled={saving}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-violet-200">
                        {saving ? 'Creating...' : 'Create Order'}
                    </button>
                </div>
            </SlidePanel>
        </div>
    )
}

export default Orders