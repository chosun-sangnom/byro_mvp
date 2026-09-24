'use client'

import { useEffect, useState } from 'react'
import { buildHighlightSections } from '@/lib/highlightMeta'
import { flattenVibe } from '@/lib/vibeItems'
import { generatePersona } from '@/lib/personaGen'
import { JIMIN_PROFILE } from '@/lib/mocks/publicProfiles'
import { ProfileRememberSection } from '@/components/screens/profile/PublicProfileSections'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
import { ProfileSnsSection } from '@/components/screens/profile/PublicProfileSnsSection'
import { Collage, LAYOUTS, pickCollageEntries } from '@/components/screens/profile/PublicProfileLifeSection'
import { ProfileHeroCard } from '@/components/screens/profile/PublicProfileHeroSection'
import { PublicProfileWhoIAmSection } from '@/components/screens/profile/PublicProfileWhoIAmSection'
import type { PublicProfile } from '@/types'

// SCRUM-148: 이지민(/jiminlee) 실제 목업 데이터로 실제 프로필 컴포넌트를 그대로 렌더하는 미리보기.
// 온보딩 완료 가이드와 프로필 기능 소개 투어(SCRUM-180)가 함께 쓴다.

// 타이핑 애니메이션 — 기본정보 슬라이드에서 예시 문구가 한 글자씩 써지는 느낌
function useTypewriter(text: string, { speed = 28, startDelay = 0 }: { speed?: number; startDelay?: number } = {}) {
  const [output, setOutput] = useState('')
  useEffect(() => {
    let i = 0
    let interval: ReturnType<typeof setInterval> | null = null
    setOutput('')
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setOutput(text.slice(0, i))
        if (i >= text.length && interval) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, startDelay])
  return output
}

// ─── Mini preview components (Figma "온보딩 가이드" 목업 기준) ──────────────────

// 기본정보 — 실제 PublicProfileWhoIAmSection 재사용(이지민 자기소개·성향). 자기소개 →
// 성향 순서로 한 글자씩 써지는 타이핑 애니메이션. 실제 컴포넌트가 렌더링할 문자열을
// 타이핑 진행률만큼 잘라 넘기는 방식이라 UI 자체는 100% 실제 컴포넌트 그대로다.
const TYPE_SPEED = 11 // 기존 22ms/글자 대비 2배 빠르게

export function PreviewBasicInfo() {
  const bioSource = JIMIN_PROFILE.bio
  const personalitySource = JIMIN_PROFILE.whoIAm.personality
  // 자기소개·성향이 동시에 올라와서 나란히 채워지도록 같은 시점에 시작
  const bio = useTypewriter(bioSource, { startDelay: 200, speed: TYPE_SPEED })
  const personality = useTypewriter(personalitySource, { startDelay: 200, speed: TYPE_SPEED })
  return <PublicProfileWhoIAmSection bio={bio} whoIAm={{ mbti: JIMIN_PROFILE.whoIAm.mbti, personality }} />
}

// 하이라이트 — 실제 ProfileHighlightsSection 재사용(이지민 경력·학력) + 잠시 후 토글이 저절로 펼쳐지는 데모
export function PreviewHighlight() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
  useEffect(() => {
    const t = setTimeout(() => setOpenKeys(new Set(['group_career-role_jiminlee'])), 900)
    return () => clearTimeout(t)
  }, [])
  const highlightSections = buildHighlightSections(JIMIN_PROFILE.manualHighlights)
  return (
    <ProfileHighlightsSection
      highlightSections={highlightSections}
      username="jiminlee"
      primaryHighlightOverrides={{}}
      getHighlightOpen={(key) => openKeys.has(key)}
      onToggleHighlight={() => {}}
      revealOnMount
    />
  )
}

// 바이브 — 콘텐츠 그리드 전체가 아니라 무드보드(콜라주)만, 카드가 하나씩 올라오는 스태거 애니메이션
export function PreviewLife() {
  const [collage] = useState(() => {
    const entries = flattenVibe(JIMIN_PROFILE.life)
    return {
      entries: pickCollageEntries(entries),
      layout: LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)],
    }
  })
  return <Collage entries={collage.entries} layout={collage.layout} onOpen={() => {}} animated />
}

// SNS — 실제 ProfileSnsSection 재사용, 인스타그램+링크드인 둘 다 노출(링크드인은 데모용 임의 값)
export function PreviewSNS() {
  return (
    <ProfileSnsSection
      instagramConnected
      linkedinConnected
      instagram={{ username: JIMIN_PROFILE.instagram.username, profileUrl: JIMIN_PROFILE.instagram.profileUrl }}
      linkedin={{ profileUrl: 'https://www.linkedin.com/in/jiminlee' }}
      revealOnMount
      hideArrowIcon
    />
  )
}

// 네트워크 — 실제 ProfileRememberSection 재사용 (이지민 리멤버 네트워크 통계).
// 공유 컴포넌트 자체 여백(pt-6)은 그대로 두고, 가이드 슬라이드에서만 상단 여백을 보정.
export function PreviewNetwork() {
  const r = JIMIN_PROFILE.rememberHighlight
  return (
    <div className="-mt-4">
      <ProfileRememberSection
        total={r.total}
        industries={r.industries}
        isLoggedIn={false}
        isOwner={false}
        mutualCompanies={r.mutualCompanies}
        topCompany={r.topCompany}
        topIndustry={r.topIndustry}
        topRole={r.topRole}
        hidePersonalizedNudge
        revealOnMount
      />
    </div>
  )
}

// 페르소나 — 실제 ProfileHeroCard 재사용(이지민 사진·이름·페르소나 문장)
export function PreviewPersona() {
  const persona = generatePersona(JIMIN_PROFILE as unknown as PublicProfile)
  return (
    <ProfileHeroCard
      profile={{ ...JIMIN_PROFILE, mbti: JIMIN_PROFILE.whoIAm.mbti }}
      heroTheme={JIMIN_PROFILE.heroTheme}
      activeImage={JIMIN_PROFILE.profileImages[0]}
      personaText={persona.text}
      personaReasons={persona.reasons}
    />
  )
}
