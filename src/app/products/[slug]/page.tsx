'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, QrCode, Download, Users, BookOpen, Wrench, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import AiChatBox from '@/components/products/AiChatBox'
import { getCategoryLabel, formatDate, parseJsonField } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/slug/${slug}`)
        const data = await res.json()
        if (data.product) {
          setProduct(data.product)
          // Increment view
          fetch(`/api/products/${data.product.id}/view`, { method: 'POST' })
        }
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-40 px-4">
        <p className="text-slate-500 text-xl">Không tìm thấy sản phẩm</p>
        <Link href="/" className="inline-block mt-4">
          <GlassButton variant="secondary">Về trang chủ</GlassButton>
        </Link>
      </div>
    )
  }

  const images = parseJsonField(product.images)
  const authors = parseJsonField(product.authors)
  const teachers = parseJsonField(product.teachers)
  const knowledge = parseJsonField(product.appliedKnowledge)
  const components = parseJsonField(product.components)
  const tags = parseJsonField(product.tags)

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
                <Image
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        i === selectedImage ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-2xl glass-card flex items-center justify-center">
              <p className="text-slate-400">Chưa có ảnh</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                {getCategoryLabel(product.category)}
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <Eye className="w-3 h-3" />
                {product.viewCount} lượt xem
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.title}</h1>
            <p className="text-slate-400 text-xs mb-4">{formatDate(product.createdAt)}</p>
            <p className="text-slate-600 whitespace-pre-wrap">{product.description}</p>
          </GlassCard>

          {/* Authors */}
          {authors.length > 0 && (
            <GlassCard>
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-500" />
                Người thực hiện
              </h3>
              <div className="flex flex-wrap gap-2">
                {authors.map((a: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">{a}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Teachers */}
          {teachers.length > 0 && (
            <GlassCard>
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-yellow-600" />
                Giáo viên hướng dẫn
              </h3>
              <div className="flex flex-wrap gap-2">
                {teachers.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm">{t}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Knowledge */}
          {knowledge.length > 0 && (
            <GlassCard>
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-violet-500" />
                Kiến thức áp dụng
              </h3>
              <ul className="space-y-1">
                {knowledge.map((k: string, i: number) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    {k}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Components */}
          {components.length > 0 && (
            <GlassCard>
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-green-600" />
                Thành phần cấu tạo
              </h3>
              <ul className="space-y-1">
                {components.map((c: string, i: number) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <GlassCard>
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-pink-500" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">#{t}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* QR Code */}
          <GlassCard className="text-center">
            <h3 className="text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 mb-4">
              <QrCode className="w-4 h-4 text-blue-500" />
              QR Code Sản Phẩm
            </h3>
            <div className="inline-block bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${product.slug}?type=card`} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-slate-400 text-xs mb-4">Quét QR để truy cập nhanh sản phẩm</p>
            <a href={`/api/qr/${product.slug}?type=card&download=1`} download={`qr-${product.slug}.png`}>
              <GlassButton variant="secondary" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Tải QR về máy
              </GlassButton>
            </a>
          </GlassCard>
        </div>
      </div>
      
      {/* AI Chat Box */}
      <div className="mt-6">
        <AiChatBox productContext={{
          title: product.title,
          description: product.description,
          appliedKnowledge: knowledge,
          components: components,
          category: getCategoryLabel(product.category),
          authors: authors
        }} />
      </div>
    </div>
  )
}
