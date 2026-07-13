import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Tài khoản đã được xác thực' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyCode: otp, verifyExpiry: expiry }
    })

    const { generateRegistrationEmail } = await import('@/lib/email-templates')
    await sendMail({
      to: email,
      subject: 'Mã xác nhận tài khoản - STEM Đoàn Kết',
      html: generateRegistrationEmail(user.name, otp)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
