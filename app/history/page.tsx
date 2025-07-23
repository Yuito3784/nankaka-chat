'use client'

import { useEffect, useState } from 'react'
import { useUserInfo } from '@/lib/hooks/useUserInfo'
import { useRouter } from 'next/navigation'
import { HistoryItem } from '@/types/history'
import HistoryDrawer from '@/components/HistoryDrawer'
import { Trash2, Loader2 } from 'lucide-react'

export default function HistoryPage() {
  const { plan } = useUserInfo()
  const router = useRouter()

  const [histories, setHistories] = useState<HistoryItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [drawerItem, setDrawerItem] = useState<HistoryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // 仮データ取得（後にAPIに差し替え）
  useEffect(() => {
    if (plan === 'free') {
      router.push('/upgrade')
      return
    }

    const fetchHistories = async () => {
    try {
      const res = await fetch('/api/history/list', {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) {
        console.error('履歴取得に失敗しました:', res.status)
        return
      }
      const data = await res.json()
      setHistories(data.histories)
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setIsFetching(false)
    }
  }

    fetchHistories()
  }, [plan, router])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await fetch('/api/history/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      setHistories(prev => prev.filter(h => !selectedIds.includes(h.id)))
      setSelectedIds([])
    } catch (e) {
      console.error('削除に失敗しました', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🩺 診断履歴</h1>

      {isFetching ? (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2 w-5 h-5" />
          読み込み中...
        </div>
      ) : histories.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-4xl mb-4">📭</p>
          <p>診断履歴はまだありません。</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">
              {selectedIds.length}件選択中
            </span>
            <button
              onClick={deleteSelected}
              disabled={selectedIds.length === 0 || loading}
              className={`flex items-center text-sm px-3 py-1 rounded ${
                selectedIds.length === 0 || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              } transition`}
            >
              {loading ? (
                <Loader2 size={16} className="mr-1 animate-spin" />
              ) : (
                <Trash2 size={16} className="mr-1" />
              )}
              {loading ? '削除中...' : '選択した履歴を削除'}
            </button>
          </div>

          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === histories.length}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? histories.map((h) => h.id) : []
                      )
                    }
                  />
                </th>
                <th className="p-2 text-left">日付</th>
                <th className="p-2 text-left">症状</th>
                <th className="p-2 text-left">診療科</th>
                <th className="p-2 text-left">緊急度</th>
                <th className="p-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="p-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 truncate max-w-xs">{item.symptom}</td>
                  <td className="p-2">{item.department}</td>
                  <td className="p-2">{item.urgency}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setDrawerItem(item)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ✅ 詳細表示 Drawer */}
      <HistoryDrawer
        isOpen={drawerItem !== null}
        onClose={() => setDrawerItem(null)}
        history={drawerItem}
      />
    </main>
  )
}
