'use client'

import React from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface GlassInputProps {
  label?: string
  error?: string
  className?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
  disabled?: boolean
  showPasswordToggle?: boolean
  maxLength?: number
}

export default function GlassInput({
  label,
  error,
  className = '',
  type = 'text',
  showPasswordToggle = false,
  ...props
}: GlassInputProps) {
  const [show, setShow] = React.useState(false)
  const isPassword = type === 'password'
  const finalType = isPassword && showPasswordToggle && show ? 'text' : type

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        <input
          type={finalType}
          {...props}
          className={`
            w-full px-4 ${isPassword && showPasswordToggle ? 'pr-10' : 'pr-4'} py-3 rounded-xl
            bg-white/50 backdrop-blur-md
            border ${error ? 'border-red-400' : 'border-slate-200'}
            text-slate-950 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            transition-all duration-300
          `}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

interface GlassTextareaProps {
  label?: string
  error?: string
  className?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  name?: string
  rows?: number
  required?: boolean
}

export function GlassTextarea({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}: GlassTextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <textarea
        rows={rows}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/50 backdrop-blur-md
          border ${error ? 'border-red-400' : 'border-slate-200'}
          text-slate-950 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          transition-all duration-300 resize-none
        `}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

interface GlassSelectProps {
  label?: string
  error?: string
  className?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  name?: string
  required?: boolean
  children: React.ReactNode
}

export function GlassSelect({
  label,
  error,
  className = '',
  children,
  ...props
}: GlassSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/50 backdrop-blur-md
          border ${error ? 'border-red-400' : 'border-slate-200'}
          text-slate-950
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          transition-all duration-300
          [&>option]:bg-white [&>option]:text-slate-900
        `}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
