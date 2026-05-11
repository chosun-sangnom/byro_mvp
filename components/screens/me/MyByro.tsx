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
  GuestbookManageScreen,
  LifeManageScreen,
  ManageByroScreen,
  ReputationManageScreen,
  SajuManageScreen,
  SNSManageScreen,
  WhoIAmManageScreen,
} from '@/components/screens/me/MyByroSupportScreens'

type Screen =
  | 'preview'
  | 'manage'
  | 'editBasic'
  | 'editWhoIAm'
  | 'editSaju'
  | 'editLife'
  | 'editHighlight'
  | 'editSNS'
  | 'editReputation'
  | 'editContact'
  | 'editGuestbook'

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

  const instagramConnected = store.instagramConnected || SAMPLE_PROFILE.instagramConnected
  const linkedinConnected = store.linkedinConnected || SAMPLE_PROFILE.linkedinConnected
  const allHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const connectedSnsCount = Number(instagramConnected) + Number(linkedinConnected)
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)
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
        connectedSnsCount={connectedSnsCount}
        totalReputationCount={totalReputationCount}
        onLogout={() => store.logout()}
        onBack={() => setScreen('preview')}
        onEditBasic={() => setScreen('editBasic')}
        onEditWhoIAm={() => setScreen('editWhoIAm')}
        onEditSaju={() => setScreen('editSaju')}
        onEditLife={() => setScreen('editLife')}
        onEditHighlight={() => setScreen('editHighlight')}
        onEditSNS={() => setScreen('editSNS')}
        onEditReputation={() => setScreen('editReputation')}
        onEditContact={() => setScreen('editContact')}
        onEditGuestbook={() => setScreen('editGuestbook')}
        user={user}
      />
    )
  }

  if (screen === 'editBasic') {
    return <BasicInfoEditScreen user={user} onBack={() => setScreen('manage')} />
  }

  if (screen === 'editWhoIAm') {
    return <WhoIAmManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editSaju') {
    return <SajuManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editLife') {
    return <LifeManageScreen onBack={() => setScreen('manage')} />
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

  if (screen === 'editGuestbook') {
    return <GuestbookManageScreen onBack={() => setScreen('manage')} />
  }

  return null
}
