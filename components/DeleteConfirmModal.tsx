// components/DeleteConfirmModal.tsx
'use client'

type Props = {
  onCancel: () => void
  onConfirm: () => void
  count: number
}

export default function DeleteConfirmModal({ onCancel, onConfirm, count }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">診断履歴を削除しますか？</h3>
        <p className="text-sm text-gray-600 mb-6">
          選択された {count} 件の履歴を完全に削除します。この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            キャンセル
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}
