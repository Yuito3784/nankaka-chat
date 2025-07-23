import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getUserIdFromCookie } from '@/lib/auth'

export async function POST() {
  try {
    // ✅ ユーザーIDを取得
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: '未認証です' }, { status: 401 })
    }

    // ✅ ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.warn('❌ ユーザーが存在しません')
      return NextResponse.json({ error: 'ユーザーが存在しません' }, { status: 404 })
    }

    // ✅ すでにfreeプランなら何もしない（冪等対応）
    if (user.subscriptionPlan === 'free') {
      console.log(`ℹ️ ユーザー ${user.email} はすでに free プランです`)
      return NextResponse.json({ success: true })
    }

    // ✅ サブスクリプション情報がない場合
    if (!user.stripeSubId || !user.stripeCustomerId) {
      console.warn('⚠️ アクティブなサブスクリプションがありません')
      return NextResponse.json({ error: 'アクティブなサブスクリプションがありません' }, { status: 400 })
    }

    // ✅ Stripe上のサブスクリプションをキャンセル
    try {
      await stripe.subscriptions.cancel(user.stripeSubId)
      console.log(`✅ Stripeサブスクリプション ${user.stripeSubId} をキャンセル`)
    } catch (stripeError: any) {
      console.error('⚠️ Stripeキャンセルエラー:', stripeError.message)
      return NextResponse.json({ error: 'Stripeのキャンセルに失敗しました' }, { status: 500 })
    }

    // ✅ DB上のユーザー情報を更新（freeに切り替え）
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: 'free',
          stripeSubId: null,
          currentPeriodEnd: null,
        },
      })

      console.log(`🛑 ${updated.email} のプランを free に変更しました`)
      return NextResponse.json({ success: true })
    } catch (dbError: any) {
      console.error('❌ DB更新エラー:', dbError.message)
      return NextResponse.json({ error: 'プラン更新に失敗しました' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('❌ 解約処理全体エラー:', err)
    return NextResponse.json({ error: '予期しないエラーが発生しました' }, { status: 500 })
  }
}
