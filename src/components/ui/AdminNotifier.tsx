'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

export default function AdminNotifier() {
  const { user } = useAuth()
  const [lastTime, setLastTime] = useState<string>('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    // Khởi tạo lastTime là thời điểm hiện tại khi component mount
    setLastTime(new Date().toISOString())
  }, [user?.role])

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !lastTime) return

    const pollLogs = async () => {
      try {
        const res = await fetch(`/api/admin/logs/latest?since=${encodeURIComponent(lastTime)}`)
        if (!res.ok) return
        const logs = await res.json()
        
        if (logs && logs.length > 0) {
          // Cập nhật lastTime bằng createdAt của log mới nhất
          const newestTime = logs[logs.length - 1].createdAt
          setLastTime(newestTime)

          logs.forEach((log: any) => {
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                  } transition-all duration-300 transform max-w-md w-full bg-slate-900/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-white/10`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                          Admin Notification - {log.type}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-white/10">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ),
              {
                position: 'bottom-left',
                duration: 15000,
              }
            )
          })
        }
      } catch (error) {
        console.error('Error polling admin logs:', error)
      }
    }

    timerRef.current = setInterval(pollLogs, 10000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [user?.role, lastTime])

  return null
}
