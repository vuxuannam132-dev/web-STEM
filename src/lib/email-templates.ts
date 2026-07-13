export const generateRegistrationEmail = (name: string, otp: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #1e293b; margin: 0;">Chào mừng bạn đến với STEM Đoàn Kết</h2>
  </div>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Xin chào <strong>${name}</strong>,
  </p>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực dưới đây:
  </p>
  
  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
    <div style="color: #0f172a; font-size: 14px; font-weight: bold; margin-bottom: 8px;">MÃ XÁC THỰC CỦA BẠN</div>
    <div style="color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</div>
  </div>
  
  <p style="color: #64748b; font-size: 14px; line-height: 1.5; font-style: italic;">
    * Mã này sẽ hết hạn sau 15 phút.<br/>
    * Nếu bạn không yêu cầu đăng ký tài khoản này, vui lòng bỏ qua email này.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
    Trân trọng,<br/>
    <strong>Admin Web STEM Đoàn Kết</strong>
  </p>
</div>
`

export const generateAdmin2FAEmail = (name: string, otp: string, ip: string, device: string, time: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #dc2626; margin: 0;">🚨 Yêu cầu xác minh bảo mật</h2>
  </div>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Kính gửi Quản trị viên <strong>${name}</strong>,
  </p>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Hệ thống vừa ghi nhận một nỗ lực đăng nhập vào tài khoản quản trị của bạn từ một thiết bị hoặc trình duyệt chưa được tin cậy.
  </p>

  <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #334155;">
    <strong>Thông tin truy cập:</strong><br/>
    • Thời gian: ${time}<br/>
    • Địa chỉ IP: ${ip}<br/>
    • Thiết bị: ${device}
  </div>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Nếu đây đúng là bạn, vui lòng sử dụng mã xác minh (OTP) dưới đây để tiếp tục quá trình đăng nhập:
  </p>
  
  <div style="background-color: #fef2f2; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px solid #fecaca;">
    <div style="color: #991b1b; font-size: 14px; font-weight: bold; margin-bottom: 8px;">MÃ XÁC MINH BẢO MẬT 2 LỚP</div>
    <div style="color: #dc2626; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</div>
  </div>
  
  <p style="color: #64748b; font-size: 14px; line-height: 1.5; font-style: italic;">
    * Mã này có hiệu lực trong 20 phút.<br/>
    <strong style="color: #dc2626;">⚠️ CẢNH BÁO:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện đăng nhập, mật khẩu của bạn có thể đã bị lộ. Vui lòng chặn thiết bị này trên Telegram ngay lập tức!
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
    Trân trọng,<br/>
    <strong>Hệ Thống Bảo Mật STEM Đoàn Kết</strong>
  </p>
</div>
`

export const generateForgotPasswordEmail = (name: string, otp: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #1e293b; margin: 0;">Khôi phục mật khẩu</h2>
  </div>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Xin chào <strong>${name}</strong>,
  </p>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để thiết lập mật khẩu mới:
  </p>
  
  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
    <div style="color: #0f172a; font-size: 14px; font-weight: bold; margin-bottom: 8px;">MÃ KHÔI PHỤC MẬT KHẨU</div>
    <div style="color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</div>
  </div>
  
  <p style="color: #64748b; font-size: 14px; line-height: 1.5; font-style: italic;">
    * Mã OTP này sẽ hết hạn sau 15 phút.<br/>
    * Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  
  <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
    Trân trọng,<br/>
    <strong>Admin Web STEM Đoàn Kết</strong>
  </p>
</div>
`
