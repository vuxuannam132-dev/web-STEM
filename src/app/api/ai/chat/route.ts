import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để sử dụng tính năng này.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    // Check rate limits
    const now = new Date()
    const isToday = user.lastAiQueryDate?.toDateString() === now.toDateString()
    let currentCount = isToday ? user.aiQueryCount : 0
    const maxQueries = user.role === 'GUEST' ? 5 : user.aiQueryLimit

    if (currentCount >= maxQueries) {
      return NextResponse.json({ 
        error: `Bạn đã hết ${maxQueries} lượt hỏi đáp trong ngày hôm nay. Vui lòng xin thêm lượt hoặc quay lại vào ngày mai!`,
        outOfQueries: true,
        pendingRequest: user.pendingAiRequest
      }, { status: 429 })
    }

    const body = await request.json()
    const { message, productContext } = body

    if (!message || !productContext) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const systemPrompt = `Bạn là trợ lý AI thông minh cho website giới thiệu sản phẩm STEM của THPT Đoàn Kết-Hai Bà Trưng.
Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng liên quan đến sản phẩm STEM đang được hiển thị.
Thông tin sản phẩm hiện tại:
- Tên sản phẩm: ${productContext.title}
- Mô tả: ${productContext.description}
- Kiến thức áp dụng: ${productContext.appliedKnowledge?.join(', ')}
- Cấu tạo: ${productContext.components?.join(', ')}
- Phân loại: ${productContext.category}
- Nhóm tác giả: ${productContext.authors?.join(', ')}

Hãy trả lời ngắn gọn, thân thiện, dễ hiểu, phù hợp với học sinh trung học phổ thông. Sử dụng tiếng Việt.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.'

    // Update user query count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiQueryCount: currentCount + 1,
        lastAiQueryDate: now,
      }
    })

    return NextResponse.json({ 
      reply,
      remainingQueries: maxQueries - currentCount - 1
    })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống AI' }, { status: 500 })
  }
}
