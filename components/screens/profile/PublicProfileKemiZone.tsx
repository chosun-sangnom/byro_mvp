'use client'

/**
 * PublicProfileKemiZone — 케미 공통점 섹션
 *
 * 헤더 메타와 탭바 사이에 위치.
 * - 로그인 상태: viewer 기준 공통점 칩(인디고 glow) + AI 카피 + 케미 리포트 CTA
 * - 비로그인:    blur 처리 + "로그인하면 케미가 보여요" 넛지
 *
 * 데이터 흐름 (현재 mock):
 *   publicProfiles.ts의 kemi 필드 → getNormalizedPublicProfile → profile.kemi
 *   TODO(real API): /profiles/:id/kemi?viewer_id=... 엔드포인트로 교체
 *
 * aiCopy:
 *   TODO(AI): 서버사이드 LLM 호출로 교체 — 매칭 항목 + 전체 프로필 컨텍스트 기반 생성
 *
 * 케미 리포트:
 *   TODO(premium): 유료 기능 — 전체 궁합 분석 화면으로 연결
 */

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { KemiData, PublicProfileLife, PublicProfileWhoIAm } from '@/types'

// TODO(AI): When real kemi endpoint is wired up, this component receives
// viewer-relative match data. The aiCopy field should be replaced with a
// streaming LLM response generated server-side from full profile context.

export function PublicProfileKemiZone({
  kemi,
  isLoggedIn,
  onCompatibilityOpen,
}: {
  kemi?: KemiData
  isLoggedIn: boolean
  onCompatibilityOpen?: () => void
}) {
  if (!kemi) return null

  return (
    <div className="px-5 pb-3">
      <div
        className="rounded-[20px] px-4 py-4"
        style={{
          border: '1px solid var(--color-accent-border-soft)',
          background: 'linear-gradient(135deg, var(--color-accent-bg-subtle) 0%, transparent 100%)',
        }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: 'var(--color-accent-dark)' }} />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            {kemi.matchCount}가지 케미
          </span>
        </div>

        {isLoggedIn ? (
          <>
            {/* Match chips with Kemi Glow */}
            <div className="flex flex-wrap gap-1.5">
              {kemi.matchItems.map((item) => (
                <span
                  key={item.label}
                  className="chip-metric"
                  style={{
                    boxShadow:
                      '0 0 0 1px var(--color-accent-border), 0 0 12px var(--color-accent-bg), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* AI copy — conversation starter */}
            {/* TODO(AI): Stream this from LLM; for now static mock text */}
            <p className="mt-3 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              {kemi.aiCopy}
            </p>

            <div className="mt-5 border-t border-[var(--color-accent-border-soft)] pt-4">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles size={11} style={{ color: 'var(--color-accent-dark)' }} />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-accent-dark)' }}
                >
                  케미 리포트
                </span>
              </div>
              <p className="mb-3 text-[12px] leading-[1.65] text-[var(--color-text-secondary)]">
                MBTI · 사주 · 라이프스타일을 조합해 이성 · 비즈니스 · 친구 관점에서 두 사람의 관계 흐름을 깊이 있게 해석해요.
              </p>
              <button
                type="button"
                onClick={onCompatibilityOpen}
                className="w-full rounded-full py-3 text-[13px] font-semibold text-white transition-opacity active:opacity-80"
                style={{
                  backgroundColor: 'var(--color-accent-dark)',
                  boxShadow: '0 0 0 1px var(--color-accent-border), 0 0 20px var(--color-accent-bg)',
                }}
              >
                케미 리포트 보기
              </button>
            </div>
          </>
        ) : (
          /* Non-logged-in: blurred nudge */
          <div className="relative">
            <div
              className="pointer-events-none flex flex-wrap gap-1.5"
              style={{ filter: 'blur(5px)', opacity: 0.5 }}
            >
              {['●●●●', '●●●', '●●●●●'].map((s, i) => (
                <span key={i} className="chip-metric">{s}</span>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[12px] font-semibold"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                로그인하면 케미가 보여요
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type OwnerKemiSection = {
  title: string
  body: string
}

type OwnerCompatibilitySummary = {
  title: string
  summary: string
  lifestyleChips: string[]
  fit: OwnerKemiSection
  chemistry: OwnerKemiSection
  caution: OwnerKemiSection
}

function getLifestyleSignals(life?: PublicProfileLife) {
  return {
    activity: life?.daily.exercise[0]?.label ?? life?.tastes.teams?.[0]?.label ?? null,
    culture: life?.tastes.movies[0]?.label ?? life?.tastes.music[0]?.label ?? life?.tastes.books[0]?.label ?? null,
    place: life?.tastes.cafes[0]?.label ?? life?.tastes.restaurants[0]?.label ?? life?.places.travelDestinations[0]?.label ?? null,
  }
}

function buildOwnerCompatibilitySummary(
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
): OwnerCompatibilitySummary {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'
  const lifestyle = getLifestyleSignals(life)

  const lifestyleChips = [lifestyle.activity, lifestyle.culture, lifestyle.place].filter(Boolean) as string[]

  const topicStyle = intuitive ? '맥락과 방향을 오래 이야기할 수 있는' : '생활 루틴과 현실 감각이 자연스럽게 맞는'
  const decisionStyle = thinking ? '기준과 판단이 분명한' : '감정 표현과 배려가 자연스러운'
  const paceStyle = extrovert ? '초반부터 대화가 자연스럽게 열리는' : '과한 텐션 없이 천천히 가까워지는'

  return {
    title: `${paceStyle} 사람과 가장 편하게 연결돼요`,
    summary: `${topicStyle} 사람과 이야기가 잘 맞고, ${decisionStyle} 사람과 함께할 때 관계가 오래 남습니다.`,
    lifestyleChips,
    fit: {
      title: '잘 맞는 유형',
      body: `${topicStyle} 사람이 잘 맞아요. ${decisionStyle} 태도를 가진 상대일수록 편하고, ${lifestyle.culture ? `${lifestyle.culture} 같은 취향이 겹치면` : '공통 취향이 하나만 보여도'} 관계가 빨리 붙습니다. ${judging ? '약속과 계획이 분명한 사람과 함께할 때 신뢰가 쌓여요.' : '유연하게 흐름을 타는 사람과 편하게 어울려요.'}`,
    },
    chemistry: {
      title: '관계가 잘 붙는 포인트',
      body: `${lifestyle.place ? `${lifestyle.place}` : '생활 반경'}과 ${lifestyle.activity ? `${lifestyle.activity}` : '일상 리듬'}이 겹치는 사람과 자연스럽게 연결돼요. ${lifestyle.culture ? `${lifestyle.culture} 같은 취향 접점이 다음 만남으로 이어지기 좋습니다.` : '공통으로 즐길 수 있는 활동이나 장소가 보이면 관계가 더 빠르게 가까워져요.'}`,
    },
    caution: {
      title: '주의할 결',
      body: `${extrovert ? '반응이 너무 느리거나 리듬이 자주 끊기면 흥미가 빨리 꺼질 수 있어요.' : '처음부터 너무 가까워지려 하면 오히려 거리감이 남을 수 있어요.'} ${thinking ? '감정 신호가 없는 관계보다 솔직하게 표현하는 사람과 더 잘 맞아요.' : '일방적인 논리나 비교 위주의 대화는 피로하게 읽혀요.'}`,
    },
  }
}

export function PublicProfileOwnerMatchZone({
  whoIAm,
  life,
}: {
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  const [reportOpen, setReportOpen] = useState(false)

  if (!whoIAm) return null

  return (
    <>
      <div className="px-5 pb-3">
        <div
          className="rounded-[20px] px-4 py-4"
          style={{
            border: '1px solid var(--color-accent-border-soft)',
            background: 'linear-gradient(135deg, var(--color-accent-bg-subtle) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} style={{ color: 'var(--color-accent-dark)' }} />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-accent-dark)' }}
                >
                  내 케미 리포트
                </span>
              </div>
              <div className="mt-1 text-[15px] font-semibold text-[var(--color-text-primary)]">
                나와 잘 맞는 사람의 결
              </div>
              <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
                라이프스타일을 바탕으로 어떤 유형의 사람과 잘 맞는지 읽어줍니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="shrink-0 rounded-full bg-[var(--color-accent-dark)] px-3 py-2 text-[12px] font-semibold text-white"
            >
              리포트 보기
            </button>
          </div>
        </div>
      </div>

      <OwnerKemiReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        whoIAm={whoIAm}
        life={life}
      />
    </>
  )
}

function OwnerKemiReportSheet({
  open,
  onClose,
  whoIAm,
  life,
}: {
  open: boolean
  onClose: () => void
  whoIAm: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  const report = buildOwnerCompatibilitySummary(whoIAm, life)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            <Sparkles size={14} />
            <span>My Kemi Report</span>
          </div>
          <h3 className="mt-3 text-[24px] font-black leading-[1.2] text-[var(--color-text-primary)]">
            나와 잘 맞는 사람의 결
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            라이프스타일을 바탕으로 어떤 유형과 잘 연결되는지 읽어드려요.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] p-4">
          <h4 className="text-[18px] font-bold leading-[1.35] text-[var(--color-text-primary)]">
            {report.title}
          </h4>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            {report.summary}
          </p>
          {report.lifestyleChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.lifestyleChips.map((chip) => (
                <span key={chip} className="chip-metric">{chip}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {[report.fit, report.chemistry, report.caution].map((section) => (
            <div
              key={section.title}
              className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                {section.title}
              </div>
              <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
