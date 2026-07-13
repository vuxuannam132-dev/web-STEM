import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { buildSystemPrompt, ExplainMode } from '@/lib/ai-prompts'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để sử dụng tính năng hỏi đáp AI.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
    }

    // Rate limit based on role
    const now = new Date()
    const isToday = user.lastAiQueryDate?.toDateString() === now.toDateString()
    const currentCount = isToday ? user.aiQueryCount : 0

    // Guest: 5 queries total (not per day), User: 10/day
    const maxQueries = user.role === 'GUEST' ? 5 : 10

    if (user.role === 'GUEST' && user.aiQueryCount >= 5) {
      return NextResponse.json({
        error: 'Bạn đã hết 5 lượt hỏi đáp AI miễn phí dành cho Khách. Hãy đăng ký tài khoản để tiếp tục sử dụng!',
      }, { status: 429 })
    }

    if (user.role !== 'GUEST' && currentCount >= maxQueries) {
      return NextResponse.json({
        error: `Bạn đã hết ${maxQueries} lượt hỏi đáp AI hôm nay. Vui lòng quay lại vào ngày mai!`,
      }, { status: 429 })
    }

    const body = await request.json()
    const { message, subject, explainMode, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(
      subject || 'stem',
      (explainMode as ExplainMode) || 'detailed'
    )

    // Build messages including conversation history (last 6 messages for context)
    const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      { role: 'system', content: systemPrompt }
    ]

    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6)
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      }
    }

    messages.push({ role: 'user', content: message })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    })

    const reply = completion.choices[0]?.message?.content || 'Xin lỗi, tôi chưa thể trả lời câu hỏi này.'

    // Update rate limit
    const newCount = user.role === 'GUEST' ? user.aiQueryCount + 1 : currentCount + 1
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiQueryCount: newCount,
        lastAiQueryDate: now,
      }
    })

    const remaining = user.role === 'GUEST' 
      ? 5 - newCount 
      : maxQueries - newCount

    return NextResponse.json({
      reply,
      remainingQueries: remaining,
    })
  } catch (error: any) {
    console.error('AI Chatbot Error:', error)
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống AI.' }, { status: 500 })
  }
}
