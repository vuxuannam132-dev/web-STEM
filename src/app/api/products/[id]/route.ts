import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    // Only owner or admin can edit
    if (product.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}

    if (body.title) {
      updateData.title = body.title
      updateData.slug = slugify(body.title)
      // Check slug uniqueness
      const existingSlug = await prisma.product.findFirst({
        where: { slug: updateData.slug as string, id: { not: id } },
      })
      if (existingSlug) {
        updateData.slug = `${updateData.slug}-${Date.now()}`
      }
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images)
    if (body.authors !== undefined) updateData.authors = JSON.stringify(body.authors)
    if (body.teachers !== undefined) updateData.teachers = JSON.stringify(body.teachers)
    if (body.appliedKnowledge !== undefined) updateData.appliedKnowledge = JSON.stringify(body.appliedKnowledge)
    if (body.components !== undefined) updateData.components = JSON.stringify(body.components)
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags)
    if (body.visibility !== undefined) updateData.visibility = body.visibility
    if (body.qrForeground !== undefined) updateData.qrForeground = body.qrForeground
    if (body.qrBackground !== undefined) updateData.qrBackground = body.qrBackground
    if (body.qrCornerStyle !== undefined) updateData.qrCornerStyle = body.qrCornerStyle
    if (body.qrDotStyle !== undefined) updateData.qrDotStyle = body.qrDotStyle
    if (body.qrFrameText !== undefined) updateData.qrFrameText = body.qrFrameText

    // If user edits (not admin), reset status to pending
    if (session.role !== 'ADMIN') {
      updateData.status = 'PENDING'
    }

    // Admin can change status directly
    if (session.role === 'ADMIN') {
      if (body.status !== undefined) updateData.status = body.status
      if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    // Only owner or admin can delete
    if (product.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
