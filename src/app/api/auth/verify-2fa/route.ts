import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { cookies } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json()
    if (!userId || !otp) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const otpSetting = await prisma.siteSetting.findUnique({ where: { key: `otp_${userId}` } })
    if (!otpSetting) {
      return NextResponse.json({ error: 'Mã xác minh không hợp lệ hoặc đã hết hạn.' }, { status: 400 })
    }

    let parsed
    try { parsed = JSON.parse(otpSetting.value) } catch (e) {
      return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
    }

    if (Date.now() > parsed.expires) {
      return NextResponse.json({ error: 'Mã xác minh đã hết hạn. Vui lòng đăng nhập lại.' }, { status: 400 })
    }

    if (parsed.otp !== otp) {
      return NextResponse.json({ error: 'Mã xác minh không chính xác.' }, { status: 400 })
    }

    // OTP is correct
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 })

    // Clear OTP
    await prisma.siteSetting.delete({ where: { key: `otp_${userId}` } })

    // Login user
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
    await setAuthCookie(token)

    // Send Telegram Alert
    const cookieStore = await cookies()
    const deviceId = cookieStore.get('device_id')?.value || 'Unknown'
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 'Unknown IP'
    const ua = request.headers.get('user-agent') || ''
    const parser = new UAParser(ua)
    const browser = parser.getBrowser()
    const os = parser.getOS()
    const device = parser.getDevice()
    
    const deviceName = [device.vendor, device.model].filter(Boolean).join(' ') || 'Máy tính/Thiết bị lạ'
    const browserInfo = `${browser.name || 'Trình duyệt lạ'} ${browser.version || ''}`.trim()
    const osInfo = `${os.name || 'Hệ điều hành lạ'} ${os.version || ''}`.trim()
    
    const readableDevice = `${browserInfo} trên ${osInfo} (${deviceName})`
    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

    const alertMsg = `🚨 <b>CẢNH BÁO ĐĂNG NHẬP ADMIN (ĐÃ NHẬP ĐÚNG OTP)</b> 🚨\n\nTài khoản: <b>${user.email}</b>\nIP: <code>${ip}</code>\nThiết bị: <i>${readableDevice}</i>\nThời gian: ${timeStr}\nMã TB: <code>${deviceId}</code>\n\n⚠️ <i>Thiết bị này đang truy cập bằng mã OTP (chưa được đưa vào danh sách tin cậy). Bạn có muốn tin cậy nó không?</i>`
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8846573144'
    
    const replyMarkup = {
      inline_keyboard: [[
        { text: "✅ Tin cậy", callback_data: `trust_dev_${deviceId}_${user.id}` },
        { text: "🛑 Chặn Thiết bị", callback_data: `block_dev_${deviceId}_${user.id}` }
      ]]
    }
    
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: alertMsg, parse_mode: 'HTML', reply_markup: replyMarkup })
      })
    } catch (e) { console.error('Telegram alert failed:', e) }

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Verify 2FA error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
