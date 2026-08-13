'use client'

import { useEffect, useRef, useState } from 'react'
import { FileSpreadsheet, Upload, ScanLine, Sparkles, X } from 'lucide-react'
import { NavBar, showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { ProfileRememberSection } from '@/components/screens/profile/PublicProfileSections'

const DOMAIN_OPTIONS = [
  'IT/테크', '스타트업', '금융/투자', '마케팅/PR',
  '대기업/제조', '컨설팅', '미디어/언론', '교육/연구',
  '의료/바이오', '유통/물류', '건설/부동산', '에너지',
]

// 그래프/범례에 한 번에 보여줄 수 있는 개수가 최대 3개라, 관심 도메인도 직접입력 포함 최대 3개로 제한
const MAX_DOMAINS = 3

type ImportStep = 'idle' | 'analyzing' | 'imported'

// [임시] 명함 인식 결과 목업 — 개인별 명함 데이터는 저장하지 않으므로
// 강민준(SAMPLE_PROFILE)의 실제 리멤버 네트워크 집계를 그대로 미리보기에 사용
const MOCK_IMPORTED_NETWORK = SAMPLE_PROFILE.rememberHighlight


export function RememberNetworkManageScreen({
  onBack,
}: {
  onBack: () => void
}) {
  const store = useFeloreStore()

  const [importStep, setImportStep] = useState<ImportStep>('idle')
  const analyzeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current)
    }
  }, [])

  const [selectedDomains, setSelectedDomains] = useState<string[]>(store.user?.networkDomains ?? [])
  const [customInput, setCustomInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const customDomains = selectedDomains.filter((d) => !DOMAIN_OPTIONS.includes(d))

  const handleSelectFile = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
    e.target.value = ''
  }

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) return prev.filter((d) => d !== domain)
      if (prev.length >= MAX_DOMAINS) {
        showToast(`관심 도메인은 최대 ${MAX_DOMAINS}개까지 선택할 수 있어요`)
        return prev
      }
      return [...prev, domain]
    })
  }

  const handleAddCustomDomain = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (selectedDomains.length >= MAX_DOMAINS && !selectedDomains.includes(trimmed)) {
      showToast(`관심 도메인은 최대 ${MAX_DOMAINS}개까지 선택할 수 있어요`)
      return
    }
    setSelectedDomains((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setCustomInput('')
  }

  const handleSaveDomains = () => {
    store.updateNetworkDomains(selectedDomains)
    showToast(
      selectedDomains.length > 0
        ? `관심 도메인 ${selectedDomains.length}개로 설정됐어요`
        : '관심 도메인이 해제됐어요'
    )
  }

  const handleConfirm = () => {
    if (!selectedFile) return
    setImportStep('analyzing')
    // [임시] 실제 엑셀 파싱 대신 1.2초 딜레이 후 목업 결과 표시
    analyzeTimeoutRef.current = setTimeout(() => {
      setImportStep('imported')
    }, 1200)
  }

  const handleApply = () => {
    showToast('네트워크에 반영됐어요!')
    onBack()
  }

  if (importStep === 'analyzing') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="네트워크 업데이트" onBack={onBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
          >
            <ScanLine size={26} className="animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>명함을 확인하고 있어요</p>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>업로드하신 엑셀 파일을 분석하고 있어요</p>
          </div>
        </div>
      </div>
    )
  }

  if (importStep === 'imported') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="네트워크 업데이트" onBack={() => { setImportStep('idle'); setSelectedFile(null) }} />
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="flex flex-col items-center text-center px-5 pt-6 pb-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full mb-3"
              style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
            >
              <Sparkles size={24} />
            </div>
            <p className="text-[16px] font-black tracking-[-0.02em]" style={{ color: 'var(--color-text-primary)' }}>
              명함 {MOCK_IMPORTED_NETWORK.total}장을 가져왔어요!
            </p>
            <p className="mt-1 text-[13px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
              확인을 누르면 아래 내용으로 내 네트워크에 반영돼요
            </p>
          </div>

          <ProfileRememberSection
            total={MOCK_IMPORTED_NETWORK.total}
            industries={MOCK_IMPORTED_NETWORK.industries}
            topIndustryRanks={MOCK_IMPORTED_NETWORK.topIndustryRanks}
            isLoggedIn={false}
            isOwner
          />

          <div className="px-5 mt-4">
            <button
              type="button"
              onClick={handleApply}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="리멤버 네트워크" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* 관심 도메인 설정 */}
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            관심 도메인
          </p>
          <p className="mb-3 text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            설정하면 다른 사람의 네트워크 탭에서 내 관심 분야와 얼마나 겹치는지 인사이트를 볼 수 있어요. 직접 입력 포함 최대 {MAX_DOMAINS}개까지 선택할 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((domain) => {
              const selected = selectedDomains.includes(domain)
              const disabled = !selected && selectedDomains.length >= MAX_DOMAINS
              return (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  disabled={disabled}
                  className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-40"
                  style={{
                    borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                    background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                    color: selected ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {domain}
                </button>
              )
            })}
            {/* 직접 추가한 도메인 칩 */}
            {customDomains.map((domain) => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: 'var(--color-accent-dark)' }}
              >
                {domain}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>

          {/* 직접입력 */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomDomain() } }}
              placeholder="예) 카카오"
              maxLength={30}
              className="flex-1 rounded-[14px] border px-4 py-3 text-[13px] outline-none"
              style={{
                borderColor: customInput.trim() ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                background: 'var(--color-bg-soft)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              onClick={handleAddCustomDomain}
              disabled={!customInput.trim() || selectedDomains.length >= MAX_DOMAINS}
              className="shrink-0 rounded-[14px] px-4 text-[13px] font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              추가
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
            {selectedDomains.length >= MAX_DOMAINS
              ? `최대 ${MAX_DOMAINS}개까지 선택했어요. 다른 도메인을 추가하려면 하나를 해제해주세요.`
              : '특정 기업·분야 등 더 세부적인 도메인을 입력하면 더 정밀한 인사이트를 받을 수 있어요.'}
          </p>

          <button
            onClick={handleSaveDomains}
            className="mt-4 w-full rounded-full py-2.5 text-[13px] font-bold text-white"
            style={{ background: 'var(--color-accent-dark)' }}
          >
            저장{selectedDomains.length > 0 ? ` (${selectedDomains.length})` : ''}
          </button>
        </div>

        {/* 업데이트 방법 */}
        <div className="rounded-[22px] border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] mb-3" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}>
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-[16px] font-black tracking-[-0.02em]" style={{ color: 'var(--color-text-primary)' }}>
              네트워크 업데이트
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: 'var(--color-text-secondary)' }}>
              리멤버 앱에서 명함을 엑셀로 내보내기 한 뒤, 아래에서 파일을 업로드해주세요.
              업로드하면 바로 반영돼요.
            </p>
          </div>

          {/* 단계별 안내 */}
          <div className="px-5 pb-5 space-y-2">
            {[
              '리멤버 앱 → 명함첩 → 우측 상단 메뉴 → 엑셀로 내보내기',
              '아래에서 내보낸 엑셀 파일을 업로드',
              '업로드하면 바로 네트워크 데이터가 업데이트돼요',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ background: 'var(--color-accent-dark)' }}
                >
                  {i + 1}
                </span>
                <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* 파일 업로드 */}
          <div className="px-5 pb-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div
                className="flex items-center gap-3 rounded-[16px] px-4 py-3.5"
                style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
                >
                  <FileSpreadsheet size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {(selectedFile.size / 1024).toFixed(0)}KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="shrink-0 rounded-full p-1.5"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label="파일 선택 취소"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSelectFile}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-[16px] py-6"
                style={{ border: '1.5px dashed var(--color-border-default)', background: 'var(--color-bg-soft)' }}
              >
                <Upload size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  엑셀 파일 선택 (.xlsx, .csv)
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedFile}
              className="mt-3 w-full rounded-full py-3.5 text-[14px] font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              업로드하기
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
