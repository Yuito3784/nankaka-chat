import './globals.css'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '診る科ナビ',
  description: '症状に合った診療科をナビゲート',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="ml-64 mt-16 p-6 w-full min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
