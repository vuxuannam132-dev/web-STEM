'use client'

import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-6
        ${hover ? 'glass-card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
