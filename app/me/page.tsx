'use client'

import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import MyByro from '@/components/screens/me/MyByro'

export default function MePage() {
  return (
    <AppShell>
      <Suspense>
        <MyByro />
      </Suspense>
    </AppShell>
  )
}
