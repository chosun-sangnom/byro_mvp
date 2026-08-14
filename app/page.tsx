'use client'

import AppShell from '@/components/layout/AppShell'
import FeedScreen from '@/components/screens/FeedScreen'

export default function HomePage() {
  return (
    <AppShell showHeader>
      <FeedScreen />
    </AppShell>
  )
}
