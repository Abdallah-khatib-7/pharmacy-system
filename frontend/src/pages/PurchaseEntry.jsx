import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Pill, AlertTriangle } from 'lucide-react'
import api from '../api/axios'

const PurchaseEntry = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`)
                setOrder(res.data)
                setItems(res.data.items.map(item => ({
                    ...item,
                    expiry: item.expiry ? item.expiry.split('T')[0] : '',
                    notes: item.notes || ''
                })))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateItem = (index, field, value) => {
        setItems(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const handleConfirm = async () => {
        const missingExpiry = items.some(item => !item.expiry)
        if (missingExpiry) {
            setError('All items must have an expiry date')
            return
        }

        setSaving(true)
        try {
            // Update items with confirmed details
            await api.put(`/orders/${id}/items`, { items })
            // Mark order as received — this triggers stock update
            await api.put(`/orders/${id}/status`, { status: 'received' })
            navigate('/orders')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
    )

    if (!order) return (
        <div className="text-center py-16 text-slate-400">
            <p>Order not found</p>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/orders')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition"
                >
                    <ArrowLeft size={20} color="#64748b" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Purchase Entry</h1>
                    <p className="text-slate-400 text-sm">
                        Order from {order.supplier_name} — verify and confirm received items
                    </p>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle size={20} color="#d97706" className="flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">Before confirming</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                        Verify each item's quantity and expiry date matches what was physically received.
                        Once confirmed, stock will be updated automatically and cannot be undone.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>
            )}

            {/* Items */}
            <div className="space-y-4 mb-8">
                {items.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        {/* Medication Info */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Pill size={18} color="#7c3aed" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{item.brand_name}</p>
                                <p className="text-sm text-slate-400">{item.ingredient_name} · {item.dosage} · {item.form}</p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">
                                    Quantity Received
                                </label>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">
                                    Unit Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">
                                    Expiry Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={item.expiry}
                                    onChange={(e) => updateItem(index, 'expiry', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">
                                    Notes (optional)
                                </label>
                                <input
                                    type="text"
                                    value={item.notes}
                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    placeholder="Any notes about this item..."
                                />
                            </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm text-slate-400">Item total</span>
                            <span className="font-bold text-slate-700">
                                ${(parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Total */}
            <div className="bg-violet-50 rounded-2xl p-5 mb-6 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total Order Value</span>
                <span className="text-2xl font-bold text-violet-700">
                    ${items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0).toFixed(2)}
                </span>
            </div>

            {/* Confirm Button */}
            <button
                onClick={handleConfirm}
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50 shadow-lg shadow-green-200 flex items-center justify-center gap-3"
            >
                <CheckCircle size={22} color="white" />
                {saving ? 'Processing...' : 'Confirm Receipt & Update Stock'}
            </button>
        </div>
    )
}

export default PurchaseEntry