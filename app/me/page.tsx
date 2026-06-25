'use client'

import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import MyByro from '@/components/screens/me/MyByro'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function MePage() {
  return (
    <AppShell showHeader>
      <RequireAuth>
        <Suspense>
          <MyByro />
        </Suspense>
      </RequireAuth>
    </AppShell>
  )
}
