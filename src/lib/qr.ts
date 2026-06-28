import QRCode from 'qrcode'

interface QROptions {
  url: string
  foreground?: string
  background?: string
  width?: number
}

export async function generateQRDataURL(options: QROptions): Promise<string> {
  const { url, foreground = '#1e40af', background = '#ffffff', width = 300 } = options
  
  return QRCode.toDataURL(url, {
    width,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: 'H',
  })
}

export async function generateQRBuffer(options: QROptions): Promise<Buffer> {
  const { url, foreground = '#1e40af', background = '#ffffff', width = 300 } = options
  
  return QRCode.toBuffer(url, {
    width,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: 'H',
    type: 'png',
  })
}

export function getProductURL(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/products/${slug}`
}
