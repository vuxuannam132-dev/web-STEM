"use client"

import { useState, useEffect } from 'react'
import { User, ShieldAlert, ShieldCheck, Mail, Calendar, Lock, Unlock } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const toggleLock = async (userId: string, isLocked: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isLocked: !isLocked })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success(isLocked ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
      setUsers(users.map(u => u.id === userId ? { ...u, isLocked: !isLocked } : u))
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi thao tác')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
        <p className="text-slate-500 mt-1">Xem và quản lý trạng thái tài khoản học sinh</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-800 uppercase font-semibold border-b border-white/20">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user.isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                      {user.isLocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit bg-red-100 text-red-700">
                          <Lock className="w-3 h-3" /> Đã bị khóa
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleLock(user.id, user.isLocked)}
                        disabled={actionLoading === user.id}
                        className={user.isLocked ? '!bg-emerald-50 !text-emerald-600 hover:!bg-emerald-100' : '!bg-red-50 !text-red-600 hover:!bg-red-100'}
                      >
                        {user.isLocked ? (
                          <><Unlock className="w-4 h-4 mr-1" /> Mở khóa</>
                        ) : (
                          <><Lock className="w-4 h-4 mr-1" /> Khóa tài khoản</>
                        )}
                      </GlassButton>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
