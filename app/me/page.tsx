'use client'

import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import MyFelore from '@/components/screens/me/MyFelore'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function MePage() {
  return (
    <AppShell showHeader>
      <RequireAuth>
        <Suspense>
          <MyFelore />
        </Suspense>
      </RequireAuth>
    </AppShell>
  )
}
