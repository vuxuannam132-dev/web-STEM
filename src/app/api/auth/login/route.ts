import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { cookies } from 'next/headers'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = loginSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 })
    }

    const { email, password } = validated.data
    const cookieStore = await cookies()
    
    // 1. Device Fingerprinting
    let deviceId = cookieStore.get('device_id')?.value
    if (!deviceId) {
      deviceId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      cookieStore.set('device_id', deviceId, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' })
    }

    // 2. Check if device is banned
    const bannedDevicesSetting = await prisma.siteSetting.findUnique({ where: { key: 'blocked_devices' } })
    if (bannedDevicesSetting) {
      try {
        const bannedList = JSON.parse(bannedDevicesSetting.value)
        if (Array.isArray(bannedList) && bannedList.includes(deviceId)) {
          return NextResponse.json({ error: 'Thiết bị của bạn đã bị chặn vĩnh viễn vì lý do bảo mật.' }, { status: 403 })
        }
      } catch (e) {}
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
    }

    if (user.isLocked) {
      return NextResponse.json({ error: 'Tài khoản đã bị khóa - bạn không thể sử dụng được vui lòng liên hệ admin để mở lại' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'not_verified', email: user.email }, { status: 403 })
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
    await setAuthCookie(token)

    // 3. Admin Login Alert
    if (user.role === 'ADMIN') {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 request.headers.get('x-real-ip') || 'Unknown IP'
      const ua = request.headers.get('user-agent') || 'Unknown Device'
      const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

      const alertMsg = `🚨 <b>CẢNH BÁO ĐĂNG NHẬP ADMIN</b> 🚨\n\nTài khoản: <b>${user.email}</b>\nIP: <code>${ip}</code>\nThiết bị: <i>${ua}</i>\nThời gian: ${timeStr}\nMã TB: <code>${deviceId}</code>`
      
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8846573144'
      
      const replyMarkup = {
        inline_keyboard: [[{ text: "🛑 Chặn Thiết bị này ngay lập tức", callback_data: `block_dev_${deviceId}_${user.id}` }]]
      }
      
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: alertMsg, parse_mode: 'HTML', reply_markup: replyMarkup })
        })
      } catch (e) { console.error('Telegram alert failed:', e) }
    }

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 })
  }
}
