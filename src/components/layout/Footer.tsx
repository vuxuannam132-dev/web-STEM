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
          <div className="flex flex-col md:items-end gap-6 mt-8 md:mt-0">
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-slate-800 text-sm font-bold uppercase tracking-wider">Liên hệ Admin</p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=61577809661742" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Facebook Admin">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z"/>
                  </svg>
                </a>
                <a href="https://zalo.me/0708393751" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Zalo Admin">
                  <img src="/zalo-logo.png" alt="Zalo" className="w-9 h-9 object-contain" />
                </a>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-slate-800 text-sm font-bold uppercase tracking-wider">Liên hệ Nhà trường</p>
              <div className="flex gap-3">
                <a href="https://www.tiktok.com/@dkhbt_victory" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 transition-colors" title="TikTok Nhà trường">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.53 2.01c1.39.02 2.76.38 4.02 1.05v3.46c-1.28-.6-2.68-.91-4.08-.9V15.5c0 3.03-2.45 5.48-5.48 5.48S1.5 18.53 1.5 15.5 3.95 10.02 6.98 10.02c.41 0 .82.04 1.23.13v3.52c-.4-.06-.8-.09-1.21-.09-1.1 0-2.01.9-2.01 2.01s.9 2.01 2.01 2.01 2.01-.9 2.01-2.01V2.01h3.52z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/dkhbt_signature/" target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors" title="Instagram Nhà trường">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/dkhbthanoi" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Facebook Page Trường">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/dk.hbt.official." target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Facebook Đoàn Trường">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="text-center md:text-right mt-4">
              <p className="text-slate-600 text-sm">
                {brand.address}
              </p>
              <p className="text-slate-500 text-xs mt-2 max-w-[320px]">
                {brand.copyright}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
