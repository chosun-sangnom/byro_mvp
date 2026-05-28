'use client'

import { Lock, MessageCircle, Sparkles, Star, Users, Handshake } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { KemiData, PublicProfileLife, PublicProfileWhoIAm } from '@/types'
import {
  getLifestyleSignals,
  getMbtiTraits,
  getTasteHook,
} from '@/components/screens/profile/profileAnalysis'

// [임시] MBTI + 라이프 데이터 기반 목업 분석. 실제 구현 시 서버사이드 LLM 호출로 교체
type CompatibilityReport = {
  summary: string
  opener: string
  chemistry: string
  fit: string
  caution: string
}

function buildCompatibilityReport(
  profileName: string,
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
): CompatibilityReport {
  const { extrovert, intuitive, thinking, judging } = getMbtiTraits(whoIAm.mbti)
  const { neighborhood, exercise } = getLifestyleSignals(life)
  const tasteHook = getTasteHook(life)

  const topicStyle = intuitive ? '맥락과 방향을 함께 이야기할 수 있는' : '생활 루틴과 현실 감각이 자연스럽게 맞는'
  const decisionStyle = thinking ? '기준과 판단이 분명한' : '감정 표현과 배려가 자연스러운'
  const paceStyle = extrovert ? '초반부터 대화가 자연스럽게 열리는' : '과한 텐션 없이 천천히 가까워지는'

  return {
    summary: `${profileName}님은 ${topicStyle} 대화를 좋아하고, ${decisionStyle} 상대와 관계가 오래 남는 편이에요.${neighborhood ? ` ${neighborhood}를 중심으로 움직이며` : ''} ${tasteHook ? `${tasteHook} 같은 취향 접점이 하나만 보여도 대화가 잘 이어집니다.` : '공통 취향이 보이면 빠르게 가까워지는 편입니다.'}`,
    opener: neighborhood && tasteHook
      ? `${neighborhood}나 ${tasteHook}처럼 실제 생활 반경과 맞닿아 있는 소재로 먼저 말을 꺼내면 반응이 좋습니다.`
      : extrovert
        ? '공통점 하나를 바로 꺼내서 분위기를 여는 방식이 잘 먹힙니다.'
        : '가벼운 공통점 뒤에 바로 취향이나 가치관 질문으로 넘어가면 반응이 좋습니다.',
    chemistry: `${neighborhood ? `${neighborhood}` : '생활 반경'}과 ${exercise ? `${exercise}` : '일상 리듬'}이 겹치는 사람과 자연스럽게 연결돼요. ${tasteHook ? `${tasteHook} 같은 취향 접점이 다음 만남으로 이어지기 좋습니다.` : '공통으로 즐길 수 있는 활동이나 장소가 보이면 관계가 더 빠르게 가까워져요.'}`,
    fit: `${topicStyle} 사람이 잘 맞아요. ${decisionStyle} 태도를 가진 상대일수록 편하고, ${tasteHook ? `${tasteHook} 같은 취향이 겹치면` : '공통 취향이 하나만 보여도'} 관계가 빨리 붙습니다. ${judging ? '약속과 계획이 분명한 사람과 함께할 때 신뢰가 쌓여요.' : '유연하게 흐름을 타는 사람과 편하게 어울려요.'}`,
    caution: `${paceStyle} 관계가 장기적으로 이어지는 경향이 있어요. ${extrovert ? '반응이 너무 느리거나 리듬이 자주 끊기면 흥미가 빨리 꺼질 수 있어요.' : '처음부터 너무 가까워지려 하면 오히려 거리감이 남을 수 있어요.'} ${thinking ? '감정 신호가 없는 관계보다 솔직하게 표현하는 사람과 더 잘 맞아요.' : '일방적인 논리나 비교 위주의 대화는 피로하게 읽혀요.'}`,
  }
}

function LockedBlockOverlay({ missingTasteCount }: { missingTasteCount: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[22px] backdrop-blur-[2px]">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
      >
        <Lock size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <p className="text-center text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        취향 {missingTasteCount}개 더 채우면 열려요
      </p>
    </div>
  )
}

const BLOCK_META = [
  { index: 1, label: '공통점', Icon: Sparkles },
  { index: 2, label: '대화스타터', Icon: MessageCircle },
  { index: 3, label: '관계흐름', Icon: Users },
  { index: 4, label: '협업결', Icon: Handshake },
  { index: 5, label: '연결가치', Icon: Star },
]

export function PublicProfileCompatibilitySheet({
  open,
  onClose,
  profileName,
  whoIAm,
  life,
  kemi,
}: {
  open: boolean
  onClose: () => void
  profileName: string
  whoIAm: PublicProfileWhoIAm
  life?: PublicProfileLife
  kemi?: KemiData
}) {
  const report = buildCompatibilityReport(profileName, whoIAm, life)
  const lockedBlocks = kemi?.lockedBlocks ?? []
  const completenessPercent = kemi?.completenessPercent ?? 100
  const missingTasteCount = kemi?.missingTasteCount ?? 0
  const matchItems = kemi?.matchItems ?? []

  const blocks = [
    {
      index: 1,
      content: (
        <>
          <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
            {report.summary}
          </p>
          {matchItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {matchItems.map((item) => (
                <span key={item.label} className="chip-metric">{item.label}</span>
              ))}
            </div>
          )}
        </>
      ),
    },
    {
      index: 2,
      content: (
        <p className="text-[14px] font-semibold leading-[1.6]" style={{ color: 'var(--color-text-primary)' }}>
          {report.opener}
        </p>
      ),
    },
    {
      index: 3,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.chemistry}
        </p>
      ),
    },
    {
      index: 4,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.fit}
        </p>
      ),
    },
    {
      index: 5,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.caution}
        </p>
      ),
    },
  ]

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">

        {/* 헤더 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            <Sparkles size={14} />
            <span>Compatibility Report</span>
          </div>
          <h3 className="mt-2 text-[24px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
            케미 리포트
          </h3>
        </div>

        {/* 정확도 프로그레스바 */}
        <div className="mb-5 rounded-[16px] px-4 py-3" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              케미 분석됨
            </span>
            <span className="text-[13px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
              {completenessPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-default)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completenessPercent}%`,
                background: 'linear-gradient(90deg, var(--color-accent-light), var(--color-accent-dark))',
              }}
            />
          </div>
          {lockedBlocks.length > 0 && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              취향 {missingTasteCount}개를 더 채우면 전체 리포트가 열려요
            </p>
          )}
        </div>

        {/* 5개 블록 */}
        <div className="space-y-3">
          {blocks.map(({ index, content }) => {
            const meta = BLOCK_META[index - 1]
            const isLocked = lockedBlocks.includes(index)
            const Icon = meta.Icon

            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-[22px] px-4 py-4"
                style={{ border: '1px solid var(--color-border-default)', background: 'var(--color-bg-surface)' }}
              >
                <div
                  className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <Icon size={12} />
                  <span>{meta.label}</span>
                </div>
                <div style={isLocked ? { filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
                  {content}
                </div>
                {isLocked && <LockedBlockOverlay missingTasteCount={missingTasteCount} />}
              </div>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
