'use client'

import { useState, type ReactNode } from 'react'
import {
  BriefcaseBusiness,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'

type CompatibilityMode = 'romance' | 'business' | 'friend'

type CompatibilitySection = {
  title: string
  body: string
}

type CompatibilityReport = {
  badge: string
  score: number
  title: string
  summary: string
  signalChips: string[]
  mbti: CompatibilitySection
  saju: CompatibilitySection
  synthesis: CompatibilitySection
  strengths: string[]
  cautions: string[]
  opener: string
}

const COMPATIBILITY_MODES: Array<{
  id: CompatibilityMode
  label: string
  icon: ReactNode
}> = [
  { id: 'romance', label: '이성', icon: <Heart size={14} /> },
  { id: 'business', label: '사업 파트너', icon: <BriefcaseBusiness size={14} /> },
  { id: 'friend', label: '친구 · 동료', icon: <Users size={14} /> },
]

const SAJU_PROFILES: Record<string, {
  alias: string
  summary: string
  modeCopy: Record<CompatibilityMode, string>
  caution: Record<CompatibilityMode, string>
}> = {
  경금: {
    alias: '기준이 분명한 금의 결',
    summary: '판단이 빠르고 기준이 선명해서 사람을 볼 때도 태도와 일관성을 중요하게 읽는 타입입니다.',
    modeCopy: {
      romance: '감정의 크기보다 태도의 안정감과 신뢰 신호가 보여야 호감이 커지는 편입니다.',
      business: '역할과 책임이 명확한 파트너십에서 속도가 붙고, 결정을 오래 미루지 않는 편입니다.',
      friend: '말수보다 행동과 약속 이행으로 신뢰를 쌓는 친구형 흐름이 강합니다.',
    },
    caution: {
      romance: '애매한 신호가 길어지면 마음이 빨리 닫힐 수 있습니다.',
      business: '기준 없이 오락가락하는 협업은 피로감이 크게 느껴질 수 있습니다.',
      friend: '겉도는 인사만 반복되면 관계를 얕게 판단할 가능성이 있습니다.',
    },
  },
  임수: {
    alias: '흐름을 읽는 물의 결',
    summary: '사람과 상황의 맥락을 빠르게 읽고 판을 넓히는 성향이라, 관계를 연결하는 감각이 좋은 타입입니다.',
    modeCopy: {
      romance: '대화가 유연하게 흐르고 감정선이 자연스러울 때 케미가 커지는 편입니다.',
      business: '변수 대응과 네트워킹이 필요한 협업에서 강점이 크게 드러납니다.',
      friend: '상대의 텐션을 읽어 관계 온도를 맞추는 데 능숙한 편입니다.',
    },
    caution: {
      romance: '리듬이 끊기면 흥미가 다른 데로 빠르게 흐를 수 있습니다.',
      business: '방향 정의 없이 아이디어만 많아지면 실행 밀도가 떨어질 수 있습니다.',
      friend: '넓게 연결되는 대신 깊이가 얕아질 수 있어 후속 약속이 중요합니다.',
    },
  },
  정화: {
    alias: '온도를 만드는 불의 결',
    summary: '분위기와 감정을 밝히는 힘이 있고, 관계의 온도를 빠르게 만드는 데 강점이 있는 타입입니다.',
    modeCopy: {
      romance: '호감 신호와 감정 교류가 분명할수록 빠르게 가까워지는 흐름이 강합니다.',
      business: '브랜딩, 설득, 대외 커뮤니케이션이 필요한 자리에서 존재감이 크게 보입니다.',
      friend: '사람을 편하게 만들고 자리를 환하게 여는 친구형 케미가 강합니다.',
    },
    caution: {
      romance: '반응이 무덤덤하면 에너지가 빠르게 가라앉을 수 있습니다.',
      business: '관계 톤은 좋은데 실행 기준이 흐리면 기대치가 어긋날 수 있습니다.',
      friend: '분위기만 좋고 구체적인 다음 액션이 없으면 관계가 가볍게 남을 수 있습니다.',
    },
  },
}

function clampScore(score: number) {
  return Math.max(68, Math.min(96, score))
}

function getGrade(score: number) {
  if (score >= 90) return '강한 케미'
  if (score >= 84) return '좋은 궁합'
  if (score >= 76) return '대화가 잘 풀리는 편'
  return '천천히 맞춰가는 편'
}

function getSajuProfile(sajuType: string) {
  return SAJU_PROFILES[sajuType] ?? {
    alias: `${sajuType}의 결`,
    summary: '관계에서 보여주는 결을 읽기 위해 사주 타입을 참고한 상태입니다.',
    modeCopy: {
      romance: '감정 템포와 신뢰 신호를 함께 읽는 관계형 흐름으로 해석됩니다.',
      business: '역할과 책임의 배분, 협업 리듬을 함께 보는 타입으로 해석됩니다.',
      friend: '공통 취향과 생활 반경을 매개로 가까워지는 흐름으로 해석됩니다.',
    },
    caution: {
      romance: '신호가 애매하면 해석 차이가 생길 수 있습니다.',
      business: '역할 정의가 늦어지면 합이 흐려질 수 있습니다.',
      friend: '가벼운 연결만 남고 깊이가 생기지 않을 수 있습니다.',
    },
  }
}

function getSignalChips(whoIAm: PublicProfileWhoIAm, life?: PublicProfileLife) {
  return [
    whoIAm.mbti,
    whoIAm.sajuType,
    life?.places.neighborhoods[0],
    life?.daily.exercise[0],
    life?.tastes.music[0]?.label,
    life?.tastes.cafes[0]?.label,
  ].filter(Boolean) as string[]
}

function getTasteHook(life?: PublicProfileLife) {
  return (
    life?.tastes.cafes[0]?.label
    ?? life?.tastes.restaurants[0]?.label
    ?? life?.tastes.music[0]?.label
    ?? life?.tastes.movies[0]?.label
    ?? life?.tastes.books[0]?.label
    ?? life?.tastes.sports[0]
    ?? life?.daily.exercise[0]
    ?? null
  )
}

function getMbtiSection(
  whoIAm: PublicProfileWhoIAm,
  mode: CompatibilityMode,
): CompatibilitySection {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'

  if (mode === 'romance') {
    return {
      title: `${mbti}가 만드는 대화의 리듬`,
      body: `${extrovert ? '초반 문을 먼저 여는 편' : '초반 텐션을 천천히 맞추는 편'}이고, ${thinking ? '감정 표현보다 기준과 일관성' : '공감과 감정선'}에서 신뢰를 확인하는 타입입니다. ${intuitive ? '가치관과 맥락' : '현실적인 생활 루틴'} 이야기로 들어갈 때 케미가 더 빨리 커집니다.`,
    }
  }

  if (mode === 'business') {
    return {
      title: `${mbti}가 만드는 협업의 호흡`,
      body: `${thinking ? '의사결정 기준이 비교적 선명하고' : '사람과 맥락을 함께 보며'} ${judging ? '우선순위와 마감을 정리하는 흐름' : '탐색과 실험을 열어두는 흐름'}에 가깝습니다. ${intuitive ? '큰 그림과 가능성' : '실행 계획과 현실 감각'}이 맞는 파트너와 시너지가 커집니다.`,
    }
  }

  return {
    title: `${mbti}가 만드는 친구형 케미`,
    body: `${extrovert ? '현장에서 금방 말을 트는 편' : '조용해도 결이 맞으면 깊어지는 편'}이고, ${thinking ? '문제 해결형 대화' : '정서적 공감'}에서 편안함을 느끼는 성향입니다. ${intuitive ? '흥미로운 이야기 확장' : '실제 같이 할 수 있는 활동'}이 보이면 관계가 빨리 편해집니다.`,
  }
}

function buildCompatibilityReport(
  profileName: string,
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
  mode: CompatibilityMode,
): CompatibilityReport {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'
  const styleLead = whoIAm.aiStyleSummary[0] ?? '첫인상'
  const saju = getSajuProfile(whoIAm.sajuType)
  const signalChips = getSignalChips(whoIAm, life)
  const neighborhood = life?.places.neighborhoods[0]
  const exercise = life?.daily.exercise[0]
  const tasteHook = getTasteHook(life)
  const mbtiSection = getMbtiSection(whoIAm, mode)

  if (mode === 'romance') {
    const score = clampScore(77 + (extrovert ? 4 : 1) + (thinking ? -1 : 4) + (intuitive ? 3 : 1) + Math.min(signalChips.length, 5))
    return {
      badge: getGrade(score),
      score,
      title: '호감은 분위기보다 리듬과 생활 접점에서 커지는 타입입니다',
      summary: `${profileName}님은 ${styleLead}가 분명하고 ${whoIAm.relationshipStatus}이라는 신호가 있어, 첫인상 이후에도 대화가 자연스럽게 이어질 가능성이 높습니다.`,
      signalChips,
      mbti: mbtiSection,
      saju: {
        title: `${whoIAm.sajuType}이 보여주는 관계의 결`,
        body: `${saju.alias}. ${saju.summary} ${saju.modeCopy.romance}`,
      },
      synthesis: {
        title: 'AI 종합 해석',
        body: `${neighborhood ? `${neighborhood} 생활권` : '생활 반경'}과 ${exercise ? `${exercise} 루틴` : '일상 리듬'}이 보여서 “어디서 시간을 보내는지” 같은 현실 질문이 잘 붙습니다. ${tasteHook ? `${tasteHook} 같은 취향 소재를 곁들이면` : '취향 소재 하나만 붙여도'} 첫 만남의 거리감이 빨리 줄어드는 편입니다.`,
      },
      strengths: [
        extrovert ? '처음 만난 자리에서도 대화 스타트를 비교적 빠르게 끊는 편입니다.' : '초반은 조용해도 텐션이 맞으면 깊은 이야기로 빨리 넘어갈 수 있습니다.',
        saju.modeCopy.romance,
        intuitive ? '가치관, 앞으로의 방향, 인생관 같은 맥락 대화에서 호감이 빨리 쌓입니다.' : '취향, 생활 습관, 자주 가는 동네처럼 현실적인 접점이 보이면 안정적으로 가까워집니다.',
      ],
      cautions: [
        extrovert ? '초반 템포가 너무 느리면 흥미가 빨리 꺼질 수 있습니다.' : '너무 가벼운 스몰토크만 길어지면 몰입이 떨어질 수 있습니다.',
        thinking ? '감정 확인 없이 논리만 앞세우는 상대는 차갑게 느껴질 수 있습니다.' : '애매한 태도로 밀당하듯 접근하면 피로도가 커질 수 있습니다.',
        saju.caution.romance,
      ],
      opener: neighborhood && tasteHook
        ? `${neighborhood}나 ${tasteHook}처럼 실제 생활 반경과 맞닿아 있는 소재로 먼저 말을 꺼내면 반응이 좋습니다.`
        : extrovert
          ? '공통점 하나를 바로 꺼내서 분위기를 여는 방식이 잘 먹힙니다.'
          : '가벼운 공통점 뒤에 바로 취향이나 가치관 질문으로 넘어가면 반응이 좋습니다.',
    }
  }

  if (mode === 'business') {
    const score = clampScore(80 + (thinking ? 5 : 2) + (judging ? 4 : 1) + (intuitive ? 3 : 0) + Math.min(signalChips.length, 4))
    return {
      badge: getGrade(score),
      score,
      title: '역할이 선명하고 실행 기준이 맞는 파트너십에서 강합니다',
      summary: `${whoIAm.mbti}와 ${whoIAm.sajuType} 흐름을 함께 보면 방향성 대화와 실행 구분이 비교적 명확한 편이라, 기대치가 분명한 사업 관계에서 시너지가 큽니다.`,
      signalChips,
      mbti: mbtiSection,
      saju: {
        title: `${whoIAm.sajuType}이 보여주는 협업의 결`,
        body: `${saju.alias}. ${saju.summary} ${saju.modeCopy.business}`,
      },
      synthesis: {
        title: 'AI 종합 해석',
        body: `${exercise ? `${exercise}처럼 반복하는 루틴` : '반복 루틴'}과 ${neighborhood ? `${neighborhood} 중심의 생활 반경` : '생활 반경'}이 함께 보여서 뜬구름보다는 실제 일정과 움직임 위에서 관계를 판단하는 편입니다. ${tasteHook ? `${tasteHook} 같은 취향 소재로 라포를 만든 뒤` : '초반 라포를 만든 뒤'} “같이 만들 수 있는 것”을 바로 제안하면 전환이 빠릅니다.`,
      },
      strengths: [
        thinking ? '의사결정 기준이 분명한 상대와 일할 때 속도가 붙습니다.' : '사람과 맥락을 함께 보는 파트너와 협업할 때 조율력이 높습니다.',
        judging ? '마감, 책임, 우선순위가 정리된 환경에서 안정적인 퍼포먼스를 냅니다.' : '탐색과 실험을 허용하는 파트너와 있을 때 아이디어 확장이 좋습니다.',
        saju.modeCopy.business,
      ],
      cautions: [
        '역할 정의 없이 감으로만 협업을 시작하면 피로도가 빠르게 올라갈 수 있습니다.',
        thinking ? '감정적 설득보다 데이터와 맥락이 있는 제안이 더 잘 통합니다.' : '숫자만 앞세우고 관계 맥락을 무시하면 동력이 약해질 수 있습니다.',
        saju.caution.business,
      ],
      opener: neighborhood
        ? `${neighborhood}나 요즘 자주 움직이는 반경 같은 가벼운 근황으로 문을 열고, 바로 “같이 만들 수 있는 것”을 붙이는 접근이 효과적입니다.`
        : '처음부터 “우리가 같이 만들 수 있는 것”을 명확하게 던지는 접근이 효과적입니다.',
    }
  }

  const score = clampScore(78 + (extrovert ? 4 : 2) + (thinking ? 2 : 4) + (intuitive ? 2 : 1) + Math.min(signalChips.length, 5))
  return {
    badge: getGrade(score),
    score,
    title: '같이 움직이며 대화가 확장되는 친구형 케미가 강합니다',
    summary: `${styleLead}와 ${whoIAm.mbti}, ${whoIAm.sajuType} 흐름을 같이 보면 취향이나 생활 반경이 맞는 사람과는 금방 편한 사이로 넘어갈 가능성이 큽니다.`,
    signalChips,
    mbti: mbtiSection,
    saju: {
      title: `${whoIAm.sajuType}이 보여주는 친구형 흐름`,
      body: `${saju.alias}. ${saju.summary} ${saju.modeCopy.friend}`,
    },
    synthesis: {
      title: 'AI 종합 해석',
      body: `${neighborhood ? `${neighborhood}` : '동네'}와 ${tasteHook ?? '취향'} 같은 현실 접점이 보여서 스몰토크보다 바로 “같이 갈 수 있는 소재”로 들어가기 좋습니다. ${life?.tastes.restaurants[0]?.label ?? life?.tastes.cafes[0]?.label ?? '좋아하는 장소'} 얘기가 다음 약속 제안으로 자연스럽게 이어질 수 있습니다.`,
    },
    strengths: [
      extrovert ? '오프라인 자리에서 금방 말을 트고 연결을 유지하는 힘이 있습니다.' : '조용해도 결이 맞는 사람과는 꾸준히 깊어지는 관계를 만듭니다.',
      '공통 취향이 하나만 보여도 다음 약속이나 대화 소재로 이어질 여지가 큽니다.',
      saju.modeCopy.friend,
    ],
    cautions: [
      '표면적인 인사만 반복되면 관계가 얕게 머무를 가능성이 큽니다.',
      intuitive ? '흥미로운 이야기만 많고 실제 만남이 안 이어지면 연결감이 약해질 수 있습니다.' : '공통점이 보여도 너무 실무적으로만 접근하면 거리감이 남을 수 있습니다.',
      saju.caution.friend,
    ],
    opener: neighborhood && tasteHook
      ? `${neighborhood}, ${tasteHook}처럼 같이 가볼 수 있는 소재부터 꺼내면 바로 다음 약속 얘기로 이어지기 좋습니다.`
      : '동네, 취향, 최근 본 콘텐츠처럼 바로 이어갈 수 있는 소재부터 꺼내는 편이 좋습니다.',
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
  const [activeMode, setActiveMode] = useState<CompatibilityMode>('romance')
  const report = buildCompatibilityReport(profileName, whoIAm, life, activeMode)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            <Sparkles size={14} />
            <span>Compatibility Report</span>
          </div>
          <div className="mt-2 text-[20px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">
            궁합 보기
          </div>
          <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
            {profileName}님의 MBTI, 사주 타입, 라이프스타일, 자주 가는 동네를 함께 읽어
            관계별 흐름을 정리한 리포트입니다.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {COMPATIBILITY_MODES.map((mode) => {
            const selected = mode.id === activeMode
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className="rounded-[16px] border px-3 py-3 text-left transition-colors"
                style={{
                  borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                  background: selected ? 'rgba(78, 99, 255, 0.14)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  <span className={selected ? 'text-white' : 'text-[var(--color-text-secondary)]'}>{mode.icon}</span>
                  <span>{mode.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {report.badge}
              </div>
              <div className="mt-3 text-[18px] font-black leading-[1.35] tracking-[-0.03em] text-[var(--color-text-strong)]">
                {report.title}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">예상 지수</div>
              <div className="mt-1 text-[26px] font-black tracking-[-0.05em] text-white">{report.score}</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">{report.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.signalChips.map((chip, index) => (
              <span key={`${chip}-${index}`} className="chip-metric">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <ReportSection
            title="MBTI 결"
            body={report.mbti.body}
            emphasis={report.mbti.title}
          />
          <ReportSection
            title="사주 결"
            body={report.saju.body}
            emphasis={report.saju.title}
          />
          <ReportSection
            title="AI 종합 해석"
            body={report.synthesis.body}
            emphasis={report.synthesis.title}
          />
          <ReportBlock
            title="잘 맞는 포인트"
            items={report.strengths}
          />
          <ReportBlock
            title="주의할 점"
            items={report.cautions}
          />
          <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">추천 첫 마디</div>
            <p className="mt-2 text-[14px] font-semibold leading-[1.6] text-[var(--color-text-primary)]">{report.opener}</p>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

function ReportSection({
  title,
  emphasis,
  body,
}: {
  title: string
  emphasis: string
  body: string
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <MessageCircle size={13} />
        <span>{title}</span>
      </div>
      <div className="mt-2 text-[14px] font-semibold leading-[1.55] text-[var(--color-text-primary)]">{emphasis}</div>
      <p className="mt-2 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">{body}</p>
    </div>
  )
}

function ReportBlock({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <Star size={13} />
        <span>{title}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-2 text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
            <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent-dark)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
