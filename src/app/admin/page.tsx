'use client'

import React, { useState, useEffect } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { getCategoryLabel } from '@/lib/constants'
import { Loader2, Package, Clock, CheckCircle, Eye, XCircle } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        setStats(data)
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-slate-500 text-center py-20 font-medium">Không thể tải thống kê</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-slate-500 text-xs">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-slate-500 text-xs">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-slate-500 text-xs">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-slate-500 text-xs">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-violet-600" />
            <div>
              <p className="text-slate-500 text-xs">Tổng lượt xem</p>
              <p className="text-2xl font-bold text-violet-600">{stats.totalViews}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Category Stats */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Theo chuyên mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.categoryStats?.map((cat: any) => (
            <div key={cat.category} className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-xs font-medium">{getCategoryLabel(cat.category)}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{cat._count.id}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Top Products */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Sản phẩm xem nhiều nhất</h2>
        <div className="space-y-2">
          {stats.topProducts?.map((product: any, i: number) => (
            <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100/50">
              <span className="text-slate-400 font-bold text-sm w-6">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-sm font-semibold truncate">{product.title}</p>
                <p className="text-slate-400 text-xs">{product.owner?.name}</p>
              </div>
              <span className="flex items-center gap-1 text-slate-500 text-sm">
                <Eye className="w-3.5 h-3.5" />
                {product.viewCount}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
