import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { sendMail } from '@/lib/mailer'
import { sendTelegramMessage } from '@/lib/telegram'

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

    // Check if email already exists in User table
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 })
      }
      // Delete unverified user
      await prisma.user.delete({ where: { email } })
    }

    // Delete any existing PendingRegistration with same email
    await prisma.pendingRegistration.deleteMany({ where: { email } })

    // Hash password, generate OTP, set expiry
    const passwordHash = await hashPassword(password)
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    // Create PendingRegistration record (NOT User)
    await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        passwordHash,
        verifyCode: otp,
        verifyExpiry: expiry,
      },
    })

    // Send OTP email
    const { generateRegistrationEmail } = await import('@/lib/email-templates')
    await sendMail({
      to: email,
      subject: 'Mã xác nhận đăng ký tài khoản - STEM Đoàn Kết',
      html: generateRegistrationEmail(name, otp),
    })

    await sendTelegramMessage(`🚨 <b>New Registration</b>\nName: ${name}\nEmail: ${email}`)

    return NextResponse.json({ email, requiresVerification: true })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }, { status: 500 })
  }
}
