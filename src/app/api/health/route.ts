import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const start = Date.now()
  
  // 1. Check DB Latency
  let dbLatency = -1
  let dbStatus = 'OFFLINE'
  let totalProducts = 0
  let totalUsers = 0
  
  try {
    const dbStart = Date.now()
    totalProducts = await prisma.product.count()
    totalUsers = await prisma.user.count()
    dbLatency = Date.now() - dbStart
    dbStatus = 'ONLINE'
  } catch (e) {
    console.error('DB Health Check Error:', e)
  }

  // 2. Network Ping (Vietnam server simulation)
  let pingVn = -1
  try {
    const pingStart = Date.now()
    const res = await fetch('https://vnexpress.net', { method: 'HEAD', next: { revalidate: 0 } })
    if (res.ok) {
      pingVn = Date.now() - pingStart
    }
  } catch (e) {
    console.error('Network Ping Error:', e)
  }

  // 3. System Specs
  const memoryUsage = process.memoryUsage()
  const memoryMB = Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100
  
  const region = process.env.VERCEL_REGION || 'DEV-LOCAL'
  
  // 4. Protect Mode status
  let protectMode = false
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'protect_mode' } })
    protectMode = setting?.value === 'true'
  } catch (e) {}

  const totalTime = Date.now() - start

  return NextResponse.json({
    status: dbStatus === 'ONLINE' ? 'OK' : 'DEGRADED',
    infrastructure: {
      region,
      memoryUsageMB: memoryMB,
      uptimeSecs: Math.floor(process.uptime()),
      totalHealthCheckTime: totalTime
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
      totalProducts,
      totalUsers
    },
    network: {
      pingVnMs: pingVn,
    },
    security: {
      protectMode
    }
  })
}
