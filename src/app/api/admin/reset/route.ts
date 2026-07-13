import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { target } = await request.json()

    if (!['ALL', 'PRODUCTS', 'LOGS', 'USERS'].includes(target)) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 })
    }

    if (target === 'PRODUCTS' || target === 'ALL') {
      await prisma.product.deleteMany()
    }

    if (target === 'LOGS' || target === 'ALL') {
      await prisma.activityLog.deleteMany()
    }

    if (target === 'USERS' || target === 'ALL') {
      await prisma.user.deleteMany({
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      })
    }

    // Ghi log (nếu không phải là xóa LOGS hoặc ALL)
    if (target !== 'LOGS' && target !== 'ALL') {
      await prisma.activityLog.create({
        data: {
          type: 'SECURITY',
          message: `Admin ${session.name} đã thực hiện reset data: ${target}.`,
          userId: session.userId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
