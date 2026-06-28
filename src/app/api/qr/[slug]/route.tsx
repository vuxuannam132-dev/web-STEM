import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQRBuffer, getProductURL } from '@/lib/qr'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isDownload = searchParams.get('download') === '1'

    const product = await prisma.product.findUnique({ where: { slug } })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    const url = getProductURL(product.slug)
    const qrBuffer = await generateQRBuffer({
      url,
      foreground: product.qrForeground,
      background: product.qrBackground,
    })

    if (type === 'card') {
      const qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`
      const authors = JSON.parse(product.authors || '[]')
      const teachers = JSON.parse(product.teachers || '[]')

      const response = new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: product.qrBackground,
              fontFamily: 'sans-serif',
              padding: '40px',
              borderRadius: '24px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" width={300} height={300} style={{ borderRadius: '16px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: product.qrForeground, margin: '0 0 10px 0' }}>
                {product.title}
              </h2>
              
              {authors.length > 0 && (
                <p style={{ fontSize: '20px', color: '#4b5563', margin: '0 0 5px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Tác giả:</span> {authors.join(', ')}
                </p>
              )}
              
              {teachers.length > 0 && (
                <p style={{ fontSize: '20px', color: '#4b5563', margin: '0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 'bold', marginRight: '8px' }}>GV Hướng dẫn:</span> {teachers.join(', ')}
                </p>
              )}
            </div>
          </div>
        ),
        {
          width: 500,
          height: 600,
        }
      )

      if (isDownload) {
        response.headers.set('Content-Disposition', `attachment; filename="qr-card-${slug}.png"`)
      }

      return response
    }

    // Default raw QR
    return new NextResponse(new Uint8Array(qrBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': isDownload ? `attachment; filename="qr-${slug}.png"` : 'inline',
      },
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Lỗi tạo QR' }, { status: 500 })
  }
}
