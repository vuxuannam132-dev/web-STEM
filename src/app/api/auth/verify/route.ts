import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Tài khoản đã được xác thực' }, { status: 400 })
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: 'Mã xác nhận không đúng' }, { status: 400 })
    }

    if (!user.verifyExpiry || new Date() > user.verifyExpiry) {
      return NextResponse.json({ error: 'Mã xác nhận đã hết hạn' }, { status: 400 })
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyCode: null, verifyExpiry: null }
    })

    // Auto login
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
    await setAuthCookie(token)

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
