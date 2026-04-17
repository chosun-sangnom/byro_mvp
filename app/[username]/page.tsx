'use client'

import PublicProfile from '@/components/screens/profile/PublicProfile'

export default function UserPage({ params }: { params: { username: string } }) {
  return <PublicProfile username={params.username} />
}
