'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, SectionHeading, ToggleSwitch } from '@/components/admin/ui'
import { Button, Chip } from '@/components/ui'
import type { AiFeatureKey, AiWeightItem, KemiBlockConfig } from '@/types/admin'

const TABS: { key: AiFeatureKey; label: string }[] = [
  { key: 'persona', label: 'AI 페르소나' },
  { key: 'bio', label: 'AI 자기소개' },
  { key: 'kemi', label: '케미 리포트' },
  { key: 'search', label: 'AI 검색' },
  { key: 'virtual', label: '가상 프로필' },
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
  const config = useAdminStore((s) => s.aiPersonaConfig)
  const updatePersonaConfig = useAdminStore((s) => s.updatePersonaConfig)

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
          <ToggleSwitch checked={config.enabled} onChange={(v) => updatePersonaConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>매주 자동 갱신</div>
          <ToggleSwitch checked={config.autoRefreshWeekly} onChange={(v) => updatePersonaConfig({ autoRefreshWeekly: v }, `자동 갱신 ${v ? 'ON' : 'OFF'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>수동 편집 허용</div>
          <ToggleSwitch checked={config.manualEditAllowed} onChange={(v) => updatePersonaConfig({ manualEditAllowed: v }, `수동 편집 ${v ? '허용' : '금지'}`)} />
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 가중치</div>
        <WeightEditor weights={weights} onChange={setWeights} />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>근거 부족 시 노출 문구</div>
        <textarea
          value={emptyStateText}
          onChange={(e) => setEmptyStateText(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!dirty || total !== 100}
          onSave={() => updatePersonaConfig({ weights, emptyStateText }, `가중치·문구 수정 (합계 ${total}%)`)}
        />
      </AdminCard>
    </div>
  )
}

function BioPanel() {
  const config = useAdminStore((s) => s.aiBioConfig)
  const updateBioConfig = useAdminStore((s) => s.updateBioConfig)

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
          <ToggleSwitch checked={config.enabled} onChange={(v) => updateBioConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>버튼 탭마다 재생성</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>확인 없이 기존 자기소개를 덮어씁니다</div>
          </div>
          <ToggleSwitch
            checked={config.regenerateOnEveryClick}
            onChange={(v) => updateBioConfig({ regenerateOnEveryClick: v }, `재생성 정책 ${v ? '탭마다 덮어쓰기' : '확인 후 덮어쓰기'}`)}
          />
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 가중치</div>
        <WeightEditor weights={weights} onChange={setWeights} />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>최대 입력 길이</div>
        <input
          type="number"
          value={maxLength}
          onChange={(e) => setMaxLength(e.target.value)}
          className="mt-2 w-[100px] rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <div className="mt-4 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 프롬프트 템플릿</div>
        <textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!dirty || total !== 100 || !maxLength.trim()}
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

function KemiBlockCard({ block }: { block: KemiBlockConfig }) {
  const updateKemiBlock = useAdminStore((s) => s.updateKemiBlock)
  const [condition, setCondition] = useState(block.unlockCondition)
  const dirty = condition !== block.unlockCondition

  return (
    <AdminCard className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{block.label}</div>
          <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>{block.description}</div>
        </div>
        <ToggleSwitch checked={block.enabled} onChange={(v) => updateKemiBlock(block.key, { enabled: v })} />
      </div>
      <div className="mb-1 text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>잠금 해제 조건</div>
      <textarea
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        rows={1}
        className="w-full rounded-lg border px-3 py-2 text-[13px]"
        style={{ borderColor: 'var(--color-border-default)' }}
      />
      <div className="mt-2 flex justify-end">
        <Button size="sm" fullWidth={false} disabled={!dirty} onClick={() => updateKemiBlock(block.key, { unlockCondition: condition })}>
          조건 저장
        </Button>
      </div>
    </AdminCard>
  )
}

function KemiPanel() {
  const config = useAdminStore((s) => s.aiKemiConfig)
  const updateKemiConfig = useAdminStore((s) => s.updateKemiConfig)
  const toggleKemiKeywordCategory = useAdminStore((s) => s.toggleKemiKeywordCategory)

  const [completenessWeights, setCompletenessWeights] = useState<AiWeightItem[]>(config.completenessWeights)
  const [copyPromptTemplate, setCopyPromptTemplate] = useState(config.copyPromptTemplate)
  const [dailyLimitFree, setDailyLimitFree] = useState(String(config.dailyLimitFree))
  const total = completenessWeights.reduce((sum, w) => sum + w.weight, 0)
  const weightsDirty = JSON.stringify(completenessWeights) !== JSON.stringify(config.completenessWeights)
  const promptDirty = copyPromptTemplate !== config.copyPromptTemplate
  const limitDirty = dailyLimitFree !== String(config.dailyLimitFree)

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 방문자와의 공통점 매칭·점수 산정 로직이 아직 없어 케미 카드의 매칭 수·대화 시작
        문구(aiCopy)는 목업에 하드코딩되어 있습니다. 블록 구성·잠금 조건·완성도 기준·열람 제한은 Notion &quot;케미 정책(미완)&quot; 문서를
        기준으로 하며, 아래 값은 그 정책을 반영한 설정 초안입니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>기능 활성화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>끄면 프로필에 케미 카드가 노출되지 않습니다</div>
          </div>
          <ToggleSwitch checked={config.enabled} onChange={(v) => updateKemiConfig({ enabled: v }, `기능 ${v ? '활성화' : '비활성화'}`)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>프로필 수정 시 캐시 무효화</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>오너가 프로필을 수정하면 케미 결과를 재계산합니다 (케미 정책 §6)</div>
          </div>
          <ToggleSwitch
            checked={config.cacheInvalidateOnProfileEdit}
            onChange={(v) => updateKemiConfig({ cacheInvalidateOnProfileEdit: v }, `캐시 무효화 ${v ? 'ON' : 'OFF'}`)}
          />
        </div>
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>완성도(%) 계산 기준 (케미 정책 §3)</div>
        <WeightEditor weights={completenessWeights} onChange={setCompletenessWeights} />
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!weightsDirty || total !== 100}
          onSave={() => updateKemiConfig({ completenessWeights }, `완성도 계산 기준 수정 (합계 ${total}%)`)}
        />
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>공통점 키워드 카테고리 (케미 정책 §7)</div>
        <div className="space-y-2">
          {config.keywordCategories.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border-soft)' }}>
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{c.label}</div>
              <ToggleSwitch checked={c.allowed} onChange={(v) => toggleKemiKeywordCategory(c.key, v)} />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>대화스타터(aiCopy) 프롬프트 템플릿</div>
        <textarea
          value={copyPromptTemplate}
          onChange={(e) => setCopyPromptTemplate(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-[13px]"
          style={{ borderColor: 'var(--color-border-default)' }}
        />
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!promptDirty}
          onSave={() => updateKemiConfig({ copyPromptTemplate }, '대화스타터 프롬프트 수정')}
        />
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>열람 제한 (케미 정책 §5)</div>
        <div className="mb-3 flex items-center gap-3">
          <div className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Free 일일 열람 횟수</div>
          <input
            type="number"
            min={0}
            value={dailyLimitFree}
            onChange={(e) => setDailyLimitFree(e.target.value)}
            className="w-[80px] rounded-lg border px-3 py-1.5 text-[13px]"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
          <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>매일 자정 초기화</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Pro 무제한</div>
          <ToggleSwitch checked={config.proUnlimited} onChange={(v) => updateKemiConfig({ proUnlimited: v }, `Pro 무제한 ${v ? 'ON' : 'OFF'}`)} />
        </div>
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!limitDirty}
          onSave={() => updateKemiConfig({ dailyLimitFree: Number(dailyLimitFree) || 0 }, `Free 일일 열람 횟수 수정 (${dailyLimitFree}회)`)}
        />
      </AdminCard>

      <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>블록별 설정 (케미 정책 §1~2)</div>
      {config.blocks.map((block) => (
        <KemiBlockCard key={block.key} block={block} />
      ))}
    </div>
  )
}

function SearchPanel() {
  const config = useAdminStore((s) => s.aiSearchConfig)
  const updateSearchConfig = useAdminStore((s) => s.updateSearchConfig)
  const toggleSearchCategory = useAdminStore((s) => s.toggleSearchCategory)

  const [model, setModel] = useState(config.model)
  const [temperature, setTemperature] = useState(String(config.temperature))
  const [maxTokens, setMaxTokens] = useState(String(config.maxTokens))
  const globalDirty =
    model !== config.model || Number(temperature) !== config.temperature || Number(maxTokens) !== config.maxTokens

  const [selectedCategory, setSelectedCategory] = useState(config.categories[0].key)
  const category = config.categories.find((c) => c.key === selectedCategory) ?? config.categories[0]
  const [promptDraft, setPromptDraft] = useState(category.promptDraft)
  const promptDirty = promptDraft !== category.promptDraft

  const handleSelectCategory = (key: string) => {
    setSelectedCategory(key)
    setPromptDraft(config.categories.find((c) => c.key === key)?.promptDraft ?? '')
  }

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 마이 바이로 편집의 장소·미디어·음악 검색 피커(PlacePicker, MediaSearchPicker,
        MusicSearchPicker)에서 실제로 OpenAI API를 호출합니다(app/api/ai-search/route.ts). 카테고리별 전용 API(TMDB·Spotify·알라딘·Kakao
        Local) 연동 전까지의 폴백입니다. 아래 값은 참고·요청용 설정이며, 실제 반영에는 코드 배포가 필요합니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>AI 검색 전체 사용</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>끄면 모든 카테고리의 AI 검색을 사용하지 않습니다 (코드 반영 필요)</div>
          </div>
          <ToggleSwitch checked={config.enabled} onChange={(v) => updateSearchConfig({ enabled: v }, `전체 사용 ${v ? 'ON' : 'OFF'}`)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="mb-1 text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>모델</div>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
          </div>
          <div>
            <div className="mb-1 text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>temperature</div>
            <input
              type="number"
              step="0.1"
              min={0}
              max={2}
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
          </div>
          <div>
            <div className="mb-1 text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>max_tokens</div>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
          </div>
        </div>
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!globalDirty || !model.trim()}
          onSave={() =>
            updateSearchConfig(
              { model: model.trim(), temperature: Number(temperature) || config.temperature, maxTokens: Number(maxTokens) || config.maxTokens },
              `모델 설정 변경 (${model.trim()}, temp ${temperature})`,
            )
          }
        />
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>카테고리별 사용 여부</div>
        <div className="space-y-2">
          {config.categories.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border-soft)' }}>
              <div>
                <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{c.label}</div>
                <div className="text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>{c.replacementApi}</div>
              </div>
              <ToggleSwitch checked={c.enabled} onChange={(v) => toggleSearchCategory(c.key, v)} />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>카테고리별 프롬프트 초안</div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {config.categories.map((c) => (
            <Chip key={c.key} label={c.label} selected={selectedCategory === c.key} onClick={() => handleSelectCategory(c.key)} />
          ))}
        </div>
        <textarea
          value={promptDraft}
          onChange={(e) => setPromptDraft(e.target.value)}
          rows={6}
          className="w-full rounded-lg border px-3 py-2 font-mono text-[12px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!promptDirty}
          onSave={() => {
            const nextCategories = config.categories.map((c) => (c.key === category.key ? { ...c, promptDraft } : c))
            updateSearchConfig({ categories: nextCategories }, `${category.label} 프롬프트 초안 수정`)
          }}
        />
      </AdminCard>
    </div>
  )
}

function VirtualPanel() {
  const config = useAdminStore((s) => s.aiVirtualConfig)
  const updateVirtualConfig = useAdminStore((s) => s.updateVirtualConfig)
  const toggleVirtualSourceType = useAdminStore((s) => s.toggleVirtualSourceType)

  const [disclaimerText, setDisclaimerText] = useState(config.disclaimerText)
  const dirty = disclaimerText !== config.disclaimerText

  return (
    <div>
      <InfoBanner>
        구현 상태: <strong>{config.status}</strong> — 검색 결과에 노출되는 가상 프로필(비가입자를 공개 정보로 구조화한 추정 프로필)은
        현재 lib/mocks/virtualProfiles.ts에 고정된 3건뿐이며 실제 생성 로직은 없습니다. 본인이 실제 소유자임을 주장하는 클레임 요청은
        인증 검토(VRFY-02) 화면에서 별도로 심사합니다.
      </InfoBanner>

      <AdminCard className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>가상 프로필 노출</div>
            <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>끄면 검색 결과에 가상 프로필이 노출되지 않습니다</div>
          </div>
          <ToggleSwitch checked={config.enabled} onChange={(v) => updateVirtualConfig({ enabled: v }, `노출 ${v ? 'ON' : 'OFF'}`)} />
        </div>
      </AdminCard>

      <AdminCard className="mb-4">
        <div className="mb-3 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>생성 근거로 허용하는 출처</div>
        <div className="space-y-2">
          {config.sourceTypes.map((s) => (
            <div key={s.key} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border-soft)' }}>
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{s.label}</div>
              <ToggleSwitch checked={s.allowed} onChange={(v) => toggleVirtualSourceType(s.key, v)} />
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-2 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>안내 문구</div>
        <textarea
          value={disclaimerText}
          onChange={(e) => setDisclaimerText(e.target.value)}
          rows={2}
          className="w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />
        <SaveFooter
          updatedBy={config.updatedBy}
          updatedAt={config.updatedAt}
          disabled={!dirty || !disclaimerText.trim()}
          onSave={() => updateVirtualConfig({ disclaimerText: disclaimerText.trim() }, '안내 문구 수정')}
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
      {tab === 'search' && <SearchPanel />}
      {tab === 'virtual' && <VirtualPanel />}
    </div>
  )
}
