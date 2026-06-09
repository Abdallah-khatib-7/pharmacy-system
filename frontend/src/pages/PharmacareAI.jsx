import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader, Sparkles, AlertTriangle, Pill, TrendingDown } from 'lucide-react'
import api from '../api/axios'

const Message = ({ msg }) => {
    const isAI = msg.role === 'assistant'
    return (
        <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isAI ? 'bg-violet-600' : 'bg-slate-200'
            }`}>
                {isAI
                    ? <Bot size={16} color="white" />
                    : <User size={16} color="#64748b" />
                }
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isAI
                    ? 'bg-white border border-slate-100 shadow-sm text-slate-700'
                    : 'bg-violet-600 text-white'
            }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
        </div>
    )
}

const SuggestionChip = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="text-left text-sm bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-700 px-4 py-2.5 rounded-xl transition"
    >
        {text}
    </button>
)

const PharmacareAI = () => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const suggestions = [
        'What medications do we have for high blood pressure?',
        'Show me all Ibuprofen brands we have in stock',
        'Which medications are expiring in the next 30 days?',
        'What antibiotic alternatives do we have for Amoxicillin?',
        'What is the standard dosage for Metformin 500mg?',
        'Which medications are critically low in stock?',
    ]

    const sendMessage = async (text) => {
        const userMessage = text || input.trim()
        if (!userMessage || loading) return

        setInput('')
        const newMessages = [...messages, { role: 'user', content: userMessage }]
        setMessages(newMessages)
        setLoading(true)

        try {
            const history = newMessages.slice(-10).slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            }))

            const res = await api.post('/ai/chat', {
                message: userMessage,
                history
            })

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                    <Sparkles size={22} color="white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">PharmaCare AI</h1>
                    <p className="text-slate-400 text-sm">Your intelligent pharmacy assistant — connected to live inventory</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700">Live Inventory Connected</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        {/* Welcome */}
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-200 mb-6">
                            <Bot size={36} color="white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you today?</h2>
                        <p className="text-slate-400 text-sm mb-8 text-center max-w-md">
                            I have full access to your pharmacy inventory, expiry dates, stock levels, and medication database.
                        </p>

                        {/* Quick Stats */}
                        <div className="flex gap-4 mb-8">
                            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 px-4 py-2 rounded-xl">
                                <Pill size={16} color="#7c3aed" />
                                <span className="text-sm font-semibold text-violet-700">Full Inventory Access</span>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl">
                                <TrendingDown size={16} color="#f97316" />
                                <span className="text-sm font-semibold text-orange-700">Stock Awareness</span>
                            </div>
                            <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
                                <AlertTriangle size={16} color="#ef4444" />
                                <span className="text-sm font-semibold text-red-700">Expiry Tracking</span>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                            {suggestions.map((s, i) => (
                                <SuggestionChip key={i} text={s} onClick={sendMessage} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <Message key={i} msg={msg} />
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} color="white" />
                                </div>
                                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader size={14} color="#7c3aed" className="animate-spin" />
                                    <span className="text-sm text-slate-400">Analyzing inventory...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-slate-100">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask about medications, stock, dosages, alternatives..."
                        className="flex-1 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        disabled={loading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="w-12 h-12 bg-violet-600 hover:bg-violet-700 rounded-2xl flex items-center justify-center transition shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <Send size={18} color="white" />
                    </button>
                </div>
                <p className="text-xs text-slate-300 text-center mt-2">
                    PharmaCare AI has access to your live inventory and responds as a pharmacy professional
                </p>
            </div>
        </div>
    )
}

export default PharmacareAI