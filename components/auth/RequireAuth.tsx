'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useFeloreStore } from '@/store/useFeloreStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  // localStorage 복원 전에는 isLoggedIn이 항상 false다. 그 값으로 판정하면
  // 로그인 상태에서 /me를 새로고침·주소 직접입력으로 열 때 온보딩(/signup)으로 튕긴다.
  // persist API는 프리렌더 시점엔 없으므로 렌더 중이 아니라 마운트 후에만 읽는다.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = useFeloreStore.persist
    if (!persist || persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return persist.onFinishHydration(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace('/signup')
  }, [hydrated, isLoggedIn, router])

  if (!hydrated || !isLoggedIn) return null
  return <>{children}</>
}
