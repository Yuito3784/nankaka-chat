// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('❌ /api/auth/me: ユーザー取得失敗:', err)

    // 無効トークン時 → クッキー削除
    const res = NextResponse.json({ user: null }, { status: 401 })
    res.cookies.set('auth_token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })
    return res
  }
}
