'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import GlassModal from '@/components/ui/GlassModal'
import { Plus, Edit, QrCode, Eye, Search, Loader2, Inbox } from 'lucide-react'
import { getCategoryLabel, formatDate, parseJsonField } from '@/lib/constants'

export default function DashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [qrProduct, setQrProduct] = useState<any>(null)

  const fetchProducts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/products?status=ALL&limit=100')
      const data = await res.json()
      // Filter user's own products
      const myProducts = (data.products || []).filter((p: any) => p.ownerId === user.id)
      setProducts(myProducts)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-pending',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
    }
    const labels: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Xin chào, {user?.name}!</p>
        </div>
        <Link href="/dashboard/products/new">
          <GlassButton variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            Đăng sản phẩm
          </GlassButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <p className="text-slate-500 text-xs">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 text-xs">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {products.filter((p) => p.status === 'PENDING').length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 text-xs">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.filter((p) => p.status === 'APPROVED').length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 text-xs">Lượt xem</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {products.reduce((s, p) => s + p.viewCount, 0)}
          </p>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm của bạn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Chưa có sản phẩm nào</p>
          <Link href="/dashboard/products/new" className="inline-block mt-3">
            <GlassButton variant="primary" size="sm">Đăng sản phẩm đầu tiên</GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <GlassCard key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-slate-900 font-semibold text-sm">{product.title}</h3>
                  {getStatusBadge(product.status)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
                  <span>{getCategoryLabel(product.category)}</span>
                  <span>{formatDate(product.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.viewCount}
                  </span>
                </div>
                {product.status === 'REJECTED' && product.rejectionReason && (
                  <p className="text-red-600 text-xs mt-1">Lý do: {product.rejectionReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <GlassButton variant="ghost" size="sm" className="gap-1">
                    <Edit className="w-3 h-3" />
                    Sửa
                  </GlassButton>
                </Link>
                <GlassButton variant="ghost" size="sm" className="gap-1" onClick={() => setQrProduct(product)}>
                  <QrCode className="w-3 h-3" />
                  QR
                </GlassButton>
                {product.status === 'APPROVED' && (
                  <Link href={`/products/${product.slug}`}>
                    <GlassButton variant="ghost" size="sm" className="gap-1">
                      <Eye className="w-3 h-3" />
                      Xem
                    </GlassButton>
                  </Link>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* QR Modal */}
      <GlassModal isOpen={!!qrProduct} onClose={() => setQrProduct(null)} title="QR Code">
        {qrProduct && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${qrProduct.slug}`} alt="QR" className="w-48 h-48" />
            </div>
            <p className="text-slate-600 text-sm text-center">{qrProduct.title}</p>
            <a href={`/api/qr/${qrProduct.slug}?download=1`} download={`qr-${qrProduct.slug}.png`}>
              <GlassButton variant="primary" size="sm">Tải QR về máy</GlassButton>
            </a>
          </div>
        )}
      </GlassModal>
    </div>
  )
}
