'use client'

import AppShell from '@/components/layout/AppShell'
import KemiSharedScreen from '@/components/screens/profile/KemiSharedScreen'

export default function KemiSharedPage({ params }: { params: { token: string } }) {
  return (
    <AppShell showHeader>
      <KemiSharedScreen token={params.token} />
    </AppShell>
  )
}
