'use client'

import AppShell from '@/components/layout/AppShell'
import LanguageScreen from '@/components/screens/settings/LanguageScreen'

export default function SettingsLanguagePage() {
  return (
    <AppShell showHeader>
      <LanguageScreen />
    </AppShell>
  )
}
