'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import { getCategoryLabel, formatDate, parseJsonField } from '@/lib/constants'
import { ArrowLeft, Check, X, Eye, QrCode, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(d => { setProduct(d.product); setLoading(false) })
  }, [id])

  const updateStatus = async (status: string) => {
    const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    const data = await res.json()
    if (!data.error) { toast.success('Cập nhật thành công!'); setProduct({ ...product, status }) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
  if (!product) return <p className="text-slate-500 text-center py-20 font-medium">Không tìm thấy</p>

  const images = parseJsonField(product.images)
  const authors = parseJsonField(product.authors)
  const teachers = parseJsonField(product.teachers)

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{product.title}</h1>
        <div className="flex gap-2">
          {product.status !== 'APPROVED' && <GlassButton variant="primary" size="sm" className="gap-1" onClick={() => updateStatus('APPROVED')}><Check className="w-3 h-3" />Duyệt</GlassButton>}
          {product.status !== 'REJECTED' && <GlassButton variant="danger" size="sm" className="gap-1" onClick={() => updateStatus('REJECTED')}><X className="w-3 h-3" />Từ chối</GlassButton>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <p className="text-slate-600 text-xs mb-1.5">Trạng thái: <span className={`font-bold ${product.status === 'APPROVED' ? 'text-green-600' : product.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>{product.status === 'APPROVED' ? 'ĐÃ DUYỆT' : product.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}</span></p>
          <p className="text-slate-600 text-xs mb-1.5">Chuyên mục: <span className="font-semibold text-slate-800">{getCategoryLabel(product.category)}</span></p>
          <p className="text-slate-600 text-xs mb-1.5">Hiển thị: <span className="font-semibold text-slate-800">{product.visibility === 'PUBLIC' ? 'Công khai' : product.visibility === 'PRIVATE' ? 'Riêng tư' : 'Chỉ Admin'}</span></p>
          <p className="text-slate-600 text-xs mb-1.5">Đăng bởi: <span className="font-semibold text-slate-800">{product.owner?.name}</span></p>
          <p className="text-slate-600 text-xs mb-1.5">Ngày đăng: <span className="font-semibold text-slate-800">{formatDate(product.createdAt)}</span></p>
          <p className="text-slate-600 text-xs flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{product.viewCount} lượt xem</p>
          <hr className="border-slate-100 my-4" />
          <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{product.description}</p>
          <div className="mt-4 space-y-2">
            {authors.length > 0 && <p className="text-slate-600 text-xs">Người thực hiện: <span className="font-medium text-slate-800">{authors.join(', ')}</span></p>}
            {teachers.length > 0 && <p className="text-slate-600 text-xs">GVHD: <span className="font-medium text-slate-800">{teachers.join(', ')}</span></p>}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {images.length > 0 && (
            <GlassCard>
              <div className="grid grid-cols-2 gap-2">
                {images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-100">
                    <Image src={img} alt="" fill className="object-cover" sizes="200px" />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
          <GlassCard className="text-center">
            <QrCode className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="bg-white rounded-xl p-3 inline-block shadow-sm border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${product.slug}`} alt="QR" className="w-32 h-32" />
            </div>
            <a href={`/api/qr/${product.slug}?download=1`} download className="block mt-3">
              <GlassButton variant="secondary" size="sm">Tải QR</GlassButton>
            </a>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
