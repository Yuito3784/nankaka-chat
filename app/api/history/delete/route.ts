// app/api/history/delete/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromCookie } from '@/lib/auth'

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie()
  if (!userId) {
    return NextResponse.json({ error: '未認証のリクエストです' }, { status: 401 })
  }

  try {
    const { ids } = await req.json() as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '削除対象が指定されていません' }, { status: 400 })
    }

    const result = await prisma.history.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    })

    return NextResponse.json({ success: true, deletedCount: result.count })
  } catch (error) {
    console.error('[削除エラー]', error)
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}
