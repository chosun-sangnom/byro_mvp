'use client'

import { useEffect, useState } from 'react'
import { useByroStore } from '@/store/useByroStore'

export function useProfileOwner(username: string) {
  // localStorage-backed 로그인 상태는 서버에서 알 수 없어 SSR은 항상 guest로 렌더됨.
  // 마운트 전까지는 guest로 고정해 hydration mismatch를 막고, 마운트 후에 실제 값으로 갱신한다.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const user = useByroStore((s) => s.user)
  const isOwner = mounted && isLoggedIn && user?.linkId === username
  return { isOwner, isLoggedIn: mounted && isLoggedIn, user }
}
