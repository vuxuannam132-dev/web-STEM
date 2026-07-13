import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Tên phải có ít nhất 2 ký tự.' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    const uniqueId = Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
    const fakeEmail = `guest_${uniqueId}@guest.local`
    const passwordHash = await hashPassword(uniqueId)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 2)

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: fakeEmail,
        passwordHash,
        role: 'GUEST',
        isVerified: true,
        expiresAt,
      },
    })

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Guest auth error:', error)
    return NextResponse.json(
      { error: 'Không thể tạo tài khoản khách. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
