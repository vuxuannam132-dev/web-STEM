import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()
    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Vui lòng nhập lý do' }, { status: 400 })
    }

    // Check if user is actually locked
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user?.isLocked) {
      return NextResponse.json({ error: 'Tài khoản không bị khóa' }, { status: 400 })
    }

    // Check if already requested
    const existingLog = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        type: 'UNLOCK_REQUEST'
      }
    })

    if (existingLog) {
      return NextResponse.json({ error: 'Bạn đã gửi yêu cầu rồi, vui lòng đợi admin xử lý.' }, { status: 400 })
    }

    // Create request
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: 'UNLOCK_REQUEST',
        message: `Yêu cầu mở khóa tài khoản. Lý do: ${reason}\nEmail: ${user.email}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unlock request error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
