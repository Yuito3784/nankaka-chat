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
    <>
      <main className="flex-1 min-h-[calc(100vh-100px)] bg-gradient-to-br from-sky-100 via-white to-sky-50 p-4 flex justify-center items-center">
        <div className="w-full max-w-2xl h-[90vh] rounded-3xl shadow-xl bg-white border border-gray-200 flex flex-col overflow-hidden">
          <header className="bg-white border-b p-4 text-center text-xl font-semibold text-blue-600 shadow-sm">
            🩺 診る科ナビ
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              何科に行けばよいかわからないあなたの相談窓口
            </p>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
              <div className="text-sm text-gray-400 text-center">診断中...</div>
            )}
            <div ref={bottomRef} />
          </div>

          <footer className="border-t p-3 bg-white">
            <details ref={detailsRef} open>
              <summary className="cursor-pointer text-sm text-blue-600 font-semibold mb-2">
                症状を入力する
              </summary>
              <ChatBox
                onSend={handleSend}
                onCloseForm={handleCloseForm}
                disabled={isLoading}
              />
            </details>
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              ※このサービスは医療行為ではありません。緊急時は病院へ。
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
