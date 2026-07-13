import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 15 // Cache response for 15 seconds to prevent DB overload

export async function GET() {
  try {
    const bannedDevicesSetting = await prisma.siteSetting.findUnique({
      where: { key: 'blocked_devices' }
    })
    
    let blockedDevices: string[] = []
    if (bannedDevicesSetting && bannedDevicesSetting.value) {
      try {
        const parsed = JSON.parse(bannedDevicesSetting.value)
        if (Array.isArray(parsed)) {
          // Xử lý cả dạng chuỗi (cũ) và dạng object (mới)
          blockedDevices = parsed.map(item => typeof item === 'string' ? item : item.id)
        }
      } catch (e) {}
    }

    return NextResponse.json({ blocked: blockedDevices })
  } catch (error) {
    return NextResponse.json({ blocked: [] })
  }
}
