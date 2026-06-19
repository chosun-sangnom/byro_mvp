'use client'

import AppShell from '@/components/layout/AppShell'
import GuestbookScreen from '@/components/screens/profile/GuestbookScreen'

export default function GuestbookPage({ params }: { params: { username: string } }) {
  return (
    <AppShell showHeader>
      <GuestbookScreen username={params.username} />
    </AppShell>
  )
}
