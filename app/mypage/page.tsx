'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { NavBar } from '@/components/ui'
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
      <div className="flex flex-col h-full">
        <NavBar title="마이페이지" onBack={() => router.back()} />
        <div className="flex-1 overflow-y-auto">
          <MyPageScreen />
        </div>
      </div>
    </AppShell>
  )
}
