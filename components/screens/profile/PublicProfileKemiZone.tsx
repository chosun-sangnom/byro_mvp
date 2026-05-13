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

import { Sparkles, Users } from 'lucide-react'
import type { KemiData, PublicProfileLife, PublicProfileWhoIAm } from '@/types'

// TODO(AI): When real kemi endpoint is wired up, this component receives
// viewer-relative match data. The aiCopy field should be replaced with a
// streaming LLM response generated server-side from full profile context.

export function PublicProfileKemiZone({
  kemi,
  isLoggedIn,
}: {
  kemi?: KemiData
  isLoggedIn: boolean
}) {
  if (!kemi) return null

  return (
    <div className="px-5 pb-3">
      <div
        className="rounded-[20px] px-4 py-4"
        style={{
          border: '1px solid rgba(75,108,245,0.22)',
          background: 'linear-gradient(135deg, rgba(75,108,245,0.09) 0%, rgba(75,108,245,0.03) 100%)',
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
                      '0 0 0 1px rgba(75,108,245,0.45), 0 0 12px rgba(75,108,245,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
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

            {/* TODO(premium): Unlock full Kemi Report */}
            <button
              type="button"
              className="mt-3 text-[12px] font-semibold"
              style={{ color: 'var(--color-accent-dark)' }}
              onClick={() => {}}
            >
              케미 리포트 전체 보기 →
            </button>
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

function getOwnerMatchSignals(whoIAm?: PublicProfileWhoIAm, life?: PublicProfileLife) {
  if (!whoIAm) return []

  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'

  const tasteHook = life?.tastes.cafes[0]?.label
    ?? life?.tastes.restaurants[0]?.label
    ?? life?.tastes.music[0]?.label
    ?? life?.tastes.movies[0]?.label
    ?? life?.tastes.books[0]?.label
    ?? life?.daily.exercise[0]
    ?? null

  return [
    extrovert ? '대화 템포가 빠른 사람' : '조용하지만 깊은 사람',
    intuitive ? '맥락 대화가 잘 통하는 사람' : '생활 루틴이 잘 맞는 사람',
    thinking ? '기준이 분명한 사람' : '공감 표현이 편한 사람',
    life?.places.neighborhoods[0] ? `${life.places.neighborhoods[0]} 생활권` : null,
    tasteHook ? `${tasteHook} 취향이 겹치는 사람` : null,
  ].filter(Boolean) as string[]
}

export function PublicProfileOwnerMatchZone({
  whoIAm,
  life,
}: {
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  if (!whoIAm) return null

  const signals = getOwnerMatchSignals(whoIAm, life)

  return (
    <div className="px-5 pb-3">
      <div
        className="rounded-[20px] px-4 py-4"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <Users size={12} className="text-[var(--color-text-primary)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            나와 잘 맞는 사람들
          </span>
        </div>

        <p className="text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
          내 MBTI와 라이프스타일 기준으로 대화가 잘 붙을 가능성이 높은 사람의 결을 먼저 읽어봅니다.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {signals.map((signal) => (
            <span key={signal} className="chip-metric">
              {signal}
            </span>
          ))}
        </div>

        <div className="mt-3 text-[12px] font-semibold text-[var(--color-text-tertiary)]">
          실제 추천 프로필 매칭은 다음 단계에서 연결할 예정입니다.
        </div>
      </div>
    </div>
  )
}
