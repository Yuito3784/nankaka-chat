'use client'

import Link from 'next/link'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
import { features, planPriority, PlanTier } from '@/constants/features'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const { email, plan = 'free' } = useUserInfo()
  const currentPriority = planPriority[plan as PlanTier]
  const router = useRouter()

  const [showModal, setShowModal] = useState(false)
  const [lockedFeature, setLockedFeature] = useState<{ title: string; requiredPlan: PlanTier } | null>(null)

  const handleLockedClick = (title: string, requiredPlan: PlanTier) => {
    setLockedFeature({ title, requiredPlan })
    setShowModal(true)
  }

  const handleUpgrade = () => {
    setShowModal(false)
    router.push('/upgrade')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (err) {
      console.error('ログアウトに失敗しました', err)
    }
  }

  return (
    <>
      <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-2">📋 メニュー</h2>
          <Link
            href="/"
            className="mb-2 w-full flex items-center px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition text-sm"
          >
            <span className="mr-2">🩺</span>診断する
          </Link>
          {/* <nav className="flex flex-col space-y-2 text-sm">
            {features.filter(f => f.paths.length > 0).flatMap((f) =>
              f.paths.map((path) => {
                const required = f.requiredPlan ? planPriority[f.requiredPlan] : 0
                const isLocked = currentPriority < required
                return isLocked && f.requiredPlan ? (
                  <button
                    key={path}
                    onClick={() => handleLockedClick(f.title, f.requiredPlan!)}
                    className="flex items-center px-3 py-2 rounded hover:text-blue-600 hover:bg-blue-50 transition text-left w-full"
                    title={`${f.title}は${f.requiredPlan}プラン以上で利用可能`}
                  >
                    <span className="mr-2">{f.icon}</span>
                    {f.title}
                  </button>
                ) : (
                  <Link
                    key={path}
                    href={path}
                    className="flex items-center px-3 py-2 rounded hover:text-blue-600 hover:bg-blue-50 transition"
                  >
                    <span className="mr-2">{f.icon}</span>
                    {f.title}
                  </Link>
                )
              })
            )}

            <Link href="/settings" className="flex items-center px-3 py-2 rounded hover:text-blue-600 hover:bg-blue-50 transition">
              <span className="mr-2">⚙️</span>設定
            </Link>
            <Link href="/news" className="flex items-center px-3 py-2 rounded hover:text-blue-600 hover:bg-blue-50 transition">
              <span className="mr-2">📰</span>お知らせ
            </Link>
            <Link href="/help" className="flex items-center px-3 py-2 rounded hover:text-blue-600 hover:bg-blue-50 transition">
              <span className="mr-2">❓</span>ヘルプ
            </Link>
          </nav> */}
        </div>

        {email && (
          <button
            onClick={handleLogout}
            className="mt-6 flex items-center px-3 py-2 rounded text-red-500 hover:bg-red-50 hover:text-red-600 transition text-sm"
          >
            <span className="mr-2">🚪</span>ログアウト
          </button>
        )}
      </aside>

      {/* 🔔 モーダル */}
      {showModal && lockedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">機能のご利用にはアップグレードが必要です</h3>
            <p className="text-sm mb-4">
              「{lockedFeature.title}」は
              <span className="font-semibold text-blue-600">{lockedFeature.requiredPlan}プラン以上</span>
              でご利用いただけます。
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                閉じる
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleUpgrade}
              >
                アップグレードする
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
