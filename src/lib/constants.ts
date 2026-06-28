export const CATEGORIES = {
  TOAN_LY_TIN: 'Tổ Toán - Lý - Tin',
  XA_HOI: 'Tổ Xã Hội',
  NGOAI_NGU_THE_DUC_GDQP: 'Tổ Ngoại Ngữ - Thể Dục - GDQP',
  KHOA_HOC_STEM: 'Khóa Học STEM',
} as const

export type CategoryKey = keyof typeof CATEGORIES

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
}

export const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Công khai',
  PRIVATE: 'Riêng tư',
  ADMIN_ONLY: 'Chỉ admin',
}

export function getCategoryLabel(key: string): string {
  return CATEGORIES[key as CategoryKey] || key
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function parseJsonField(value: string | string[]): string[] {
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
