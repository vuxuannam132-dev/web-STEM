import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Admin get products error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, rejectionReason, tags, category } = body

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    if (category) updateData.category = category

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin update product error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
