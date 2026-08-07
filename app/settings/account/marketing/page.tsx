'use client'

import AppShell from '@/components/layout/AppShell'
import MarketingConsentScreen from '@/components/screens/settings/MarketingConsentScreen'
import { RequireAuth } from '@/components/auth/RequireAuth'

export default function SettingsMarketingPage() {
  return (
    <AppShell showHeader>
      <RequireAuth>
        <MarketingConsentScreen />
      </RequireAuth>
    </AppShell>
  )
}
