import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'

async function reply(chatId: string | number, text: string, replyMarkup?: any) {
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
    if (replyMarkup) body.reply_markup = replyMarkup
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
  } catch (e) {
    console.error('Telegram reply error:', e)
  }
}

async function editMessage(chatId: string | number, messageId: number | null | undefined, text: string, replyMarkup?: any) {
  if (!messageId) {
    return reply(chatId, text, replyMarkup)
  }
  try {
    const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' }
    if (replyMarkup) body.reply_markup = replyMarkup
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
  } catch (e) {
    console.error('Telegram edit error:', e)
  }
}

async function answerCallback(callbackQueryId: string, text?: string) {
  try {
    const body: any = { callback_query_id: callbackQueryId }
    if (text) body.text = text
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
  } catch (e) {
    console.error('Telegram answerCallback error:', e)
  }
}

async function getHealthReport(origin: string) {
  try {
    const res = await fetch(`${origin}/api/health`, { next: { revalidate: 0 } })
    const h = await res.json()
    let report = `🩺 <b>BÁO CÁO SỨC KHỎE HỆ THỐNG</b> 🩺\n\n`
    report += `🖥️ <b>Hạ tầng (Infrastructure):</b>\n`
    report += ` - Server: <code>${h.infrastructure.region}</code>\n`
    report += ` - RAM: <code>${h.infrastructure.memoryUsageMB} MB</code>\n`
    report += ` - Uptime: <code>${h.infrastructure.uptimeSecs}s</code>\n\n`
    report += `🗄️ <b>Cơ sở dữ liệu (Database):</b>\n`
    report += ` - Trạng thái: ${h.database.status === 'ONLINE' ? '🟢 ONLINE' : '🔴 OFFLINE'}\n`
    report += ` - Ping DB: <code>${h.database.latencyMs}ms</code>\n`
    report += ` - Records: <code>${h.database.totalUsers}</code> users, <code>${h.database.totalProducts}</code> sp\n\n`
    report += `🌐 <b>Mạng (Network):</b>\n`
    report += ` - Ping Server VN: <code>${h.network.pingVnMs > -1 ? h.network.pingVnMs + 'ms' : 'Timeout'}</code>\n\n`
    report += `🛡️ <b>Bảo mật (Security):</b>\n`
    report += ` - Protect Mode: ${h.security.protectMode ? '🔴 BẬT (CHẶN TOÀN CẦU)' : '🟢 TẮT'}\n\n`
    report += (h.status === 'OK') ? `✅ <b>KẾT LUẬN: HỆ THỐNG HOẠT ĐỘNG TỐT</b>` : `⚠️ <b>KẾT LUẬN: ĐANG CÓ SỰ CỐ!</b>`
    return report
  } catch (e) {
    return '❌ Lỗi khi lấy báo cáo sức khỏe hệ thống.'
  }
}

const menus = {
  main: {
    inline_keyboard: [
      [{ text: "📊 Báo cáo Hệ thống", callback_data: "menu_report" }, { text: "🤖 Lượt dùng AI", callback_data: "menu_ai" }],
      [{ text: "👥 Quản lý Người dùng", callback_data: "menu_users" }, { text: "📝 Nhật ký Logs", callback_data: "menu_logs" }],
      [{ text: "📦 Quản lý Bài đăng", callback_data: "menu_products" }, { text: "🩺 Đo sức khỏe Web", callback_data: "menu_health" }],
      [{ text: "🛡️ Bật/Tắt Protect Mode", callback_data: "menu_protect" }],
      [{ text: "🛡️ Quản lý Sổ Trắng", callback_data: "menu_whitelist" }, { text: "📱 Quản lý Sổ Đen", callback_data: "menu_blacklist" }],
      [{ text: "⚙️ Cài đặt Web", callback_data: "menu_settings" }]
    ]
  },
  settings: {
    inline_keyboard: [
      [{ text: "📧 Đổi Email Nhận OTP", callback_data: "menu_email" }],
      [{ text: "🗑️ Danger Zone (Xóa Dữ Liệu)", callback_data: "menu_danger" }],
      [{ text: "🔙 Quay lại Menu Chính", callback_data: "menu_main" }]
    ]
  },
  danger: {
    inline_keyboard: [
      [{ text: "Xóa Sản phẩm", callback_data: "reset_PRODUCTS" }, { text: "Xóa Logs", callback_data: "reset_LOGS" }],
      [{ text: "Xóa User", callback_data: "reset_USERS" }, { text: "Xóa TẤT CẢ", callback_data: "reset_ALL" }],
      [{ text: "🔙 Quay lại", callback_data: "menu_settings" }]
    ]
  },
  backToMain: {
    inline_keyboard: [[{ text: "🔙 Quay lại Menu Chính", callback_data: "menu_main" }]]
  }
}

async function getBotConfig() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ['telegram_bot_password', 'telegram_admin_ids'] } }
  })
  let password = 'Vunamdkhbt2009@'
  let adminIds: string[] = []
  
  for (const s of settings) {
    if (s.key === 'telegram_bot_password') password = s.value
    if (s.key === 'telegram_admin_ids') {
      try { 
        const parsed = JSON.parse(s.value) 
        if (Array.isArray(parsed)) adminIds = parsed.map(String)
      } catch (e) {}
    }
  }
  return { password, adminIds }
}

async function auth(chatId: number, text?: string): Promise<boolean> {
  const conf = await getBotConfig()
  const chatStr = String(chatId)
  
  if (conf.adminIds.includes(chatStr)) return true
  
  if (text === conf.password) {
    conf.adminIds.push(chatStr)
    await prisma.siteSetting.upsert({
      where: { key: 'telegram_admin_ids' },
      update: { value: JSON.stringify(conf.adminIds) },
      create: { key: 'telegram_admin_ids', value: JSON.stringify(conf.adminIds) }
    })
    
    const persistentKeyboard = {
      keyboard: [
        [{ text: "🚀 Bắt đầu" }],
        [{ text: "📊 Báo cáo Hệ thống" }, { text: "🤖 Lượt dùng AI" }],
        [{ text: "👥 Quản lý Người dùng" }, { text: "📝 Nhật ký Logs" }],
        [{ text: "📦 Quản lý Bài đăng" }, { text: "🩺 Đo sức khỏe Web" }],
        [{ text: "🛡️ Bật/Tắt Protect Mode" }],
        [{ text: "🛡️ Quản lý Sổ Trắng" }, { text: "📱 Quản lý Sổ Đen" }],
        [{ text: "⚙️ Cài đặt Web" }]
      ],
      resize_keyboard: true,
      is_persistent: true
    };
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '✅ <b>Mật khẩu đúng. Đã mở khóa quyền truy cập Bot.</b>', parse_mode: 'HTML', reply_markup: persistentKeyboard })
    })
    
    await reply(chatId, 'Gõ /menu hoặc ấn "🚀 Bắt đầu" để mở bảng điều khiển!', menus.main)
    return false // Mới xác thực xong, không xử lý tiếp lệnh hiện tại
  }
  
  await reply(chatId, '⛔ <b>Bạn không phải admin và không có quyền sử dụng bot.</b>\n\nVui lòng nhập mật khẩu để truy cập:')
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id
      const text = body.message.text.trim()

      const isAuthed = await auth(chatId, text)
      if (!isAuthed) return NextResponse.json({ ok: true })

      const menuMap: Record<string, string> = {
        '📊 Báo cáo hệ thống': 'menu_report',
        '📊 Báo cáo Hệ thống': 'menu_report',
        '🤖 Lượt dùng AI': 'menu_ai',
        '📦 Quản lý Bài đăng': 'menu_products',
        '🩺 Đo sức khỏe Web': 'menu_health',
        '🛡️ Bật/Tắt Protect Mode': 'menu_protect',
        '👥 Quản lý Người dùng': 'menu_users',
        '👥 Người dùng': 'menu_users',
        '📝 Xem 5 Logs gần nhất': 'menu_logs',
        '📝 Nhật ký Logs': 'menu_logs',
        '🛡️ Quản lý Sổ Trắng': 'menu_whitelist',
        '📱 Quản lý Sổ Đen': 'menu_blacklist',
        '⚙️ Cài đặt Web': 'menu_settings',
        '⚙️ Cài đặt (Danger Zone)': 'menu_settings'
      }

      if (text === '/start' || text === '/menu' || text === '🚀 Bắt đầu') {
        const persistentKeyboard = {
          keyboard: [
            [{ text: "🚀 Bắt đầu" }],
            [{ text: "📊 Báo cáo Hệ thống" }, { text: "🤖 Lượt dùng AI" }],
            [{ text: "👥 Quản lý Người dùng" }, { text: "📝 Nhật ký Logs" }],
            [{ text: "📦 Quản lý Bài đăng" }, { text: "🩺 Đo sức khỏe Web" }],
            [{ text: "🛡️ Bật/Tắt Protect Mode" }],
            [{ text: "🛡️ Quản lý Sổ Trắng" }, { text: "📱 Quản lý Sổ Đen" }],
            [{ text: "⚙️ Cài đặt Web" }]
          ],
          resize_keyboard: true,
          is_persistent: true
        };
        
        // Cập nhật bàn phím cứng
        if (text === '/start') {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: '🔄 Đã cập nhật bàn phím nhanh!', reply_markup: persistentKeyboard })
          })
        }
        
        const healthReport = await getHealthReport(request.nextUrl.origin)
        await reply(chatId, healthReport)
        await reply(chatId, '🌟 <b>MENU QUẢN TRỊ VIÊN</b> 🌟\n\nXin chào, Admin! Chọn một chức năng bên dưới:', menus.main)
      } else if (text.startsWith('/setemail ')) {
        const newEmail = text.replace('/setemail ', '').trim()
        await prisma.siteSetting.upsert({
          where: { key: 'admin_otp_email' },
          update: { value: newEmail },
          create: { key: 'admin_otp_email', value: newEmail }
        })
        await reply(chatId, `✅ <b>Cập nhật thành công!</b>\n\nEmail nhận OTP Admin đã được đổi thành: <code>${newEmail}</code>`)
      } else if (text.startsWith('/add_ai ')) {
        const parts = text.replace('/add_ai ', '').trim().split(' ')
        if (parts.length < 2) {
          await reply(chatId, '❌ <b>Sai cú pháp!</b>\n\nSử dụng: <code>/add_ai [email] [lượt]</code>')
        } else {
          const email = parts[0]
          const amount = parseInt(parts[1]) || 0
          if (amount <= 0) {
            await reply(chatId, '❌ <b>Số lượt không hợp lệ!</b>')
          } else {
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) {
              await reply(chatId, `❌ Không tìm thấy user với email: <code>${email}</code>`)
            } else {
              await prisma.user.update({
                where: { email },
                data: {
                  aiQueryLimit: user.aiQueryLimit + amount,
                  hasUnreadAiNotification: true,
                  unreadAiAmount: amount,
                  pendingAiRequest: false
                }
              })
              await reply(chatId, `✅ <b>THÀNH CÔNG!</b>\n\nĐã cộng ${amount} lượt hỏi AI cho user <b>${user.name}</b> (<code>${email}</code>).`)
            }
          }
        }
      } else if (menuMap[text]) {
        // Chuyển hướng xử lý sang callback_query
        body.callback_query = {
          id: Date.now().toString(),
          data: menuMap[text],
          message: { chat: { id: chatId }, message_id: null, text: '' }
        }
        delete body.message
        // Xử lý tiếp ở logic callback_query phía dưới
      } else {
        await reply(chatId, 'Lệnh không xác định. Gõ /menu để mở bảng điều khiển.')
      }
    } 
    
    if (body.callback_query) {
      const cb = body.callback_query
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id
      const data = cb.data

      const isAuthed = await auth(chatId)
      if (!isAuthed) {
        await answerCallback(cb.id, '⛔ Không có quyền truy cập!')
        return NextResponse.json({ ok: true })
      }

      await answerCallback(cb.id) // acknowledge

      if (data === 'menu_main') {
        await editMessage(chatId, messageId, '🌟 <b>MENU QUẢN TRỊ VIÊN</b> 🌟\n\nXin chào, Admin! Chọn một chức năng bên dưới:', menus.main)
      }
      else if (data === 'menu_report') {
        const totalUsers = await prisma.user.count()
        const totalProducts = await prisma.product.count()
        const products = await prisma.product.findMany({ select: { viewCount: true } })
        const totalViews = products.reduce((acc, p) => acc + (p.viewCount || 0), 0)
        
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { name: true, email: true } })
        const adminText = admins.map(a => `👑 ${a.name} (${a.email})`).join('\n')

        const report = `📈 <b>BÁO CÁO NHANH:</b>\n\n▪️ Lượt xem SP: <b>${totalViews}</b>\n▪️ Sản phẩm: <b>${totalProducts}</b>\n▪️ Người dùng: <b>${totalUsers}</b>\n\n👥 <b>DANH SÁCH QUẢN TRỊ VIÊN:</b>\n${adminText}`
        await editMessage(chatId, messageId, report, menus.backToMain)
      }
      else if (data === 'menu_health') {
        await editMessage(chatId, messageId, '⏳ Đang kiểm tra sức khỏe hệ thống...')
        const healthReport = await getHealthReport(request.nextUrl.origin)
        await editMessage(chatId, messageId, healthReport, menus.backToMain)
      }
      else if (data === 'menu_protect') {
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'protect_mode' } })
        const currentMode = setting?.value === 'true'
        const newMode = !currentMode
        
        await prisma.siteSetting.upsert({
          where: { key: 'protect_mode' },
          update: { value: newMode.toString() },
          create: { key: 'protect_mode', value: newMode.toString() }
        })
        
        if (newMode) {
          await editMessage(chatId, messageId, '🔴 <b>ĐÃ BẬT PROTECT MODE</b>\n\nToàn bộ người dùng hiện đã bị chặn và chuyển sang màn hình Bảo vệ. Website đang ở trạng thái an toàn nhất trước DDoS.', menus.backToMain)
        } else {
          await editMessage(chatId, messageId, '⏳ <b>Đang kiểm tra kết nối và tình trạng hệ thống...</b>\nXin đợi trong giây lát để hoàn tất Post-Attack Check.')
          const healthReport = await getHealthReport(request.nextUrl.origin)
          await editMessage(chatId, messageId, `🟢 <b>ĐÃ TẮT PROTECT MODE</b>\n\nHệ thống đã mở lại bình thường.\n\n${healthReport}`, menus.backToMain)
        }
      }
      else if (data === 'menu_ai') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const activeAiUsers = await prisma.user.findMany({
          where: { lastAiQueryDate: { gte: today } },
          select: { aiQueryCount: true }
        })
        const aiQueries = activeAiUsers.reduce((acc, u) => acc + (u.aiQueryCount || 0), 0)
        await editMessage(chatId, messageId, `🤖 <b>THỐNG KÊ AI HÔM NAY</b>\n\n⚡ Lượt hỏi: <b>${aiQueries}</b>\n🧑‍💻 Người dùng AI: <b>${activeAiUsers.length}</b>`, menus.backToMain)
      }
      else if (data === 'menu_logs') {
        const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
        if (logs.length === 0) {
          await editMessage(chatId, messageId, '📭 Không có nhật ký nào.', menus.backToMain)
        } else {
          const logsText = logs.map(l => `[${new Date(l.createdAt).toLocaleTimeString()}] <b>${l.type}</b>\n${l.message}`).join('\n\n')
          await editMessage(chatId, messageId, `📝 <b>5 HOẠT ĐỘNG GẦN NHẤT</b>\n\n${logsText}`, menus.backToMain)
        }
      }
      else if (data === 'menu_settings') {
        await editMessage(chatId, messageId, '⚙️ <b>CÀI ĐẶT HỆ THỐNG</b>\n\nBạn muốn làm gì?', menus.settings)
      }
      else if (data === 'menu_danger') {
        await editMessage(chatId, messageId, '🗑️ <b>DANGER ZONE</b>\n\nCẢNH BÁO: Hành động xóa không thể hoàn tác. Vui lòng chọn mục tiêu:', menus.danger)
      }
      else if (data.startsWith('reset_')) {
        const target = data.replace('reset_', '')
        const confirmMenu = {
          inline_keyboard: [
            [{ text: "✅ CHẮC CHẮN XÓA", callback_data: `do_reset_${target}` }],
            [{ text: "❌ Hủy", callback_data: "menu_danger" }]
          ]
        }
        await editMessage(chatId, messageId, `⚠️ <b>XÁC NHẬN XÓA: ${target}</b>\nBạn có chắc chắn? Hành động này sẽ xóa dữ liệu vĩnh viễn!`, confirmMenu)
      }
      else if (data.startsWith('do_reset_')) {
        const target = data.replace('do_reset_', '')
        if (target === 'PRODUCTS' || target === 'ALL') await prisma.product.deleteMany()
        if (target === 'LOGS' || target === 'ALL') await prisma.activityLog.deleteMany()
        if (target === 'USERS' || target === 'ALL') await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } })
        await editMessage(chatId, messageId, `✅ <b>Đã xóa thành công: ${target}</b>`, menus.backToMain)
      }
      else if (data === 'menu_users') {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
        const buttons = users.map(u => [{ text: `${u.isLocked ? '🔒' : '👤'} ${u.name} (${u.email})`, callback_data: `user_view_${u.id}` }])
        buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_main" }])
        await editMessage(chatId, messageId, '👥 <b>DANH SÁCH NGƯỜI DÙNG (8 MỚI NHẤT)</b>\n\nChọn để thao tác:', { inline_keyboard: buttons })
      }
      else if (data.startsWith('user_view_')) {
        const uid = data.replace('user_view_', '')
        const u = await prisma.user.findUnique({ where: { id: uid } })
        if (!u) {
          await editMessage(chatId, messageId, '❌ User không tồn tại.', menus.backToMain)
        } else {
          const userMenu = {
            inline_keyboard: [
              [{ text: u.isLocked ? "🔓 Mở Khóa" : "🔒 Khóa", callback_data: `user_togglelock_${u.id}` }, { text: "📝 Xem Logs", callback_data: `user_logs_${u.id}` }],
              [{ text: "🔙 Trở lại Danh sách", callback_data: "menu_users" }]
            ]
          }
          const info = `👤 <b>${u.name}</b>\nEmail: ${u.email}\nQuyền: ${u.role}\nTham gia: ${new Date(u.createdAt).toLocaleDateString()}\nTrạng thái: ${u.isLocked ? 'Đang bị khóa 🔒' : 'Hoạt động 🟢'}\n\nLượt dùng AI: ${u.aiQueryCount}`
          await editMessage(chatId, messageId, info, userMenu)
        }
      }
      else if (data.startsWith('user_togglelock_')) {
        const uid = data.replace('user_togglelock_', '')
        const u = await prisma.user.findUnique({ where: { id: uid } })
        if (u) {
          await prisma.user.update({ where: { id: uid }, data: { isLocked: !u.isLocked } })
          await answerCallback(cb.id, `Đã ${!u.isLocked ? 'KHÓA' : 'MỞ KHÓA'} tài khoản!`)
          
          const updatedU = await prisma.user.findUnique({ where: { id: uid } })
          const userMenu = {
            inline_keyboard: [
              [{ text: updatedU?.isLocked ? "🔓 Mở Khóa" : "🔒 Khóa", callback_data: `user_togglelock_${uid}` }, { text: "📝 Xem Logs", callback_data: `user_logs_${uid}` }],
              [{ text: "🔙 Trở lại Danh sách", callback_data: "menu_users" }]
            ]
          }
          const info = `👤 <b>${updatedU?.name}</b>\nEmail: ${updatedU?.email}\nQuyền: ${updatedU?.role}\nTrạng thái: ${updatedU?.isLocked ? 'Đang bị khóa 🔒' : 'Hoạt động 🟢'}\n\nLượt dùng AI: ${updatedU?.aiQueryCount}`
          await editMessage(chatId, messageId, info, userMenu)
        }
      }
      else if (data.startsWith('user_logs_')) {
        const uid = data.replace('user_logs_', '')
        const logs = await prisma.activityLog.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 5 })
        if (logs.length === 0) {
          await answerCallback(cb.id, 'Chưa có hoạt động nào!')
        } else {
          const logsText = logs.map(l => `[${l.type}] ${l.message}`).join('\n')
          await editMessage(chatId, messageId, `📝 <b>Logs của User</b>\n\n${logsText}`, { inline_keyboard: [[{ text: "🔙 Trở lại User", callback_data: `user_view_${uid}` }]] })
        }
      }
      else if (data === 'menu_email') {
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'admin_otp_email' } })
        const currentEmail = setting?.value || 'Chưa cài đặt (Dùng email gốc của tài khoản)'
        await editMessage(chatId, messageId, `📧 <b>CẤU HÌNH EMAIL NHẬN OTP</b>\n\nHiện tại: <code>${currentEmail}</code>\n\nĐể thay đổi Email, vui lòng gõ lệnh theo cú pháp sau gửi cho Bot:\n\n<code>/setemail abc@gmail.com</code>`, menus.settings)
      }
      else if (data === 'menu_whitelist') {
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'trusted_devices' } })
        let trusted = []
        if (setting) {
          try { trusted = JSON.parse(setting.value) } catch (e) {}
        }
        
        if (trusted.length === 0) {
          await editMessage(chatId, messageId, '🛡️ <b>SỔ TRẮNG THIẾT BỊ</b>\n\nHiện không có thiết bị nào được tin cậy.', menus.main)
        } else {
          const buttons = trusted.map((devId: string) => {
            return [{ text: `🗑️ Xóa tin cậy: ${devId.substring(0,8)}...`, callback_data: `untrust_dev_${devId}` }]
          })
          buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_main" }])
          await editMessage(chatId, messageId, `🛡️ <b>SỔ TRẮNG THIẾT BỊ (${trusted.length})</b>\n\nThiết bị tin cậy sẽ không bị hỏi mã OTP khi đăng nhập.`, { inline_keyboard: buttons })
        }
      }
      else if (data.startsWith('untrust_dev_')) {
        const devId = data.replace('untrust_dev_', '')
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'trusted_devices' } })
        let trusted = []
        if (setting) {
          try { trusted = JSON.parse(setting.value) } catch (e) {}
        }
        trusted = trusted.filter((id: string) => id !== devId)
        await prisma.siteSetting.update({
          where: { key: 'trusted_devices' },
          data: { value: JSON.stringify(trusted) }
        })
        
        await answerCallback(cb.id, 'Đã xóa thiết bị khỏi sổ trắng!')
        
        const buttons = trusted.map((tid: string) => [{ text: `🗑️ Xóa tin cậy: ${tid.substring(0,8)}...`, callback_data: `untrust_dev_${tid}` }])
        buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_main" }])
        await editMessage(chatId, messageId, `🛡️ <b>SỔ TRẮNG THIẾT BỊ (${trusted.length})</b>\n\nĐã cập nhật danh sách.`, { inline_keyboard: buttons })
      }
      else if (data === 'menu_blacklist') {
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'blocked_devices' } })
        let blocked = []
        if (setting) {
          try { blocked = JSON.parse(setting.value) } catch (e) {}
        }
        
        if (blocked.length === 0) {
          await editMessage(chatId, messageId, '📱 <b>SỔ ĐEN THIẾT BỊ</b>\n\nHiện không có thiết bị nào bị chặn.', menus.settings)
        } else {
          const buttons = blocked.map((b: any) => {
            const devId = typeof b === 'string' ? b : b.id
            const name = typeof b === 'string' ? devId : b.name
            return [{ text: `🟢 Mở chặn: ${name}`, callback_data: `unblock_dev_${devId}_blacklist` }]
          })
          buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_settings" }])
          await editMessage(chatId, messageId, `📱 <b>SỔ ĐEN THIẾT BỊ (${blocked.length})</b>\n\nChọn để mở chặn:`, { inline_keyboard: buttons })
        }
      }
      else if (data.startsWith('block_dev_')) {
        const [_, __, devId, uid] = data.split('_')
        const msgText = cb.message.text || ''
        const matchName = msgText.match(/Thiết bị: (.+)/)
        const deviceName = matchName ? matchName[1].trim() : devId
        
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'blocked_devices' } })
        let blocked = []
        if (setting) {
          try { blocked = JSON.parse(setting.value) } catch (e) {}
        }
        
        const isBlocked = blocked.some((b: any) => (typeof b === 'string' ? b : b.id) === devId)
        
        if (!isBlocked) {
          blocked.push({ id: devId, name: deviceName, time: new Date().toISOString() })
          await prisma.siteSetting.upsert({
            where: { key: 'blocked_devices' },
            update: { value: JSON.stringify(blocked) },
            create: { key: 'blocked_devices', value: JSON.stringify(blocked) }
          })
        }
        
        await answerCallback(cb.id, 'Đã đưa thiết bị này vào SỔ ĐEN!')
        
        // Cập nhật tin nhắn gốc để đổi nút
        const oldMsgText = cb.message?.text || ''
        const newMarkup = {
          inline_keyboard: [[{ text: "🟢 Bỏ chặn Thiết bị này", callback_data: `unblock_dev_${devId}_${uid}` }]]
        }
        await editMessage(chatId, messageId, `✅ <b>ĐÃ CHẶN THIẾT BỊ NÀY!</b>\n\n${oldMsgText}`, newMarkup)
      }
      else if (data.startsWith('unblock_dev_')) {
        const parts = data.split('_')
        const devId = parts[2]
        const uid = parts[3]
        
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'blocked_devices' } })
        let blocked = []
        if (setting) {
          try { blocked = JSON.parse(setting.value) } catch (e) {}
        }
        blocked = blocked.filter((b: any) => (typeof b === 'string' ? b : b.id) !== devId)
        
        await prisma.siteSetting.update({
          where: { key: 'blocked_devices' },
          data: { value: JSON.stringify(blocked) }
        })

        await answerCallback(cb.id, 'Đã gỡ chặn thiết bị thành công!')
        
        if (uid === 'blacklist') {
          // Trở lại menu blacklist
          const buttons = blocked.map((b: any) => {
            const bId = typeof b === 'string' ? b : b.id
            const name = typeof b === 'string' ? bId : b.name
            return [{ text: `🟢 Mở chặn: ${name}`, callback_data: `unblock_dev_${bId}_blacklist` }]
          })
          buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_settings" }])
          await editMessage(chatId, messageId, `📱 <b>SỔ ĐEN THIẾT BỊ (${blocked.length})</b>\n\nChọn để mở chặn:`, { inline_keyboard: buttons })
        } else {
          const oldMsgText = cb.message?.text || ''
          const newMarkup = {
            inline_keyboard: [[
              { text: "✅ Tin cậy", callback_data: `trust_dev_${devId}_${uid}` },
              { text: "🛑 Chặn Thiết bị", callback_data: `block_dev_${devId}_${uid}` }
            ]]
          }
          await editMessage(chatId, messageId, oldMsgText.replace('✅ ĐÃ CHẶN THIẾT BỊ NÀY!\n\n', ''), newMarkup)
        }
      }
      else if (data.startsWith('trust_dev_')) {
        const parts = data.split('_')
        const devId = parts[2]
        const uid = parts[3]
        
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'trusted_devices' } })
        let trusted = []
        if (setting) {
          try { trusted = JSON.parse(setting.value) } catch (e) {}
        }
        if (!trusted.includes(devId)) {
          trusted.push(devId)
          await prisma.siteSetting.upsert({
            where: { key: 'trusted_devices' },
            update: { value: JSON.stringify(trusted) },
            create: { key: 'trusted_devices', value: JSON.stringify(trusted) }
          })
        }
        
        await answerCallback(cb.id, 'Đã đưa thiết bị vào Sổ Trắng (Tin cậy)!')
        
        const oldMsgText = cb.message?.text || ''
        const newMarkup = {
          inline_keyboard: [[{ text: "🛑 Bỏ Tin cậy & Chặn", callback_data: `block_dev_${devId}_${uid}` }]]
        }
        await editMessage(chatId, messageId, `🛡️ <b>THIẾT BỊ ĐÃ ĐƯỢC TIN CẬY</b>\n\n${oldMsgText}`, newMarkup)
      }
      else if (data.startsWith('ai_approve_')) {
        const parts = data.split('_')
        const uid = parts[2]
        const amount = parseInt(parts[3])

        const user = await prisma.user.findUnique({ where: { id: uid } })
        if (user) {
          await prisma.user.update({
            where: { id: uid },
            data: { 
              aiQueryLimit: user.aiQueryLimit + amount,
              pendingAiRequest: false,
              hasUnreadAiNotification: true,
              unreadAiAmount: amount
            }
          })
          await answerCallback(cb.id, `Đã cấp thêm ${amount} lượt cho user!`)
          
          const oldMsgText = cb.message?.text || ''
          await editMessage(chatId, messageId, `✅ <b>ĐÃ DUYỆT +${amount} LƯỢT AI</b>\n\n${oldMsgText}`)
        } else {
          await answerCallback(cb.id, 'User không tồn tại!')
        }
      }
      else if (data.startsWith('ai_reject_')) {
        const uid = data.replace('ai_reject_', '')
        
        const user = await prisma.user.findUnique({ where: { id: uid } })
        if (user) {
          await prisma.user.update({
            where: { id: uid },
            data: { pendingAiRequest: false }
          })
          await answerCallback(cb.id, 'Đã từ chối yêu cầu!')
          
          const oldMsgText = cb.message?.text || ''
          await editMessage(chatId, messageId, `❌ <b>ĐÃ TỪ CHỐI YÊU CẦU AI</b>\n\n${oldMsgText}`)
        }
      }
      else if (data === 'menu_products') {
        const pending = await prisma.product.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, take: 10 })
        if (pending.length === 0) {
          await editMessage(chatId, messageId, '📦 <b>QUẢN LÝ BÀI ĐĂNG</b>\n\nHiện không có bài đăng nào đang chờ duyệt.', menus.backToMain)
        } else {
          const buttons = pending.map(p => [{ text: `⏳ ${p.title.substring(0,25)}...`, callback_data: `product_view_${p.id}` }])
          buttons.push([{ text: "🔙 Quay lại", callback_data: "menu_main" }])
          await editMessage(chatId, messageId, `📦 <b>BÀI ĐĂNG CHỜ DUYỆT (${pending.length})</b>\n\nChọn để xem chi tiết:`, { inline_keyboard: buttons })
        }
      }
      else if (data.startsWith('product_view_')) {
        const pid = data.replace('product_view_', '')
        const p = await prisma.product.findUnique({ where: { id: pid }, include: { owner: true } })
        if (!p) {
          await answerCallback(cb.id, 'Sản phẩm không tồn tại!')
        } else {
          const msg = `📦 <b>BÀI ĐĂNG CẦN DUYỆT</b> 📦\n\nTiêu đề: <b>${p.title}</b>\nTác giả: ${p.owner.name} (${p.owner.email})\nDanh mục: ${p.category}\nTrạng thái: ${p.status}`
          const menu = {
            inline_keyboard: [
              p.status === 'PENDING' ? [
                { text: "✅ Duyệt", callback_data: `product_approve_${p.id}` },
                { text: "❌ Từ chối", callback_data: `product_reject_${p.id}` }
              ] : [],
              [{ text: "🔙 Trở lại Danh sách", callback_data: "menu_products" }]
            ]
          }
          await editMessage(chatId, messageId, msg, menu)
        }
      }
      else if (data.startsWith('product_approve_')) {
        const pid = data.replace('product_approve_', '')
        const p = await prisma.product.findUnique({ where: { id: pid } })
        if (p && p.status === 'PENDING') {
          await prisma.product.update({ where: { id: pid }, data: { status: 'APPROVED' } })
          await answerCallback(cb.id, 'Đã duyệt bài đăng!')
          const oldMsgText = cb.message?.text || ''
          await editMessage(chatId, messageId, `✅ <b>ĐÃ DUYỆT BÀI ĐĂNG</b>\n\n${oldMsgText}`, { inline_keyboard: [[{ text: "🔙 Quản lý bài đăng", callback_data: "menu_products" }]] })
        }
      }
      else if (data.startsWith('product_reject_')) {
        const pid = data.replace('product_reject_', '')
        const p = await prisma.product.findUnique({ where: { id: pid } })
        if (p && p.status === 'PENDING') {
          await prisma.product.update({ where: { id: pid }, data: { status: 'REJECTED' } })
          await answerCallback(cb.id, 'Đã từ chối bài đăng!')
          const oldMsgText = cb.message?.text || ''
          await editMessage(chatId, messageId, `❌ <b>ĐÃ TỪ CHỐI BÀI ĐĂNG</b>\n\n${oldMsgText}`, { inline_keyboard: [[{ text: "🔙 Quản lý bài đăng", callback_data: "menu_products" }]] })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET(request: NextRequest) {
  const setup = request.nextUrl.searchParams.get('setup')
  if (setup === 'true') {
    const webhookUrl = `${request.nextUrl.origin}/api/webhook/telegram`
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`)
      const data = await res.json()
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
