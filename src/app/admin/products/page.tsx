'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import GlassModal from '@/components/ui/GlassModal'
import { GlassTextarea } from '@/components/ui/GlassInput'
import { getCategoryLabel, formatDate } from '@/lib/constants'
import { Loader2, Inbox, Eye, QrCode, Check, X, Trash2, Search, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [qrProduct, setQrProduct] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateStatus = async (id: string, status: string, rejectionReason?: string) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      toast.success(status === 'APPROVED' ? 'Đã duyệt sản phẩm!' : 'Đã từ chối sản phẩm!')
      fetchProducts()
      setRejectModal(null)
      setRejectReason('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading('')
    }
  }

  const deleteProduct = async (id: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success('Đã xóa sản phẩm!')
      fetchProducts()
      setDeleteConfirm(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading('')
    }
  }

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
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>{labels[status]}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : s === 'REJECTED' ? 'Từ chối' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <GlassCard key={product.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-slate-900 font-semibold text-sm">{product.title}</h3>
                    {getStatusBadge(product.status)}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {product.visibility === 'PUBLIC' ? 'Công khai' : product.visibility === 'PRIVATE' ? 'Riêng tư' : 'Chỉ Admin'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs flex-wrap">
                    <span>Bởi: {product.owner?.name}</span>
                    <span>{getCategoryLabel(product.category)}</span>
                    <span>{formatDate(product.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.viewCount}</span>
                  </div>
                  {product.rejectionReason && (
                    <p className="text-red-600 text-xs mt-1 font-medium">Lý do từ chối: {product.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.status === 'PENDING' && (
                    <>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(product.id, 'APPROVED')}
                        loading={actionLoading === product.id}
                        className="gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Duyệt
                      </GlassButton>
                      <GlassButton
                        variant="danger"
                        size="sm"
                        onClick={() => setRejectModal(product)}
                        className="gap-1"
                      >
                        <X className="w-3 h-3" />
                        Từ chối
                      </GlassButton>
                    </>
                  )}
                  <Link href={`/admin/products/${product.id}`}>
                    <GlassButton variant="ghost" size="sm" className="gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Chi tiết
                    </GlassButton>
                  </Link>
                  <GlassButton variant="ghost" size="sm" className="gap-1" onClick={() => setQrProduct(product)}>
                    <QrCode className="w-3 h-3" />
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" className="gap-1 text-red-500 hover:text-red-600" onClick={() => setDeleteConfirm(product)}>
                    <Trash2 className="w-3 h-3" />
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Từ chối sản phẩm">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Sản phẩm: <strong className="text-slate-900">{rejectModal?.title}</strong></p>
          <GlassTextarea
            label="Lý do từ chối"
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <GlassButton variant="ghost" onClick={() => setRejectModal(null)}>Hủy</GlassButton>
            <GlassButton
              variant="danger"
              onClick={() => updateStatus(rejectModal.id, 'REJECTED', rejectReason)}
              loading={actionLoading === rejectModal?.id}
            >
              Xác nhận từ chối
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Xóa sản phẩm">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Bạn có chắc muốn xóa <strong className="text-slate-900">{deleteConfirm?.title}</strong>?</p>
          <div className="flex gap-2 justify-end">
            <GlassButton variant="ghost" onClick={() => setDeleteConfirm(null)}>Hủy</GlassButton>
            <GlassButton variant="danger" onClick={() => deleteProduct(deleteConfirm.id)} loading={actionLoading === deleteConfirm?.id}>Xóa</GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={!!qrProduct} onClose={() => setQrProduct(null)} title="QR Code">
        {qrProduct && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <img src={`/api/qr/${qrProduct.slug}`} alt="QR" className="w-48 h-48" />
            </div>
            <p className="text-slate-600 text-sm text-center font-medium">{qrProduct.title}</p>
            <a href={`/api/qr/${qrProduct.slug}?type=card&download=1`} download={`qr-${qrProduct.slug}.png`}>
              <GlassButton variant="primary" size="sm">Tải QR</GlassButton>
            </a>
          </div>
        )}
      </GlassModal>
    </div>
  )
}
