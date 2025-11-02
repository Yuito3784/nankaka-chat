'use client'

import { useState, useRef, useEffect } from 'react'
import ChatBox from '@/components/ChatBox'
import ChatMessage from '@/components/ChatMessage'

type Message = {
  role: 'user' | 'ai'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const detailsRef = useRef<HTMLDetailsElement | null>(null)

  const handleCloseForm = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  const handleSend = async (text: string) => {
    if (!text) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: text }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `🩺 診療科: ${data.diagnosis.診療科}\n🚨 緊急度: ${data.diagnosis.緊急度}\n💬 コメント: ${data.diagnosis.コメント}\n🏠 自宅でできる対処法: ${data.diagnosis.自宅でできる対処法}\n⚠️ 注意すべき症状: ${data.diagnosis.注意すべき症状}\n🗣️ 受診時に伝えるとよい情報: ${data.diagnosis.受診時に伝えるとよい情報}\n🔁 他の可能性がある診療科: ${data.diagnosis.他の可能性がある診療科}`,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '⚠️ エラーが発生しました。しばらくしてから再度お試しください。',
        },
      ])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    // 外枠：カードを画面高いっぱいに
    <main className="flex-1 h-[calc(100dvh-4rem)] px-3 sm:px-4 flex justify-center">
      <div className="w-full max-w-screen-sm md:max-w-2xl h-full
                      rounded-none md:rounded-3xl shadow-none md:shadow-xl
                      bg-white border border-gray-200 flex flex-col min-h-0">

        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b p-4
                          text-center text-lg md:text-xl font-semibold text-blue-600 shadow-sm">
          🩺 診る科ナビ
          <p className="text-[11px] md:text-[10px] text-gray-400 mt-1">
            何科に行けばよいかわからないあなたの相談窓口
          </p>
        </header>

        <section className="bg-white px-4 py-2 border-b">
          <details ref={detailsRef} open className="flex flex-col">
            {/* 見出しは常に上に表示される */}
            <summary className="sticky top-0 z-10 bg-white cursor-pointer
                                text-sm text-blue-600 font-semibold py-2">
              症状を入力する
            </summary>

            {/* ←ここが“内部スクロール”エリア */}
            <div
              className="mt-2 max-h-[60vh] overflow-y-auto overscroll-contain touch-pan-y pr-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <ChatBox
                onSend={handleSend}
                onCloseForm={handleCloseForm}
                disabled={isLoading}
              />
            </div>
          </details>
        </section>

        {/* メッセージ一覧（必要なら内部スクロールに切替可） */}
        <div className="p-4 space-y-3 bg-white min-w-0">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <div className="text-sm text-gray-400 text-center">診断中...</div>}
          <div ref={bottomRef} />
        </div>

        <footer className="shrink-0 border-t p-3 bg-white">
          <p className="text-[10px] text-gray-400 text-center">
            ※このサービスは医療行為ではありません。緊急時は病院へ。
          </p>
        </footer>
      </div>
    </main>
  )
}
