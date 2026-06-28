'use client'

import React, { useState, useEffect, useCallback } from 'react'
import ProductPost from './ProductPost'
import { Loader2, Inbox } from 'lucide-react'

interface ProductGridProps {
  category?: string
  search?: string
}

export default function ProductGrid({ category, search }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Inbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 text-lg">Chưa có sản phẩm nào</p>
        <p className="text-white/30 text-sm mt-2">Hãy là người đầu tiên đăng sản phẩm STEM!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {products.map((product) => (
        <ProductPost key={product.id} product={product} />
      ))}
    </div>
  )
}
