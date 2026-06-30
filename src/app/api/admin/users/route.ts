import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isLocked: true,
        createdAt: true,
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { userId, isLocked } = await request.json()
    
    if (session.userId === userId) {
      return NextResponse.json({ error: 'Không thể tự khóa tài khoản của mình' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isLocked }
    })

    // Ghi log
    await prisma.activityLog.create({
      data: {
        type: 'SECURITY',
        message: `Admin ${session.name} đã ${isLocked ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.name} (${user.email}).`,
        userId: session.userId
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
