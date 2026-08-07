'use client'

import AppShell from '@/components/layout/AppShell'
import WithdrawScreen from '@/components/screens/settings/WithdrawScreen'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function SettingsWithdrawPage() {
  return (
    <AppShell showHeader>
      <RequireAuth>
        <WithdrawScreen />
      </RequireAuth>
    </AppShell>
  )
}
