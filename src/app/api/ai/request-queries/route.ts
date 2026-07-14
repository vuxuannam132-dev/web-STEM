import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8846573144'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
    }

    if (user.pendingAiRequest) {
      return NextResponse.json({ error: 'Bạn đã gửi yêu cầu rồi, vui lòng chờ Admin duyệt!' }, { status: 400 })
    }

    // Set pending request to true
    await prisma.user.update({
      where: { id: user.id },
      data: { pendingAiRequest: true }
    })

    // Send Telegram Notification to Admin
    const msg = `🤖 <b>YÊU CẦU THÊM LƯỢT HỎI AI</b> 🤖\n\nNgười dùng: <b>${user.name}</b>\nEmail: <code>${user.email}</code>\nGiới hạn hiện tại: ${user.aiQueryLimit} lượt/ngày\n\nBạn có muốn cấp thêm lượt cho user này không?`
    
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ +10 lượt", callback_data: `ai_approve_${user.id}_10` },
          { text: "🚀 +50 lượt", callback_data: `ai_approve_${user.id}_50` }
        ],
        [
          { text: "❌ Từ chối", callback_data: `ai_reject_${user.id}` }
        ]
      ]
    }

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      })
    } catch (e) {
      console.error('Failed to send Telegram request', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Request AI Queries Error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống.' }, { status: 500 })
  }
}
