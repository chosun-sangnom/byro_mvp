'use client'

import AppShell from '@/components/layout/AppShell'
import InquiryScreen from '@/components/screens/settings/InquiryScreen'

export default function SettingsInquiryPage() {
  return (
    <AppShell showHeader>
      <InquiryScreen />
    </AppShell>
  )
}
