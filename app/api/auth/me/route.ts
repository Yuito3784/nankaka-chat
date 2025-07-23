import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
    console.error('❌ JWTの検証に失敗:', err)

    // 無効なトークンの場合、cookieを削除して返す（任意）
    return new NextResponse(JSON.stringify({ user: null }), {
      status: 401,
      headers: {
        'Set-Cookie': 'token=; Path=/; Max-Age=0;',
        'Content-Type': 'application/json',
      },
    })
  }
}
