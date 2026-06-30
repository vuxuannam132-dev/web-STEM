import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  // Lấy thêm isVerified, isLocked từ DB
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isVerified: true, isLocked: true }
  })
  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      isVerified: dbUser?.isVerified ?? true,
      isLocked: dbUser?.isLocked ?? false,
    },
  })
}
