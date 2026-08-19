'use client'

import { useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFeloreStore } from '@/store/useFeloreStore'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'
import { type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PublicProfileLifeTabPage,
  PublicProfileReputationTabPage,
  PublicProfileWhoTabPage,
} from '@/components/screens/profile/PublicProfileTabPages'
import { BasicInfoEditScreen, WhoIAmEditScreen } from '@/components/screens/me/MyFeloreBasicInfoScreen'
import { HighlightManageScreen } from '@/components/screens/me/MyFeloreHighlightManageScreen'
import {
  ContactManageScreen,
  LifeManageScreen,
  ManageFeloreScreen,
  RememberNetworkManageScreen,
  ReputationManageScreen,
  SNSManageScreen,
  VisibilitySettingScreen,
} from '@/components/screens/me/MyFeloreSupportScreens'

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
export default function MyFelore() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const store = useFeloreStore()
  // returnTo는 딥링크로 진입한 "첫 화면"(initialScreenRef)의 뒤로가기에서만 소비됨 —
  // manage 허브를 거쳐 하위 화면으로 더 들어간 경우엔(초기 진입 화면이 아니므로)
  // returnTo를 무시하고 항상 manage 허브로 돌아감. returnTo 자체는 값을 바꾸지
  // 않고 유지하므로, 허브로 돌아온 뒤 허브 자체의 뒤로가기는 여전히 정상 동작함
  const returnTo = searchParams.get('returnTo')
  const handleBackToManage = () => {
    if (returnTo && screen === initialScreenRef.current) {
      router.replace(returnTo)
      return
    }
    setScreen('manage')
  }
  const handleBackFromManage = () => {
    if (returnTo) {
      router.replace(returnTo)
      return
    }
    setScreen('preview')
  }

  const sectionParam = searchParams.get('section')
  const initialScreen: Screen =
    sectionParam === 'highlight'  ? 'editHighlight'  :
    sectionParam === 'vibe'       ? 'editLife'        :
    sectionParam === 'sns'        ? 'editSNS'         :
    sectionParam === 'contact'    ? 'editContact'     :
    sectionParam === 'visibility' ? 'editVisibility'  :
    sectionParam === 'whoiam'     ? 'editWhoIAm'      :
    searchParams.get('edit') === 'true' ? 'manage' : 'preview'
  const initialScreenRef = useRef(initialScreen)
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [activeTab, setActiveTab] = useState<PublicProfileTabId>('who')

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
      >
        {activeTab === 'who' && <PublicProfileWhoTabPage username={user.linkId} />}
        {activeTab === 'vibe' && <PublicProfileLifeTabPage username={user.linkId} />}
        {activeTab === 'network' && <PublicProfileReputationTabPage username={user.linkId} />}
      </PublicProfileShell>
    )
  }

  if (screen === 'manage') {
    return (
      <ManageFeloreScreen
        allHighlights={allHighlights}
        profile={profile}
        instagramConnected={store.instagramConnected}
        linkedinConnected={store.linkedinConnected}
        onBack={handleBackFromManage}
        onEditBasic={() => setScreen('editBasic')}
        onEditWhoIAm={() => setScreen('editWhoIAm')}
        onEditHighlight={() => setScreen('editHighlight')}
        onEditLife={() => setScreen('editLife')}
        onEditNetwork={() => setScreen('editNetwork')}
        onEditReputation={() => setScreen('editReputation')}
        onEditSNS={() => setScreen('editSNS')}
        onEditContact={() => setScreen('editContact')}
        user={user}
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
        onBack={handleBackToManage}
      />
    )
  }

  if (screen === 'editHighlight') {
    return (
      <HighlightManageScreen
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
        tabVisibility={store.tabVisibility ?? { who: 'public', vibe: 'public', network: 'public' }}
        onUpdate={store.updateTabVisibility}
        onBack={handleBackToManage}
      />
    )
  }

  return null
}
