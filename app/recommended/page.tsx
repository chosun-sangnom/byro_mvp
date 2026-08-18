'use client'

import AppShell from '@/components/layout/AppShell'
import RecommendedScreen from '@/components/screens/recommended/RecommendedScreen'

export default function RecommendedPage() {
  return (
    <AppShell showHeader>
      <RecommendedScreen />
    </AppShell>
  )
}
