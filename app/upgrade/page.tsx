'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useUserInfo } from '@/lib/hooks/useUserInfo' 
import { features } from '@/constants/features'
import type { PlanTier } from '@/constants/features'

const plans = [
    { name: "無料プラン", icon: "🟢", tier: "free" as const, price: "¥0/月", color: "gray" },
    { name: "プレミアム", icon: "🔵", tier: "premium" as const, price: "¥980/月", color: "blue", popular: true },
    { name: "ゴールド", icon: "🟡", tier: "gold" as const, price: "¥1,980/月", color: "yellow" },
  ]

export default function UpgradePage() {
  const [plan, setPlan] = useState<'free' | 'premium' | 'gold'>('free')
  const [loading, setLoading] = useState<string | null>(null)
  const { refreshUser } = useUserInfo()

  useEffect(() => {
    const fetchPlan = async () => {
      const res = await fetch('/api/auth/me')
      const { user } = await res.json()
      if (user?.subscriptionPlan) {
        setPlan(user.subscriptionPlan)
      }
    }
    fetchPlan()
  }, [])

  const handleFreeDowngrade = async () => {
    if (!confirm('有料プランを解約して無料プランに戻します。よろしいですか？')) return

    setLoading('free')
    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('キャンセル失敗')
      await refreshUser()
      setPlan('free')
    } catch (err) {
      alert('エラーが発生しました')
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-10">料金プラン比較</h1>

      {/* プランカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={clsx(
              'border rounded-lg p-6 shadow transition text-center relative',
              {
                'border-gray-300': p.color === 'gray',
                'border-blue-400': p.color === 'blue',
                'border-yellow-400': p.color === 'yellow',
              }
            )}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                人気
              </div>
            )}
            <h2 className={clsx('text-xl font-semibold mb-2', {
              'text-gray-700': p.color === 'gray',
              'text-blue-700': p.color === 'blue',
              'text-yellow-700': p.color === 'yellow',
            })}>
              {p.icon} {p.name}
            </h2>
            <p className={clsx('text-3xl font-bold mb-4', {
              'text-gray-600': p.color === 'gray',
              'text-blue-600': p.color === 'blue',
              'text-yellow-600': p.color === 'yellow',
            })}>
              {p.price}
            </p>
            <div className="mt-4">
              {plan === p.tier ? (
                <button disabled className="bg-gray-300 text-white px-4 py-2 rounded cursor-not-allowed">
                  ご利用中
                </button>
              ) : p.tier === 'free' ? (
                <button
                  onClick={handleFreeDowngrade}
                  disabled={loading === 'free'}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  {loading === 'free' ? '処理中...' : '無料プランに戻す'}
                </button>
              ) : (
                <a
                  href={`/api/create-checkout-session?plan=${p.tier}`}
                  className={clsx('px-4 py-2 rounded text-white', {
                    'bg-blue-500 hover:bg-blue-600': p.color === 'blue',
                    'bg-yellow-500 hover:bg-yellow-600': p.color === 'yellow',
                  })}
                >
                  {p.name}に登録
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 機能テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="p-3 text-left w-1/4">機能</th>
              <th className="p-3 text-center">無料プラン</th>
              <th className="p-3 text-center">プレミアム</th>
              <th className="p-3 text-center">ゴールド</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={idx} className="border-t border-gray-200 text-sm text-center">
                <td className="p-3 text-left font-medium">
                  {feature.icon} {feature.title}
                </td>
                <td className="p-3">{feature.free}</td>
                <td className="p-3">{feature.premium}</td>
                <td className="p-3">{feature.gold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
