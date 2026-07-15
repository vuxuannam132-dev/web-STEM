import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

// ========== Rate Limiting (In-memory, per IP) ==========
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // max 60 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  return false
}

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Stricter rate limit for auth endpoints (login, register)
const authRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const AUTH_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const AUTH_RATE_LIMIT_MAX = 10 // max 10 auth attempts per minute

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = authRateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    authRateLimitMap.set(ip, { count: 1, resetTime: now + AUTH_RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  if (entry.count > AUTH_RATE_LIMIT_MAX) {
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'

  // ========== Security Headers ==========
  const response = NextResponse.next()
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // ========== PROTECT MODE CHECK ==========
  // Skip protect mode check for telegram webhook, health check, and protect page itself
  if (
    !pathname.startsWith('/api/webhook/telegram') &&
    !pathname.startsWith('/api/health') &&
    !pathname.startsWith('/api/settings/protect') &&
    pathname !== '/protect'
  ) {
    try {
      const protectRes = await fetch(`${request.nextUrl.origin}/api/settings/protect`, { 
        next: { revalidate: 10 } 
      })
      if (protectRes.ok) {
        const { protectMode } = await protectRes.json()
        if (protectMode) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'System is under High Protection Mode.' }, { status: 503 })
          }
          return NextResponse.redirect(new URL('/protect', request.url))
        }
      }
    } catch (e) {
      // Fallback silently if fetch fails
    }
  }

  // ========== Global Device Ban Check ==========
  // Skip check for webhook, check-ban API, and the banned/protect pages
  if (!pathname.startsWith('/banned') && 
      !pathname.startsWith('/protect') &&
      !pathname.startsWith('/api/webhook') && 
      !pathname.startsWith('/api/auth/check-ban')) {
    
    const deviceId = request.cookies.get('device_id')?.value
    if (deviceId) {
      try {
        const banRes = await fetch(`${request.nextUrl.origin}/api/auth/check-ban`, { next: { revalidate: 15 } })
        if (banRes.ok) {
          const data = await banRes.json()
          if (Array.isArray(data.blocked) && data.blocked.includes(deviceId)) {
            if (pathname.startsWith('/api/')) {
              return NextResponse.json({ error: 'Thiết bị của bạn đã bị chặn vĩnh viễn.' }, { status: 403 })
            }
            return NextResponse.redirect(new URL('/banned', request.url))
          }
        }
      } catch (e) {
        // Fallback silently if fetch fails
      }
    }
  }

  // ========== Anti-Bot: Block suspicious user agents ==========
  const ua = request.headers.get('user-agent') || ''
  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python-requests|go-http|java\/|php\//i
  if (botPatterns.test(ua) && !pathname.startsWith('/api/cron') && !pathname.startsWith('/api/webhook/telegram')) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  // ========== Rate Limiting for API routes ==========
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhook/telegram')) {
    if (pathname.startsWith('/api/auth/')) {
      if (isAuthRateLimited(ip)) {
        return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' }, { status: 429 })
      }
    }
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
    }
  }

  // ========== Protect dashboard routes ==========
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try { await jwtVerify(token, JWT_SECRET) } 
    catch { return NextResponse.redirect(new URL('/login', request.url)) }
  }

  // ========== Protect admin routes ==========
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (payload.role !== 'ADMIN') return NextResponse.redirect(new URL('/', request.url))
    } catch { return NextResponse.redirect(new URL('/login', request.url)) }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
