'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Sparkles, Rocket, BookOpen } from 'lucide-react'
import GlassButton from '@/components/ui/GlassButton'
import SearchFilter from '@/components/products/SearchFilter'
import ProductPost from '@/components/products/ProductPost'
import { Loader2, Inbox } from 'lucide-react'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [ieltsConfig, setIeltsConfig] = useState({ show: false, url: '' })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.show_ielts_link === 'true' && data.ielts_link_url) {
          setIeltsConfig({ show: true, url: data.ielts_link_url })
        }
      })
      .catch(console.error)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="min-h-screen">
      {/* Hero Section — Dark gradient preserved */}
      <section className="hero-dark relative py-20 px-4 text-center -mt-24 pt-32 pb-16 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="animate-hero-text">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-violet-200 bg-clip-text text-transparent leading-tight">
              Website Giới Thiệu Sản Phẩm STEM
            </h1>
            <p className="text-lg md:text-xl text-blue-200/80 mt-2 font-medium">
              Trường THPT Đoàn Kết-Hai Bà Trưng
            </p>
          </div>
          
          <p className="animate-hero-text-delay text-white/60 text-base md:text-lg mt-6 max-w-2xl mx-auto">
            Nơi trưng bày, chia sẻ và lan tỏa các sản phẩm STEM sáng tạo của học sinh.
          </p>

          <div className="animate-hero-text-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="#products">
              <GlassButton variant="primary" size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Khám phá sản phẩm
              </GlassButton>
            </Link>
            <Link href="/dashboard/products/new">
              <GlassButton variant="secondary" size="lg" className="gap-2 !bg-white/15 !text-white !border-white/20 hover:!bg-white/25">
                <Rocket className="w-5 h-5" />
                Đăng sản phẩm
              </GlassButton>
            </Link>
            {ieltsConfig.show && (
              <a href={ieltsConfig.url} target="_blank" rel="noopener noreferrer">
                <GlassButton variant="secondary" size="lg" className="gap-2 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !border-emerald-400/30 hover:!shadow-lg hover:!shadow-emerald-500/25">
                  <BookOpen className="w-5 h-5" />
                  Luyện IELTS ngay
                </GlassButton>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="max-w-2xl mx-auto mb-8 px-4 mt-8">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />
      </section>

      {/* Products Feed */}
      <section id="products" className="max-w-2xl mx-auto pb-16 px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Chưa có sản phẩm nào</p>
            <p className="text-slate-400 text-sm mt-2">
              Hãy là người đầu tiên đăng sản phẩm STEM!
            </p>
            <Link href="/dashboard/products/new" className="inline-block mt-4">
              <GlassButton variant="primary">Đăng sản phẩm ngay</GlassButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <ProductPost key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
