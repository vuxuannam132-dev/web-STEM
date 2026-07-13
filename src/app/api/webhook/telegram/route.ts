import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'

async function reply(chatId: string | number, text: string, replyMarkup?: any) {
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
    if (replyMarkup) {
      body.reply_markup = replyMarkup
    }
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch (e) {
    console.error('Telegram reply error:', e)
  }
}

const defaultKeyboard = {
  keyboard: [
    [{ text: "📊 Báo cáo hệ thống" }, { text: "🤖 Lượt dùng AI" }],
    [{ text: "👥 Người dùng" }, { text: "📝 Nhật ký Logs" }]
  ],
  resize_keyboard: true,
  is_persistent: true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body?.message

    if (message && message.text) {
      const chatId = message.chat.id
      const text = message.text.trim()

      if (text === '/start' || text === '📊 Báo cáo hệ thống' || text === '/status') {
        const totalUsers = await prisma.user.count()
        const totalProducts = await prisma.product.count()
        const products = await prisma.product.findMany({ select: { viewCount: true } })
        const totalViews = products.reduce((acc, p) => acc + (p.viewCount || 0), 0)
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const activeAiUsers = await prisma.user.findMany({
          where: { lastAiQueryDate: { gte: today } },
          select: { aiQueryCount: true }
        })
        const aiQueries = activeAiUsers.reduce((acc, u) => acc + (u.aiQueryCount || 0), 0)

        const report = `🌟 <b>HỆ THỐNG WEB STEM THPT ĐOÀN KẾT</b> 🌟
<i>Trạng thái: Đang hoạt động ổn định 🟢</i>

📈 <b>BÁO CÁO NHANH:</b>
▪️ Tổng lượt xem SP: <b>${totalViews}</b> lượt
▪️ Tổng số Sản phẩm: <b>${totalProducts}</b>
▪️ Tổng số Người dùng: <b>${totalUsers}</b>
▪️ Lượt dùng AI hôm nay: <b>${aiQueries}</b> lượt

<i>Chọn các lệnh bên dưới bàn phím để xem chi tiết nhé! 👇</i>`

        await reply(chatId, report, defaultKeyboard)
        
      } else if (text === '/users' || text === '👥 Người dùng') {
        const totalUsers = await prisma.user.count()
        const guestUsers = await prisma.user.count({ where: { role: 'GUEST' } })
        const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } })
        const normalUsers = totalUsers - guestUsers - adminUsers
        
        await reply(chatId, `👥 <b>THỐNG KÊ NGƯỜI DÙNG</b>\n\n👨‍🎓 Thành viên: <b>${normalUsers}</b>\n🕵️ Khách (Guest): <b>${guestUsers}</b>\n👑 Quản trị (Admin): <b>${adminUsers}</b>\n\n📊 Tổng cộng: <b>${totalUsers}</b>`, defaultKeyboard)
        
      } else if (text === '/ai' || text === '🤖 Lượt dùng AI') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const users = await prisma.user.findMany({
          where: { lastAiQueryDate: { gte: today } },
          select: { aiQueryCount: true }
        })
        
        const sum = users.reduce((acc, user) => acc + (user.aiQueryCount || 0), 0)
        await reply(chatId, `🤖 <b>THỐNG KÊ TRỢ LÝ AI</b>\n\n⚡ Lượt hỏi hôm nay: <b>${sum}</b>\n🧑‍💻 Số người đã dùng: <b>${users.length}</b>`, defaultKeyboard)
        
      } else if (text === '/logs' || text === '📝 Nhật ký Logs') {
        const logs = await prisma.activityLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5
        })
        
        if (logs.length === 0) {
          await reply(chatId, '📭 Không có nhật ký nào.', defaultKeyboard)
        } else {
          const logsText = logs.map(l => `[${new Date(l.createdAt).toLocaleTimeString()}] <b>${l.type}</b>\n${l.message}`).join('\n\n')
          await reply(chatId, `📝 <b>5 HOẠT ĐỘNG GẦN NHẤT</b>\n\n${logsText}`, defaultKeyboard)
        }
      }
    }

    // Acknowledge Telegram immediately
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true }) // Must return 200 to prevent retries
  }
}

export async function GET(request: NextRequest) {
  const setup = request.nextUrl.searchParams.get('setup')

  if (setup === 'true') {
    const webhookUrl = `${request.nextUrl.origin}/api/webhook/telegram`
    
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`)
      const data = await res.json()
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
