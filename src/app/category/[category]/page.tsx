'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Inbox } from 'lucide-react'
import ProductPost from '@/components/products/ProductPost'
import { getCategoryLabel } from '@/lib/constants'

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?category=${category}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
        {getCategoryLabel(category)}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg">Chưa có sản phẩm nào trong chuyên mục này</p>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <ProductPost key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
