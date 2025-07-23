'use client'

import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Modal({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-sm text-sm">
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            閉じる
          </button>
          <a
            href="/upgrade"
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
          >
            アップグレード
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
