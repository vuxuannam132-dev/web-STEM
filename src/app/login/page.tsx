'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBrand } from '@/components/providers/BrandProvider'
import GlassButton from '@/components/ui/GlassButton'
import GlassInput from '@/components/ui/GlassInput'
import GlassCard from '@/components/ui/GlassCard'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const brand = useBrand()
  const router = useRouter()
  const { refetch } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false)
  const [userId, setUserId] = useState('')
  const [otp, setOtp] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.error === 'not_verified') {
        router.push(`/verify?email=${encodeURIComponent(email)}`)
        return
      }

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        setUserId(data.userId)
        toast.success('Mã OTP đã được gửi đến Telegram của bạn')
        return
      }

      toast.success('Đăng nhập thành công!')
      await refetch()
      if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      toast.success('Xác minh thành công!')
      await refetch()
      router.push('/admin')
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    if (!guestName.trim()) {
      toast.error('Vui lòng nhập tên của bạn')
      return
    }

    setGuestLoading(true)
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName.trim() }),
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Chào mừng bạn!')
      await refetch()
      router.push('/dashboard')
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          {brand.logo && (
            <Image
              src={brand.logo}
              alt={`Logo ${brand.shortName}`}
              width={80}
              height={80}
              className="mx-auto rounded-full mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="text-slate-500 text-sm mt-1">{brand.name}</p>
        </div>

        {!requires2FA ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <GlassInput
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordToggle
            />
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Đăng nhập
            </GlassButton>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-center text-sm text-blue-800">
              <span className="font-semibold block mb-1">Xác minh bảo mật (2FA)</span>
              Vì bạn đang đăng nhập từ thiết bị lạ, một mã OTP đã được gửi đến Telegram (và Email). Hãy nhập mã để tiếp tục.
            </div>
            <GlassInput
              label="Mã OTP (10 số)"
              type="text"
              placeholder="1234567890"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={10}
            />
            
            {error && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Xác minh
            </GlassButton>
            <button 
              type="button" 
              onClick={() => { setRequires2FA(false); setOtp(''); setError(''); }}
              className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Quay lại đăng nhập
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 text-sm mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
            Đăng ký ngay
          </Link>
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm font-medium">hoặc</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Guest Login */}
        <div className="space-y-3">
          <p className="text-center text-slate-600 text-sm font-medium">
            🎓 Trải nghiệm với tư cách Khách
          </p>
          <GlassInput
            label="Tên của bạn"
            type="text"
            placeholder="Nhập tên hiển thị..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <GlassButton
            type="button"
            variant="secondary"
            size="lg"
            loading={guestLoading}
            className="w-full"
            onClick={handleGuestLogin}
          >
            Vào với tư cách Khách
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
