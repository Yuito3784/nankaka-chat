// app/api/history/list/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromCookie } from '@/lib/auth'

export async function GET() {
  const userId = await getUserIdFromCookie()
  console.log('[DEBUG] Extracted userId:', userId)

  if (!userId) {
    console.log('[ERROR] 未認証のため履歴を返しません')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  })

  const isPremium =
    user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'gold'

  const histories = await prisma.history.findMany({
    where: {
      userId,
      ...(isPremium
        ? {}
        : {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 過去30日
            },
          }),
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log('[DEBUG] Histories fetched:', histories.length)

  return NextResponse.json({ histories })
}
