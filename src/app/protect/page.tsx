'use client'

import React, { useEffect } from 'react'
import { ShieldAlert, Activity, Server, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProtectPage() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/settings/protect', { cache: 'no-store' })
        if (res.ok) {
          const { protectMode } = await res.json()
          if (!protectMode) {
            window.location.href = '/' // Force a full reload to clear any cached states
          }
        }
      } catch (e) {}
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="z-10 flex flex-col items-center max-w-2xl text-center space-y-8 animate-fade-in-up">
        
        {/* Radar/Shield Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-24 h-24 bg-slate-900 border border-blue-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
            <ShieldAlert className="w-12 h-12 text-blue-400" />
            
            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-scan"></div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            SYSTEM PROTECTED
          </h1>
          <p className="text-lg md:text-xl text-blue-200/80 font-medium max-w-lg mx-auto">
            Web hiện đang trong quá trình test hạ tầng và đang trong chế độ bảo vệ dữ liệu cao nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <Activity className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Trạng thái</span>
            <span className="text-emerald-400 font-bold">Chống DDoS Bật</span>
          </div>
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <Server className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Máy chủ</span>
            <span className="text-blue-400 font-bold">Ngắt kết nối DB</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <Lock className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Dữ liệu</span>
            <span className="text-purple-400 font-bold">An toàn tuyệt đối</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 w-full">
          <p className="text-slate-500 text-sm">
            Hệ thống sẽ tự động mở lại sau khi kết thúc quá trình kiểm tra. Vui lòng quay lại sau!
          </p>
        </div>
      </div>
    </div>
  )
}
