'use client'

import Link from 'next/link'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
import clsx from 'clsx'

export default function Header() {
  const { email, plan } = useUserInfo()

  type PlanType = 'free' | 'premium' | 'gold'
  const currentPlan: PlanType = (plan ?? 'free') as PlanType

  const planLabel: Record<PlanType, string> = {
    free: '無料',
    premium: 'プレミアム',
    gold: 'ゴールド',
  }

  const planColor: Record<PlanType, string> = {
    free: 'bg-gray-200 text-gray-700',
    premium: 'bg-blue-100 text-blue-700',
    gold: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      {/* 左ロゴ */}
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
        <span className="text-2xl">🩺</span>
        <div className="text-lg font-bold text-blue-600">診る科ナビ</div>
      </Link>

      {/* 右エリア */}
      <div className="flex items-center space-x-4 text-sm">
        {/* 🪙 プラン表示 → /upgrade へ遷移 */}
        <Link
          href="/upgrade"
          className={clsx(
            'px-3 py-1 rounded-full cursor-pointer transition hover:opacity-80',
            planColor[currentPlan]
          )}
          title="プランを変更"
        >
          🪙 {planLabel[currentPlan]}プラン
        </Link>

        <Link
          href="/notifications"
          className="hover:text-blue-600 transition"
          title="通知"
        >
          🔔
        </Link>

        {!email && (
          <Link href="/login" className="hover:text-blue-600 transition">
            🔑 ログイン
          </Link>
        )}

        {email && (
          <Link href="/account" className="hover:text-blue-600 transition">
            👤 マイページ
          </Link>
        )}
      </div>
    </header>
  )
}
