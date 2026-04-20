'use client'

import AppShell from '@/components/layout/AppShell'
import PublicProfile from '@/components/screens/profile/PublicProfile'

export default function UserPage({ params }: { params: { username: string } }) {
  return (
    <AppShell>
      <PublicProfile username={params.username} />
    </AppShell>
  )
}
