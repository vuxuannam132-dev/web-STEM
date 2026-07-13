'use client'

import React from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar type="user" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
