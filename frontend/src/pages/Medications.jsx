import { useState, useEffect } from 'react'
import { Pill, Plus, Pencil, Trash2, Search, X, ChevronDown } from 'lucide-react'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const getStockStatus = (stock) => {
    if (stock <= 15) return { bg: 'bg-red-100', text: 'text-red-600', label: 'Critical' }
    if (stock <= 50) return { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Low' }
    return { bg: 'bg-green-100', text: 'text-green-600', label: 'Good' }
}

const getExpiryStatus = (expiry) => {
    const days = Math.floor((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24))
    if (days <= 90) return 'text-red-500 font-semibold'
    return 'text-slate-500'
}

const SlidePanel = ({ open, onClose, title, children }) => (
    <>
        {open && (
            <div className="fixed inset-0 z-50 flex">
                <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10"
                    style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
                            <X size={20} color="#64748b" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        )}
    </>
)

const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
            <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} color="#ef4444" />
                </div>
                <p className="text-slate-600 mb-1">Are you sure you want to delete</p>
                <p className="font-bold text-slate-800 mb-6">"{item.brand_name}"?</p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
)

const Medications = () => {
    const { user } = useAuth()
    const isAdmin = user?.role === 'admin'

    const [medications, setMedications] = useState([])
    const [ingredients, setIngredients] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPanel, setShowPanel] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [deleteItem, setDeleteItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [newIngredient, setNewIngredient] = useState('')
    const [addingIngredient, setAddingIngredient] = useState(false)

    // Filters
    const [search, setSearch] = useState('')
    const [filterIngredient, setFilterIngredient] = useState('')
    const [filterForm, setFilterForm] = useState('')
    const [filterStock, setFilterStock] = useState('')
    const [filterExpiry, setFilterExpiry] = useState('')

    const [form, setForm] = useState({
        ingredient_id: '',
    brand_name: '',
    dosage: '',
    form: '',
    stock: '',
    purchase_price: '',
    selling_price: '',
    supplier_id: '',
    expiry: ''
    })

    const fetchData = async () => {
        try {
            const [meds, ings, sups] = await Promise.all([
                api.get('/medications'),
                api.get('/ingredients'),
                api.get('/suppliers')
            ])
            setMedications(meds.data)
            setIngredients(ings.data)
            setSuppliers(sups.data)
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

    const openAdd = () => {
        setEditItem(null)
        setForm({ ingredient_id: '', brand_name: '', dosage: '', form: '', stock: '', purchase_price: '', selling_price: '', supplier_id: '', expiry: '' })
        setError('')
        setNewIngredient('')
        setShowPanel(true)
    }

    const openEdit = (med) => {
        setEditItem(med)
        setForm({
            ingredient_id: med.ingredient_id,
        brand_name: med.brand_name,
        dosage: med.dosage,
        form: med.form,
        stock: med.stock,
        purchase_price: med.purchase_price,
        selling_price: med.selling_price,
        supplier_id: med.supplier_id || '',
        expiry: med.expiry?.split('T')[0]
        })
        setError('')
        setNewIngredient('')
        setShowPanel(true)
    }

    const handleAddIngredient = async () => {
        if (!newIngredient.trim()) return
        setAddingIngredient(true)
        try {
            const res = await api.post('/ingredients', { name: newIngredient.trim() })
            await fetchData()
            setForm(f => ({ ...f, ingredient_id: res.data.id }))
            setNewIngredient('')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add ingredient')
        } finally {
            setAddingIngredient(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.ingredient_id || !form.brand_name || !form.dosage || !form.form || !form.stock || !form.purchase_price || !form.selling_price || !form.expiry) {
            setError('All fields are required')
            return
        }
        setSaving(true)
        try {
            if (editItem) {
                await api.put(`/medications/${editItem.id}`, form)
            } else {
                await api.post('/medications', form)
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
            await api.delete(`/medications/${deleteItem.id}`)
            setDeleteItem(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const filtered = medications.filter(m => {
        const matchSearch = m.brand_name.toLowerCase().includes(search.toLowerCase()) ||
            m.ingredient_name.toLowerCase().includes(search.toLowerCase())
        const matchIngredient = filterIngredient ? m.ingredient_name === filterIngredient : true
        const matchForm = filterForm ? m.form === filterForm : true
        const matchStock = filterStock === 'critical' ? m.stock <= 15
            : filterStock === 'low' ? m.stock > 15 && m.stock <= 50
            : filterStock === 'good' ? m.stock > 50
            : true
        const days = Math.floor((new Date(m.expiry) - new Date()) / (1000 * 60 * 60 * 24))
        const matchExpiry = filterExpiry === 'expiring' ? days <= 90 : true
        return matchSearch && matchIngredient && matchForm && matchStock && matchExpiry
    })

    const uniqueForms = [...new Set(medications.map(m => m.form))]

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
                    <Pill size={26} color="#2563eb" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Medications</h1>
                        <p className="text-slate-400 text-sm">{filtered.length} of {medications.length} medications</p>
                    </div>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-200">
                    <Plus size={18} color="white" />
                    Add Medication
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <Search size={16} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search brand or ingredient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Ingredient Filter */}
                    <div className="relative">
                        <select
                            value={filterIngredient}
                            onChange={(e) => setFilterIngredient(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                        >
                            <option value="">All Ingredients</option>
                            {ingredients.map(ing => (
                                <option key={ing.id} value={ing.name}>{ing.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Form Filter */}
                    <div className="relative">
                        <select
                            value={filterForm}
                            onChange={(e) => setFilterForm(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                        >
                            <option value="">All Forms</option>
                            {uniqueForms.map(f => (
                                <option key={f} value={f} className="capitalize">{f}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Stock Filter */}
                    <div className="relative">
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                        >
                            <option value="">All Stock</option>
                            <option value="critical">Critical (≤15)</option>
                            <option value="low">Low (16-50)</option>
                            <option value="good">Good (50+)</option>
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Expiry Filter */}
                    <div className="relative">
                        <select
                            value={filterExpiry}
                            onChange={(e) => setFilterExpiry(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                        >
                            <option value="">All Expiry</option>
                            <option value="expiring">Expiring in 90 days</option>
                        </select>
                        <ChevronDown size={14} color="#94a3b8" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Clear Filters */}
                    {(search || filterIngredient || filterForm || filterStock || filterExpiry) && (
                        <button
                            onClick={() => { setSearch(''); setFilterIngredient(''); setFilterForm(''); setFilterStock(''); setFilterExpiry('') }}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                            <X size={14} color="#ef4444" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Medication</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingredient</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dosage</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Form</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Buy Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sell Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry</th>
                                    {isAdmin && <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((med) => {
                                    const stock = getStockStatus(med.stock)
                                    const expiryClass = getExpiryStatus(med.expiry)
                                    return (
                                        <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Pill size={14} color="#2563eb" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{med.brand_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{med.ingredient_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{med.dosage}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg capitalize">{med.form}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`${stock.bg} ${stock.text} text-xs font-bold px-3 py-1 rounded-full`}>
                                                    {med.stock} — {stock.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">${Number(med.purchase_price).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">${Number(med.selling_price).toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-sm ${expiryClass}`}>
                                                {new Date(med.expiry).toLocaleDateString()}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEdit(med)}
                                                            className="p-2 hover:bg-blue-50 rounded-lg transition">
                                                            <Pencil size={15} color="#2563eb" />
                                                        </button>
                                                        <button onClick={() => setDeleteItem(med)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition">
                                                            <Trash2 size={15} color="#ef4444" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <Pill size={40} color="#cbd5e1" className="mx-auto mb-3" />
                                <p className="font-medium">No medications found</p>
                                <p className="text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Slide Panel - Add/Edit */}
            <SlidePanel
                open={showPanel}
                onClose={() => setShowPanel(false)}
                title={editItem ? 'Edit Medication' : 'Add New Medication'}
            >
                <div className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
                    )}

                    {/* Ingredient */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Active Ingredient</label>
                        <select
                            value={form.ingredient_id}
                            onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        >
                            <option value="">Select ingredient...</option>
                            {ingredients.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                        </select>

                        {/* Add new ingredient inline */}
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="New ingredient name..."
                                value={newIngredient}
                                onChange={(e) => setNewIngredient(e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                            <button
                                onClick={handleAddIngredient}
                                disabled={addingIngredient || !newIngredient.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40"
                            >
                                {addingIngredient ? '...' : '+ Add'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Can't find the ingredient? Type it above and click Add</p>
                    </div>

                    {/* Brand Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Brand Name</label>
                        <input
                            type="text"
                            value={form.brand_name}
                            onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            placeholder="e.g. Profinal"
                        />
                    </div>

                    {/* Dosage & Form */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Dosage</label>
                            <input
                                type="text"
                                value={form.dosage}
                                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="e.g. 400mg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Form</label>
                            <select
                                value={form.form}
                                onChange={(e) => setForm({ ...form, form: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            >
                                <option value="">Select...</option>
                                <option value="tablet">Tablet</option>
                                <option value="capsule">Capsule</option>
                                <option value="syrup">Syrup</option>
                                <option value="injection">Injection</option>
                                <option value="cream">Cream</option>
                                <option value="drops">Drops</option>
                            </select>
                        </div>
                    </div>

                    {/* Stock & Expiry */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Stock</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Expiry Date</label>
                            <input
                                type="date"
                                value={form.expiry}
                                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                        </div>
                    </div>
                        
{/* Supplier */}
<div>
    <label className="block text-sm font-semibold text-slate-600 mb-2">Supplier</label>
    <select
        value={form.supplier_id}
        onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
    >
        <option value="">Select supplier...</option>
        {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
        ))}
    </select>
</div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Purchase Price ($)</label>
                            <input
                                type="number"
                                value={form.purchase_price}
                                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Selling Price ($)</label>
                            <input
                                type="number"
                                value={form.selling_price}
                                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                        {saving ? 'Saving...' : editItem ? 'Update Medication' : 'Add Medication'}
                    </button>
                </div>
            </SlidePanel>

            {/* Delete Modal */}
            {deleteItem && (
                <DeleteModal
                    item={deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}

export default Medications