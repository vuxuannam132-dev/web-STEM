'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, User, LayoutDashboard, LogOut, Shield, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Trang Chủ' },
  { href: '/category/TOAN_LY_TIN', label: 'Tổ Toán - Lý - Tin' },
  { href: '/category/XA_HOI', label: 'Tổ Xã Hội' },
  { href: '/category/NGOAI_NGU_THE_DUC_GDQP', label: 'Tổ Ngoại Ngữ - Thể Dục - GDQP' },
  { href: '/category/KHOA_HOC_STEM', label: 'Khóa Học STEM' },
]

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [ieltsConfig, setIeltsConfig] = useState({ show: false, url: '' })

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.show_ielts_link === 'true' && data.ielts_link_url) {
          setIeltsConfig({ show: true, url: data.ielts_link_url })
        }
      })
      .catch(console.error)
  }, [])

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass-nav rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Removed Logo per user request */}

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* IELTS Button */}
          {ieltsConfig.show && (
            <a
              href={ieltsConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-md hover:shadow-emerald-500/20 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              IELTS
            </a>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-700 text-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:block">{user.name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 min-w-[200px] animate-fade-in">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-slate-100 transition-all text-slate-600"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white rounded-2xl mt-2 p-4 shadow-lg border border-slate-100 animate-slide-down">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {ieltsConfig.show && (
            <a
              href={ieltsConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-emerald-600 hover:bg-emerald-50 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <BookOpen className="w-5 h-5" />
              Luyện thi IELTS
            </a>
          )}
          {!user && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                className="flex-1 text-center px-4 py-2 rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center px-4 py-2 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
