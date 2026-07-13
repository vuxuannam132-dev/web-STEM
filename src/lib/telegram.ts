const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8828705964:AAFTVrQrj2skrLCwVjnCiZax0Nex67wsq84'
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8846573144'

const defaultKeyboard = {
  keyboard: [
    [{ text: "🚀 Bắt đầu" }],
    [{ text: "📊 Báo cáo Hệ thống" }, { text: "🤖 Lượt dùng AI" }],
    [{ text: "👥 Quản lý Người dùng" }, { text: "📝 Nhật ký Logs" }],
    [{ text: "🛡️ Quản lý Sổ Trắng" }, { text: "📱 Quản lý Sổ Đen" }],
    [{ text: "⚙️ Cài đặt Web" }]
  ],
  resize_keyboard: true,
  is_persistent: true
}

export async function sendTelegramMessage(text: string) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text, 
        parse_mode: 'HTML',
        reply_markup: defaultKeyboard
      })
    })
  } catch (e) {
    console.error('Telegram error:', e)
  }
}
