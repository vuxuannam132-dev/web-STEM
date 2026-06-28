'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
}

export default function SearchFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: SearchFilterProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            !category
              ? 'bg-blue-600 text-white font-semibold shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Tất cả
        </button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              category === key
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
