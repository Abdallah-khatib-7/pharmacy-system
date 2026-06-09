import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Pill, Shield, BarChart2, FileText, Truck,
    AlertTriangle, Calculator, Sparkles, ArrowRight,
    CheckCircle, Clock, Users, Lock, Key
} from 'lucide-react'

// Animated counter hook
const useCounter = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [start, target, duration])
    return count
}

const StatCounter = ({ value, suffix, label, start }) => {
    const num = useCounter(value, 1800, start)
    return (
        <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">
                {num}{suffix}
            </p>
            <p className="text-blue-200 text-sm">{label}</p>
        </div>
    )
}

const Feature = ({ icon: Icon, color, bg, title, desc }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
            <Icon size={22} color={color} />
        </div>
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
)

const Landing = () => {
    const navigate = useNavigate()
    const statsRef = useRef(null)
    const [statsVisible, setStatsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
            { threshold: 0.3 }
        )
        if (statsRef.current) observer.observe(statsRef.current)
        return () => observer.disconnect()
    }, [])

    const features = [
        { icon: Pill, color: '#2563eb', bg: 'bg-blue-100', title: 'Smart Inventory', desc: 'Track medications by brand and active ingredient. Get instant alerts for low stock and expiring medications before they become a problem.' },
        { icon: FileText, color: '#7c3aed', bg: 'bg-violet-100', title: 'Prescriptions', desc: 'Create detailed prescriptions with insurance coverage calculation, diagnosis tracking, and automatic stock deduction on dispense.' },
        { icon: Truck, color: '#10b981', bg: 'bg-emerald-100', title: 'Supplier Management', desc: 'Manage suppliers, create purchase orders, and verify deliveries. Stock updates automatically when orders are received and confirmed.' },
        { icon: AlertTriangle, color: '#f97316', bg: 'bg-orange-100', title: 'Smart Alerts', desc: 'Never miss a critical situation. Low stock and expiry alerts with PDF export — filter by supplier and send directly to your rep.' },
        { icon: Calculator, color: '#0891b2', bg: 'bg-cyan-100', title: 'Dosage Calculator', desc: 'Professional weight-based dosage calculator with renal impairment adjustments, pediatric flags, and pregnancy warnings.' },
        { icon: Sparkles, color: '#8b5cf6', bg: 'bg-violet-100', title: 'PharmaCare AI', desc: 'AI assistant with live inventory access. Ask about alternatives, get FEFO recommendations, and receive professional answers instantly.' },
        { icon: Shield, color: '#2563eb', bg: 'bg-blue-100', title: 'Role-Based Access', desc: 'Admin and pharmacist roles with different permissions. Full audit trail of who dispensed what, when, and to whom.' },
        { icon: BarChart2, color: '#10b981', bg: 'bg-emerald-100', title: 'Performance Analytics', desc: 'Track each pharmacist\'s prescriptions, dispensing rate, revenue generated, and monthly activity — all in one view.' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-900">
                <Pill size={20} color="white" />
            </div>
            <span className="text-xl font-bold text-white">PharmaCare</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 px-3 py-1.5 rounded-xl">
                <Lock size={13} color="#94a3b8" />
                <span className="text-red-800 text-xs font-semibold">Staff Access Only</span>
            </div>
            <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-900"
            >
                Staff Login
                <ArrowRight size={16} color="white" />
            </button>
        </div>
    </div>
</nav>

            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500 opacity-10 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-cyan-500 opacity-10 rounded-full animate-pulse"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-full px-4 py-2 w-fit mb-8">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-200 text-sm font-medium">Private Pharmacy Management System</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Your Pharmacy.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Fully Under Control.</span>
                        </h1>

                        <p className="text-slate-300 text-xl mb-6 leading-relaxed max-w-2xl">
                            PharmaCare is a closed, professional pharmacy management system. 
                            Access is restricted to authorized pharmacy staff only — no public registration.
                        </p>

                        {/* Access info box */}
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-5 mb-10 max-w-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Key size={16} color="#60a5fa" />
                                <span className="text-blue-700 text-sm font-semibold">How Access Works</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    'The pharmacy owner registers as Admin',
                                    'Admin creates accounts for their pharmacists',
                                    'Each pharmacist logs in with their own credentials',
                                    'No public sign-up — full control over who accesses your data'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle size={14} color="#4ade80" className="mt-0.5 flex-shrink-0" />
                                        <span className="text-blue-500 font-bold text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-2xl shadow-blue-900"
                            >
                                Staff Login
                                <ArrowRight size={20} color="white" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-6 mt-10">
                            {[
                                { icon: CheckCircle, text: 'Role-based access control' },
                                { icon: Clock, text: 'Real-time stock alerts' },
                                { icon: Users, text: 'Multi-pharmacist support' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <item.icon size={16} color="#60a5fa" />
                                    <span className="text-slate-300 text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar — animated counters */}
            <section ref={statsRef} className="bg-gradient-to-r from-blue-600 to-cyan-500 py-14">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCounter value={57} suffix="+" label="Medications Tracked" start={statsVisible} />
                        <StatCounter value={20} suffix="+" label="Active Ingredients" start={statsVisible} />
                        <StatCounter value={360} suffix="°" label="Pharmacy Coverage" start={statsVisible} />
                        <StatCounter value={24} suffix="/7" label="System Availability" start={statsVisible} />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything Your Pharmacy Needs</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Built by someone who worked in a pharmacy for 5 years. Every feature solves a real problem pharmacists face daily.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((f, i) => <Feature key={i} {...f} />)}
                </div>
            </section>

            {/* Who is this for */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Built for Real Pharmacy Teams</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Designed around the actual workflow of a Lebanese pharmacy
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'For the Pharmacy Owner',
                                desc: 'Register as admin. Add your pharmacists. Control who has access to what. View performance analytics, revenue, and full audit history. You are in complete control.',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                                icon: Shield
                            },
                            {
                                step: '02',
                                title: 'For the Pharmacist',
                                desc: 'Log in with your credentials. Create prescriptions, manage stock, search by active ingredient, check alerts, and use the AI assistant — all in one place.',
                                color: 'text-violet-600',
                                bg: 'bg-violet-50',
                                icon: Users
                            },
                            {
                                step: '03',
                                title: 'For the Pharmacy',
                                desc: 'Real-time inventory, automatic stock deduction on dispense, purchase orders that update stock on receipt, and PDF reports you can send directly to suppliers.',
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                                icon: Pill
                            }
                        ].map((item, i) => (
                            <div key={i} className={`${item.bg} rounded-2xl p-8`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-5xl font-black ${item.color} opacity-20`}>{item.step}</span>
                                    <item.icon size={24} color={item.color.replace('text-', '#').replace('blue-600', '2563eb').replace('violet-600', '7c3aed').replace('emerald-600', '059669')} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 lg:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-10 translate-y-10"></div>
                    <div className="relative z-10 lg:flex items-center justify-between gap-12">
                        <div className="max-w-xl mb-8 lg:mb-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Sparkles size={24} color="white" />
</div>
                                <span className="text-violet-300 font-semibold">AI-Powered Assistant</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Meet PharmaCare AI</h2>
                            <p className="text-violet-200 text-lg leading-relaxed">
                                Your intelligent pharmacy assistant with live access to your inventory. 
                                Ask about drug alternatives, get FEFO recommendations, and receive professional answers — 
                                no disclaimers, no redirects to doctors.
                            </p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: 24, minWidth: 288 }}>
    <p style={{ color: '#ddd6fe', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Example questions:</p>
    {[
        'What Ibuprofen brands do we have in stock?',
        'Which medications expire in the next 30 days?',
        "What's the antibiotic alternative to Amoxil?",
        'Which items should I sell first today?'
    ].map((q, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <Sparkles size={12} color="#c4b5fd" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.5 }}>{q}</span>
        </div>
    ))}
</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-900 py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Pill size={28} color="white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        If you are pharmacy staff, log in with your credentials provided by your admin.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-2xl mx-auto"
                    >
                        Staff Login
                        <ArrowRight size={20} color="white" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-8">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 rounded-xl p-1.5">
                            <Pill size={16} color="white" />
                        </div>
                        <span className="text-white font-bold">PharmaCare</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock size={13} color="#64748b" />
                        <p className="text-slate-500 text-sm">Private system — authorized staff only</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing