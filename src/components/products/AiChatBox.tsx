'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import { Bot, Send, User, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isOutOfQueries?: boolean
  pendingRequest?: boolean
}

export default function AiChatBox({ productContext }: { productContext: any }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Chào bạn! Mình là AI trợ lý của STEM Đoàn Kết. Bạn có câu hỏi nào về sản phẩm này không?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const requestMoreQueries = async (msgIndex: number) => {
    try {
      const res = await fetch('/api/ai/request-queries', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Đã gửi yêu cầu đến Admin!')
        setMessages(prev => {
          const newMsgs = [...prev]
          newMsgs[msgIndex] = { ...newMsgs[msgIndex], pendingRequest: true }
          return newMsgs
        })
      }
    } catch (e) {
      toast.error('Lỗi khi gửi yêu cầu.')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    if (!user) {
      toast.error('Vui lòng đăng nhập để hỏi đáp AI')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          productContext
        })
      })
      const data = await res.json()

      if (data.error) {
        toast.error('Lỗi: Bạn đã hết lượt hoặc có lỗi xảy ra.')
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Lỗi: ${data.error}`,
          isOutOfQueries: data.outOfQueries,
          pendingRequest: data.pendingRequest
        }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      
      if (data.remainingQueries !== undefined) {
        toast.success(`Bạn còn ${data.remainingQueries} lượt hỏi đáp AI hôm nay`)
      }
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi kết nối AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <Bot className="w-5 h-5 text-blue-500" />
        <h3 className="text-slate-800 font-semibold">Hỏi đáp AI về sản phẩm</h3>
      </div>
      
      {!user && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">Bạn cần đăng nhập để sử dụng tính năng AI (Giới hạn 10 câu hỏi/ngày).</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-100 border border-slate-200/50'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-500" />}
            </div>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100 shadow-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/10'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap m-0">{msg.content}</p>
              ) : (
                <div>
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
                  {msg.isOutOfQueries && (
                    <div className="mt-3">
                      <button
                        onClick={() => requestMoreQueries(i)}
                        disabled={msg.pendingRequest}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                      >
                        {msg.pendingRequest ? '⏳ Đã gửi yêu cầu (Chờ duyệt)' : '🚀 Yêu cầu thêm lượt'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 rounded-tl-sm flex items-center gap-1 border border-slate-100">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user ? "Hỏi gì đó về sản phẩm..." : "Đăng nhập để đặt câu hỏi..."}
          disabled={!user || loading}
          className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 text-sm"
        />
        <GlassButton variant="primary" disabled={!user || loading || !input.trim()} className="px-4">
          <Send className="w-4 h-4" />
        </GlassButton>
      </form>
      
      <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
        AI có thể mắc sai sót, vui lòng kiểm chứng thông tin trước khi tiếp thu.
      </p>
    </GlassCard>
  )
}
