import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product by slug error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
