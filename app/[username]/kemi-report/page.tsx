'use client'

import AppShell from '@/components/layout/AppShell'
import KemiReportScreen from '@/components/screens/profile/KemiReportScreen'

export default function KemiReportPage({ params }: { params: { username: string } }) {
  return (
    <AppShell showHeader>
      <KemiReportScreen username={params.username} />
    </AppShell>
  )
}
