import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')

  if (!since) {
    return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 })
  }

  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          gt: new Date(since)
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
