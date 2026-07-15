'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useBrand } from '@/components/providers/BrandProvider'

export default function Footer() {
  const pathname = usePathname()
  const brand = useBrand()
  
  if (pathname === '/protect') return null

  return (
    <footer className="mt-20">
      <div className="glass-card rounded-t-3xl border-b-0 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={`Logo ${brand.shortName}`}
                width={56}
                height={56}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="text-slate-900 font-bold text-lg">{brand.name}</h3>
              <p className="text-slate-600 text-sm">Website giới thiệu sản phẩm STEM của học sinh</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-800 text-sm font-medium">
              {brand.name}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {brand.address}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              {brand.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
