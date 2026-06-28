'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'
import GlassInput from '@/components/ui/GlassInput'
import { GlassTextarea, GlassSelect } from '@/components/ui/GlassInput'
import ImageUpload from '@/components/products/ImageUpload'
import QRPreview from '@/components/products/QRPreview'
import { CATEGORIES, parseJsonField, slugify } from '@/lib/constants'
import { ArrowLeft, Plus, X, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([''])
  const [teachers, setTeachers] = useState<string[]>([''])
  const [knowledge, setKnowledge] = useState<string[]>([''])
  const [components, setComponents] = useState<string[]>([''])
  const [category, setCategory] = useState('TOAN_LY_TIN')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')
  const [qrForeground, setQrForeground] = useState('#1e40af')
  const [qrBackground, setQrBackground] = useState('#ffffff')
  const [qrFrameText, setQrFrameText] = useState('')
  const [error, setError] = useState('')
  const [currentSlug, setCurrentSlug] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (data.product) {
          const p = data.product
          setTitle(p.title)
          setDescription(p.description)
          setImages(parseJsonField(p.images))
          setAuthors(parseJsonField(p.authors).length ? parseJsonField(p.authors) : [''])
          setTeachers(parseJsonField(p.teachers).length ? parseJsonField(p.teachers) : [''])
          setKnowledge(parseJsonField(p.appliedKnowledge).length ? parseJsonField(p.appliedKnowledge) : [''])
          setComponents(parseJsonField(p.components).length ? parseJsonField(p.components) : [''])
          setCategory(p.category)
          setTags(parseJsonField(p.tags))
          setVisibility(p.visibility)
          setQrForeground(p.qrForeground || '#1e40af')
          setQrBackground(p.qrBackground || '#ffffff')
          setQrFrameText(p.qrFrameText || '')
          setCurrentSlug(p.slug)
        }
      } catch {
        setError('Không thể tải sản phẩm')
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [productId])

  const updateListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const addListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList([...list, ''])
  }

  const removeListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    if (list.length <= 1) return
    setList(list.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          images,
          authors: authors.filter(Boolean),
          teachers: teachers.filter(Boolean),
          appliedKnowledge: knowledge.filter(Boolean),
          components: components.filter(Boolean),
          category,
          tags,
          visibility,
          qrForeground,
          qrBackground,
          qrFrameText: qrFrameText || undefined,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      toast.success('Cập nhật thành công! Bài viết sẽ quay lại trạng thái chờ duyệt.')
      router.push('/dashboard')
    } catch {
      setError('Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  const renderListField = (
    label: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {list.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateListItem(list, setList, i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          {list.length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem(list, setList, i)}
              className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addListItem(list, setList)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs transition-all"
      >
        <Plus className="w-3 h-3" />
        Thêm
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Quay lại Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-4">Chỉnh Sửa Sản Phẩm</h1>

      <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" />
        <p>Sau khi chỉnh sửa, bài viết sẽ quay lại trạng thái <strong>chờ duyệt</strong>. Admin sẽ cần duyệt lại trước khi hiển thị công khai.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Thông tin sản phẩm</h2>
          <GlassInput label="Tên sản phẩm" value={title} onChange={(e) => setTitle(e.target.value)} required />
          {title && <p className="text-slate-500 text-xs">Slug: <code className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{slugify(title)}</code></p>}
          <GlassTextarea label="Mô tả sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
          <ImageUpload images={images} onChange={setImages} />
        </GlassCard>

        <GlassCard className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Thành viên & Hướng dẫn</h2>
          {renderListField('Người thực hiện', authors, setAuthors, 'Họ tên')}
          {renderListField('Giáo viên hướng dẫn', teachers, setTeachers, 'Họ tên giáo viên')}
        </GlassCard>

        <GlassCard className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Chi tiết kỹ thuật</h2>
          {renderListField('Kiến thức áp dụng', knowledge, setKnowledge, 'VD: Điện tử')}
          {renderListField('Thành phần cấu tạo', components, setComponents, 'VD: Arduino')}
        </GlassCard>

        <GlassCard className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Phân loại</h2>
          <GlassSelect label="Chuyên mục" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </GlassSelect>
          <GlassSelect label="Chế độ hiển thị" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
            <option value="ADMIN_ONLY">Chỉ admin xem được</option>
          </GlassSelect>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Nhập tag..." className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
              <button type="button" onClick={addTag} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-sm font-medium">Thêm</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">QR Code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Màu QR</label>
              <div className="flex items-center gap-2">
                <input type="color" value={qrForeground} onChange={(e) => setQrForeground(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <span className="text-slate-600 text-sm font-mono">{qrForeground}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Màu nền QR</label>
              <div className="flex items-center gap-2">
                <input type="color" value={qrBackground} onChange={(e) => setQrBackground(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <span className="text-slate-600 text-sm font-mono">{qrBackground}</span>
              </div>
            </div>
          </div>
          <GlassInput label="Text dưới QR" value={qrFrameText} onChange={(e) => setQrFrameText(e.target.value)} placeholder="VD: Quét để xem chi tiết" />
          <QRPreview slug={currentSlug || undefined} foreground={qrForeground} background={qrBackground} frameText={qrFrameText} productTitle={title} />
        </GlassCard>

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard"><GlassButton variant="ghost">Hủy</GlassButton></Link>
          <GlassButton type="submit" variant="primary" loading={loading}>Cập nhật sản phẩm</GlassButton>
        </div>
      </form>
    </div>
  )
}
