'use client'

import AppShell from '@/components/layout/AppShell'
import SettingsScreen from '@/components/screens/settings/SettingsScreen'

export default function SettingsPage() {
  return (
    <AppShell showHeader showTabBar>
      <SettingsScreen />
    </AppShell>
  )
}
