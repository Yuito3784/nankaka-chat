'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      setMessage('ログイン成功！')
      router.push('/upgrade') // ログイン後のリダイレクト先
    } else {
      const data = await res.json()
      setMessage(`ログイン失敗: ${data.error || '不明なエラー'}`)
    }
  }

  const handleSignup = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      setMessage('登録成功！ログインしてください')
      setIsLogin(true)
    } else {
      const data = await res.json()
      setMessage(`登録失敗: ${data.error || '不明なエラー'}`)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-center">
        {isLogin ? 'ログイン' : '新規登録'}
      </h1>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <button
        onClick={isLogin ? handleLogin : handleSignup}
        className={`w-full py-2 rounded ${
          isLogin ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isLogin ? 'ログイン' : '新規登録'}
      </button>

      <p className="text-center text-sm">
        {isLogin ? 'アカウントをお持ちでない方は' : 'すでに登録済みの方は'}{' '}
        <button
          className="text-blue-600 underline"
          onClick={() => {
            setMessage('')
            setIsLogin(!isLogin)
          }}
        >
          {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
        </button>
      </p>

      {message && <p className="text-center text-sm text-red-500">{message}</p>}
    </div>
  )
}
