import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, ChevronDown, Pill, AlertTriangle } from 'lucide-react'
import api from '../api/axios'

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5"

const NewPrescription = () => {
    const navigate = useNavigate()
    const [medications, setMedications] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        patient_name: '',
        doctor_name: '',
        prescription_date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        insurance: false,
        insurance_company: '',
        insurance_coverage: '',
        hospitalized: false,
        notes: '',
        items: []
    })

    useEffect(() => {
        api.get('/medications').then(res => setMedications(res.data))
    }, [])

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { medication_id: '', quantity: 1, instructions: '' }]
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

    const getSelectedMed = (medication_id) => {
        return medications.find(m => m.id === parseInt(medication_id))
    }

    const calculateTotal = () => {
        return form.items.reduce((sum, item) => {
            const med = getSelectedMed(item.medication_id)
            if (!med) return sum
            return sum + (med.selling_price * item.quantity)
        }, 0)
    }

    const calculatePatientPays = () => {
        const total = calculateTotal()
        if (!form.insurance) return total
        const coverage = parseFloat(form.insurance_coverage) || 0
        return total * (1 - coverage / 100)
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.patient_name.trim()) { setError('Patient name is required'); return }
        if (form.items.length === 0) { setError('Add at least one medication'); return }
        const invalid = form.items.some(i => !i.medication_id || !i.quantity)
        if (invalid) { setError('Each medication needs a selection and quantity'); return }

        // Check zero stock
        const zeroStock = form.items.find(i => {
            const med = getSelectedMed(i.medication_id)
            return med && med.stock === 0
        })
        if (zeroStock) {
            const med = getSelectedMed(zeroStock.medication_id)
            setError(`${med.brand_name} is out of stock and cannot be dispensed`)
            return
        }

        setSaving(true)
        try {
            await api.post('/prescriptions', form)
            navigate('/prescriptions')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    const total = calculateTotal()
    const patientPays = calculatePatientPays()

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/prescriptions')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <ArrowLeft size={20} color="#64748b" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">New Prescription</h1>
                    <p className="text-slate-400 text-sm">Fill in all prescription details carefully</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertTriangle size={16} color="#ef4444" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left — Patient & Prescription Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Information */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">
                            Patient Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelClass}>Patient Name *</label>
                                <input type="text" value={form.patient_name}
                                    onChange={(e) => setForm(f => ({ ...f, patient_name: e.target.value }))}
                                    className={inputClass} placeholder="Full patient name" />
                            </div>
                            <div>
                                <label className={labelClass}>Doctor Name</label>
                                <input type="text" value={form.doctor_name}
                                    onChange={(e) => setForm(f => ({ ...f, doctor_name: e.target.value }))}
                                    className={inputClass} placeholder="Dr. name" />
                            </div>
                            <div>
                                <label className={labelClass}>Prescription Date</label>
                                <input type="date" value={form.prescription_date}
                                    onChange={(e) => setForm(f => ({ ...f, prescription_date: e.target.value }))}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Diagnosis / Condition</label>
                                <input type="text" value={form.diagnosis}
                                    onChange={(e) => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                                    className={inputClass} placeholder="e.g. Upper respiratory tract infection" />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Notes</label>
                                <input type="text" value={form.notes}
                                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className={inputClass} placeholder="Any additional notes..." />
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex gap-6 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.hospitalized}
                                    onChange={(e) => setForm(f => ({ ...f, hospitalized: e.target.checked }))}
                                    className="w-4 h-4 accent-violet-600"
                                />
                                <span className="text-sm font-medium text-slate-600">Hospitalized Patient</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.insurance}
                                    onChange={(e) => setForm(f => ({ ...f, insurance: e.target.checked, insurance_company: '', insurance_coverage: '' }))}
                                    className="w-4 h-4 accent-violet-600"
                                />
                                <span className="text-sm font-medium text-slate-600">Has Insurance</span>
                            </label>
                        </div>

                        {/* Insurance Details */}
                        {form.insurance && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-sm font-semibold text-blue-700 mb-3">Insurance Details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Insurance Company</label>
                                        <input type="text" value={form.insurance_company}
                                            onChange={(e) => setForm(f => ({ ...f, insurance_company: e.target.value }))}
                                            className={inputClass} placeholder="e.g. NSSF, AXA" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Coverage (%)</label>
                                        <input type="number" value={form.insurance_coverage}
                                            onChange={(e) => setForm(f => ({ ...f, insurance_coverage: e.target.value }))}
                                            className={inputClass} placeholder="e.g. 80"
                                            min="0" max="100" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medications */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h2 className="font-bold text-slate-700">Medications</h2>
                            <button onClick={addItem}
                                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition">
                                <Plus size={14} color="white" /> Add Medication
                            </button>
                        </div>

                        {form.items.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Pill size={32} color="#cbd5e1" className="mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No medications added yet</p>
                                <button onClick={addItem} className="text-sm text-violet-600 font-medium mt-1">+ Add first medication</button>
                            </div>
                        ) : (
                            <div className="space-y-4 ">
                                {form.items.map((item, index) => {
                                    const med = getSelectedMed(item.medication_id)
                                    const outOfStock = med && med.stock === 0
                                    const lowStock = med && med.stock > 0 && med.stock <= 15
                                    return (
                                        <div key={index} className={`rounded-xl p-4 border ${outOfStock ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-semibold text-slate-500">Medication {index + 1}</span>
                                                <button onClick={() => removeItem(index)}>
                                                    <X size={14} color="#ef4444" />
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Medication Select */}
                                                <div className="relative">
                                                    <select
                                                        value={item.medication_id}
                                                        onChange={(e) => updateItem(index, 'medication_id', e.target.value)}
                                                        className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                    >
                                                        <option value="">Select medication...</option>
                                                        {medications.map(m => (
                                                            <option key={m.id} value={m.id} disabled={m.stock === 0}>
                                                                {m.brand_name} — {m.ingredient_name} {m.dosage} ({m.form}) | Stock: {m.stock} | ${Number(m.selling_price).toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} color="#94a3b8" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>

                                                {/* Stock warning */}
                                                {outOfStock && (
                                                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-100 rounded-lg px-3 py-2">
                                                        <AlertTriangle size={12} color="#ef4444" />
                                                        Out of stock — cannot dispense this medication
                                                    </div>
                                                )}
                                                {lowStock && (
                                                    <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-100 rounded-lg px-3 py-2">
                                                        <AlertTriangle size={12} color="#f97316" />
                                                        Low stock — only {med.stock} units remaining
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                            min="1"
                                                            max={med ? med.stock : 999}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Instructions</label>
                                                        <input
                                                            type="text"
                                                            value={item.instructions}
                                                            onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                            placeholder="e.g. 1 tab every 8h after meals"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Item price */}
                                                {med && (
                                                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                                                        <span>${Number(med.selling_price).toFixed(2)} × {item.quantity}</span>
                                                        <span className="font-semibold text-slate-600">${(med.selling_price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Summary */}
                <div className="space-y-4">
                    {/* Patient Flags */}
                    {(form.hospitalized || form.insurance) && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                            <h3 className="font-bold text-slate-700 text-sm mb-3">Patient Flags</h3>
                            {form.hospitalized && (
                                <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-xs text-orange-700 font-semibold mb-2">
                                    Hospitalized Patient
                                </div>
                            )}
                            {form.insurance && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700 font-semibold">
                                    Insurance: {form.insurance_company || 'Not specified'} {form.insurance_coverage ? `(${form.insurance_coverage}%)` : ''}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6">
                        <h2 className="font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">
                            Price Summary
                        </h2>

                        {form.items.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">Add medications to see total</p>
                        ) : (
                            <div className="space-y-3">
                                {form.items.map((item, i) => {
                                    const med = getSelectedMed(item.medication_id)
                                    if (!med) return null
                                    return (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-slate-500 truncate mr-2">{med.brand_name} ×{item.quantity}</span>
                                            <span className="font-medium text-slate-700 flex-shrink-0">${(med.selling_price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    )
                                })}

                                <div className="border-t border-slate-100 pt-3 mt-3">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-semibold text-slate-700">${total.toFixed(2)}</span>
                                    </div>

                                    {form.insurance && form.insurance_coverage && (
                                        <>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-500">Insurance ({form.insurance_coverage}%)</span>
                                                <span className="font-semibold text-green-600">-${(total * parseFloat(form.insurance_coverage) / 100).toFixed(2)}</span>
                                            </div>
                                            {form.insurance_company && (
                                                <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mb-2">
                                                    Covered by {form.insurance_company}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="flex justify-between items-center bg-violet-50 rounded-xl p-3 mt-2">
                                        <span className="font-bold text-slate-700">Patient Pays</span>
                                        <span className="text-xl font-bold text-violet-700">${patientPays.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={saving || form.items.length === 0}
                            className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-40 shadow-lg shadow-violet-200"
                        >
                            {saving ? 'Creating...' : 'Create Prescription'}
                        </button>

                        <button
                            onClick={() => navigate('/prescriptions')}
                            className="w-full mt-2 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewPrescription