'use client'

import AppShell from '@/components/layout/AppShell'
import FeedbackScreen from '@/components/screens/profile/FeedbackScreen'

export default function FeedbackPage({ params }: { params: { username: string } }) {
  return (
    <AppShell>
      <FeedbackScreen username={params.username} />
    </AppShell>
  )
}
