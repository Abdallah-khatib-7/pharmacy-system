import { useState, useEffect } from 'react'
import {
    Users, UserPlus, X, ChevronRight, Pill, FileText,
    CheckCircle, DollarSign, Calendar, Activity,
    AlertTriangle, Trash2, Heart, Shield, Star,
    BarChart2, RefreshCw
} from 'lucide-react'
import api from '../api/axios'

// ─── small reusable stat card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={18} color="white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    </div>
)

// ─── mini sparkline bar chart — shows daily activity for the last 30 days ────
const Sparkline = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-xs text-slate-400 text-center py-4">No activity data</p>
    }
    const max = Math.max(...data.map(d => d.count), 1)
    return (
        <div className="flex items-end gap-0.5 h-12">
            {data.map((d, i) => (
                <div
                    key={i}
                    title={`${d.date}: ${d.count} prescriptions`}
                    className="flex-1 bg-violet-500 rounded-sm hover:bg-violet-600 transition cursor-default"
                    style={{ height: `${Math.max((d.count / max) * 100, 8)}%`, minWidth: 3 }}
                />
            ))}
        </div>
    )
}

// ─── dispensing rate badge ─────────────────────────────────────────────────
const RateBadge = ({ dispensed, total }) => {
    const rate = total > 0 ? Math.round((dispensed / total) * 100) : 0
    const color = rate >= 80 ? 'text-green-700 bg-green-100' : rate >= 50 ? 'text-orange-700 bg-orange-100' : 'text-red-700 bg-red-100'
    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{rate}% dispensed</span>
    )
}

// ─── main component ───────────────────────────────────────────────────────────
const UsersPage = () => {
    const [pharmacists, setPharmacists] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('total_prescriptions')
    const [confirmDelete, setConfirmDelete] = useState(null)

    // New pharmacist form state
    const [newForm, setNewForm] = useState({ name: '', email: '', password: '' })
    const [formError, setFormError] = useState('')
    const [formSaving, setFormSaving] = useState(false)

    const fetchPharmacists = async () => {
        try {
            setLoading(true)
            const res = await api.get('/users')
            setPharmacists(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPharmacists()
    }, [])

    // Load deep profile when admin clicks a pharmacist card
    const openProfile = async (pharmacist) => {
        setSelectedUser(pharmacist)
        setProfile(null)
        setProfileLoading(true)
        try {
            const res = await api.get(`/users/${pharmacist.id}/profile`)
            setProfile(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setProfileLoading(false)
        }
    }

    const handleAddPharmacist = async () => {
        setFormError('')
        if (!newForm.name.trim() || !newForm.email.trim() || !newForm.password.trim()) {
            setFormError('All fields are required')
            return
        }
        setFormSaving(true)
        try {
            await api.post('/users', newForm)
            setShowAddModal(false)
            setNewForm({ name: '', email: '', password: '' })
            fetchPharmacists()
        } catch (err) {
            setFormError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setFormSaving(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/${id}`)
            setConfirmDelete(null)
            if (selectedUser?.id === id) setSelectedUser(null)
            fetchPharmacists()
        } catch (err) {
            console.error(err)
        }
    }

    // Client-side filter + sort — no extra API calls needed
    const displayed = pharmacists
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                     p.email.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))

    // Aggregate totals for the summary row at the top
    const totals = pharmacists.reduce((acc, p) => ({
        prescriptions: acc.prescriptions + Number(p.total_prescriptions),
        dispensed:     acc.dispensed     + Number(p.dispensed),
        revenue:       acc.revenue       + Number(p.total_revenue),
    }), { prescriptions: 0, dispensed: 0, revenue: 0 })

    return (
        <div>
            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users size={26} color="#8b5cf6" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Pharmacist Management</h1>
                        <p className="text-slate-400 text-sm">{pharmacists.length} pharmacist{pharmacists.length !== 1 ? 's' : ''} registered</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchPharmacists} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                        <RefreshCw size={16} color="#64748b" />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-violet-200"
                    >
                        <UserPlus size={18} color="white" />
                        Add Pharmacist
                    </button>
                </div>
            </div>

            {/* ── Summary stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Pharmacists" value={pharmacists.length}  icon={Users}       color="bg-violet-600" bg="bg-violet-50" />
                <StatCard label="Total Prescriptions" value={totals.prescriptions} icon={FileText}  color="bg-blue-600"   bg="bg-blue-50" />
                <StatCard label="Dispensed"          value={totals.dispensed}    icon={CheckCircle} color="bg-green-600"  bg="bg-green-50" />
                <StatCard label="Total Revenue"      value={`$${Number(totals.revenue).toFixed(0)}`} icon={DollarSign} color="bg-amber-500" bg="bg-amber-50" />
            </div>

            {/* ── Search + sort ── */}
            <div className="flex gap-3 mb-5">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                    <option value="total_prescriptions">Sort: Most Prescriptions</option>
                    <option value="dispensed">Sort: Most Dispensed</option>
                    <option value="total_revenue">Sort: Most Revenue</option>
                    <option value="unique_patients">Sort: Most Patients</option>
                    <option value="prescriptions_this_month">Sort: Active This Month</option>
                </select>
            </div>

            {/* ── Pharmacist cards ── */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Users size={40} color="#cbd5e1" className="mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No pharmacists found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map(p => (
                        <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition cursor-pointer hover:border-violet-200"
                            style={{ animation: 'fadeIn 0.3s ease-out' }}
                            onClick={() => openProfile(p)}
                        >
                            <div className="flex items-center justify-between">
                                {/* Avatar + name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-200">
                                        <span className="text-white font-bold text-lg">{p.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.email}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Joined {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div className="hidden md:flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-800">{p.total_prescriptions}</p>
                                        <p className="text-xs text-slate-400">Total Rx</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-green-600">{p.dispensed}</p>
                                        <p className="text-xs text-slate-400">Dispensed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-blue-600">{p.unique_patients}</p>
                                        <p className="text-xs text-slate-400">Patients</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-amber-600">${Number(p.total_revenue).toFixed(0)}</p>
                                        <p className="text-xs text-slate-400">Revenue</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-violet-600">{p.prescriptions_this_month}</p>
                                        <p className="text-xs text-slate-400">This Month</p>
                                    </div>
                                </div>

                                {/* Badges + actions */}
                                <div className="flex items-center gap-3">
                                    <RateBadge dispensed={p.dispensed} total={p.total_prescriptions} />
                                    {p.pending > 0 && (
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                            {p.pending} pending
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(p) }}
                                        className="p-2 hover:bg-red-50 rounded-xl transition"
                                    >
                                        <Trash2 size={14} color="#ef4444" />
                                    </button>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </div>
                            </div>

                            {/* Mobile stats row */}
                            <div className="flex md:hidden gap-4 mt-3 pt-3 border-t border-slate-100">
                                <div className="text-center flex-1">
                                    <p className="font-bold text-slate-800">{p.total_prescriptions}</p>
                                    <p className="text-xs text-slate-400">Rx</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="font-bold text-green-600">{p.dispensed}</p>
                                    <p className="text-xs text-slate-400">Done</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="font-bold text-amber-600">${Number(p.total_revenue).toFixed(0)}</p>
                                    <p className="text-xs text-slate-400">Revenue</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                Deep-profile slide-over panel
            ───────────────────────────────────────────────────────────────── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setSelectedUser(null)} />
                    <div
                        className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
                        style={{ animation: 'slideIn 0.3s ease-out' }}
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                                    <span className="text-white font-bold text-xl">{selectedUser.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{selectedUser.name}</h2>
                                    <p className="text-sm text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* ── Snapshot stats ── */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-slate-800">{selectedUser.total_prescriptions}</p>
                                    <p className="text-xs text-slate-500">Total Rx</p>
                                </div>
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-700">{selectedUser.dispensed}</p>
                                    <p className="text-xs text-slate-500">Dispensed</p>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-red-600">{selectedUser.cancelled}</p>
                                    <p className="text-xs text-slate-500">Cancelled</p>
                                </div>
                                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-orange-600">{selectedUser.pending}</p>
                                    <p className="text-xs text-slate-500">Pending</p>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{selectedUser.unique_patients}</p>
                                    <p className="text-xs text-slate-500">Unique Patients</p>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-bold text-amber-600">${Number(selectedUser.total_revenue).toFixed(0)}</p>
                                    <p className="text-xs text-slate-500">Revenue Generated</p>
                                </div>
                            </div>

                            {/* ── Special patient flags ── */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                    <Shield size={20} color="#2563eb" />
                                    <div>
                                        <p className="text-lg font-bold text-blue-700">{selectedUser.insured_patients}</p>
                                        <p className="text-xs text-slate-500">Insured Patients</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                    <Heart size={20} color="#ea580c" />
                                    <div>
                                        <p className="text-lg font-bold text-orange-600">{selectedUser.hospitalized_patients}</p>
                                        <p className="text-xs text-slate-500">Hospitalized Patients</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── This week / month activity ── */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Activity size={16} color="#7c3aed" /> Recent Activity
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
                                        <p className="text-xl font-bold text-violet-600">{selectedUser.prescriptions_this_week}</p>
                                        <p className="text-xs text-slate-500">This Week</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
                                        <p className="text-xl font-bold text-violet-600">{selectedUser.prescriptions_this_month}</p>
                                        <p className="text-xs text-slate-500">This Month</p>
                                    </div>
                                </div>
                            </div>

                            {profileLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
                                </div>
                            ) : profile ? (
                                <>
                                    {/* ── 30-day activity sparkline ── */}
                                    {profile.activity.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <BarChart2 size={16} color="#7c3aed" /> Last 30 Days Activity
                                            </h3>
                                            <Sparkline data={profile.activity} />
                                            <p className="text-xs text-slate-400 mt-2 text-right">
                                                {profile.activity.reduce((s, d) => s + d.count, 0)} total prescriptions
                                            </p>
                                        </div>
                                    )}

                                    {/* ── Top prescribed medications ── */}
                                    {profile.medications.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Pill size={16} color="#7c3aed" /> Most Prescribed Medications
                                            </h3>
                                            <div className="space-y-2">
                                                {profile.medications.map((med, i) => {
                                                    const maxVal = profile.medications[0].total_dispensed
                                                    const pct = Math.round((med.total_dispensed / maxVal) * 100)
                                                    return (
                                                        <div key={i}>
                                                            <div className="flex items-center justify-between text-sm mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    {i === 0 && <Star size={12} color="#f59e0b" />}
                                                                    <span className="font-semibold text-slate-700">{med.brand_name}</span>
                                                                    <span className="text-slate-400 text-xs">{med.ingredient} · {med.dosage} {med.form}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-slate-500">{med.times_prescribed}× prescribed</span>
                                                                    <span className="font-bold text-violet-600">{med.total_dispensed} units</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-violet-500 h-1.5 rounded-full transition-all"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Recent prescription history ── */}
                                    {profile.prescriptions.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <FileText size={16} color="#7c3aed" /> Recent Prescriptions
                                            </h3>
                                            <div className="space-y-2">
                                                {profile.prescriptions.map((rx) => {
                                                    const statusColor = rx.status === 'dispensed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : rx.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    return (
                                                        <div key={rx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold text-slate-700 text-sm truncate">{rx.patient_name}</p>
                                                                    {rx.insurance === 1 && (
                                                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">Insured</span>
                                                                    )}
                                                                    {rx.hospitalized === 1 && (
                                                                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">Hosp.</span>
                                                                    )}
                                                                </div>
                                                                {rx.diagnosis && (
                                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{rx.diagnosis}</p>
                                                                )}
                                                                {rx.medications && (
                                                                    <p className="text-xs text-violet-600 truncate mt-0.5">{rx.medications}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                                                                    {rx.status}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    ${Number(rx.prescription_value).toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    {new Date(rx.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Paid leave records ── */}
                                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                <Calendar size={16} color="#7c3aed" /> Paid Leave Records
                                            </h3>
                                        </div>
                                        {profile.leaves.length === 0 ? (
                                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <Calendar size={24} color="#cbd5e1" className="mx-auto mb-2" />
                                                <p className="text-sm text-slate-400">No leave records yet</p>
                                                <p className="text-xs text-slate-400 mt-1">Leave tracking table not set up or no leaves taken</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {profile.leaves.map((leave, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                                                        <span className="font-medium text-slate-700">{leave.type || 'Paid Leave'}</span>
                                                        <span className="text-slate-500">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                                                        <span className="text-slate-400">{new Date(leave.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Account info ── */}
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                        <h3 className="font-bold text-slate-700 text-sm mb-2">Account Info</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Member since</span>
                                            <span className="font-semibold text-slate-700">
                                                {new Date(selectedUser.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Days on the job</span>
                                            <span className="font-semibold text-slate-700">
                                               {Math.floor((new Date() - new Date(selectedUser.created_at)) / (1000 * 60 * 60 * 24))} days
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Avg Rx/day</span>
                                            <span className="font-semibold text-slate-700">
                                                {(() => {
                                                   const days = Math.max(Math.floor((new Date() - new Date(selectedUser.created_at)) / (1000 * 60 * 60 * 24)), 1)
                                                    return (selectedUser.total_prescriptions / days).toFixed(2)
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Cancellation rate</span>
                                            <span className={`font-semibold ${selectedUser.cancelled / Math.max(selectedUser.total_prescriptions, 1) > 0.2 ? 'text-red-600' : 'text-slate-700'}`}>
                                                {selectedUser.total_prescriptions > 0
                                                    ? `${Math.round((selectedUser.cancelled / selectedUser.total_prescriptions) * 100)}%`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── Danger zone ── */}
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                                        <h3 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-2">
                                            <AlertTriangle size={14} color="#dc2626" /> Danger Zone
                                        </h3>
                                        <button
                                            onClick={() => setConfirmDelete(selectedUser)}
                                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                                        >
                                            <Trash2 size={14} color="white" />
                                            Remove Pharmacist Account
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                Add pharmacist modal
            ───────────────────────────────────────────────────────────────── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">Add New Pharmacist</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                                <AlertTriangle size={14} color="#ef4444" /> {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    value={newForm.name}
                                    onChange={(e) => setNewForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    placeholder="e.g. Sarah Johnson"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email *</label>
                                <input
                                    type="email"
                                    value={newForm.email}
                                    onChange={(e) => setNewForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    placeholder="sarah@pharmacy.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Temporary Password *</label>
                                <input
                                    type="password"
                                    value={newForm.password}
                                    onChange={(e) => setNewForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddPharmacist}
                            disabled={formSaving}
                            className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-violet-200"
                        >
                            {formSaving ? 'Creating...' : 'Create Pharmacist Account'}
                        </button>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                Delete confirmation modal
            ───────────────────────────────────────────────────────────────── */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setConfirmDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} color="#ef4444" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2">Remove Pharmacist?</h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Are you sure you want to remove <strong>{confirmDelete.name}</strong>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage
