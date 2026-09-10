'use client'

import { Sparkles } from 'lucide-react'
import type { PublicProfileWhoIAm } from '@/types'
import { SectionTitle } from '@/components/screens/profile/PublicProfileSections'
import { ProfileEmptyAddBlock } from '@/components/screens/profile/ProfileEmptyAddBlock'

function AiBadge() {
  return (
    <span
      className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
      style={{ backgroundImage: 'linear-gradient(110deg, #0088FF 0%, #34C759 100%)' }}
    >
      <Sparkles size={10} />AI
    </span>
  )
}

function BioBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
      <div className="text-[12px] font-semibold text-[#6C7786]">자기 소개</div>
      <p className="mt-1 text-[14px] leading-[1.5] text-[#25313D]">{text}</p>
    </div>
  )
}

function PersonalityBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold text-[#6C7786]">성향</div>
        <AiBadge />
      </div>
      <p className="mt-1 text-[14px] leading-[1.5] text-[#25313D]">{text}</p>
    </div>
  )
}

export function PublicProfileWhoIAmSection({
  whoIAm,
  bio,
  isOwner,
  onAdd,
}: {
  whoIAm?: PublicProfileWhoIAm
  bio?: string
  isOwner?: boolean
  onAdd?: () => void
}) {
  const isEmpty = !bio && !whoIAm?.personality && !whoIAm?.mbti

  // 방문자에게는 빈 섹션을 숨긴다. 오너에게만 추가 진입점을 노출.
  if (isEmpty && !(isOwner && onAdd)) return null

  return (
    <div className="px-5 pt-6 pb-2">
      <SectionTitle
        title="나"
        subtitle="MBTI와 생활감 있는 정보로 프로필의 기본 결을 정리합니다."
      />
      {isEmpty ? (
        <ProfileEmptyAddBlock label="아직 성향 정보가 없어요" onAdd={onAdd!} />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {bio && <BioBlock text={bio} />}
          {whoIAm?.personality && <PersonalityBlock text={whoIAm.personality} />}
        </div>
      )}
    </div>
  )
}
