'use client'

import AppShell from '@/components/layout/AppShell'
import PoliciesScreen from '@/components/screens/settings/PoliciesScreen'

export default function SettingsPoliciesPage() {
  return (
    <AppShell showHeader>
      <PoliciesScreen />
    </AppShell>
  )
}
