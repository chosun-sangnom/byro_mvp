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
import type { Highlight, KemiData, PublicProfileLife, PublicProfileWhoIAm, ReputationKeyword } from '@/types'
import { AXIS_ORDER, buildSelfKemiAxes, type SelfKemiAxis } from '@/components/screens/profile/kemiReport'
import {
  BODY,
  INK,
  KEMI_ANIM_CSS,
  KemiAxisCard,
  KemiLockedOverlay,
  MUTED,
  PointGroup,
} from '@/components/screens/profile/kemiReportUi'

// TODO(AI): When real kemi endpoint is wired up, this component receives
// viewer-relative match data. The aiCopy field should be replaced with a
// streaming LLM response generated server-side from full profile context.

const cardBorderStyle = {
  border: '1.5px solid transparent',
  backgroundImage: 'linear-gradient(var(--color-bg-page), var(--color-bg-page)), linear-gradient(135deg, #BFDBFE 0%, #3B82F6 55%, #2563EB 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
} as const

export function PublicProfileKemiZone({
  kemi,
  isLoggedIn,
  isLoading,
  onCompatibilityOpen,
  onLoginRequest,
}: {
  kemi?: KemiData
  isLoggedIn: boolean
  isLoading?: boolean
  onCompatibilityOpen?: () => void
  onLoginRequest?: () => void
}) {
  if (!kemi && !isLoading) return null

  if (isLoading) {
    return (
      <div className="px-5 pb-3">
        <div className="rounded-[20px] p-4" style={cardBorderStyle}>
          <div className="mb-3 flex items-center gap-1.5">
            <Sparkles size={13} style={{ color: 'var(--color-accent-dark)' }} className="animate-pulse" />
            <span className="text-[13px] font-bold animate-pulse text-[#0D0D0D]">케미 분석 중...</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[64, 80, 52].map((w) => (
              <span
                key={w}
                className="animate-pulse rounded-full h-7"
                style={{ width: w, backgroundColor: 'var(--color-accent-bg)' }}
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="animate-pulse h-3 rounded-full bg-[var(--color-bg-muted)] w-full" />
            <div className="animate-pulse h-3 rounded-full bg-[var(--color-bg-muted)] w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pb-3 space-y-3">
      {/* 케미(공통점) — 케미 리포트와 별개 카드로 분리 노출 */}
      <div className="rounded-[20px] p-4" style={cardBorderStyle}>
        <div className="mb-3 flex items-center gap-1.5">
          <Sparkles size={13} style={{ color: 'var(--color-accent-dark)' }} />
          <span className="text-[13px] font-bold text-[#0D0D0D]">
            {kemi!.matchCount}가지 케미
          </span>
        </div>

        {isLoggedIn ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {kemi!.matchItems.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full px-3 py-1.5 text-[13px] font-semibold"
                  style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* AI copy — conversation starter */}
            {/* TODO(AI): Stream this from LLM; for now static mock text */}
            <p className="mt-3 text-[13px] leading-[1.65] text-[#475058]">
              {kemi!.aiCopy}
            </p>
          </>
        ) : (
          /* Non-logged-in: blurred nudge */
          <button type="button" onClick={onLoginRequest} className="relative w-full text-left">
            <div
              className="pointer-events-none flex flex-wrap gap-1.5"
              style={{ filter: 'blur(5px)', opacity: 0.5 }}
            >
              {['●●●●', '●●●', '●●●●●'].map((s, i) => (
                <span
                  key={i}
                  className="rounded-full px-3 py-1.5 text-[13px] font-semibold"
                  style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[12px] font-semibold underline underline-offset-2"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                로그인하면 케미가 보여요
              </span>
            </div>
          </button>
        )}
      </div>

      {/* 케미 리포트 CTA — 내 펠로어(WHO 탭)와 동일한 카드 디자인 */}
      {isLoggedIn && (
        <div className="rounded-[20px] p-4" style={cardBorderStyle}>
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kemi-report-icon.svg" alt="" className="size-[40px] shrink-0" />
            <div>
              <span className="text-[15px] font-bold text-[#0D0D0D]">케미 리포트</span>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#475058]">
                두 사람이 나눈 경험과 공통점을 바탕으로 나와의 관계 흐름을 분석해줘요.
              </p>
              <button
                type="button"
                onClick={onCompatibilityOpen}
                className="mt-3 shrink-0 rounded-full bg-[var(--color-accent-dark)] px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                리포트 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PublicProfileOwnerMatchZone({
  whoIAm,
  life,
  title,
  manualHighlights,
  reputationKeywords,
}: {
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  title: string
  manualHighlights: Highlight[]
  reputationKeywords?: ReputationKeyword[]
}) {
  const [reportOpen, setReportOpen] = useState(false)

  if (!whoIAm) return null

  return (
    <>
      <div className="px-5 pb-3">
        <div className="rounded-[20px] p-4" style={cardBorderStyle}>
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kemi-report-icon.svg" alt="" className="size-[40px] shrink-0" />
            <div>
              <span className="text-[15px] font-bold text-[#0D0D0D]">
                케미 리포트
              </span>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#475058]">
                커리어·평판·성격·생활·취향 다섯 항목으로 내가 어떤 사람과 잘 맞는지 읽어줍니다.
              </p>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="mt-3 shrink-0 rounded-full bg-[var(--color-accent-dark)] px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                리포트 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      <OwnerKemiReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        whoIAm={whoIAm}
        life={life}
        title={title}
        manualHighlights={manualHighlights}
        reputationKeywords={reputationKeywords}
      />
    </>
  )
}

function OwnerKemiReportSheet({
  open,
  onClose,
  whoIAm,
  life,
  title,
  manualHighlights,
  reputationKeywords,
}: {
  open: boolean
  onClose: () => void
  whoIAm: PublicProfileWhoIAm
  life?: PublicProfileLife
  title: string
  manualHighlights: Highlight[]
  reputationKeywords?: ReputationKeyword[]
}) {
  const axes = buildSelfKemiAxes({ title, whoIAm, life, manualHighlights, reputationKeywords })

  return (
    <BottomSheet open={open} onClose={onClose}>
      <style>{KEMI_ANIM_CSS}</style>
      <div className="px-4 pb-6" data-kemi-report>
        <div className="mb-5 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kemi/report-badge-icon.svg" alt="" className="size-[18px]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>Kemi Report</span>
          </div>
          <h3 className="text-[23px] font-bold leading-[1.3] tracking-[-0.03em]" style={{ color: INK }}>
            나와 잘 맞는 사람
          </h3>
          <p className="text-[14px] font-medium leading-[1.6]" style={{ color: BODY }}>
            커리어·평판·성격·생활·취향 다섯 항목으로 내가 어떤 사람과 잘 어울리는지 읽어드려요.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {AXIS_ORDER.map((id, idx) => {
            const axis = axes.find((a) => a.id === id) as SelfKemiAxis
            return (
              <div key={id} data-kemi-anim style={{ animation: `kemiFadeUp .4s ease ${idx * 0.06}s both` }}>
                <KemiAxisCard>
                  {/* 타이틀은 잠긴 항목이어도 항상 노출 — 안의 분석 내용만 가린다 */}
                  <div className="mb-2 text-[15.5px] font-bold tracking-[-0.02em]" style={{ color: INK }}>{axis.label}</div>

                  {axis.locked ? (
                    <div className="relative">
                      <div className="select-none" style={{ filter: 'blur(5px)' }} aria-hidden>
                        <p className="mb-3.5 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>
                          내 정보를 채우면 이 항목에서 어떤 사람과 잘 맞는지 통계로 읽어 드려요.
                        </p>
                        <PointGroup
                          tone="good"
                          title="이런 사람과 잘 맞아요"
                          items={['나와 결이 맞는 사람의 특징이 여기 표시돼요', '서로 부족한 면을 채워주는 유형을 짚어 드려요']}
                        />
                      </div>
                      <KemiLockedOverlay missingItems={axis.missingItems} />
                    </div>
                  ) : (
                    <>
                      {axis.lead && (
                        <p className="mb-3.5 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>{axis.lead}</p>
                      )}
                      <div className="flex flex-col gap-3.5">
                        {axis.matchWith.length > 0 && (
                          <PointGroup tone="good" title="이런 사람과 잘 맞아요" items={axis.matchWith} />
                        )}
                        {axis.clashWith.length > 0 && (
                          <PointGroup tone="watch" title="이런 사람과는 조심하세요" items={axis.clashWith} />
                        )}
                      </div>
                    </>
                  )}
                </KemiAxisCard>
              </div>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
