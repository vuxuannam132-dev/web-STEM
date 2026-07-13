import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const { message } = await request.json()

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Nội dung báo lỗi không được để trống' }, { status: 400 })
    }

    let userContext = session ? `[${session.name} - ${session.email}]` : '[Khách]';
    
    // Ghi log hoạt động loại Lỗi
    await prisma.activityLog.create({
      data: {
        type: 'BUG',
        message: `${userContext} Báo lỗi: ${message}`,
        userId: session?.userId || null
      }
    })

    await sendTelegramMessage(`🐛 <b>Bug Report</b>\nFrom: ${userContext}\nMessage: ${message}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
