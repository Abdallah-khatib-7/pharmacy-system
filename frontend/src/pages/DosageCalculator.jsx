import { useState, useEffect } from 'react'
import { Calculator, Pill, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import api from '../api/axios'

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5"

const ResultRow = ({ label, value, highlight }) => (
    <div className={`flex justify-between items-center py-3 border-b border-slate-100 last:border-0 ${highlight ? 'bg-blue-50 -mx-4 px-4 rounded-xl' : ''}`}>
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`text-sm font-bold ${highlight ? 'text-blue-700 text-base' : 'text-slate-800'}`}>{value}</span>
    </div>
)

const DosageCalculator = () => {
    const [medications, setMedications] = useState([])
    const [selectedMed, setSelectedMed] = useState(null)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        medication_id: '',
        weight: '',
        age: '',
        age_unit: 'years',
        dose_per_kg: '',
        frequency: '2',
        duration: '5',
        renal: 'normal',
        pregnant: 'no'
    })

    useEffect(() => {
        api.get('/medications').then(res => setMedications(res.data))
    }, [])

    const handleMedChange = (id) => {
        const med = medications.find(m => m.id === parseInt(id))
        setSelectedMed(med || null)
        setForm(f => ({ ...f, medication_id: id }))
        setResult(null)
        setError('')
    }

    const calculate = () => {
        setError('')
        setResult(null)

        if (!form.medication_id || !form.weight || !form.dose_per_kg || !form.frequency) {
            setError('Please fill in all required fields marked with *')
            return
        }

        const weight = parseFloat(form.weight)
        const dosePerKg = parseFloat(form.dose_per_kg)
        const frequency = parseInt(form.frequency)
        const duration = parseInt(form.duration)

        if (isNaN(weight) || weight <= 0) { setError('Invalid weight'); return }
        if (isNaN(dosePerKg) || dosePerKg <= 0) { setError('Invalid dose'); return }

        // Step 1: Total daily dose
        const totalDailyDose = weight * dosePerKg

        // Step 2: Per dose amount
        const perDoseMg = totalDailyDose / frequency

        // Step 3: Volume for liquids
        let perDoseVolume = null
        let concentrationText = null

        if (selectedMed && (selectedMed.form === 'syrup' || selectedMed.form === 'drops')) {
            const match = selectedMed.dosage.match(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*(\d+(?:\.\d+)?)\s*ml/i)
            if (match) {
                const concMg = parseFloat(match[1])
                const concMl = parseFloat(match[2])
                perDoseVolume = (perDoseMg / concMg) * concMl
                concentrationText = `${concMg}mg/${concMl}ml`
            }
        }

        // Step 4: Total course
        const totalCourseMg = totalDailyDose * duration
        const totalCourseVolume = perDoseVolume ? perDoseVolume * frequency * duration : null

        // Step 5: Expiry check
        const daysUntilExpiry = Math.floor((new Date(selectedMed.expiry) - new Date()) / (1000 * 60 * 60 * 24))

        // Step 6: Pediatric check
        const ageYears = form.age_unit === 'months' ? parseFloat(form.age) / 12 : parseFloat(form.age)
        const isPediatric = !isNaN(ageYears) && ageYears < 18

        // Step 7: Renal warning
        const renalWarnings = {
            mild: 'Consider 75% of normal dose (CrCl 50-80 ml/min)',
            moderate: 'Consider 50% of normal dose (CrCl 10-50 ml/min)',
            severe: 'Significant dose reduction required or avoid — verify carefully (CrCl <10 ml/min)'
        }

        setResult({
            totalDailyDose: totalDailyDose.toFixed(1),
            perDoseMg: perDoseMg.toFixed(1),
            perDoseVolume: perDoseVolume ? perDoseVolume.toFixed(2) : null,
            concentrationText,
            frequency,
            duration,
            totalCourseMg: totalCourseMg.toFixed(1),
            totalCourseVolume: totalCourseVolume ? totalCourseVolume.toFixed(1) : null,
            daysUntilExpiry,
            stock: selectedMed.stock,
            brandName: selectedMed.brand_name,
            ingredient: selectedMed.ingredient_name,
            dosage: selectedMed.dosage,
            form: selectedMed.form,
            sellingPrice: selectedMed.selling_price,
            renalWarning: form.renal !== 'normal' ? renalWarnings[form.renal] : null,
            pregnancyWarning: form.pregnant === 'yes',
            isPediatric
        })
    }

    const frequencyLabel = {
        '1': 'Once daily (OD)',
        '2': 'Twice daily (BID)',
        '3': 'Three times daily (TID)',
        '4': 'Four times daily (QID)',
        '6': 'Every 4 hours',
        '8': 'Every 3 hours'
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Calculator size={22} color="white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dosage Calculator</h1>
                    <p className="text-slate-400 text-sm">Accurate weight-based dosing with pharmacy stock integration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Input */}
                <div className="space-y-6">
                    {/* Medication Selection */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Pill size={16} color="#2563eb" />
                            Medication
                        </h2>
                        <div>
                            <label className={labelClass}>Select Medication *</label>
                            <select
                                value={form.medication_id}
                                onChange={(e) => handleMedChange(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Choose from inventory...</option>
                                {medications.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.brand_name} — {m.ingredient_name} {m.dosage} ({m.form})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMed && (
                            <div className="mt-3 bg-blue-50 rounded-xl p-4 grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <p className="text-xs text-blue-400 mb-1">Stock</p>
                                    <p className="font-bold text-blue-700">{selectedMed.stock} units</p>
                                </div>
                                <div className="text-center border-x border-blue-100">
                                    <p className="text-xs text-blue-400 mb-1">Expiry</p>
                                    <p className="font-bold text-blue-700">{new Date(selectedMed.expiry).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-blue-400 mb-1">Sell Price</p>
                                    <p className="font-bold text-blue-700">${Number(selectedMed.selling_price).toFixed(2)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Patient Information */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Info size={16} color="#2563eb" />
                            Patient Information
                        </h2>
                        <div className="space-y-4">
                            {/* Weight */}
                            <div>
                                <label className={labelClass}>Weight (kg) *</label>
                                <input
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. 40"
                                    min="0.5"
                                    step="0.1"
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label className={labelClass}>Age</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={form.age}
                                        onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))}
                                        className={inputClass}
                                        placeholder="e.g. 8"
                                        min="0"
                                    />
                                    <select
                                        value={form.age_unit}
                                        onChange={(e) => setForm(f => ({ ...f, age_unit: e.target.value }))}
                                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 flex-shrink-0"
                                    >
                                        <option value="years">Years</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                            </div>

                            {/* Renal Function */}
                            <div>
                                <label className={labelClass}>Renal Function</label>
                                <select
                                    value={form.renal}
                                    onChange={(e) => setForm(f => ({ ...f, renal: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="mild">Mild Impairment (CrCl 50-80)</option>
                                    <option value="moderate">Moderate Impairment (CrCl 10-50)</option>
                                    <option value="severe">Severe Impairment (CrCl &lt;10)</option>
                                </select>
                            </div>

                            {/* Pregnancy */}
                            <div>
                                <label className={labelClass}>Pregnancy</label>
                                <select
                                    value={form.pregnant}
                                    onChange={(e) => setForm(f => ({ ...f, pregnant: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="no">Not Pregnant</option>
                                    <option value="yes">Pregnant</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dosing Parameters */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Calculator size={16} color="#2563eb" />
                            Dosing Parameters
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Dose (mg/kg/day) *</label>
                                <input
                                    type="number"
                                    value={form.dose_per_kg}
                                    onChange={(e) => setForm(f => ({ ...f, dose_per_kg: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. 25"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Frequency *</label>
                                <select
                                    value={form.frequency}
                                    onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="1">Once daily (OD)</option>
                                    <option value="2">Twice daily (BID)</option>
                                    <option value="3">Three times daily (TID)</option>
                                    <option value="4">Four times daily (QID)</option>
                                    <option value="6">Every 4 hours</option>
                                    <option value="8">Every 3 hours</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Duration (days)</label>
                                <input
                                    type="number"
                                    value={form.duration}
                                    onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. 7"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={16} color="#ef4444" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={calculate}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                    >
                        <Calculator size={22} color="white" />
                        Calculate Dose
                    </button>
                </div>

                {/* Right — Results */}
                <div>
                    {!result ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center text-slate-300 p-12">
                            <Calculator size={60} color="#e2e8f0" />
                            <p className="mt-4 font-medium text-slate-400">Results will appear here</p>
                            <p className="text-sm text-slate-300 mt-1">Fill in the form and click Calculate</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Main Results */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <CheckCircle size={16} color="#10b981" />
                                    Calculation Results
                                </h3>

                                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 text-white mb-4">
                                    <p className="text-blue-100 text-sm mb-1">Give per dose</p>
                                    <p className="text-4xl font-bold">{result.perDoseMg} mg</p>
                                    {result.perDoseVolume && (
                                        <p className="text-blue-100 text-lg mt-1">= {result.perDoseVolume} ml</p>
                                    )}
                                    <p className="text-blue-200 text-sm mt-2">
                                        {frequencyLabel[result.frequency]} for {result.duration} days
                                    </p>
                                </div>

                                <ResultRow label="Total daily dose" value={`${result.totalDailyDose} mg/day`} />
                                <ResultRow label="Per dose amount" value={`${result.perDoseMg} mg`} highlight />
                                {result.perDoseVolume && (
                                    <ResultRow label="Volume per dose" value={`${result.perDoseVolume} ml`} highlight />
                                )}
                                {result.concentrationText && (
                                    <ResultRow label="Concentration used" value={result.concentrationText} />
                                )}
                                <ResultRow label="Frequency" value={frequencyLabel[result.frequency]} />
                                <ResultRow label="Duration" value={`${result.duration} days`} />
                                <ResultRow label="Total course dose" value={`${result.totalCourseMg} mg`} />
                                {result.totalCourseVolume && (
                                    <ResultRow label="Total course volume" value={`${result.totalCourseVolume} ml`} />
                                )}
                            </div>

                            {/* Calculation Steps */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                                <h3 className="font-bold text-slate-600 text-sm mb-3">Calculation Steps</h3>
                                <div className="space-y-2 text-xs text-slate-500 font-mono">
                                    <p>1. Total daily dose = {form.weight}kg × {form.dose_per_kg}mg/kg = {result.totalDailyDose}mg/day</p>
                                    <p>2. Per dose = {result.totalDailyDose}mg ÷ {result.frequency} doses = {result.perDoseMg}mg/dose</p>
                                    {result.perDoseVolume && result.concentrationText && (
                                        <p>3. Volume = ({result.perDoseMg}mg ÷ {result.concentrationText.split('/')[0].replace('mg','')}) × {result.concentrationText.split('/')[1].replace('ml','')}ml = {result.perDoseVolume}ml</p>
                                    )}
                                </div>
                            </div>

                            {/* Stock Info */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Pill size={16} color="#2563eb" />
                                    Stock Information
                                </h3>
                                <ResultRow label="Medication" value={`${result.brandName} (${result.ingredient})`} />
                                <ResultRow label="Available stock" value={`${result.stock} units`} />
                                <ResultRow label="Selling price" value={`$${Number(result.sellingPrice).toFixed(2)}`} />
                                <ResultRow
                                    label="Expiry"
                                    value={`${new Date(selectedMed.expiry).toLocaleDateString()} (${result.daysUntilExpiry} days)`}
                                />
                            </div>

                            {/* Warnings */}
                            {(result.renalWarning || result.pregnancyWarning || result.isPediatric || result.daysUntilExpiry <= 90) && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} color="#f97316" />
                                        Clinical Alerts
                                    </h3>
                                    <div className="space-y-2">
                                        {result.daysUntilExpiry <= 90 && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                                                <span className="font-semibold">FEFO Alert:</span> This batch expires in {result.daysUntilExpiry} days — dispense this stock first
                                            </div>
                                        )}
                                        {result.isPediatric && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                                                <span className="font-semibold">Pediatric patient</span> — verify dose is within safe range for age and weight
                                            </div>
                                        )}
                                        {result.renalWarning && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                                <span className="font-semibold">Renal Impairment:</span> {result.renalWarning}
                                            </div>
                                        )}
                                        {result.pregnancyWarning && (
                                            <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-sm text-pink-700">
                                                <span className="font-semibold">Pregnancy:</span> Verify safety category before dispensing this medication
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DosageCalculator