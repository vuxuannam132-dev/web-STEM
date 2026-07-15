'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import GlassButton from '@/components/ui/GlassButton'
import GlassInput from '@/components/ui/GlassInput'
import GlassCard from '@/components/ui/GlassCard'
import toast from 'react-hot-toast'
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react'
import { useBrand } from '@/components/providers/BrandProvider'

export default function RegisterPage() {
  const brand = useBrand()
  const router = useRouter()
  const { refetch } = useAuth()

  // Registration form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // OTP verification state
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [verified, setVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Auto-redirect after verification success
  useEffect(() => {
    if (!verified) return
    const timeout = setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
    return () => clearTimeout(timeout)
  }, [verified, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.requiresVerification) {
        toast.success('Mã OTP đã được gửi đến email của bạn!')
        setShowOtp(true)
        setResendCooldown(60)
      } else {
        toast.success('Đăng ký thành công!')
        await refetch()
        router.push('/dashboard')
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số')
      return
    }

    setOtpLoading(true)
    setOtpError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await res.json()

      if (data.success) {
        setVerified(true)
        toast.success('Xác thực thành công!')
        await refetch()
      } else {
        setOtpError(data.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.')
      }
    } catch {
      setOtpError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success('Mã OTP mới đã được gửi!')
      setResendCooldown(60)
      setOtp('')
      setOtpError('')
    } catch {
      toast.error('Không thể gửi lại mã OTP.')
    }
  }, [email, resendCooldown])

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
          <h1 className="text-2xl font-bold text-slate-900">
            {showOtp ? 'Xác thực Email' : 'Đăng ký tài khoản'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{brand.name}</p>
        </div>

        {/* Registration Form */}
        {!showOtp && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPasswordToggle
              />

              {error && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Đăng ký
              </GlassButton>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
                Đăng nhập
              </Link>
            </p>
          </>
        )}

        {/* OTP Verification Form */}
        {showOtp && !verified && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-slate-600 text-sm text-center">
                Chúng tôi đã gửi mã xác thực 6 chữ số đến
                <br />
                <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:tracking-[0.3em] placeholder:text-slate-300"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                  {otpError}
                </div>
              )}

              <GlassButton type="submit" variant="primary" size="lg" loading={otpLoading} className="w-full">
                Xác thực
              </GlassButton>
            </form>

            <div className="text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Verification Success */}
        {verified && (
          <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-green-700">Xác thực thành công!</h3>
              <p className="text-slate-500 text-sm mt-1">Đang chuyển hướng đến trang chính...</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
