import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'protect_mode' }
    })
    
    return NextResponse.json({ 
      protectMode: setting?.value === 'true'
    })
  } catch (error) {
    return NextResponse.json({ protectMode: false })
  }
}
