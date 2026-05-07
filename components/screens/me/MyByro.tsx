'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import PublicProfile from '@/components/screens/profile/PublicProfile'
import { BasicInfoEditScreen } from '@/components/screens/me/MyByroBasicInfoScreen'
import { HighlightManageScreen } from '@/components/screens/me/MyByroHighlightManageScreen'
import {
  ContactManageScreen,
  GuestbookManageScreen,
  ManageByroScreen,
  ReputationManageScreen,
  SNSManageScreen,
} from '@/components/screens/me/MyByroSupportScreens'

type Screen = 'preview' | 'manage' | 'editBasic' | 'editHighlight' | 'editSNS' | 'editReputation' | 'editContact' | 'editGuestbook'

// ─────────────────────────────────────────────────────────────────────────────
export default function MyByro() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/onboarding')
  }, [store.isLoggedIn, router])

  const [screen, setScreen] = useState<Screen>('preview')

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
      <PublicProfile
        username={user.linkId}
        mode="owner"
        onOpenArchive={() => router.push('/archive')}
        onOpenManage={() => setScreen('manage')}
      />
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
