'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'
import { type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PublicProfileLifeTabPage,
  PublicProfileReputationTabPage,
  PublicProfileWhoTabPage,
} from '@/components/screens/profile/PublicProfileTabPages'
import { BasicInfoEditScreen } from '@/components/screens/me/MyByroBasicInfoScreen'
import { HighlightManageScreen } from '@/components/screens/me/MyByroHighlightManageScreen'
import {
  ContactManageScreen,
  LifeManageScreen,
  ManageByroScreen,
  RememberNetworkManageScreen,
  ReputationManageScreen,
  SNSManageScreen,
} from '@/components/screens/me/MyByroSupportScreens'

type Screen =
  | 'preview'
  | 'manage'
  | 'editBasic'
  | 'editHighlight'
  | 'editLife'
  | 'editNetwork'
  | 'editReputation'
  | 'editSNS'
  | 'editContact'

// ─────────────────────────────────────────────────────────────────────────────
export default function MyByro() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/onboarding')
  }, [store.isLoggedIn, router])

  const [screen, setScreen] = useState<Screen>('preview')
  const [activeTab, setActiveTab] = useState<PublicProfileTabId>('who')

  if (!store.isLoggedIn) return null
  const user = store.user!

  const allHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  // ── 화면 분기 ──────────────────────────────────────────────
  if (screen === 'preview') {
    return (
      <PublicProfileShell
        username={user.linkId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOwnerEdit={() => setScreen('manage')}
        onOwnerManageConnections={() => router.push('/archive')}
      >
        {activeTab === 'who' && <PublicProfileWhoTabPage username={user.linkId} />}
        {activeTab === 'life' && <PublicProfileLifeTabPage username={user.linkId} />}
        {activeTab === 'reputation' && <PublicProfileReputationTabPage username={user.linkId} />}
      </PublicProfileShell>
    )
  }

  if (screen === 'manage') {
    return (
      <ManageByroScreen
        allHighlights={allHighlights}
        onLogout={() => store.logout()}
        onBack={() => setScreen('preview')}
        onEditBasic={() => setScreen('editBasic')}
        onEditHighlight={() => setScreen('editHighlight')}
        onEditLife={() => setScreen('editLife')}
        onEditNetwork={() => setScreen('editNetwork')}
        onEditReputation={() => setScreen('editReputation')}
        onEditSNS={() => setScreen('editSNS')}
        onEditContact={() => setScreen('editContact')}
        user={user}
      />
    )
  }

  if (screen === 'editBasic') {
    return <BasicInfoEditScreen user={user} onBack={() => setScreen('manage')} />
  }

  if (screen === 'editLife') {
    return <LifeManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editNetwork') {
    return (
      <RememberNetworkManageScreen
        userLinkId={user.linkId}
        onBack={() => setScreen('manage')}
      />
    )
  }

  if (screen === 'editHighlight') {
    return (
      <HighlightManageScreen
        userLinkId={user.linkId}
        onBack={() => setScreen('manage')}
      />
    )
  }

  if (screen === 'editSNS') {
    return <SNSManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editReputation') {
    return <ReputationManageScreen currentKeywords={user.selectedKeywords ?? SAMPLE_PROFILE.selectedKeywords} onBack={() => setScreen('manage')} />
  }

  if (screen === 'editContact') {
    return <ContactManageScreen onBack={() => setScreen('manage')} />
  }

  return null
}
