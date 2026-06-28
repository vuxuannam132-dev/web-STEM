'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
}

export default function ImageUpload({ images, onChange, maxFiles = 10 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > maxFiles) {
      toast.error(`Tối đa ${maxFiles} ảnh`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('files', file))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      onChange([...images, ...data.urls])
      toast.success('Upload thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Hình ảnh sản phẩm</label>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
            <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" sizes="150px" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {images.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white/50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-all"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
