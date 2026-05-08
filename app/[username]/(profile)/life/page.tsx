'use client'

import { PublicProfileLifeTabPage } from '@/components/screens/profile/PublicProfileTabPages'

export default function UserLifePage({ params }: { params: { username: string } }) {
  return <PublicProfileLifeTabPage username={params.username} />
}
