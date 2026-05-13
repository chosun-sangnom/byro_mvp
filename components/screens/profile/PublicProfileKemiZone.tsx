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
import { BriefcaseBusiness, Heart, Sparkles, Users } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
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

type OwnerKemiMode = 'romance' | 'business' | 'friend'

type OwnerKemiSection = {
  title: string
  body: string
}

type OwnerKemiReport = {
  badge: string
  title: string
  summary: string
  signalChips: string[]
  fit: OwnerKemiSection
  chemistry: OwnerKemiSection
  caution: OwnerKemiSection
  oneLine: string
}

const OWNER_KEMI_MODES: Array<{
  id: OwnerKemiMode
  label: string
  icon: JSX.Element
}> = [
  { id: 'romance', label: '이성', icon: <Heart size={14} /> },
  { id: 'business', label: '비즈니스', icon: <BriefcaseBusiness size={14} /> },
  { id: 'friend', label: '친구', icon: <Users size={14} /> },
]

const OWNER_SAJU_PROFILES: Record<string, {
  alias: string
  summary: string
  romance: string
  business: string
  friend: string
}> = {
  경금: {
    alias: '기준이 분명한 금의 결',
    summary: '판단이 빠르고 태도의 일관성을 중요하게 읽는 흐름이 강합니다.',
    romance: '신뢰 신호가 분명하고 태도가 안정적인 사람에게 마음이 열리는 편입니다.',
    business: '역할과 책임이 명확한 파트너십에서 속도가 붙는 편입니다.',
    friend: '말보다 행동과 약속 이행으로 관계를 쌓는 흐름이 강합니다.',
  },
  임수: {
    alias: '흐름을 읽는 물의 결',
    summary: '사람과 상황의 맥락을 넓게 읽고 연결을 만드는 감각이 좋습니다.',
    romance: '감정선이 자연스럽게 오가고 대화 흐름이 부드러운 사람과 케미가 커집니다.',
    business: '변수 대응과 네트워킹이 필요한 협업에서 시너지가 커지는 편입니다.',
    friend: '상대 텐션을 읽어 관계 온도를 맞추는 데 강한 흐름입니다.',
  },
  정화: {
    alias: '온도를 만드는 불의 결',
    summary: '분위기와 감정의 온도를 올리며 관계 초반에 존재감을 만드는 타입입니다.',
    romance: '호감 신호와 감정 교류가 분명할수록 빠르게 가까워지는 편입니다.',
    business: '브랜딩, 설득, 대외 커뮤니케이션이 필요한 자리에서 강점을 냅니다.',
    friend: '사람을 편하게 만들고 자리를 환하게 여는 친구형 케미가 강합니다.',
  },
}

function getOwnerSajuProfile(sajuType: string) {
  return OWNER_SAJU_PROFILES[sajuType] ?? {
    alias: `${sajuType}의 결`,
    summary: '관계의 온도와 역할감을 함께 읽는 타입으로 해석됩니다.',
    romance: '감정 템포와 신뢰 신호가 함께 맞는 사람과 케미가 커지는 편입니다.',
    business: '역할과 기대치가 분명한 협업에서 강점이 드러나는 흐름입니다.',
    friend: '공통 취향과 생활 접점을 통해 가까워지는 친구형 흐름입니다.',
  }
}

function getOwnerLifestyleSignals(life?: PublicProfileLife) {
  return {
    activity:
      life?.daily.exercise[0]?.label
      ?? life?.tastes.teams?.[0]?.label
      ?? life?.tastes.sports[0]
      ?? null,
    culture:
      life?.tastes.movies[0]?.label
      ?? life?.tastes.music[0]?.label
      ?? life?.tastes.books[0]?.label
      ?? life?.tastes.plays?.[0]?.label
      ?? null,
    place:
      life?.tastes.cafes[0]?.label
      ?? life?.tastes.restaurants[0]?.label
      ?? life?.places.neighborhoods[0]
      ?? life?.places.travelDestinations[0]?.label
      ?? null,
  }
}

function getOwnerSignalChips(whoIAm: PublicProfileWhoIAm, life?: PublicProfileLife) {
  const signals = getOwnerLifestyleSignals(life)

  return [
    whoIAm.mbti,
    whoIAm.sajuType,
    signals.activity,
    signals.culture,
    signals.place,
  ].filter(Boolean) as string[]
}

function buildOwnerKemiReport(
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
  mode: OwnerKemiMode,
): OwnerKemiReport {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'
  const saju = getOwnerSajuProfile(whoIAm.sajuType)
  const styleLead = whoIAm.aiStyleSummary[0] ?? '첫인상'
  const lifestyle = getOwnerLifestyleSignals(life)
  const signalChips = getOwnerSignalChips(whoIAm, life)
  const topicStyle = intuitive ? '맥락과 방향을 오래 이야기할 수 있는' : '생활 루틴과 현실 감각이 자연스럽게 맞는'
  const decisionStyle = thinking ? '기준과 판단이 분명한' : '감정 표현과 배려가 자연스러운'
  const paceStyle = extrovert ? '초반 대화의 템포가 빠른' : '과한 텐션 없이 천천히 가까워지는'
  const structureStyle = judging ? '약속과 계획이 분명한' : '유연하게 흐름을 타는'

  if (mode === 'romance') {
    return {
      badge: '이성 케미',
      title: '생활 접점과 대화 결이 함께 맞는 사람에게 끌리는 편입니다',
      summary: `${styleLead} 인상이 분명한 편이고, ${saju.alias} 흐름도 있어 호감은 자극보다 안정감과 생활 접점에서 커지는 편입니다.`,
      signalChips,
      fit: {
        title: '잘 맞는 유형',
        body: `${paceStyle} 사람보다 ${topicStyle} 사람이 더 오래 남습니다. ${decisionStyle} 태도를 가진 상대일수록 마음이 편하고, ${lifestyle.culture ? `${lifestyle.culture} 같은 취향이 겹치면` : '공통 취향이 하나만 보여도'} 감정선이 빨리 열립니다.`,
      },
      chemistry: {
        title: '관계가 잘 붙는 포인트',
        body: `${lifestyle.place ? `${lifestyle.place}` : '생활 반경'}과 ${lifestyle.activity ? `${lifestyle.activity}` : '일상 리듬'}이 보이는 사람이 잘 맞습니다. ${saju.romance}`,
      },
      caution: {
        title: '주의할 결',
        body: `${extrovert ? '반응이 너무 느리거나 리듬이 자주 끊기면 흥미가 빨리 꺼질 수 있습니다.' : '가벼운 스몰토크만 길어지면 관계가 얕게 남을 수 있습니다.'} ${thinking ? '논리만 앞세우는 상대보다 감정 신호를 분명히 주는 사람이 더 잘 맞습니다.' : '애매한 밀당처럼 느껴지는 태도는 피로하게 읽힐 수 있습니다.'}`,
      },
      oneLine: '호감은 분위기보다 신뢰와 일상 접점에서 커지는 타입입니다.',
    }
  }

  if (mode === 'business') {
    return {
      badge: '비즈니스 케미',
      title: '역할이 선명하고 실행 속도가 맞는 파트너와 시너지가 큽니다',
      summary: `${mbti}가 만드는 협업 호흡과 ${saju.alias}을 같이 보면, 사람과 실행을 함께 읽는 편이라 기대치가 분명한 파트너십에서 힘이 붙습니다.`,
      signalChips,
      fit: {
        title: '잘 맞는 유형',
        body: `${decisionStyle} 파트너, 그리고 ${structureStyle} 파트너가 잘 맞습니다. ${intuitive ? '큰 그림을 함께 그리되' : '현실적인 실행 감각을 공유하며'} ${lifestyle.activity ? `${lifestyle.activity}처럼 반복 루틴을 같이 관리할 수 있는` : '일정과 역할을 함께 관리할 수 있는'} 사람이 시너지를 냅니다.`,
      },
      chemistry: {
        title: '관계가 잘 붙는 포인트',
        body: `${lifestyle.place ? `${lifestyle.place} 같은 생활권에서 자주 부딪히거나` : '실제로 자주 만날 수 있거나'} ${lifestyle.culture ? `${lifestyle.culture} 같은 공통 소재로 라포를 만든 뒤` : '공통 소재로 라포를 만든 뒤'} 역할을 명확히 나누면 전환이 빠릅니다. ${saju.business}`,
      },
      caution: {
        title: '주의할 결',
        body: `${judging ? '우선순위와 마감이 흐리면 빠르게 피로해질 수 있습니다.' : '계획 없이 가능성만 늘어놓는 협업은 집중이 분산될 수 있습니다.'} ${thinking ? '감정적 설득보다 근거와 맥락이 있는 제안이 신뢰를 만듭니다.' : '숫자만 앞세우고 관계 맥락을 무시하면 합이 깨질 수 있습니다.'}`,
      },
      oneLine: '비슷한 기준 위에서 역할을 나눌 수 있는 사람과 합이 좋습니다.',
    }
  }

  return {
    badge: '친구 케미',
    title: '공통 취향과 실제 생활 반경이 보일 때 금방 편해지는 편입니다',
    summary: `${mbti}의 친구형 리듬과 ${saju.alias}을 함께 보면, 억지 텐션보다 공통 취향과 생활 접점이 있을 때 관계가 더 자연스럽게 깊어집니다.`,
    signalChips,
    fit: {
      title: '잘 맞는 유형',
      body: `${extrovert ? '가볍게 말을 트되 깊이도 있는' : '처음은 조용해도 결이 맞으면 오래 가는'} 사람이 잘 맞습니다. ${lifestyle.culture ? `${lifestyle.culture} 같은 문화 취향` : '공통 취향'}이나 ${lifestyle.activity ? `${lifestyle.activity}` : '같이 할 수 있는 활동'}이 보이면 관계가 빨리 붙습니다.`,
    },
    chemistry: {
      title: '관계가 잘 붙는 포인트',
      body: `${lifestyle.place ? `${lifestyle.place}` : '동네'}처럼 바로 함께 갈 수 있는 접점이 중요합니다. ${saju.friend} ${lifestyle.culture ? `${lifestyle.culture} 같은 소재가 다음 약속 얘기로 이어지기 좋습니다.` : '같이 갈 곳이나 같이 볼 콘텐츠가 보이면 다음 약속으로 이어지기 좋습니다.'}`,
    },
    caution: {
      title: '주의할 결',
      body: `${extrovert ? '표면적인 친화력만 높고 후속 약속이 없는 관계는 금방 식을 수 있습니다.' : '서로의 텐션을 읽을 시간 없이 너무 빨리 가까워지려 하면 오히려 거리감이 남을 수 있습니다.'} ${intuitive ? '흥미로운 이야기만 많고 실제 만남이 안 이어지면 연결감이 약해질 수 있습니다.' : '공통점이 있어도 너무 실무적으로만 접근하면 거리감이 남을 수 있습니다.'}`,
    },
    oneLine: '같이 움직일 수 있는 취향과 생활 반경이 친구 케미를 크게 만듭니다.',
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
            border: '1px solid rgba(75,108,245,0.18)',
            background: 'linear-gradient(135deg, rgba(75,108,245,0.09) 0%, rgba(255,255,255,0.03) 100%)',
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
                이성 · 비즈니스 · 친구 관점으로 보는 내 관계 결
              </div>
              <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
                사주, MBTI, 라이프스타일을 조합해 어떤 유형의 사람과 잘 맞는지 읽어줍니다.
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
  const [activeMode, setActiveMode] = useState<OwnerKemiMode>('romance')
  const report = buildOwnerKemiReport(whoIAm, life, activeMode)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            <Sparkles size={14} />
            <span>My Kemi Report</span>
          </div>
          <h3 className="mt-3 text-[24px] font-black leading-[1.2] text-[var(--color-text-primary)]">
            나는 어떤 유형과 잘 맞을까
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            사주, MBTI, 라이프스타일을 기준으로 이성, 비즈니스, 친구 관점의 잘 맞는 결을 해석합니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-1.5">
          {OWNER_KEMI_MODES.map((mode) => {
            const active = mode.id === activeMode

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className="flex items-center justify-center gap-1.5 rounded-[18px] px-3 py-3 text-[12px] font-semibold transition"
                style={{
                  backgroundColor: active ? 'rgba(75,108,245,0.16)' : 'transparent',
                  color: active ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                }}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-[24px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                color: 'var(--color-accent-dark)',
                background: 'rgba(75,108,245,0.12)',
              }}
            >
              {report.badge}
            </span>
            <span className="text-right text-[11px] text-[var(--color-text-tertiary)]">
              {report.oneLine}
            </span>
          </div>

          <h4 className="mt-3 text-[18px] font-bold leading-[1.35] text-[var(--color-text-primary)]">
            {report.title}
          </h4>
          <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-text-secondary)]">
            {report.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.signalChips.map((chip) => (
              <span key={chip} className="chip-metric">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {[report.fit, report.chemistry, report.caution].map((section) => (
            <div
              key={section.title}
              className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4"
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
