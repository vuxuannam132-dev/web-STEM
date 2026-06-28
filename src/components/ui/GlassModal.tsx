'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function GlassModal({ isOpen, onClose, title, children, className = '' }: GlassModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in ${className}`}>
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
