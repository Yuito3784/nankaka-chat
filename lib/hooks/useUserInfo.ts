// 'use client'

// import { useCallback, useEffect, useState } from 'react'

// export function useUserInfo() {
//   const [email, setEmail] = useState<string | null>(null)
//   const [plan, setPlan] = useState<'free' | 'premium' | 'gold' | null>(null)

//   const fetchUser = useCallback(async () => {
//     const res = await fetch('/api/auth/me')
//     const { user } = await res.json()
//     setEmail(user?.email ?? null)
//     setPlan(user?.subscriptionPlan ?? null)
//   }, [])

//   useEffect(() => {
//     fetchUser()
//   }, [fetchUser])

//   return { email, plan, refreshUser: fetchUser }
// }

'use client'

import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useUserInfo() {
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher)

  const email = data?.user?.email ?? null
  const plan = data?.user?.subscriptionPlan ?? null

  // 🔁 外部から再取得したい時用
  const refreshUser = () => mutate('/api/auth/me')

  return { email, plan, refreshUser, isLoading, error }
}
