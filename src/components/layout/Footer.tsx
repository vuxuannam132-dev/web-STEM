import React from 'react'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="mt-20">
      <div className="glass-card rounded-t-3xl border-b-0 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo1.jpg"
              alt="Logo THPT Đoàn Kết"
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <h3 className="text-slate-900 font-bold text-lg">THPT Đoàn Kết-Hai Bà Trưng</h3>
              <p className="text-slate-600 text-sm">Website giới thiệu sản phẩm STEM của học sinh</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-800 text-sm font-medium">
              Trường THPT Đoàn Kết - Hai Bà Trưng (Hà Nội)
            </p>
            <p className="text-slate-600 text-sm mt-1">
              Địa chỉ: Số 174 Hồng Mai, phường Quỳnh Lôi, quận Hai Bà Trưng, thành phố Hà Nội.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              © 2026 Dev by Vũ Xuân Nam D2K64 trường THPT Đoàn Kết-Hai Bà Trưng kính tặng!
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
