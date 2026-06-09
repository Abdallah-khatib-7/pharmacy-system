import { useState, useEffect } from 'react'
import { FileText, Plus, X, ChevronDown, Pill, User, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../api/axios'
import useAuth from '../context/useAuth'
import { useNavigate } from 'react-router-dom'

const getStatusStyle = (status) => {
    switch (status) {
        case 'dispensed': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, color: '#15803d' }
        case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, color: '#b91c1c' }
        default: return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, color: '#c2410c' }
    }
}

const SlidePanel = ({ open, onClose, title, children }) => (
    <>
        {open && (
            <div className="fixed inset-0 z-50 flex">
                <div className="absolute inset-0 bg-black " onClick={onClose} />
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

const Prescriptions = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [prescriptions, setPrescriptions] = useState([])
    const [medications, setMedications] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPanel, setShowPanel] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const [form, setForm] = useState({
        patient_name: '',
        notes: '',
        items: []
    })

    const fetchData = async () => {
        try {
            const [presc, meds] = await Promise.all([
                api.get('/prescriptions'),
                api.get('/medications')
            ])
            setPrescriptions(presc.data)
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

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { medication_id: '', quantity: '', instructions: '' }]
        }))
    }

    const removeItem = (index) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
    }

    const updateItem = (index, field, value) => {
        setForm(f => {
            const items = [...f.items]
            items[index] = { ...items[index], [field]: value }
            return { ...f, items }
        })
    }

    const handleSubmit = async () => {
        if (!form.patient_name.trim()) {
            setError('Patient name is required')
            return
        }
        if (form.items.length === 0) {
            setError('Add at least one medication')
            return
        }
        const invalidItem = form.items.some(i => !i.medication_id || !i.quantity)
        if (invalidItem) {
            setError('Each medication needs a selection and quantity')
            return
        }

        setSaving(true)
        try {
            await api.post('/prescriptions', form)
            setShowPanel(false)
            setForm({ patient_name: '', notes: '', items: [] })
            fetchData()
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/prescriptions/${id}/status`, { status })
            setSelectedPrescription(null)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    // Group prescriptions by id since each medication is a separate row
    const grouped = prescriptions.reduce((acc, row) => {
    if (!acc[row.id]) {
        acc[row.id] = {
            id: row.id,
            patient_name: row.patient_name,
            doctor_name: row.doctor_name,
            prescription_date: row.prescription_date,
            diagnosis: row.diagnosis,
            insurance: row.insurance,
            insurance_company: row.insurance_company,
            insurance_coverage: row.insurance_coverage,
            hospitalized: row.hospitalized,
            status: row.status,
            notes: row.notes,
            created_at: row.created_at,
            pharmacist_name: row.pharmacist_name,
            medications: []
        }
    }
    if (row.medication_name) {
        acc[row.id].medications.push({
            name: row.medication_name,
            quantity: row.quantity,
            selling_price: row.selling_price,
            instructions: row.instructions
        })
    }
    return acc
}, {})

    const groupedList = Object.values(grouped)
    const filtered = groupedList.filter(p =>
        filterStatus ? p.status === filterStatus : true
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
                    <FileText size={26} color="#8b5cf6" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
                        <p className="text-slate-400 text-sm">{groupedList.length} total prescriptions</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/prescriptions/new')}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-violet-200"
                >
                    <Plus size={18} color="white" />
                    New Prescription
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
                {['', 'pending', 'dispensed', 'cancelled'].map(status => (
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

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <FileText size={40} color="#cbd5e1" className="mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No prescriptions found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => {
                        const style = getStatusStyle(p.status)
                        const StatusIcon = style.icon
                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPrescription(p)}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer hover:border-violet-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <User size={20} color="#7c3aed" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{p.patient_name}</p>
                                            <p className="text-sm text-slate-400">
                                                {p.medications.length} medication{p.medications.length !== 1 ? 's' : ''} · By {p.pharmacist_name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex flex-wrap gap-1 max-w-xs">
                                            {p.medications.slice(0, 3).map((m, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-lg">
                                                    {m.name}
                                                </span>
                                            ))}
                                            {p.medications.length > 3 && (
                                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-lg">
                                                    +{p.medications.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`flex items-center gap-1.5 ${style.bg} ${style.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                                            <StatusIcon size={12} color={style.color} />
                                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Prescription Detail Panel */}
            {selectedPrescription && (
    <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }} onClick={() => setSelectedPrescription(null)} />
        <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10"
            style={{ animation: 'slideIn 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Prescription Details</h2>
                    <p className="text-sm text-slate-400">{selectedPrescription.patient_name}</p>
                </div>
                <button onClick={() => setSelectedPrescription(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <X size={20} color="#64748b" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl w-fit ${getStatusStyle(selectedPrescription.status).bg}`}>
                        {(() => { const S = getStatusStyle(selectedPrescription.status); return <S.icon size={16} color={S.color} /> })()}
                        <span className={`font-semibold text-sm capitalize ${getStatusStyle(selectedPrescription.status).text}`}>
                            {selectedPrescription.status}
                        </span>
                    </div>

                    {/* Patient & Prescription Info */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Patient Name</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedPrescription.patient_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Doctor</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedPrescription.doctor_name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Prescription Date</p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {selectedPrescription.prescription_date
                                        ? new Date(selectedPrescription.prescription_date).toLocaleDateString()
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Dispensed On</p>
                                <p className="text-sm font-semibold text-slate-700">
                                    {new Date(selectedPrescription.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-400 mb-0.5">Diagnosis</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedPrescription.diagnosis || '—'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-400 mb-0.5">Pharmacist</p>
                                <p className="text-sm font-semibold text-slate-700">{selectedPrescription.pharmacist_name}</p>
                            </div>
                            {selectedPrescription.notes && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400 mb-0.5">Notes</p>
                                    <p className="text-sm font-semibold text-slate-700">{selectedPrescription.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex gap-2 flex-wrap">
                        {selectedPrescription.hospitalized && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                Hospitalized Patient
                            </span>
                        )}
                        {selectedPrescription.insurance && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                Insured — {selectedPrescription.insurance_company || 'Unknown'}
                                {selectedPrescription.insurance_coverage ? ` (${selectedPrescription.insurance_coverage}%)` : ''}
                            </span>
                        )}
                    </div>

                    {/* Medications */}
                    <div>
                        <h3 className="font-bold text-slate-700 mb-3">Medications</h3>
                        <div className="space-y-2">
                            {selectedPrescription.medications.map((med, i) => (
                                <div key={i} className="bg-white border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                                <Pill size={14} color="#7c3aed" />
                                            </div>
                                            <p className="font-semibold text-slate-700">{med.name}</p>
                                        </div>
                                        <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            x{med.quantity}
                                        </span>
                                    </div>
                                    {med.instructions && (
                                        <p className="text-xs text-slate-500 ml-11">{med.instructions}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    {selectedPrescription.medications.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <h3 className="font-bold text-slate-700 text-sm mb-3">Price Summary</h3>
                            {selectedPrescription.medications.map((med, i) => (
                                <div key={i} className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500">{med.name} ×{med.quantity}</span>
                                    <span className="font-medium text-slate-700">
                                        ${med.selling_price ? (med.selling_price * med.quantity).toFixed(2) : '—'}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between">
                                <span className="font-bold text-slate-700">Total</span>
                                <span className="font-bold text-slate-800">
                                    ${selectedPrescription.medications.reduce((sum, med) => {
                                        return sum + ((med.selling_price || 0) * med.quantity)
                                    }, 0).toFixed(2)}
                                </span>
                            </div>
                            {selectedPrescription.insurance && selectedPrescription.insurance_coverage && (
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-green-600">Insurance covers ({selectedPrescription.insurance_coverage}%)</span>
                                    <span className="font-bold text-green-600">
                                        -${(selectedPrescription.medications.reduce((sum, med) => {
                                            return sum + ((med.selling_price || 0) * med.quantity)
                                        }, 0) * selectedPrescription.insurance_coverage / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {selectedPrescription.insurance && selectedPrescription.insurance_coverage && (
                                <div className="mt-2 bg-violet-50 rounded-xl p-3 flex justify-between">
                                    <span className="font-bold text-slate-700">Patient Pays</span>
                                    <span className="font-bold text-violet-700">
                                        ${(selectedPrescription.medications.reduce((sum, med) => {
                                            return sum + ((med.selling_price || 0) * med.quantity)
                                        }, 0) * (1 - selectedPrescription.insurance_coverage / 100)).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {selectedPrescription.status === 'pending' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange(selectedPrescription.id, 'dispensed')}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} color="white" />
                                Mark Dispensed
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedPrescription.id, 'cancelled')}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} color="white" />
                                Cancel
                            </button>
                        </div>
                    )}
                    {selectedPrescription.status === 'dispensed' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <p className="text-green-700 font-semibold text-sm">Prescription has been dispensed</p>
                        </div>
                    )}
                    {selectedPrescription.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-red-700 font-semibold text-sm">Prescription was cancelled</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

            {/* New Prescription Panel */}
            <SlidePanel
                open={showPanel}
                onClose={() => { setShowPanel(false); setForm({ patient_name: '', notes: '', items: [] }) }}
                title="New Prescription"
            >
                <div className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Patient Name *</label>
                        <input
                            type="text"
                            value={form.patient_name}
                            onChange={(e) => setForm(f => ({ ...f, patient_name: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                            placeholder="Enter patient name..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Notes (optional)</label>
                        <input
                            type="text"
                            value={form.notes}
                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                            placeholder="Any special notes..."
                        />
                    </div>

                    {/* Medications */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-600">Medications *</label>
                            <button onClick={addItem}
                                className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium">
                                <Plus size={14} color="#7c3aed" /> Add Medication
                            </button>
                        </div>

                        {form.items.length === 0 && (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">No medications added yet</p>
                                <button onClick={addItem} className="text-sm text-violet-600 font-medium mt-1">+ Add first medication</button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-500">Medication {index + 1}</span>
                                        <button onClick={() => removeItem(index)}>
                                            <X size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <select
                                                value={item.medication_id}
                                                onChange={(e) => updateItem(index, 'medication_id', e.target.value)}
                                                className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            >
                                                <option value="">Select medication...</option>
                                                {medications.map(m => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.brand_name} — {m.ingredient_name} {m.dosage} (Stock: {m.stock})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} color="#94a3b8" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                placeholder="Quantity"
                                                min="1"
                                            />
                                            <input
                                                type="text"
                                                value={item.instructions}
                                                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                placeholder="Instructions (e.g. 1 tab every 8h)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg shadow-violet-200"
                    >
                        {saving ? 'Creating...' : 'Create Prescription'}
                    </button>
                </div>
            </SlidePanel>
        </div>
    )
}

export default Prescriptions