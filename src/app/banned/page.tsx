import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thiết bị đã bị chặn',
  description: 'Thiết bị của bạn đã bị khóa truy cập.',
}

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-600/20 rounded-full blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            BẠN ĐÃ BỊ CHẶN BỞI ADMIN
          </h1>
          
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Thiết bị của bạn đã được đưa vào danh sách đen do có hành vi đáng ngờ. 
            Bạn không thể sử dụng bất kỳ tính năng nào trên hệ thống này nữa.
            <br /><br />
            Nếu cho rằng có nhầm lẫn, hãy gửi thông báo hoặc liên hệ Admin để được mở lại.
          </p>

          <a 
            href="https://t.me/script99dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium w-full group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform">
              <path d="M21.198 2.027c-1.341-.531-2.923-.213-4.043.81L2.247 16.486c-.538.536-.786 1.347-.563 2.1.223.753.86 1.328 1.624 1.488l5.882 1.25c.677.143 1.385.02 1.956-.356l9.646-7.394a1.002 1.002 0 0 1 1.417.15c.346.463.267 1.11-.184 1.47l-7.306 5.86c-.454.364-.691.93-.615 1.512.076.582.455 1.053 1.011 1.224l5.372 1.666c.86.265 1.83.056 2.502-.559l3.52-3.155c.602-.538.932-1.32.932-2.146v-5.69c0-1.077-.474-2.115-1.31-2.834z"/>
            </svg>
            Liên hệ @script99dev
          </a>
        </div>
      </div>
    </div>
  )
}
