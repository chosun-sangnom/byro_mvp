'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, RoleLockNotice, SectionHeading, ToggleSwitch, hasRole } from '@/components/admin/ui'
import { Button, Chip } from '@/components/ui'
import type { AiFeatureKey, AiWeightItem } from '@/types/admin'

const TABS: { key: AiFeatureKey; label: string }[] = [
  { key: 'persona', label: 'AI 페르소나' },
  { key: 'bio', label: 'AI 자기소개' },
  { key: 'kemi', label: '케미 리포트' },
]

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12.5px]"
      style={{ borderColor: 'var(--color-state-info-bg)', backgroundColor: 'var(--color-state-info-bg)', color: 'var(--color-state-info-text)' }}
    >
      <Sparkles size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function WeightEditor({
  weights,
  onChange,
  disabled,
}: {
  weights: AiWeightItem[]
  onChange: (next: AiWeightItem[]) => void
  disabled?: boolean
}) {
  const total = weights.reduce((sum, w) => sum + w.weight, 0)
  return (
    <div>
      <div className="space-y-2">
        {weights.map((w, i) => (
          <div key={w.key} className="flex items-center gap-3">
            <div className="w-[180px] text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
              {w.label}
            </div>
            <input
              type="number"
              min={0}
              max={100}
              disabled={disabled}
              value={w.weight}
              onChange={(e) => {
                const value = Number(e.target.value) || 0
                onChange(weights.map((item, idx) => (idx === i ? { ...item, weight: value } : item)))
              }}
              className="w-[80px] rounded-lg border px-3 py-1.5 text-[13px] disabled:opacity-50"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
            <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>%</span>
          </div>
        ))}
      </div>
      <div
        className="mt-2 text-[12px] font-semibold"
        style={{ color: total === 100 ? 'var(--color-text-tertiary)' : 'var(--color-state-danger-text)' }}
      >
        합계 {total}%{total !== 100 && ' — 100%가 되도록 맞춰주세요'}
      </div>
    </div>
  )
}

function SaveFooter({
  updatedBy,
  updatedAt,
  disabled,
  onSave,
}: {
  updatedBy?: string
  updatedAt?: string
  disabled: boolean
  onSave: () => void
}) {
  return (
    <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--color-border-soft)' }}>
      <div className="text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
        마지막 수정 {updatedBy ?? '—'} · {updatedAt ?? '—'}
      </div>
      <Button size="sm" fullWidth={false} disabled={disabled} onClick={onSave}>
        변경사항 저장
      </Button>
    </div>
  )
}

function PersonaPanel() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const config = useAdminStore((s) => s.aiPersonaConfig)
  const updatePersonaConfig = useAdminStore((s) => s.updatePersonaConfig)
  const canEdit = hasRole(adminUser?.role, 'admin')

  const [weights, setWeights] = useState<AiWeightItem[]>(config.weights)
  const [emptyStateText, setEmptyStateText] = useState(config.emptyStateText)
  const total = weights.reduce((sum, w) => sum + w.weight, 0)
  const dirty = JSON.stringify(weights) !== JSON.stringify(config.weights) || emptyStateText !== config.emptyStateText

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 평판 키워드·직함·취향(음악/운동/카페/책)을 조합해 15~30자 한 줄 문구를 생성합니다
        (lib/personaGen.ts, 규칙 기반 템플릿). 매주 자동 갱신되며 현재 수동 편집은 지원하지 않습니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>기능 활성화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>끄면 프로필에 페르소나 문구가 노출되지 않습니다</div>
          </div>
          <ToggleSwitch checked={config.enabled} disabled={!canEdit} onChange={(v) => updatePersonaConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>매주 자동 갱신</div>
          <ToggleSwitch checked={config.autoRefreshWeekly} disabled={!canEdit} onChange={(v) => updatePersonaConfig({ autoRefreshWeekly: v }, `자동 갱신 ${v ? 'ON' : 'OFF'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>수동 편집 허용</div>
          <ToggleSwitch checked={config.manualEditAllowed} disabled={!canEdit} onChange={(v) => updatePersonaConfig({ manualEditAllowed: v }, `수동 편집 ${v ? '허용' : '금지'}`)} />
        </div>
        {!canEdit && <div className="mt-3"><RoleLockNotice required="admin" /></div>}
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 가중치</div>
        <WeightEditor weights={weights} onChange={setWeights} disabled={!canEdit} />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>근거 부족 시 노출 문구</div>
        <textarea
          disabled={!canEdit}
          value={emptyStateText}
          onChange={(e) => setEmptyStateText(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!canEdit || !dirty || total !== 100}
          onSave={() => updatePersonaConfig({ weights, emptyStateText }, `가중치·문구 수정 (합계 ${total}%)`)}
        />
      </AdminCard>
    </div>
  )
}

function BioPanel() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const config = useAdminStore((s) => s.aiBioConfig)
  const updateBioConfig = useAdminStore((s) => s.updateBioConfig)
  const canEdit = hasRole(adminUser?.role, 'admin')

  const [weights, setWeights] = useState<AiWeightItem[]>(config.weights)
  const [promptTemplate, setPromptTemplate] = useState(config.promptTemplate)
  const [maxLength, setMaxLength] = useState(String(config.maxLength))
  const total = weights.reduce((sum, w) => sum + w.weight, 0)
  const dirty =
    JSON.stringify(weights) !== JSON.stringify(config.weights) ||
    promptTemplate !== config.promptTemplate ||
    Number(maxLength) !== config.maxLength

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 내 바이로 &gt; 기본정보 편집의 &quot;AI로 채우기&quot; 버튼은 현재 토스트만 노출하는
        스텁이며(components/screens/me/MyByroBasicInfoScreen.tsx) 실제 생성 로직과 연결되어 있지 않습니다. 아래 값은 추후 서버 사이드
        LLM 연동 시 사용할 가중치·프롬프트 초안입니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>기능 활성화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>&quot;AI로 채우기&quot; 버튼 노출 여부</div>
          </div>
          <ToggleSwitch checked={config.enabled} disabled={!canEdit} onChange={(v) => updateBioConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>버튼 탭마다 재생성</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>확인 없이 기존 자기소개를 덮어씁니다</div>
          </div>
          <ToggleSwitch
            checked={config.regenerateOnEveryClick}
            disabled={!canEdit}
            onChange={(v) => updateBioConfig({ regenerateOnEveryClick: v }, `재생성 정책 ${v ? '탭마다 덮어쓰기' : '확인 후 덮어쓰기'}`)}
          />
        </div>
        {!canEdit && <div className="mt-3"><RoleLockNotice required="admin" /></div>}
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 가중치</div>
        <WeightEditor weights={weights} onChange={setWeights} disabled={!canEdit} />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>최대 입력 길이</div>
        <input
          type="number"
          disabled={!canEdit}
          value={maxLength}
          onChange={(e) => setMaxLength(e.target.value)}
          className="mt-2 w-[100px] rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 프롬프트 템플릿</div>
        <textarea
          disabled={!canEdit}
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!canEdit || !dirty || total !== 100 || !maxLength.trim()}
          onSave={() =>
            updateBioConfig(
              { weights, promptTemplate, maxLength: Number(maxLength) || config.maxLength },
              `가중치·프롬프트 수정 (합계 ${total}%)`,
            )
          }
        />
      </AdminCard>
    </div>
  )
}

function KemiPanel() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const config = useAdminStore((s) => s.aiKemiConfig)
  const updateKemiConfig = useAdminStore((s) => s.updateKemiConfig)
  const canEdit = hasRole(adminUser?.role, 'admin')

  const [weights, setWeights] = useState<AiWeightItem[]>(config.weights)
  const [copyPromptTemplate, setCopyPromptTemplate] = useState(config.copyPromptTemplate)
  const total = weights.reduce((sum, w) => sum + w.weight, 0)
  const dirty = JSON.stringify(weights) !== JSON.stringify(config.weights) || copyPromptTemplate !== config.copyPromptTemplate

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 방문자와의 공통점 매칭·점수 산정 로직이 아직 없어 케미 카드의 매칭 수·대화 시작
        문구(aiCopy)는 목업에 하드코딩되어 있습니다(docs/data-pipeline.md &quot;공통점 감지&quot; 섹션 TODO). 아래 값은 추후 서버 구현 시
        사용할 매칭 카테고리 가중치·문구 프롬프트 초안입니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>기능 활성화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>끄면 프로필에 케미 카드가 노출되지 않습니다</div>
          </div>
          <ToggleSwitch checked={config.enabled} disabled={!canEdit} onChange={(v) => updateKemiConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>프로필 수정 시 캐시 무효화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>오너가 프로필을 수정하면 케미 결과를 재계산합니다</div>
          </div>
          <ToggleSwitch
            checked={config.cacheInvalidateOnProfileEdit}
            disabled={!canEdit}
            onChange={(v) => updateKemiConfig({ cacheInvalidateOnProfileEdit: v }, `캐시 무효화 ${v ? 'ON' : 'OFF'}`)}
          />
        </div>
        {!canEdit && <div className="mt-3"><RoleLockNotice required="admin" /></div>}
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>매칭 카테고리 가중치</div>
        <WeightEditor weights={weights} onChange={setWeights} disabled={!canEdit} />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>대화 시작 문구(aiCopy) 프롬프트 템플릿</div>
        <textarea
          disabled={!canEdit}
          value={copyPromptTemplate}
          onChange={(e) => setCopyPromptTemplate(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!canEdit || !dirty || total !== 100}
          onSave={() => updateKemiConfig({ weights, copyPromptTemplate }, `가중치·프롬프트 수정 (합계 ${total}%)`)}
        />
      </AdminCard>
    </div>
  )
}

export default function AiScreen() {
  const [tab, setTab] = useState<AiFeatureKey>('persona')

  return (
    <div>
      <SectionHeading title="AI 관리" description="AI 페르소나·자기소개·케미 리포트의 생성 기준(가중치)과 정책을 관리합니다. (AI-01~03)" />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Chip key={t.key} label={t.label} selected={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {tab === 'persona' && <PersonaPanel />}
      {tab === 'bio' && <BioPanel />}
      {tab === 'kemi' && <KemiPanel />}
    </div>
  )
}
