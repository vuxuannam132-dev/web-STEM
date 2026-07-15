'use client'

import React, { createContext, useContext } from 'react'

export interface BrandInfo {
  name: string
  shortName: string
  logo: string
  copyright: string
  address: string
}

export const BrandContext = createContext<BrandInfo | null>(null)

export function BrandProvider({ brand, children }: { brand: BrandInfo, children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
}

export function useBrand(): BrandInfo {
  const context = useContext(BrandContext)
  if (!context) {
    // Fallback if not wrapped
    return {
      name: 'Trường THPT Đoàn Kết-Hai Bà Trưng',
      shortName: 'THPT Đoàn Kết',
      logo: '/logo1.jpg',
      copyright: '© 2026 Dev by Vũ Xuân Nam D2K64 trường THPT Đoàn Kết-Hai Bà Trưng kính tặng!',
      address: 'Địa chỉ: Số 174 Hồng Mai, phường Quỳnh Lôi, quận Hai Bà Trưng, thành phố Hà Nội.'
    }
  }
  return context
}
