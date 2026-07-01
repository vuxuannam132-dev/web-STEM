import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/hooks/useAuth'
import AiChatWidget from '@/components/ai/AiChatWidget'
import BugReportWidget from '@/components/ui/BugReportWidget'
import VerifyPromptModal from '@/components/ui/VerifyPromptModal'
import GlobalSessionSync from '@/components/ui/GlobalSessionSync'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'STEM Đoàn Kết - Website Giới Thiệu Sản Phẩm STEM',
  description: 'Website giới thiệu sản phẩm STEM trường THPT Đoàn Kết-Hai Bà Trưng. Nơi trưng bày, chia sẻ và lan tỏa các sản phẩm STEM sáng tạo của học sinh.',
  keywords: ['STEM', 'THPT Đoàn Kết', 'Hai Bà Trưng', 'sản phẩm STEM', 'giáo dục'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
            <filter id="distorsion">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="B" />
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </svg>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px) url(#distorsion)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
              },
            }}
          />
          <Navbar />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
          <Footer />
          <AiChatWidget />
          <BugReportWidget />
          <VerifyPromptModal />
          <GlobalSessionSync />
        </AuthProvider>
      </body>
    </html>
  )
}
