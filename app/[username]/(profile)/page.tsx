'use client'

import { useState } from 'react'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'
import { type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PublicProfileLifeTabPage,
  PublicProfileReputationTabPage,
  PublicProfileWhoTabPage,
} from '@/components/screens/profile/PublicProfileTabPages'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [activeTab, setActiveTab] = useState<PublicProfileTabId>('who')

  return (
    <PublicProfileShell
      username={params.username}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'who' && <PublicProfileWhoTabPage username={params.username} />}
      {activeTab === 'life' && <PublicProfileLifeTabPage username={params.username} />}
      {activeTab === 'reputation' && <PublicProfileReputationTabPage username={params.username} />}
    </PublicProfileShell>
  )
}
