import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100, 'Tên tối đa 100 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100, 'Mật khẩu tối đa 100 ký tự'),
})

export const productSchema = z.object({
  title: z.string().min(1, 'Tên sản phẩm không được để trống').max(200),
  description: z.string().min(1, 'Mô tả không được để trống'),
  authors: z.array(z.string()).default([]),
  teachers: z.array(z.string()).default([]),
  appliedKnowledge: z.array(z.string()).default([]),
  components: z.array(z.string()).default([]),
  category: z.enum(['TOAN_LY_TIN', 'XA_HOI', 'NGOAI_NGU_THE_DUC_GDQP', 'KHOA_HOC_STEM']),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'ADMIN_ONLY']).default('PUBLIC'),
  qrForeground: z.string().default('#1e40af'),
  qrBackground: z.string().default('#ffffff'),
  qrCornerStyle: z.string().default('square'),
  qrDotStyle: z.string().default('square'),
  qrFrameText: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
