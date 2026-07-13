import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực' }, { status: 400 })
    }

    // Find PendingRegistration by email
    const pending = await prisma.pendingRegistration.findUnique({ where: { email } })

    if (!pending) {
      return NextResponse.json({ error: 'Không tìm thấy yêu cầu đăng ký' }, { status: 404 })
    }

    // Check code matches
    if (pending.verifyCode !== code) {
      return NextResponse.json({ error: 'Mã xác nhận không đúng' }, { status: 400 })
    }

    // Check expiry not passed
    if (new Date() > pending.verifyExpiry) {
      return NextResponse.json({ error: 'Mã xác nhận đã hết hạn' }, { status: 400 })
    }

    // Create User from PendingRegistration data
    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        isVerified: true,
        role: 'USER',
      },
    })

    // Delete PendingRegistration record
    await prisma.pendingRegistration.delete({ where: { id: pending.id } })

    // Create ActivityLog for the new registration
    await prisma.activityLog.create({
      data: {
        type: 'ACCOUNT',
        message: `Người dùng ${user.name} (${user.email}) vừa đăng ký tài khoản.`,
        userId: user.id,
      },
    })

    // Sign JWT token and set auth cookie (auto-login)
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
