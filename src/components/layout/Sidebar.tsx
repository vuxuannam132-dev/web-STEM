'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, FileText, Settings } from 'lucide-react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  items?: SidebarItem[]
  type?: 'user' | 'admin'
}

const userItems: SidebarItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/products/new', label: 'Đăng sản phẩm', icon: <Plus className="w-5 h-5" /> },
]

const adminItems: SidebarItem[] = [
  { href: '/admin', label: 'Thống kê', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/products', label: 'Quản lý sản phẩm', icon: <FileText className="w-5 h-5" /> },
]

export default function Sidebar({ items, type = 'user' }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = items || (type === 'admin' ? adminItems : userItems)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="glass-card rounded-2xl p-4 sticky top-24">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden glass-card rounded-2xl p-2 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm whitespace-nowrap ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
