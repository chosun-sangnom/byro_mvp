'use client'

import {
  MessageCircle,
  Sparkles,
  Star,
} from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'

type CompatibilitySection = {
  title: string
  body: string
}

type CompatibilityReport = {
  title: string
  summary: string
  signalChips: string[]
  fit: CompatibilitySection
  chemistry: CompatibilitySection
  caution: CompatibilitySection
  opener: string
}

function getSignalChips(whoIAm: PublicProfileWhoIAm, life?: PublicProfileLife) {
  return [
    life?.places.neighborhoods[0],
    life?.daily.exercise[0]?.label,
    life?.tastes.music[0]?.label,
    life?.tastes.cafes[0]?.label,
    life?.tastes.movies[0]?.label,
  ].filter(Boolean) as string[]
}

function getTasteHook(life?: PublicProfileLife) {
  return (
    life?.tastes.cafes[0]?.label
    ?? life?.tastes.restaurants[0]?.label
    ?? life?.tastes.music[0]?.label
    ?? life?.tastes.movies[0]?.label
    ?? life?.tastes.books[0]?.label
    ?? life?.daily.exercise[0]?.label
    ?? null
  )
}

function buildCompatibilityReport(
  profileName: string,
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
): CompatibilityReport {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'
  const signalChips = getSignalChips(whoIAm, life)
  const neighborhood = life?.places.neighborhoods[0]
  const exercise = life?.daily.exercise[0]?.label
  const tasteHook = getTasteHook(life)

  const topicStyle = intuitive ? '맥락과 방향을 함께 이야기할 수 있는' : '생활 루틴과 현실 감각이 자연스럽게 맞는'
  const decisionStyle = thinking ? '기준과 판단이 분명한' : '감정 표현과 배려가 자연스러운'
  const paceStyle = extrovert ? '초반부터 대화가 자연스럽게 열리는' : '과한 텐션 없이 천천히 가까워지는'

  return {
    title: `${paceStyle} 사람과 잘 연결되는 스타일이에요`,
    summary: `${profileName}님은 ${topicStyle} 대화를 좋아하고, ${decisionStyle} 상대와 관계가 오래 남는 편이에요.${neighborhood ? ` ${neighborhood}를 중심으로 움직이며` : ''} ${tasteHook ? `${tasteHook} 같은 취향 접점이 하나만 보여도 대화가 잘 이어집니다.` : '공통 취향이 보이면 빠르게 가까워지는 편입니다.'}`,
    signalChips,
    fit: {
      title: '잘 맞는 포인트',
      body: `${topicStyle} 사람이 잘 맞아요. ${decisionStyle} 태도를 가진 상대일수록 편하고, ${tasteHook ? `${tasteHook} 같은 취향이 겹치면` : '공통 취향이 하나만 보여도'} 관계가 빨리 붙습니다. ${judging ? '약속과 계획이 분명한 사람과 함께할 때 신뢰가 쌓여요.' : '유연하게 흐름을 타는 사람과 편하게 어울려요.'}`,
    },
    chemistry: {
      title: '관계가 잘 붙는 포인트',
      body: `${neighborhood ? `${neighborhood}` : '생활 반경'}과 ${exercise ? `${exercise}` : '일상 리듬'}이 겹치는 사람과 자연스럽게 연결돼요. ${tasteHook ? `${tasteHook} 같은 취향 접점이 다음 만남으로 이어지기 좋습니다.` : '공통으로 즐길 수 있는 활동이나 장소가 보이면 관계가 더 빠르게 가까워져요.'}`,
    },
    caution: {
      title: '주의할 결',
      body: `${extrovert ? '반응이 너무 느리거나 리듬이 자주 끊기면 흥미가 빨리 꺼질 수 있어요.' : '처음부터 너무 가까워지려 하면 오히려 거리감이 남을 수 있어요.'} ${thinking ? '감정 신호가 없는 관계보다 솔직하게 표현하는 사람과 더 잘 맞아요.' : '일방적인 논리나 비교 위주의 대화는 피로하게 읽혀요.'}`,
    },
    opener: neighborhood && tasteHook
      ? `${neighborhood}나 ${tasteHook}처럼 실제 생활 반경과 맞닿아 있는 소재로 먼저 말을 꺼내면 반응이 좋습니다.`
      : extrovert
        ? '공통점 하나를 바로 꺼내서 분위기를 여는 방식이 잘 먹힙니다.'
        : '가벼운 공통점 뒤에 바로 취향이나 가치관 질문으로 넘어가면 반응이 좋습니다.',
  }
}

export function PublicProfileCompatibilitySheet({
  open,
  onClose,
  profileName,
  whoIAm,
  life,
}: {
  open: boolean
  onClose: () => void
  profileName: string
  whoIAm: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  const report = buildCompatibilityReport(profileName, whoIAm, life)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            <Sparkles size={14} />
            <span>Compatibility Report</span>
          </div>
          <h3 className="mt-3 text-[24px] font-black leading-[1.2] text-[var(--color-text-primary)]">
            케미 리포트
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            {profileName}님의 MBTI와 라이프스타일을 바탕으로 어떤 관계 흐름이 만들어지는지 읽어드려요.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] p-4">
          <h4 className="text-[18px] font-bold leading-[1.35] text-[var(--color-text-primary)]">
            {report.title}
          </h4>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            {report.summary}
          </p>
          {report.signalChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.signalChips.map((chip) => (
                <span key={chip} className="chip-metric">{chip}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {[report.fit, report.chemistry, report.caution].map((section) => (
            <div
              key={section.title}
              className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                <MessageCircle size={12} />
                <span>{section.title}</span>
              </div>
              <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
                {section.body}
              </p>
            </div>
          ))}

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              <Star size={12} />
              <span>추천 첫 마디</span>
            </div>
            <p className="mt-2 text-[14px] font-semibold leading-[1.6] text-[var(--color-text-primary)]">
              {report.opener}
            </p>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
