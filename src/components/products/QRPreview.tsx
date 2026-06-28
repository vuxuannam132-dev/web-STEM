'use client'

import React, { useEffect, useState } from 'react'
import { QrCode, Download } from 'lucide-react'

interface QRPreviewProps {
  slug?: string
  foreground?: string
  background?: string
  frameText?: string
  productTitle?: string
}

export default function QRPreview({
  slug,
  foreground = '#1e40af',
  background = '#ffffff',
  frameText,
  productTitle,
}: QRPreviewProps) {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (!slug) return
    // Generate QR data URL client-side for preview
    const baseUrl = window.location.origin
    const url = `${baseUrl}/products/${slug}`
    
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: foreground, light: background },
        errorCorrectionLevel: 'H',
      }).then(setQrUrl)
    })
  }, [slug, foreground, background])

  if (!slug) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 glass-card rounded-2xl">
        <QrCode className="w-16 h-16 text-white/20" />
        <p className="text-white/40 text-sm">QR sẽ hiển thị sau khi tạo sản phẩm</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 glass-card rounded-2xl">
      <h4 className="text-white font-semibold text-sm">Preview QR Code</h4>
      {qrUrl ? (
        <div className="bg-white rounded-2xl p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR Preview" className="w-48 h-48" />
        </div>
      ) : (
        <div className="w-48 h-48 bg-white/10 rounded-2xl animate-pulse" />
      )}
      {(frameText || productTitle) && (
        <p className="text-white/60 text-xs text-center">{frameText || productTitle}</p>
      )}
      <a
        href={`/api/qr/${slug}`}
        download={`qr-${slug}.png`}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
      >
        <Download className="w-4 h-4" />
        Tải QR
      </a>
    </div>
  )
}
