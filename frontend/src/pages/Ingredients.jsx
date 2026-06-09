import { useState, useEffect } from 'react'
import { Search, FlaskConical, Pill, X, Plus, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import useAuth from '../context/useAuth'

const getStockColor = (stock) => {
    if (stock <= 15) return { bg: 'bg-red-100', text: 'text-red-600' }
    if (stock <= 50) return { bg: 'bg-orange-100', text: 'text-orange-600' }
    return { bg: 'bg-green-100', text: 'text-green-600' }
}

const Ingredients = () => {
    const { user } = useAuth()
    const isAdmin = user?.role === 'admin'
    const [ingredients, setIngredients] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [selectedMeds, setSelectedMeds] = useState([])
    const [loadingMeds, setLoadingMeds] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState('')

    const fetchIngredients = async () => {
        try {
            const res = await api.get('/ingredients')
            setIngredients(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIngredients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSelect = async (ingredient) => {
        setSelected(ingredient)
        setLoadingMeds(true)
        try {
            const res = await api.get(`/ingredients/${ingredient.id}/medications`)
            setSelectedMeds(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingMeds(false)
        }
    }

    const handleAdd = async () => {
        if (!newName.trim()) return
        setAdding(true)
        setError('')
        try {
            await api.post('/ingredients', { name: newName.trim() })
            setNewName('')
            setShowAdd(false)
            fetchIngredients()
        } catch (err) {
            setError(err.response?.data?.error || 'Already exists')
        } finally {
            setAdding(false)
        }
    }

    const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex gap-6 h-full">
            {/* Left — Ingredients List */}
            <div className="w-80 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FlaskConical size={22} color="#8b5cf6" />
                        <h1 className="text-xl font-bold text-slate-800">Ingredients</h1>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="p-2 bg-violet-100 hover:bg-violet-200 rounded-xl transition"
                        >
                            <Plus size={16} color="#7c3aed" />
                        </button>
                    )}
                </div>

                {/* Add New */}
                {showAdd && (
                    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-4">
                        <p className="text-sm font-semibold text-violet-700 mb-2">New Ingredient</p>
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white mb-2"
                            placeholder="e.g. Metoprolol"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={() => { setShowAdd(false); setError('') }}
                                className="flex-1 border border-slate-200 text-slate-600 py-1.5 rounded-xl text-sm">
                                Cancel
                            </button>
                            <button onClick={handleAdd} disabled={adding}
                                className="flex-1 bg-violet-600 text-white py-1.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                                {adding ? '...' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-3">
                    <Search size={15} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X size={14} color="#94a3b8" />
                        </button>
                    )}
                </div>

                <p className="text-xs text-slate-400 mb-3">{filtered.length} ingredients</p>

                {/* List */}
                <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filtered.map((ing) => (
                        <button
                            key={ing.id}
                            onClick={() => handleSelect(ing)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left ${
                                selected?.id === ing.id
                                    ? 'bg-violet-600 text-white'
                                    : 'hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            <span className="text-sm font-medium">{ing.name}</span>
                            <ChevronRight size={14} color={selected?.id === ing.id ? 'white' : '#94a3b8'} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right — Medications Panel */}
            <div className="flex-1">
                {!selected ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <FlaskConical size={60} color="#e2e8f0" />
                        <p className="mt-4 font-medium text-slate-400">Select an ingredient</p>
                        <p className="text-sm text-slate-300 mt-1">to see all available brands</p>
                    </div>
                ) : (
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
                                <p className="text-slate-400 text-sm mt-0.5">
                                    {selectedMeds.length} brands available in inventory
                                </p>
                            </div>
                            <div className="bg-violet-100 text-violet-700 text-sm font-bold px-4 py-2 rounded-xl">
                                Active Ingredient
                            </div>
                        </div>

                        {loadingMeds ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : selectedMeds.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                                <Pill size={40} color="#cbd5e1" className="mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">No medications in stock</p>
                                <p className="text-slate-300 text-sm mt-1">for this ingredient</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {selectedMeds.map((med) => {
                                    const stock = getStockColor(med.stock)
                                    return (
                                        <div key={med.id}
                                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Pill size={18} color="#7c3aed" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{med.brand_name}</p>
                                                        <p className="text-xs text-slate-400">{med.dosage}</p>
                                                    </div>
                                                </div>
                                                <span className={`${stock.bg} ${stock.text} text-xs font-bold px-2.5 py-1 rounded-full`}>
                                                    {med.stock} units
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg capitalize">
                                                    {med.form}
                                                </span>
                                                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                                                    Exp: {new Date(med.expiry).toLocaleDateString()}
                                                </span>
                                                {med.supplier_name && (
                                                    <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-lg">
                                                        {med.supplier_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
                                                <span className="text-xs text-slate-400">Sell price</span>
                                                <span className="text-sm font-bold text-slate-700">${Number(med.selling_price).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Ingredients