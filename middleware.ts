// middleware.ts （置換）
import { NextResponse, NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/history']

// 環境に合わせてクッキー候補を列挙
const CANDIDATE_COOKIE_KEYS = [
  'auth_token', // 自前JWT想定
  'mesync_session', // 自前セッション想定
  'next-auth.session-token', // NextAuth(HTTPのみ)
  '__Secure-next-auth.session-token', // NextAuth(HTTPS)
]

function hasLoginCookie(req: NextRequest) {
  return CANDIDATE_COOKIE_KEYS.some(k => !!req.cookies.get(k)?.value)
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  // ✅ クッキーが1つでもあればログイン扱い（真正性検証はAPI/サーバで）
  if (hasLoginCookie(req)) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(loginUrl)
}

export const config = { matcher: ['/history'] }
