'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, QrCode, Share2, Clock, Users, Tag } from 'lucide-react'
import GlassModal from '@/components/ui/GlassModal'
import { getCategoryLabel, formatDate, parseJsonField } from '@/lib/constants'

interface Product {
  id: string
  title: string
  slug: string
  description: string
  images: string
  authors: string
  teachers: string
  category: string
  tags: string
  viewCount: number
  createdAt: string
  owner: { name: string }
  qrForeground?: string
  qrBackground?: string
}

interface ProductPostProps {
  product: Product
}

export default function ProductPost({ product }: ProductPostProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const images = parseJsonField(product.images)
  const authors = parseJsonField(product.authors)
  const tags = parseJsonField(product.tags)

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.slug}`
    if (navigator.share) {
      await navigator.share({ title: product.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Đã sao chép link!')
    }
  }

  return (
    <>
      {/* Social-media style card — white bg, soft shadow */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {product.owner.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 font-bold text-lg leading-tight">{product.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {authors.join(', ') || product.owner.name}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(product.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
            {getCategoryLabel(product.category)}
          </span>
          {tags.map((tag: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-xs flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm px-5 pb-4 line-clamp-3">{product.description}</p>

        {/* Images */}
        {images.length > 0 && (
          <div className={`${images.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
            {images.slice(0, 4).map((img: string, i: number) => (
              <div key={i} className={`relative ${images.length === 1 ? 'aspect-video' : 'aspect-square'} ${i === 0 && images.length === 3 ? 'col-span-2' : ''}`}>
                <Image
                  src={img}
                  alt={`${product.title} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 py-3 text-slate-400 text-sm">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {product.viewCount} lượt xem
          </span>
        </div>

        {/* Actions — social-media style */}
        <div className="flex items-center border-t border-slate-100">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Xem chi tiết
          </Link>
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all text-sm font-medium border-x border-slate-100"
          >
            <QrCode className="w-4 h-4" />
            Xem QR
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-green-600 hover:bg-green-50/50 transition-all text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* QR Modal */}
      <GlassModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="QR Code">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${product.slug}?type=card`}
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>
          <p className="text-slate-500 text-sm text-center">{product.title}</p>
          <a
            href={`/api/qr/${product.slug}?type=card&download=1`}
            download={`qr-${product.slug}.png`}
            className="glass-btn glass-btn-primary px-6 py-3 rounded-full text-sm font-semibold"
          >
            Tải QR về máy
          </a>
        </div>
      </GlassModal>
    </>
  )
}
