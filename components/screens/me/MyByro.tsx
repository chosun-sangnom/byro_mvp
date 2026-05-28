'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'
import { type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PublicProfileLifeTabPage,
  PublicProfileReputationTabPage,
  PublicProfileWhoTabPage,
} from '@/components/screens/profile/PublicProfileTabPages'
import { BasicInfoEditScreen, WhoIAmEditScreen } from '@/components/screens/me/MyByroBasicInfoScreen'
import { HighlightManageScreen } from '@/components/screens/me/MyByroHighlightManageScreen'
import {
  ContactManageScreen,
  LifeManageScreen,
  ManageByroScreen,
  RememberNetworkManageScreen,
  ReputationManageScreen,
  SNSManageScreen,
  VisibilitySettingScreen,
} from '@/components/screens/me/MyByroSupportScreens'

type Screen =
  | 'preview'
  | 'manage'
  | 'editBasic'
  | 'editWhoIAm'
  | 'editHighlight'
  | 'editLife'
  | 'editNetwork'
  | 'editReputation'
  | 'editSNS'
  | 'editContact'
  | 'editVisibility'

// ─────────────────────────────────────────────────────────────────────────────
export default function MyByro() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const store = useByroStore()
  const returnTo = searchParams.get('returnTo')
  const handleBackToManage = () => {
    if (returnTo) {
      router.replace(returnTo)
      return
    }
    setScreen('manage')
  }

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/signup')
  }, [store.isLoggedIn, router])

  const sectionParam = searchParams.get('section')
  const [screen, setScreen] = useState<Screen>(
    sectionParam === 'highlight' ? 'editHighlight' :
    sectionParam === 'life'      ? 'editLife'      :
    sectionParam === 'sns'       ? 'editSNS'       :
    sectionParam === 'contact'   ? 'editContact'   :
    searchParams.get('edit') === 'true' ? 'manage' : 'preview'
  )
  const [activeTab, setActiveTab] = useState<PublicProfileTabId>('who')

  if (!store.isLoggedIn) return null
  const user = store.user!
  const profile = getNormalizedPublicProfile({ username: user.linkId, user, ownerHighlights: store.highlights })

  const allHighlights = store.highlightsInitialized
    ? store.highlights
    : [...profile.manualHighlights, ...store.highlights]
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
        profile={profile}
        instagramConnected={store.instagramConnected}
        linkedinConnected={store.linkedinConnected}
        onLogout={() => store.logout()}
        onBack={() => setScreen('preview')}
        onEditBasic={() => setScreen('editBasic')}
        onEditWhoIAm={() => setScreen('editWhoIAm')}
        onEditHighlight={() => setScreen('editHighlight')}
        onEditLife={() => setScreen('editLife')}
        onEditNetwork={() => setScreen('editNetwork')}
        onEditReputation={() => setScreen('editReputation')}
        onEditSNS={() => setScreen('editSNS')}
        onEditContact={() => setScreen('editContact')}
        user={user}
        tabVisibility={store.tabVisibility ?? { who: 'public', life: 'public', reputation: 'public' }}
        onEditVisibility={() => setScreen('editVisibility')}
        onResetMockData={() => store.resetToMockDefaults()}
      />
    )
  }

  if (screen === 'editBasic') {
    return <BasicInfoEditScreen user={user} onBack={handleBackToManage} />
  }

  if (screen === 'editWhoIAm') {
    return <WhoIAmEditScreen user={user} onBack={handleBackToManage} />
  }

  if (screen === 'editLife') {
    return <LifeManageScreen onBack={handleBackToManage} />
  }

  if (screen === 'editNetwork') {
    return (
      <RememberNetworkManageScreen
        userLinkId={user.linkId}
        onBack={handleBackToManage}
      />
    )
  }

  if (screen === 'editHighlight') {
    return (
      <HighlightManageScreen
        userLinkId={user.linkId}
        onBack={handleBackToManage}
      />
    )
  }

  if (screen === 'editSNS') {
    return <SNSManageScreen onBack={handleBackToManage} />
  }

  if (screen === 'editReputation') {
    return <ReputationManageScreen onBack={handleBackToManage} />
  }

  if (screen === 'editContact') {
    return <ContactManageScreen onBack={handleBackToManage} />
  }

  if (screen === 'editVisibility') {
    return (
      <VisibilitySettingScreen
        tabVisibility={store.tabVisibility ?? { who: 'public', life: 'public', reputation: 'public' }}
        onUpdate={store.updateTabVisibility}
        onBack={() => setScreen('manage')}
      />
    )
  }

  return null
}
