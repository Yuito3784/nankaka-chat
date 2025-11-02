import './globals.css'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '診る科ナビ',
  description: '症状に合った診療科をナビゲート',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* モバイル表示の大前提 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-gray-100 min-h-dvh">
        <Header />
        <div className="flex">
          {/* スマホでは非表示、md以上で表示 */}
          <aside className="hidden md:block">
            <Sidebar />
          </aside>

          {/* md以上の時だけ Sidebar 分の左余白（w-64=256px）を確保 */}
          <main className="w-full md:ml-64 mt-16 p-3 md:p-6 min-h-[calc(100dvh-4rem)] bg-gradient-to-br from-sky-100 via-white to-sky-50 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
