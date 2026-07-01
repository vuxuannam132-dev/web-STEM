import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isLocked: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      isLocked: user.isLocked,
      role: user.role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
