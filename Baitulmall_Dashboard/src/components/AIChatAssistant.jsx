import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Loader2, X } from 'lucide-react';
import { smartAssistantApi } from '../services/smartAssistantApi';

const AIChatAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Assalamu\'alaikum! Saya Asisten AI Baitulmal. Ada yang bisa saya bantu? Cek "Siapa belum bayar zakat" atau coba "Buatkan undangan rapat".'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Check if document generation command
            if (input.toLowerCase().includes('undangan') || input.toLowerCase().includes('surat')) {
                const res = await smartAssistantApi.generateDocument('undangan_rt', { event_name: 'Rapat Koordinasi' });
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Dokumen berhasil dibuat!',
                    type: 'document',
                    data: res.html
                }]);
            } else {
                // Normal chat
                const res = await smartAssistantApi.chat(userMsg.content);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.message,
                    type: res.type,
                    data: res.data
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan koneksi.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Asisten Baitulmal</h3>
                        <p className="text-xs opacity-90">Online • Smart Logic</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                    <X size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-none'}`}>
                            {msg.type === 'document' ? (
                                <div>
                                    <p className="mb-2 font-semibold flex items-center gap-2"><FileText size={14} /> Dokumen Dibuat:</p>
                                    <div className="bg-gray-50 p-2 rounded border text-xs font-mono max-h-32 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                        {msg.data.substring(0, 100)}...
                                    </div>
                                    <button className="mt-2 text-xs bg-[var(--primary)] text-white px-3 py-1 rounded w-full hover:bg-[var(--primary-hover)] transition-colors">
                                        Download / View
                                    </button>
                                </div>
                            ) : msg.type === 'list_muzaki' ? (
                                <div>
                                    <p className="mb-2">{msg.content}</p>
                                    {msg.data && (
                                        <ul className="space-y-1 mt-2 bg-slate-50 p-2 rounded">
                                            {msg.data.map((m, i) => (
                                                <li key={i} className="flex justify-between text-xs border-b border-gray-200 pb-1 last:border-0">
                                                    <span className="font-semibold">{m.nama}</span>
                                                    <span className="text-slate-500">{m.rt} {m.status && `• ${m.status}`}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <Loader2 size={16} className="animate-spin text-primary" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pertanyaan atau perintah..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
