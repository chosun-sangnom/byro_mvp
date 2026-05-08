'use client'

import { PublicProfileReputationTabPage } from '@/components/screens/profile/PublicProfileTabPages'

export default function UserReputationPage({ params }: { params: { username: string } }) {
  return <PublicProfileReputationTabPage username={params.username} />
}
