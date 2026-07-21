'use client'

import { Info } from 'lucide-react'
import {
  EVENT_SPECS,
  MOCK_CORE_ACTION_FUNNEL,
  MOCK_INFLOW_CHANNELS,
  MOCK_ONBOARDING_FUNNEL,
  MOCK_RETENTION,
  MOCK_SIGNUP_FUNNEL,
} from '@/lib/mocks/adminMocks'
import { AdminCard, SectionHeading, Td, Th, TableShell } from '@/components/admin/ui'
import type { FunnelStep } from '@/types/admin'

function BarRow({ label, value, max, sublabel }: { label: string; value: number; max: number; sublabel?: string }) {
  const pct = Math.max(4, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-3">
      <div className="w-[132px] shrink-0 text-[12.5px] font-semibold truncate" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
      <div className="relative h-6 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: 'var(--color-accent-dark)' }}
        />
      </div>
      <div className="w-[92px] shrink-0 text-right text-[12.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {value.toLocaleString()}
        {sublabel ? <span className="ml-1 font-normal" style={{ color: 'var(--color-text-tertiary)' }}>{sublabel}</span> : null}
      </div>
    </div>
  )
}

function FunnelBlock({ title, steps }: { title: string; steps: FunnelStep[] }) {
  const max = steps[0]?.entered || 1
  return (
    <AdminCard>
      <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </div>
      <div className="space-y-2.5">
        {steps.map((s) => (
          <BarRow key={s.step} label={s.step} value={s.entered} max={max} sublabel={s.dropRate > 0 ? `이탈 ${s.dropRate}%` : undefined} />
        ))}
      </div>
    </AdminCard>
  )
}

export default function AnalyticsScreen() {
  const inflowMax = Math.max(...MOCK_INFLOW_CHANNELS.map((c) => c.visits))

  return (
    <div>
      <SectionHeading title="애널리틱스" description="도구: Google Analytics 4 확정. 아래는 GA4 연동 후 노출될 화면의 목업입니다." />

      <div
        className="mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12.5px]"
        style={{ borderColor: 'var(--color-state-info-bg)', backgroundColor: 'var(--color-state-info-bg)', color: 'var(--color-state-info-text)' }}
      >
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          GA4 지표의 백오피스 노출 방식(Looker Studio 임베드 vs GA4 Data API vs GA4 콘솔 직접 사용)은 아직 미확정입니다 (기획 §10).
          현재 화면은 최종 UI 목업이며 수치는 목업 데이터입니다.
        </span>
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          3.1 유입 채널 (ANLY-01, ANLY-02)
        </div>
        <AdminCard>
          <div className="space-y-2.5">
            {MOCK_INFLOW_CHANNELS.map((c) => (
              <BarRow key={c.channel} label={c.channel} value={c.visits} max={inflowMax} />
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          유입 → 가입 전환 (ANLY-03)
        </div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>채널</Th>
              <Th>방문</Th>
              <Th>가입 시작</Th>
              <Th>가입 완료</Th>
              <Th>전환율</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INFLOW_CHANNELS.map((c) => (
              <tr key={c.channel} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>{c.channel}</Td>
                <Td>{c.visits.toLocaleString()}</Td>
                <Td>{c.signupStarts.toLocaleString()}</Td>
                <Td>{c.signupCompletes.toLocaleString()}</Td>
                <Td>{((c.signupCompletes / c.visits) * 100).toFixed(1)}%</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <FunnelBlock title="회원가입 퍼널 (ANLY-04)" steps={MOCK_SIGNUP_FUNNEL} />
        <FunnelBlock title="핵심 액션 전환 (ANLY-07)" steps={MOCK_CORE_ACTION_FUNNEL} />
      </div>

      <div className="mb-6">
        <FunnelBlock title="온보딩 퍼널 (ANLY-05)" steps={MOCK_ONBOARDING_FUNNEL} />
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          리텐션 — 코호트별 D1/D7/D30 재방문율 (ANLY-06, 휴면 기준: 마지막 활동 30일)
        </div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>코호트</Th>
              <Th>가입자 수</Th>
              <Th>D1</Th>
              <Th>D7</Th>
              <Th>D30</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RETENTION.map((r) => (
              <tr key={r.cohort} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>{r.cohort}</Td>
                <Td>{r.size.toLocaleString()}</Td>
                <Td>{r.d1}%</Td>
                <Td>{r.d7}%</Td>
                <Td>{r.d30}%</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div>
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          3.3 이벤트 계측 정의 (프론트 심기 작업)
        </div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>이벤트명</Th>
              <Th>발생 시점</Th>
              <Th>파라미터</Th>
            </tr>
          </thead>
          <tbody>
            {EVENT_SPECS.map((e) => (
              <tr key={e.name} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td className="font-mono">{e.name}</Td>
                <Td>{e.timing}</Td>
                <Td>{e.params}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
        <p className="mt-2 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
          개인정보(이름, 연락처, 피드백 내용)는 이벤트 파라미터에 포함하지 않습니다.
        </p>
      </div>
    </div>
  )
}
