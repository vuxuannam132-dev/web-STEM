import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { sendMail } from '@/lib/mailer'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password } = validated.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      if (!existing.isVerified) {
        // Resend OTP logic for unverified user
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
          where: { email },
          data: { verifyCode: otp, verifyExpiry: expiry }
        });
        await sendMail({
          to: email,
          subject: "Mã xác nhận đăng ký tài khoản",
          html: `<p>Xin chào ${name},</p><p>Mã xác nhận của bạn là: <strong>${otp}</strong></p><p>Mã này sẽ hết hạn sau 15 phút.</p>`
        });
        return NextResponse.json({ email: existing.email, requiresVerification: true })
      }
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    const user = await prisma.user.create({
      data: { name, email, passwordHash, isVerified: false, verifyCode: otp, verifyExpiry: expiry },
    })

    // Ghi log hoạt động
    await prisma.activityLog.create({
      data: {
        type: 'ACCOUNT',
        message: `Người dùng ${name} (${email}) vừa đăng ký tài khoản.`,
        userId: user.id
      }
    })

    await sendMail({
      to: email,
      subject: "Mã xác nhận đăng ký tài khoản",
      html: `<p>Xin chào ${name},</p><p>Mã xác nhận của bạn là: <strong>${otp}</strong></p><p>Mã này sẽ hết hạn sau 15 phút.</p>`
    })

    return NextResponse.json({ email: user.email, requiresVerification: true })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 })
  }
}
