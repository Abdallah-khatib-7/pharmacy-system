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
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-2xl relative z-20`}
            >
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
                        {collapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                {/* User info */}
                {!collapsed && (
                    <div className="px-4 py-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900 flex-shrink-0">
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
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {links.map((link, i) => {
                        const active = location.pathname === link.path
                        return (
                            <button
                                key={i}
                                onClick={() => navigate(link.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                    ${active
                                        ? 'bg-blue-600 shadow-lg shadow-blue-900'
                                        : 'hover:bg-slate-700'
                                    }`}
                            >
                                <link.icon
                                    size={20}
                                    color={active ? 'white' : '#94a3b8'}
                                />
                                {!collapsed && (
                                    <>
                                        <span className={`text-sm font-medium flex-1 text-left ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                            {link.label}
                                        </span>
                                        {active && <ChevronRight size={14} color="white" />}
                                    </>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500 hover:bg-opacity-20 transition group"
                    >
                        <LogOut size={20} color="#ef4444" />
                        {!collapsed && (
                            <span className="text-sm font-medium text-slate-400 group-hover:text-red-400">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div>
                        <h2 className="text-slate-800 font-semibold capitalize">
                            {location.pathname.replace('/', '') || 'Dashboard'}
                        </h2>
                        <p className="text-xs text-slate-400">PharmaCare Management System</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-400">System Online</span>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default Layout