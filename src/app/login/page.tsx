'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import GlassButton from '@/components/ui/GlassButton'
import GlassInput from '@/components/ui/GlassInput'
import GlassCard from '@/components/ui/GlassCard'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { refetch } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (data.error) {
        setError(data.error)
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo1.jpg"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="text-slate-500 text-sm mt-1">STEM Đoàn Kết-Hai Bà Trưng</p>
        </div>

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

          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <GlassButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Đăng nhập
          </GlassButton>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
