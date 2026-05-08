'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  BriefcaseBusiness,
  Heart,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { PublicProfileWhoIAm } from '@/types'

type CompatibilityMode = 'romance' | 'business' | 'friend'

type CompatibilityReport = {
  badge: string
  score: number
  title: string
  summary: string
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

function clampScore(score: number) {
  return Math.max(68, Math.min(96, score))
}

function getGrade(score: number) {
  if (score >= 90) return '강한 케미'
  if (score >= 84) return '좋은 궁합'
  if (score >= 76) return '대화가 잘 풀리는 편'
  return '천천히 맞춰가는 편'
}

function buildCompatibilityReport(
  whoIAm: PublicProfileWhoIAm,
  mode: CompatibilityMode,
): CompatibilityReport {
  const mbti = whoIAm.mbti.toUpperCase()
  const extrovert = mbti.startsWith('E')
  const intuitive = mbti[1] === 'N'
  const thinking = mbti[2] === 'T'
  const judging = mbti[3] === 'J'
  const styleLead = whoIAm.aiStyleSummary[0] ?? '첫인상'

  if (mode === 'romance') {
    const score = clampScore(77 + (extrovert ? 4 : 1) + (thinking ? -1 : 4) + (intuitive ? 3 : 1))
    return {
      badge: getGrade(score),
      score,
      title: '감정만보다 리듬과 대화 결이 맞을 때 케미가 커집니다',
      summary: `${styleLead}가 분명하고 ${whoIAm.relationshipStatus}이라는 신호가 있어, 첫인상 이후 대화의 온도가 자연스럽게 이어질 가능성이 높습니다.`,
      strengths: [
        extrovert ? '처음 만난 자리에서도 대화의 스타트를 비교적 빠르게 끊습니다.' : '한 번 텐션이 맞으면 깊은 이야기로 빠르게 들어가는 편입니다.',
        thinking ? '감정 표현보다 태도와 일관성에서 신뢰를 확인하려는 경향이 있습니다.' : '상대의 감정선과 분위기를 잘 읽는 관계에서 편안함이 커집니다.',
        intuitive ? '미래 이야기나 가치관 대화가 이어질 때 호감이 빨리 쌓입니다.' : '취향, 생활 습관처럼 현실적인 접점이 보이면 안정적으로 가까워집니다.',
      ],
      cautions: [
        extrovert ? '초반 템포가 너무 느리면 흥미가 빨리 꺼질 수 있습니다.' : '너무 가벼운 스몰토크만 길어지면 몰입이 떨어질 수 있습니다.',
        thinking ? '감정 확인 없이 논리만 앞세우는 상대는 차갑게 느껴질 수 있습니다.' : '애매한 태도로 밀당하듯 접근하면 피로도가 커질 수 있습니다.',
      ],
      opener: extrovert
        ? '공통점 하나를 바로 꺼내서 분위기를 여는 방식이 잘 먹힙니다.'
        : '가벼운 공통점 뒤에 바로 취향이나 가치관 질문으로 넘어가면 반응이 좋습니다.',
    }
  }

  if (mode === 'business') {
    const score = clampScore(80 + (thinking ? 5 : 2) + (judging ? 4 : 1) + (intuitive ? 3 : 0))
    return {
      badge: getGrade(score),
      score,
      title: '역할이 선명하고 실행 호흡이 맞는 파트너와 강합니다',
      summary: `${whoIAm.mbti} 기반으로 보면 방향성 대화와 실행 구분이 명확한 편이라, 역할과 기대치가 분명한 사업 파트너 관계에서 시너지가 큽니다.`,
      strengths: [
        thinking ? '의사결정 기준이 분명한 상대와 일할 때 속도가 붙습니다.' : '사람과 맥락을 함께 보는 파트너와 협업할 때 조율력이 높습니다.',
        judging ? '마감, 책임, 우선순위가 정리된 환경에서 안정적인 퍼포먼스를 냅니다.' : '탐색과 실험을 허용하는 파트너와 있을 때 아이디어 확장이 좋습니다.',
        intuitive ? '큰 그림과 가능성을 먼저 보는 대화에서 강점을 보입니다.' : '현실적인 수치와 실행 계획이 함께 있을 때 신뢰도가 올라갑니다.',
      ],
      cautions: [
        '역할 정의 없이 감으로만 협업을 시작하면 피로도가 빠르게 올라갈 수 있습니다.',
        thinking ? '감정적 설득보다 데이터와 맥락이 있는 제안이 더 잘 통합니다.' : '숫자만 앞세우고 관계 맥락을 무시하면 동력이 약해질 수 있습니다.',
      ],
      opener: '처음부터 “우리가 같이 만들 수 있는 것”을 명확하게 던지는 접근이 효과적입니다.',
    }
  }

  const score = clampScore(78 + (extrovert ? 4 : 2) + (thinking ? 2 : 4) + (intuitive ? 2 : 1))
  return {
    badge: getGrade(score),
    score,
    title: '같이 움직이며 대화가 확장되는 친구형 케미에 가깝습니다',
    summary: `${styleLead}와 ${whoIAm.mbti} 조합상, 취향이나 생활 반경이 맞는 사람과는 금방 편한 사이로 넘어갈 가능성이 큽니다.`,
    strengths: [
      extrovert ? '오프라인 자리에서 금방 말을 트고 연결을 유지하는 힘이 있습니다.' : '조용해도 결이 맞는 사람과는 꾸준히 깊어지는 관계를 만듭니다.',
      '공통 취향이 하나만 보여도 다음 약속이나 대화 소재로 이어질 여지가 큽니다.',
      thinking ? '문제 해결형 대화가 잘 맞는 사람과 오래 갑니다.' : '서로의 감정 톤을 존중해주는 사람과 오래 갑니다.',
    ],
    cautions: [
      '표면적인 인사만 반복되면 관계가 얕게 머무를 가능성이 큽니다.',
      intuitive ? '흥미로운 이야기만 많고 실제 만남이 안 이어지면 연결감이 약해질 수 있습니다.' : '공통점이 보여도 너무 실무적으로만 접근하면 거리감이 남을 수 있습니다.',
    ],
    opener: '동네, 취향, 최근 본 콘텐츠처럼 바로 이어갈 수 있는 소재부터 꺼내는 편이 좋습니다.',
  }
}

export function PublicProfileCompatibilitySheet({
  open,
  onClose,
  whoIAm,
}: {
  open: boolean
  onClose: () => void
  whoIAm: PublicProfileWhoIAm
}) {
  const [activeMode, setActiveMode] = useState<CompatibilityMode>('romance')
  const report = buildCompatibilityReport(whoIAm, activeMode)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            <Sparkles size={14} />
            <span>Compatibility Report</span>
          </div>
          <div className="mt-2 text-[20px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">
            사주 궁합 리포트
          </div>
          <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
            현재는 프로필 신호를 바탕으로 관계별 케미를 먼저 보여주는 프리뷰입니다.
            실제 상대 정보와 연결되면 pairwise 궁합 리포트로 확장할 수 있습니다.
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
        </div>

        <div className="mt-4 space-y-3">
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
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
            <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent-dark)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
