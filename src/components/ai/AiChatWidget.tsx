'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SUBJECTS, EXPLAIN_MODES } from '@/lib/ai-prompts'
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown, Sparkles, LogIn, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const mathSymbols = [
  { display: 'π', value: 'π', label: 'Pi' },
  { display: '√', value: '\\sqrt{}', label: 'Căn thức' },
  { display: 'x²', value: '^2', label: 'Mũ 2' },
  { display: 'xⁿ', value: '^', label: 'Mũ n' },
  { display: 'xᵢ', value: '_', label: 'Chỉ số dưới' },
  { display: '±', value: '±', label: 'Cộng trừ' },
  { display: '∞', value: '\\infty', label: 'Vô cùng' },
  { display: 'Δ', value: '\\Delta', label: 'Delta' },
  { display: '∫', value: '\\int', label: 'Tích phân' },
  { display: '∑', value: '\\sum', label: 'Tổng xích ma' },
  { display: '→', value: '\\rightarrow', label: 'Suy ra' },
  { display: '⇒', value: '\\Rightarrow', label: 'Suy ra lớn' },
  { display: 'α', value: '\\alpha', label: 'Alpha' },
  { display: 'β', value: '\\beta', label: 'Beta' },
  { display: 'θ', value: '\\theta', label: 'Theta' },
  { display: 'λ', value: '\\lambda', label: 'Lambda' },
  { display: '≠', value: '≠', label: 'Khác' },
  { display: '≤', value: '≤', label: 'Nhỏ hơn hoặc bằng' },
  { display: '≥', value: '≥', label: 'Lớn hơn hoặc bằng' },
]

const codeHelpers = [
  { display: '```code', value: '```\n\n```', label: 'Khung mã nguồn' },
  { display: 'Python', value: '```python\n\n```', label: 'Code Python' },
  { display: 'C++', value: '```cpp\n\n```', label: 'Code C++' },
  { display: 'Arduino', value: '```arduino\n\n```', label: 'Code Arduino' },
  { display: 'HTML', value: '```html\n\n```', label: 'Code HTML' },
  { display: 'JS', value: '```javascript\n\n```', label: 'Code JavaScript' },
]

export default function AiChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('stem')
  const [explainMode, setExplainMode] = useState('detailed')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [showMathDropdown, setShowMathDropdown] = useState(false)
  const [showCodeDropdown, setShowCodeDropdown] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiChatHistory')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setMessages(parsed)
          setShowIntro(false)
        }
      } catch (e) {
        console.error('Failed to parse chat history', e)
      }
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages))
      setShowIntro(false)
    } else {
      localStorage.removeItem('aiChatHistory')
      setShowIntro(true)
    }
    scrollToBottom()
  }, [messages, loading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const insertAtCursor = (value: string) => {
    const inputEl = inputRef.current
    if (!inputEl) return

    const start = inputEl.selectionStart ?? 0
    const end = inputEl.selectionEnd ?? 0
    const text = inputEl.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)

    setInput(before + value + after)

    setTimeout(() => {
      inputEl.focus()
      let newCursorPos = start + value.length
      if (value.endsWith('{}')) {
        newCursorPos -= 1
      } else if (value === '```\n\n```') {
        newCursorPos = start + 4
      } else if (value.startsWith('```') && value.endsWith('\n\n```')) {
        newCursorPos = start + value.indexOf('\n') + 1
      }
      inputEl.setSelectionRange(newCursorPos, newCursorPos)
    }, 50)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setShowSubjectDropdown(false)
        setShowModeDropdown(false)
        setShowMathDropdown(false)
        setShowCodeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // AI tooltip every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 5000)
      }
    }, 120000)
    return () => clearInterval(interval)
  }, [isOpen])

  const selectedSubject = SUBJECTS.find(s => s.key === subject)!
  const selectedMode = EXPLAIN_MODES.find(m => m.key === explainMode)!

  const clearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử trò chuyện?')) {
      setMessages([])
      toast.success('Đã xóa lịch sử')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng AI')
      return
    }

    const userMessage = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          subject,
          explainMode,
          history: messages.slice(-6),
        })
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (data.remainingQueries !== undefined && data.remainingQueries <= 3) {
        toast(`Bạn còn ${data.remainingQueries} lượt hỏi hôm nay`, { icon: '⏳' })
      }
    } catch {
      toast.error('Lỗi kết nối đến hệ thống AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* AI Tooltip */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-8 right-24 z-[99] animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl px-4 py-3 text-sm text-slate-700 font-medium max-w-[220px] border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span>Tôi là AI, hãy hỏi tôi bất cứ điều gì bạn thắc mắc nhé!</span>
            </div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-[-45deg]" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setShowTooltip(false); setIsOpen(!isOpen); }}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-110 ${
          isOpen
            ? 'bg-white/10 backdrop-blur-xl border border-white/20 rotate-90'
            : 'ai-fab-gradient border-2 border-white/30'
        }`}
        aria-label="Mở AI Chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 z-[100] w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-chat-open ai-chat-panel"
        >
          {/* Header */}
          <div className="ai-chat-header px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm">AI Trợ lý STEM</h4>
              <p className="text-white/50 text-xs truncate">THPT Đoàn Kết-Hai Bà Trưng</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-300 text-xs hidden sm:inline">Online</span>
              </span>
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                  title="Xóa lịch sử"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 ai-chat-messages text-white">
            {/* Intro */}
            {showIntro && (
              <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                <Sparkles className="w-10 h-10 mb-3 ai-galaxy-icon" />
                <h3 className="ai-galaxy-text text-xl font-extrabold tracking-wide text-center">
                  AI chatbot created by XUAN NAM
                </h3>
                <p className="text-white/40 text-xs mt-2 text-center">
                  Chọn môn học và đặt câu hỏi bên dưới - công nghệ model AI 5.3
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600/80 text-white rounded-tr-sm'
                    : 'bg-white/8 text-white/90 rounded-tl-sm border border-white/5 prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content
                        .replace(/\\\[/g, '$$$$')
                        .replace(/\\\]/g, '$$$$')
                        .replace(/\\\(/g, '$$')
                        .replace(/\\\)/g, '$$')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/8 rounded-tl-sm flex items-center gap-1.5">
                  <div className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
                  <div className="ai-typing-dot" style={{ animationDelay: '150ms' }} />
                  <div className="ai-typing-dot" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Login prompt if not logged in */}
          {!user && (
            <div className="px-4 py-3 bg-blue-500/10 border-t border-blue-500/15">
              <Link href="/login" className="flex items-center gap-2 text-blue-300 text-sm hover:text-blue-200 transition-colors">
                <LogIn className="w-4 h-4" />
                Đăng nhập để sử dụng AI (10 câu/ngày miễn phí)
              </Link>
            </div>
          )}

          {/* Input Area with dropdowns */}
          <div className="px-3 py-3 border-t border-white/8 shrink-0 bg-black/20">
            {/* Dropdowns row */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Subject dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowSubjectDropdown(!showSubjectDropdown); setShowModeDropdown(false); setShowMathDropdown(false); setShowCodeDropdown(false); }}
                  className="w-full flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/10 text-white/80 text-xs hover:bg-white/12 transition-colors"
                >
                  <span className="truncate">{selectedSubject.emoji} {selectedSubject.label}</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSubjectDropdown && (
                  <div className="absolute bottom-full left-0 mb-1 w-[200%] sm:w-[150%] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 animate-fade-in max-h-48 overflow-y-auto">
                    {SUBJECTS.map(s => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => { setSubject(s.key); setShowSubjectDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                          subject === s.key ? 'bg-blue-600/30 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Explain mode dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowModeDropdown(!showModeDropdown); setShowSubjectDropdown(false); setShowMathDropdown(false); setShowCodeDropdown(false); }}
                  className="w-full flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/10 text-white/80 text-xs hover:bg-white/12 transition-colors"
                >
                  <span className="truncate">{selectedMode.emoji} {selectedMode.label}</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showModeDropdown && (
                  <div className="absolute bottom-full right-0 mb-1 w-[200%] sm:w-[150%] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 animate-fade-in">
                    {EXPLAIN_MODES.map(m => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => { setExplainMode(m.key); setShowModeDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                          explainMode === m.key ? 'bg-blue-600/30 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Math helpers dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowMathDropdown(!showMathDropdown); setShowSubjectDropdown(false); setShowModeDropdown(false); setShowCodeDropdown(false); }}
                  className="w-full flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/10 text-white/80 text-xs hover:bg-white/12 transition-colors"
                >
                  <span className="truncate">∑ Ký tự Toán</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showMathDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showMathDropdown && (
                  <div className="absolute bottom-full left-0 mb-1 w-[200%] sm:w-[150%] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 animate-fade-in p-2">
                    <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {mathSymbols.map((sym, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { insertAtCursor(sym.value); setShowMathDropdown(false); }}
                          className="px-1 py-1.5 rounded hover:bg-white/10 text-white/90 text-xs text-center font-mono transition-colors border border-transparent hover:border-white/5"
                          title={sym.label}
                        >
                          {sym.display}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Code helpers dropdown (Only for STEM/Tin) */}
              {(subject === 'stem' || subject === 'tin') && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowCodeDropdown(!showCodeDropdown); setShowSubjectDropdown(false); setShowModeDropdown(false); setShowMathDropdown(false); }}
                    className="w-full flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs hover:bg-indigo-500/20 transition-colors"
                  >
                    <span className="truncate">💻 Code</span>
                    <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showCodeDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCodeDropdown && (
                    <div className="absolute bottom-full right-0 mb-1 w-[200%] sm:w-[150%] bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 animate-fade-in p-1">
                      <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {codeHelpers.map((helper, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { insertAtCursor(helper.value); setShowCodeDropdown(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-white/70 hover:bg-indigo-500/20 hover:text-white rounded-lg mb-0.5 last:mb-0"
                            title={helper.label}
                          >
                            <span className="font-mono">{helper.display}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Text input */}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? 'Nhập câu hỏi...' : 'Đăng nhập để hỏi...'}
                disabled={!user || loading}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/8 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 disabled:opacity-40 transition-all"
              />
              <button
                type="submit"
                disabled={!user || loading || !input.trim()}
                className="px-3 py-2 rounded-xl ai-fab-gradient text-white disabled:opacity-30 hover:opacity-90 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
