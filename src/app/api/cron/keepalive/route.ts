import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Bật chế độ chạy động (không cache) cho route này
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Giữ kết nối Database (Supabase) không bị Pause
    await prisma.$queryRaw`SELECT 1`

    // 2. Dọn dẹp tài khoản Khách hết hạn (quá 2 ngày)
    const expiredGuests = await prisma.user.deleteMany({
      where: {
        role: 'GUEST',
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // 3. Dọn dẹp PendingRegistration hết hạn (quá 1 giờ)
    const expiredPending = await prisma.pendingRegistration.deleteMany({
      where: {
        verifyExpiry: {
          lt: new Date()
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job completed',
      cleaned: {
        expiredGuests: expiredGuests.count,
        expiredPending: expiredPending.count,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Keepalive/Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to run cron job' }, 
      { status: 500 }
    )
  }
}
