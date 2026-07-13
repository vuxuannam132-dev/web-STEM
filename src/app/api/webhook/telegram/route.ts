import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'

async function reply(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    })
  } catch (e) {
    console.error('Telegram reply error:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body?.message

    if (message && message.text) {
      const chatId = message.chat.id
      const text = message.text.trim()

      if (text === '/status') {
        await reply(chatId, '✅ <b>System Status</b>\nVercel: OK\nSupabase: OK')
      } else if (text === '/users') {
        const totalUsers = await prisma.user.count()
        const guestUsers = await prisma.user.count({ where: { role: 'GUEST' } })
        await reply(chatId, `👥 <b>User Stats</b>\nTotal: ${totalUsers}\nGuests: ${guestUsers}`)
      } else if (text === '/ai') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const users = await prisma.user.findMany({
          where: {
            lastAiQueryDate: {
              gte: today
            }
          },
          select: {
            aiQueryCount: true
          }
        })
        
        const sum = users.reduce((acc, user) => acc + (user.aiQueryCount || 0), 0)
        await reply(chatId, `🤖 <b>AI Usage Today</b>\nQueries: ${sum}`)
      } else if (text === '/logs') {
        const logs = await prisma.activityLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3
        })
        
        if (logs.length === 0) {
          await reply(chatId, 'No logs found.')
        } else {
          const logsText = logs.map(l => `[${l.type}] ${l.message}`).join('\n\n')
          await reply(chatId, `📝 <b>Last 3 Logs</b>\n${logsText}`)
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
