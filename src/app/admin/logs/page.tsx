"use client"

import { useState, useEffect } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { Activity, User, FileText, Lock, AlertTriangle, Calendar } from 'lucide-react'
import GlassButton from '@/components/ui/GlassButton'
import toast from 'react-hot-toast'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs')
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (error) {
      toast.error('Lỗi khi tải nhật ký')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (userId: string) => {
    const toastId = toast.loading('Đang mở khóa...')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isLocked: false })
      })
      if (res.ok) {
        toast.success('Mở khóa thành công', { id: toastId })
        fetchLogs()
      } else {
        toast.error('Mở khóa thất bại', { id: toastId })
      }
    } catch (error) {
      toast.error('Lỗi khi mở khóa', { id: toastId })
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'ACCOUNT': return <User className="w-5 h-5 text-blue-500" />
      case 'POST': return <FileText className="w-5 h-5 text-emerald-500" />
      case 'SECURITY': return <Lock className="w-5 h-5 text-orange-500" />
      case 'BUG': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'UNLOCK_REQUEST': return <Lock className="w-5 h-5 text-yellow-500" />
      default: return <Activity className="w-5 h-5 text-slate-500" />
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'ACCOUNT': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'POST': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'SECURITY': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'BUG': return 'bg-red-100 text-red-700 border-red-200'
      case 'UNLOCK_REQUEST': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getLogLabel = (type: string) => {
    switch (type) {
      case 'ACCOUNT': return 'Tài khoản'
      case 'POST': return 'Bài đăng'
      case 'SECURITY': return 'Bảo mật'
      case 'BUG': return 'Báo lỗi'
      case 'UNLOCK_REQUEST': return 'Yêu cầu mở khóa'
      default: return 'Khác'
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nhật ký hệ thống</h1>
        <p className="text-slate-500 mt-1">Theo dõi các hoạt động mới nhất trên website</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Hoạt động gần đây (100)
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100/50">
          {logs.map((log) => (
            <div key={log.id} className="p-6 flex gap-4 hover:bg-white/40 transition-colors">
              <div className="mt-1 shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getLogColor(log.type)} w-fit`}>
                    {getLogLabel(log.type)}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{log.message}</p>
                {log.userId && (
                  <p className="text-xs text-slate-400 mt-2">ID Người dùng: {log.userId}</p>
                )}
                {log.type === 'UNLOCK_REQUEST' && log.userId && (
                  <div className="mt-3">
                    <GlassButton size="sm" variant="primary" onClick={() => handleUnlock(log.userId!)}>
                      Mở khóa ngay
                    </GlassButton>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              Chưa có nhật ký hoạt động nào.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
