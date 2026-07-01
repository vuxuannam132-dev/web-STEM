import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { slugify } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    // Public view: only show approved + public products
    if (!status) {
      where.status = 'APPROVED'
      where.visibility = 'PUBLIC'
    } else if (status !== 'ALL') {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { owner: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const body = await request.json()
    const validated = productSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validated.data
    let slug = slugify(data.title)

    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        images: JSON.stringify(body.images || []),
        authors: JSON.stringify(data.authors),
        teachers: JSON.stringify(data.teachers),
        appliedKnowledge: JSON.stringify(data.appliedKnowledge),
        components: JSON.stringify(data.components),
        category: data.category,
        tags: JSON.stringify(data.tags),
        visibility: data.visibility,
        status: 'PENDING',
        qrForeground: data.qrForeground,
        qrBackground: data.qrBackground,
        qrCornerStyle: data.qrCornerStyle,
        qrDotStyle: data.qrDotStyle,
        qrFrameText: data.qrFrameText,
        ownerId: session.userId,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
