import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Bật chế độ chạy động (không cache) cho route này
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Thực hiện 1 query siêu nhẹ (SELECT 1) để đánh thức và giữ kết nối Database (Supabase)
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection kept alive successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Keepalive error:', error)
    return NextResponse.json(
      { error: 'Failed to keep database alive' }, 
      { status: 500 }
    )
  }
}
