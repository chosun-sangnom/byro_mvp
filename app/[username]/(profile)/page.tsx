'use client'

import { PublicProfileWhoTabPage } from '@/components/screens/profile/PublicProfileTabPages'

export default function UserWhoPage({ params }: { params: { username: string } }) {
  return <PublicProfileWhoTabPage username={params.username} />
}
