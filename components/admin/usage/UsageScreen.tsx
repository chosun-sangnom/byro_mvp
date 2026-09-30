'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { AdminCard, SectionHeading, StatusBadge, TableShell, Td, Th, ToggleSwitch } from '@/components/admin/ui'
import { Button, Chip, showToast } from '@/components/ui'
import {
  CHARGE_TYPE_LABEL,
  DAILY_COSTS,
  FEATURE_COSTS,
  FIXED_COSTS,
  OCI_COST_ANALYSIS_URL,
  OCI_CREDIT_URL,
  PREPAID_BALANCES,
  UNIT_PRICES,
  USAGE_QUOTAS,
  USAGE_SERVICES,
  USAGE_SETTINGS_DEFAULT,
  type ChargeType,
  type PrepaidBalance,
  type UnitPrice,
  type UsageQuota,
} from '@/lib/mocks/adminUsageMocks'

// [임시] 목업 기준일 — 실서비스에선 서버 시각
const TODAY = new Date('2026-09-30T12:00:00+09:00')
const DAYS_IN_MONTH = 30

type Tab = 'dashboard' | 'settings'
type Period = 'this' | 'last'

const won = (n: number) => `₩${Math.round(n).toLocaleString()}`

const CHARGE_TONE: Record<ChargeType, 'info' | 'warn' | 'success' | 'neutral'> = {
  prepaid: 'info',
  postpaid: 'warn',
  subscription: 'success',
  free: 'neutral',
}

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function quotaState(q: UsageQuota, warnPercent: number): 'ok' | 'warn' | 'over' {
  const pct = (q.used / q.limit) * 100
  if (pct >= 100) return 'over'
  if (pct >= warnPercent) return 'warn'
  return 'ok'
}

/** 선불 잔액이 언제 바닥나는지, 만료일에 얼마가 남아 소멸하는지 */
function prepaidForecast(p: PrepaidBalance) {
  const daysLeft = p.monthlyBurnKrw > 0 ? (p.balanceKrw / p.monthlyBurnKrw) * DAYS_IN_MONTH : Infinity
  const depletesAt = new Date(TODAY.getTime() + daysLeft * 86_400_000)
  if (!p.expiresAt) return { depletesAt, lapseKrw: 0, daysLeft }
  const expires = new Date(`${p.expiresAt}T00:00:00+09:00`)
  const usedUntilExpiry = (p.monthlyBurnKrw / DAYS_IN_MONTH) * Math.max(0, daysBetween(TODAY, expires))
  return { depletesAt, lapseKrw: Math.max(0, p.balanceKrw - usedUntilExpiry), daysLeft, expires }
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-1 text-[12px] font-bold"
      style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-accent-dark)' }}
    >
      {label}
      <ExternalLink size={12} />
    </a>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <AdminCard>
      <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </div>
      <div className="mt-1.5 text-[20px] font-black tabular-nums" style={{ color: 'var(--color-text-strong)' }}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          {sub}
        </div>
      )}
    </AdminCard>
  )
}

function Delta({ now, prev }: { now: number | null; prev: number | null }) {
  if (now == null || prev == null || prev === 0) return <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
  const pct = ((now - prev) / prev) * 100
  if (Math.abs(pct) < 1) return <span style={{ color: 'var(--color-text-tertiary)' }}>변동 없음</span>
  const up = pct > 0
  return (
    <span className="font-semibold" style={{ color: up ? 'var(--color-state-danger-text)' : 'var(--color-state-success-text)' }}>
      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(0)}%
    </span>
  )
}

function QuotaRow({ q, warnPercent }: { q: UsageQuota; warnPercent: number }) {
  const state = quotaState(q, warnPercent)
  const pct = Math.min(100, (q.used / q.limit) * 100)
  const color =
    state === 'over'
      ? 'var(--color-state-danger-text)'
      : state === 'warn'
        ? 'var(--color-state-warn-text)'
        : 'var(--color-accent-dark)'
  const over = q.used - q.limit
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {q.label}
        </div>
        <div className="text-[12px] tabular-nums" style={{ color }}>
          {q.used.toLocaleString()} / {q.limit.toLocaleString()}
          {q.unit} ({((q.used / q.limit) * 100).toFixed(0)}%)
        </div>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
        {state === 'over' && over > 0
          ? `${over.toLocaleString()}${q.unit} 초과${q.overagePriceKrw ? `, 추가 예상 ${won(over * q.overagePriceKrw)}` : ''}`
          : `${q.period === 'day' ? '하루' : '한 달'} 기준, ${q.overageNote}`}
      </div>
    </div>
  )
}

function DailyChart({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const top = Math.ceil(max / 100) * 100
  return (
    <div>
      <div className="flex h-[140px] items-end gap-[3px]">
        {values.map((v, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[3px]"
              style={{ height: `${(v / top) * 100}%`, backgroundColor: 'var(--color-accent-light)' }}
            />
            <div
              className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white group-hover:block"
              style={{ backgroundColor: 'var(--color-text-strong)' }}
            >
              9/{i + 1} {won(v)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>9/1</span>
        <span>9/15</span>
        <span>9/30</span>
      </div>
      <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
        세로축 최대 {won(top)}. 틸코 구독료와 서버비 같은 고정비는 빼고 호출량에 따라 나간 비용만 표시합니다.
      </div>
    </div>
  )
}

function Dashboard({
  period,
  includeAdmin,
  warnPercent,
}: {
  period: Period
  includeAdmin: boolean
  warnPercent: number
}) {
  const rows = USAGE_SERVICES.map((s) => {
    const trim = !includeAdmin
    const calls = s.calls - (trim ? s.adminTestCalls ?? 0 : 0)
    const cost = s.costKrw == null ? null : s.costKrw - (trim ? s.adminTestCostKrw ?? 0 : 0)
    return {
      ...s,
      calls: period === 'this' ? calls : Math.round(calls * 0.82),
      cost: period === 'this' ? cost : s.lastMonthCostKrw,
    }
  })

  // 틸코처럼 월 구독료가 정해진 서비스는 호출량과 무관하므로 고정비로 묶는다
  const variableTotal = rows.filter((r) => r.chargeType !== 'subscription').reduce((sum, r) => sum + (r.cost ?? 0), 0)
  const fixedTotal =
    FIXED_COSTS.reduce((sum, f) => sum + f.costKrw, 0) +
    rows.filter((r) => r.chargeType === 'subscription').reduce((sum, r) => sum + (r.cost ?? 0), 0)
  const lastMonthTotal = USAGE_SERVICES.reduce((sum, s) => sum + (s.lastMonthCostKrw ?? 0), 0) + fixedTotal
  const elapsed = period === 'this' ? DAILY_COSTS.length : DAYS_IN_MONTH
  const projected = (variableTotal / elapsed) * DAYS_IN_MONTH + fixedTotal
  const missingPrice = rows.filter((r) => r.cost == null)
  const featureTotal = FEATURE_COSTS.reduce((sum, f) => sum + f.costKrw, 0)

  const alerts: { tone: 'danger' | 'warn'; text: string; href?: string; linkLabel?: string }[] = []
  for (const q of USAGE_QUOTAS) {
    const state = quotaState(q, warnPercent)
    const svc = USAGE_SERVICES.find((s) => s.id === q.serviceId)
    if (state === 'over') {
      alerts.push({ tone: 'danger', text: `${q.label} 제공량을 넘었습니다. ${q.overageNote}.`, href: svc?.billingUrl, linkLabel: svc?.billingLabel })
    } else if (state === 'warn') {
      alerts.push({ tone: 'warn', text: `${q.label} 제공량의 ${warnPercent}%를 넘었습니다.`, href: svc?.billingUrl, linkLabel: svc?.billingLabel })
    }
  }
  for (const p of PREPAID_BALANCES) {
    const f = prepaidForecast(p)
    if (f.lapseKrw > 0 && f.expires) {
      alerts.push({
        tone: 'warn',
        text: `${p.name}이 ${formatDate(f.expires)}에 만료되며, 지금 속도면 약 ${won(f.lapseKrw)}이 쓰이지 않고 사라집니다.`,
        href: p.billingUrl,
        linkLabel: '크레딧 보기',
      })
    } else if (f.daysLeft < 30) {
      alerts.push({ tone: 'danger', text: `${p.name} 잔액이 한 달 안에 바닥납니다. 충전이 필요합니다.`, href: p.billingUrl, linkLabel: '충전하기' })
    }
  }
  if (missingPrice.length > 0) {
    alerts.push({
      tone: 'warn',
      text: `${missingPrice.map((r) => r.name).join(', ')}의 단가가 입력되지 않아 비용이 계산되지 않았습니다. 단가와 한도 설정에서 입력해 주세요.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label={period === 'this' ? '이번 달 누적' : '지난달 합계'}
          value={won(period === 'this' ? variableTotal + fixedTotal : lastMonthTotal)}
          sub={`사용량 ${won(variableTotal)} + 고정비 ${won(fixedTotal)}`}
        />
        <StatCard
          label="월말 예상"
          value={period === 'this' ? won(projected) : '-'}
          sub={period === 'this' ? `${elapsed}일 평균으로 ${DAYS_IN_MONTH}일 환산` : undefined}
        />
        <StatCard label="지난달" value={won(lastMonthTotal)} sub={period === 'this' ? undefined : '8월'} />
        <StatCard label="확인 필요" value={`${alerts.length}건`} sub="한도, 크레딧, 단가 미입력" />
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3"
              style={{
                backgroundColor: a.tone === 'danger' ? 'var(--color-state-danger-bg)' : 'var(--color-state-warn-bg)',
                color: a.tone === 'danger' ? 'var(--color-state-danger-text)' : 'var(--color-state-warn-text)',
              }}
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span className="flex-1 text-[13px] font-semibold">{a.text}</span>
              {a.href && a.linkLabel && <LinkButton href={a.href} label={a.linkLabel} />}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <AdminCard>
          <div className="mb-2 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            선불 잔액
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
            {PREPAID_BALANCES.map((p) => {
              const f = prepaidForecast(p)
              return (
                <div key={p.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </div>
                      <div className="mt-0.5 text-[20px] font-black tabular-nums" style={{ color: 'var(--color-text-strong)' }}>
                        {won(p.balanceKrw)}
                      </div>
                    </div>
                    <LinkButton href={p.billingUrl} label={p.expiresAt ? '크레딧 보기' : '충전하기'} />
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <div>한 달 평균 {won(p.monthlyBurnKrw)} 사용, {p.note}</div>
                    {f.expires ? (
                      <div>
                        만료 {formatDate(f.expires)} ({daysBetween(TODAY, f.expires)}일 남음)
                        {f.lapseKrw > 0 ? `, 만료 시 약 ${won(f.lapseKrw)} 소멸 예상` : `, 소진 예상 ${formatDate(f.depletesAt)}`}
                      </div>
                    ) : (
                      <div>소진 예상 {formatDate(f.depletesAt)} (약 {Math.round(f.daysLeft)}일 뒤)</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-1 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            무료 제공량
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
            {USAGE_QUOTAS.map((q) => (
              <QuotaRow key={q.id} q={q} warnPercent={warnPercent} />
            ))}
          </div>
        </AdminCard>
      </div>

      <div>
        <div className="mb-2 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
          서비스별 사용량
        </div>
        <TableShell>
          <thead style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <tr>
              <Th>서비스</Th>
              <Th>과금 방식</Th>
              <Th>호출</Th>
              <Th>{period === 'this' ? '이번 달 비용' : '지난달 비용'}</Th>
              <Th>지난달 대비</Th>
              <Th>바로가기</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>
                  <div className="font-bold">{r.name}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {r.usedFor}
                  </div>
                </Td>
                <Td>
                  <StatusBadge label={CHARGE_TYPE_LABEL[r.chargeType]} tone={CHARGE_TONE[r.chargeType]} />
                </Td>
                <Td className="tabular-nums">
                  {r.calls.toLocaleString()}
                  {r.tokens && period === 'this' && (
                    <div className="text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
                      토큰 {(r.tokens / 1_000_000).toFixed(1)}M
                    </div>
                  )}
                </Td>
                <Td className="tabular-nums font-semibold">
                  {r.cost == null ? <StatusBadge label="단가 미입력" tone="warn" /> : won(r.cost)}
                </Td>
                <Td className="tabular-nums">
                  {period === 'this' ? <Delta now={r.cost} prev={r.lastMonthCostKrw} /> : '-'}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <LinkButton href={r.consoleUrl} label="대시보드" />
                    {r.billingUrl && r.billingLabel && <LinkButton href={r.billingUrl} label={r.billingLabel} />}
                  </div>
                </Td>
              </tr>
            ))}
            {FIXED_COSTS.map((f) => (
              <tr key={f.id} className="border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>
                  <div className="font-bold">{f.name}</div>
                  <div className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {f.note}
                  </div>
                </Td>
                <Td>
                  <StatusBadge label="고정비" tone="neutral" />
                </Td>
                <Td>-</Td>
                <Td className="tabular-nums font-semibold">{won(f.costKrw)}</Td>
                <Td>-</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <LinkButton href={f.consoleUrl} label="대시보드" />
                    <LinkButton href={OCI_COST_ANALYSIS_URL} label="비용 분석" />
                    <LinkButton href={OCI_CREDIT_URL} label="크레딧" />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AdminCard>
          <div className="mb-3 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            기능별 비용
          </div>
          <div className="space-y-2.5">
            {FEATURE_COSTS.map((f) => {
              const pct = (f.costKrw / featureTotal) * 100
              return (
                <div key={f.feature}>
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {f.feature}
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                      {won(f.costKrw)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--color-accent-dark)' }} />
                  </div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {f.service}, {f.calls.toLocaleString()}회
                  </div>
                </div>
              )
            })}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-3 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            일별 사용량 비용 (9월)
          </div>
          <DailyChart values={DAILY_COSTS} />
        </AdminCard>
      </div>
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  step,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[110px] rounded-lg border px-2.5 py-1.5 text-right text-[13px] tabular-nums"
        style={{ borderColor: 'var(--color-border-default)' }}
      />
      {suffix && (
        <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

function Settings({
  warnPercent,
  onWarnPercent,
}: {
  warnPercent: number
  onWarnPercent: (v: number) => void
}) {
  const [prices, setPrices] = useState<UnitPrice[]>(UNIT_PRICES)
  const [quotas, setQuotas] = useState(USAGE_QUOTAS.map((q) => ({ id: q.id, label: q.label, limit: q.limit, unit: q.unit })))
  const [balances, setBalances] = useState(PREPAID_BALANCES.map((p) => ({ id: p.id, name: p.name, balanceKrw: p.balanceKrw, expiresAt: p.expiresAt ?? '' })))
  const [usdKrw, setUsdKrw] = useState(USAGE_SETTINGS_DEFAULT.usdKrw)
  const [tilkoFee, setTilkoFee] = useState(USAGE_SETTINGS_DEFAULT.tilkoMonthlyFee)

  const save = () => showToast('설정을 저장했어요. 이후 기록부터 새 단가로 계산돼요.') // [임시] 목업 — 저장 API 미연동

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="mb-3 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
          기본 설정
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="space-y-1.5">
            <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              환율 (1달러)
            </div>
            <NumberInput value={usdKrw} onChange={setUsdKrw} suffix="원" />
          </label>
          <label className="space-y-1.5">
            <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              경고 기준
            </div>
            <NumberInput value={warnPercent} onChange={onWarnPercent} suffix="% 이상" />
          </label>
          <label className="space-y-1.5">
            <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              틸코 월 구독료 (부가세 별도)
            </div>
            <NumberInput value={tilkoFee} onChange={setTilkoFee} suffix="원" />
          </label>
        </div>
      </AdminCard>

      <div>
        <div className="mb-2 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
          단가표
        </div>
        <TableShell>
          <thead style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <tr>
              <Th>서비스</Th>
              <Th>세부 항목</Th>
              <Th>단가</Th>
              <Th>통화</Th>
              <Th>단위</Th>
              <Th>원화 환산</Th>
              <Th>적용 시작일</Th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td className="font-semibold">{p.service}</Td>
                <Td>{p.operation}</Td>
                <Td>
                  <NumberInput
                    value={p.price}
                    step={p.currency === 'USD' ? 0.001 : 1}
                    onChange={(v) => setPrices((prev) => prev.map((x) => (x.id === p.id ? { ...x, price: v } : x)))}
                  />
                </Td>
                <Td>{p.currency === 'USD' ? '달러' : '원'}</Td>
                <Td>{p.unit}</Td>
                <Td className="tabular-nums">
                  {p.price === 0 && !p.since ? (
                    <StatusBadge label="단가 미입력" tone="warn" />
                  ) : (
                    won(p.currency === 'USD' ? p.price * usdKrw : p.price)
                  )}
                </Td>
                <Td className="tabular-nums">{p.since || '-'}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AdminCard>
          <div className="mb-2 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            무료 제공량
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
            {quotas.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {q.label}
                </span>
                <NumberInput
                  value={q.limit}
                  suffix={q.unit}
                  onChange={(v) => setQuotas((prev) => prev.map((x) => (x.id === q.id ? { ...x, limit: v } : x)))}
                />
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-2 text-[15px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            선불 잔액
          </div>
          <div className="mb-2 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            청구 연동(2단계) 전까지는 콘솔에서 확인한 잔액을 직접 입력합니다.
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
            {balances.map((b) => (
              <div key={b.id} className="space-y-2 py-2.5">
                <div className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {b.name}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <NumberInput
                    value={b.balanceKrw}
                    suffix="원"
                    onChange={(v) => setBalances((prev) => prev.map((x) => (x.id === b.id ? { ...x, balanceKrw: v } : x)))}
                  />
                  <input
                    type="date"
                    value={b.expiresAt}
                    onChange={(e) =>
                      setBalances((prev) => prev.map((x) => (x.id === b.id ? { ...x, expiresAt: e.target.value } : x)))
                    }
                    className="rounded-lg border px-2.5 py-1.5 text-[13px]"
                    style={{ borderColor: 'var(--color-border-default)' }}
                  />
                  <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    만료일 (없으면 비움)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="flex justify-end">
        <Button fullWidth={false} onClick={save}>
          저장
        </Button>
      </div>
    </div>
  )
}

export default function UsageScreen() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [period, setPeriod] = useState<Period>('this')
  const [includeAdmin, setIncludeAdmin] = useState(false)
  const [warnPercent, setWarnPercent] = useState(USAGE_SETTINGS_DEFAULT.warnPercent)

  const updatedAt = useMemo(() => `${formatDate(TODAY)} 12:00 기준`, [])

  return (
    <div>
      <SectionHeading
        title="사용량 관리"
        description="외부 API와 AI의 사용량, 예상 비용, 충전이 필요한 곳을 한 화면에서 확인합니다. 비용은 호출 기록에 단가표를 곱한 예상값이며 실제 청구와 다를 수 있습니다. (SCRUM-229)"
      />

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <Chip label="대시보드" selected={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
        <Chip label="단가와 한도 설정" selected={tab === 'settings'} onClick={() => setTab('settings')} />
      </div>

      {tab === 'dashboard' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              <Chip label="이번 달" selected={period === 'this'} onClick={() => setPeriod('this')} />
              <Chip label="지난달" selected={period === 'last'} onClick={() => setPeriod('last')} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                관리자 테스트 호출 포함
                <ToggleSwitch checked={includeAdmin} onChange={setIncludeAdmin} />
              </label>
              <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {updatedAt}
              </span>
            </div>
          </div>
          <Dashboard period={period} includeAdmin={includeAdmin} warnPercent={warnPercent} />
        </>
      ) : (
        <Settings warnPercent={warnPercent} onWarnPercent={setWarnPercent} />
      )}
    </div>
  )
}
