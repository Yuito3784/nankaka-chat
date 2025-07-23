// components/HistoryDrawer.tsx
'use client'

import { X } from 'lucide-react'
import { HistoryItem } from '@/types/history'

type Props = {
  isOpen: boolean
  onClose: () => void
  history: HistoryItem | null
}

export default function HistoryDrawer({ isOpen, onClose, history }: Props) {
  if (!isOpen || !history) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full shadow-lg p-6 overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">診断詳細</h2>
        <div className="space-y-4 text-sm">
          <div><strong>📝 症状:</strong> {history.symptom}</div>
          <div><strong>🏥 診療科:</strong> {history.department}</div>
          <div><strong>⚠️ 緊急度:</strong> {history.urgency}</div>
          <div><strong>💬 コメント:</strong> {history.comment}</div>
          <div><strong>🏡 自宅でできる対処法:</strong> {history.homeCare}</div>
          <div><strong>🚨 注意すべき症状:</strong> {history.warningSymptoms}</div>
          <div><strong>🧾 受診時に伝えるとよい情報:</strong> {history.helpfulToTellDoctor}</div>
          <div><strong>🔍 他の可能性がある診療科:</strong> {history.additionalDepartments}</div>
        </div>
      </div>
    </div>
  )
}
