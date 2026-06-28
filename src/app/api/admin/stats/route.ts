import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const [
      totalProducts,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalViews,
      categoryStats,
      topProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { status: 'APPROVED' } }),
      prisma.product.count({ where: { status: 'REJECTED' } }),
      prisma.product.aggregate({ _sum: { viewCount: true } }),
      prisma.product.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.product.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { owner: { select: { name: true } } },
      }),
    ])

    return NextResponse.json({
      totalProducts,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalViews: totalViews._sum.viewCount || 0,
      categoryStats,
      topProducts,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
