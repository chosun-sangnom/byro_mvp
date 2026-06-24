'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import AppShell from '@/components/layout/AppShell'
import MyPageScreen from '@/components/screens/mypage/MyPageScreen'

export default function MyPage() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/signup')
  }, [store.isLoggedIn, router])

  if (!store.isLoggedIn) return null

  return (
    <AppShell showHeader>
      <MyPageScreen />
    </AppShell>
  )
}
