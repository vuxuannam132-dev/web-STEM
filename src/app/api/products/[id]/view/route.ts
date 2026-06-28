import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View count error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
