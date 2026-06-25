'use client'

import AppShell from '@/components/layout/AppShell'
import Archive from '@/components/screens/archive/Archive'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function ArchivePage() {
  return (
    <AppShell showHeader>
      <RequireAuth>
        <Archive />
      </RequireAuth>
    </AppShell>
  )
}
