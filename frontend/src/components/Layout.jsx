import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Pill, LayoutDashboard, Truck, FileText,
    AlertTriangle, LogOut, Menu, X,
    ChevronRight, Users, Search
} from 'lucide-react'
import useAuth from '../context/useAuth'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const adminLinks = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'Medications', icon: Pill, path: '/medications' },
        { label: 'Ingredients', icon: Search, path: '/ingredients' },
        { label: 'Suppliers', icon: Truck, path: '/suppliers' },
        { label: 'Prescriptions', icon: FileText, path: '/prescriptions' },
        { label: 'Users', icon: Users, path: '/users' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
    ]

    const pharmacistLinks = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Medications', icon: Pill, path: '/medications' },
        { label: 'Search by Ingredient', icon: Search, path: '/ingredients' },
        { label: 'Prescriptions', icon: FileText, path: '/prescriptions' },
        { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
    ]

    const links = user?.role === 'admin' ? adminLinks : pharmacistLinks

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: collapsed ? 80 : 256,
                transition: 'width 0.3s',
                background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                height: '100vh',
                overflowY: 'auto'
            }}>
                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-900">
                                <Pill size={20} color="white" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-tight">PharmaCare</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-700"
                    >
                        {collapsed ? <Menu size={20} color="#94a3b8" /> : <X size={20} color="#94a3b8" />}
                    </button>
                </div>

                {/* User info */}
                {!collapsed && (
                    <div className="px-4 py-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                    {user?.name?.charAt(0)}
                                </span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                                <span className="text-xs bg-blue-500 bg-opacity-30 text-blue-300 px-2 py-0.5 rounded-full capitalize">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {links.map((link, i) => {
                            const active = location.pathname === link.path
                            return (
                                <button
                                    key={i}
                                    onClick={() => navigate(link.path)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        borderRadius: 12,
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: active ? '#2563eb' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#334155' }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                                >
                                    <link.icon size={20} color={active ? 'white' : '#94a3b8'} />
                                    {!collapsed && (
                                        <>
                                            <span style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                flex: 1,
                                                textAlign: 'left',
                                                color: active ? 'white' : '#94a3b8'
                                            }}>
                                                {link.label}
                                            </span>
                                            {active && <ChevronRight size={14} color="white" />}
                                        </>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid #334155' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={20} color="#ef4444" />
                        {!collapsed && (
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <div style={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #f1f5f9',
                    padding: '16px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
                            {location.pathname.replace('/', '') || 'Dashboard'}
                        </h2>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>PharmaCare Management System</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, backgroundColor: '#4ade80', borderRadius: '50%' }} className="animate-pulse"></div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>System Online</span>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ padding: 32, flex: 1 }}>
                    {children}
                </div>
            </main>
        </div>
    )
}

export default Layout