'use client'

import MobileFrame from '@/components/layout/MobileFrame'
import PublicProfile from '@/components/screens/profile/PublicProfile'

export default function UserPage({ params }: { params: { username: string } }) {
  return (
    <MobileFrame>
      <PublicProfile username={params.username} />
    </MobileFrame>
  )
}
