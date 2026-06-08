import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../context/useAuth'



const Login = () => {
     const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, token, user } = useAuth()
    const navigate = useNavigate()
      if (token && user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const response = await api.post('/auth/login', { email, password })
            login(response.data.user, response.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 flex-col justify-center items-center p-12 relative overflow-hidden">
                {/* Animated circles */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white opacity-5 rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-cyan-300 opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-300 opacity-10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>

                <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm shadow-2xl">
                        <span className="text-5xl">💊</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        PharmaCare
                    </h1>
                    <p className="text-blue-100 text-lg max-w-sm leading-relaxed">
                        Complete pharmacy management system. Track inventory, prescriptions, and suppliers in one place.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12 justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">99%</div>
                            <div className="text-blue-200 text-sm mt-1">Uptime</div>
                        </div>
                        <div className="w-px bg-blue-400 opacity-40"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">∞</div>
                            <div className="text-blue-200 text-sm mt-1">Medications</div>
                        </div>
                        <div className="w-px bg-blue-400 opacity-40"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-blue-200 text-sm mt-1">Access</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <span className="text-5xl">💊</span>
                        <h1 className="text-2xl font-bold text-blue-700 mt-2">PharmaCare</h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
                        <p className="text-gray-400 text-sm mb-8">Sign in to your pharmacy account</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 text-gray-800"
                                        placeholder="you@pharmacy.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 text-gray-800"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-blue-200 hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign In →'}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-8">
                            Protected by JWT Authentication
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login