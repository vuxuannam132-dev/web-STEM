import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ hasNotification: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { hasUnreadAiNotification: true, unreadAiAmount: true }
    })

    if (user?.hasUnreadAiNotification) {
      // Clear the notification
      await prisma.user.update({
        where: { id: session.userId },
        data: { hasUnreadAiNotification: false, unreadAiAmount: 0 }
      })
      return NextResponse.json({ 
        hasNotification: true, 
        amount: user.unreadAiAmount 
      })
    }

    return NextResponse.json({ hasNotification: false })
  } catch (error) {
    console.error('AI Notification check error:', error)
    return NextResponse.json({ hasNotification: false })
  }
}
