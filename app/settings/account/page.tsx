'use client'

import AppShell from '@/components/layout/AppShell'
import AccountScreen from '@/components/screens/settings/AccountScreen'

export default function SettingsAccountPage() {
  return (
    <AppShell showHeader>
      <AccountScreen />
    </AppShell>
  )
}
