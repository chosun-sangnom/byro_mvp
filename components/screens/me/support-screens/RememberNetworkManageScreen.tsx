'use client'

import { useEffect, useRef, useState } from 'react'
import { Mail, Copy, ScanLine, Sparkles } from 'lucide-react'
import { NavBar, showToast } from '@/components/ui'
import { useByroStore } from '@/store/useByroStore'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { ProfileRememberSection } from '@/components/screens/profile/PublicProfileSections'

const DOMAIN_OPTIONS = [
  'IT/테크', '스타트업', '금융/투자', '마케팅/PR',
  '대기업/제조', '컨설팅', '미디어/언론', '교육/연구',
  '의료/바이오', '유통/물류', '건설/부동산', '에너지',
]

type ImportStep = 'idle' | 'analyzing' | 'imported'

// [임시] 명함 인식 결과 목업 — 개인별 명함 데이터는 저장하지 않으므로
// 강민준(SAMPLE_PROFILE)의 실제 리멤버 네트워크 집계를 그대로 미리보기에 사용
const MOCK_IMPORTED_NETWORK = SAMPLE_PROFILE.rememberHighlight


export function RememberNetworkManageScreen({
  userLinkId,
  onBack,
}: {
  userLinkId: string
  onBack: () => void
}) {
  const store = useByroStore()

  const [importStep, setImportStep] = useState<ImportStep>('idle')
  const analyzeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current)
    }
  }, [])

  const currentDomain = store.user?.networkDomain
  const isCustom = currentDomain ? !DOMAIN_OPTIONS.includes(currentDomain) : false

  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(isCustom ? 'custom' : currentDomain)
  const [customDomain, setCustomDomain] = useState(isCustom ? (currentDomain ?? '') : '')

  const effectiveDomain = selectedDomain === 'custom' ? (customDomain.trim() || undefined) : selectedDomain

  const email = `${userLinkId}@data.byro.io`

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email).catch(() => {})
    showToast('이메일 주소가 복사됐어요!')
  }

  const handleChipSelect = (domain: string) => {
    setSelectedDomain((prev) => (prev === domain ? undefined : domain))
    if (domain !== 'custom') setCustomDomain('')
  }

  const handleSaveDomain = () => {
    store.updateNetworkDomain(effectiveDomain)
    showToast(effectiveDomain ? `'${effectiveDomain}' 도메인으로 설정됐어요` : '관심 도메인이 해제됐어요')
  }

  const handleConfirm = () => {
    setImportStep('analyzing')
    // [임시] 실제 명함 확인 대신 1.2초 딜레이 후 목업 결과 표시
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
            <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>보내주신 파일을 분석하고 있어요</p>
          </div>
        </div>
      </div>
    )
  }

  if (importStep === 'imported') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="네트워크 업데이트" onBack={() => setImportStep('idle')} />
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
            profileName={store.user?.name ?? '나'}
            total={MOCK_IMPORTED_NETWORK.total}
            industries={MOCK_IMPORTED_NETWORK.industries}
            topIndustryRanks={MOCK_IMPORTED_NETWORK.topIndustryRanks}
            topIndustryRoles={MOCK_IMPORTED_NETWORK.topIndustryRoles}
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
            설정하면 다른 사람의 네트워크 탭에서 내 관심 분야와 얼마나 겹치는지 인사이트를 볼 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((domain) => {
              const selected = domain === selectedDomain
              return (
                <button
                  key={domain}
                  onClick={() => handleChipSelect(domain)}
                  className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
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
            {/* 직접입력 칩 */}
            <button
              onClick={() => handleChipSelect('custom')}
              className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                borderColor: selectedDomain === 'custom' ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                background: selectedDomain === 'custom' ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                color: selectedDomain === 'custom' ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              직접입력
            </button>
          </div>

          {/* 직접입력 선택 시 텍스트 필드 */}
          {selectedDomain === 'custom' && (
            <div className="mt-3">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="예) 카카오"
                maxLength={30}
                autoFocus
                className="w-full rounded-[14px] border px-4 py-3 text-[13px] outline-none"
                style={{
                  borderColor: customDomain.trim() ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                  background: 'var(--color-bg-soft)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                특정 기업·분야 등 더 세부적인 도메인을 입력하면 더 정밀한 인사이트를 받을 수 있어요.
              </p>
            </div>
          )}

          <button
            onClick={handleSaveDomain}
            className="mt-4 w-full rounded-full py-2.5 text-[13px] font-bold text-white"
            style={{ background: 'var(--color-accent-dark)' }}
          >
            저장
          </button>
        </div>

        {/* 업데이트 방법 */}
        <div className="rounded-[22px] border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] mb-3" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}>
              <Mail size={18} />
            </div>
            <p className="text-[16px] font-black tracking-[-0.02em]" style={{ color: 'var(--color-text-primary)' }}>
              네트워크 업데이트
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: 'var(--color-text-secondary)' }}>
              리멤버 앱에서 명함을 내보내기 한 뒤, 아래 이메일로 파일을 보내주세요.
              확인 후 1-2 영업일 내에 반영돼요.
            </p>
          </div>

          <div className="mx-5 mb-5 rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
              나의 Byro 인증 이메일
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 truncate text-[13px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {email}
              </p>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: 'var(--color-accent-dark)' }}
              >
                <Copy size={11} />
                복사
              </button>
            </div>
          </div>

          {/* 단계별 안내 */}
          <div className="px-5 pb-5 space-y-2">
            {[
              '리멤버 앱 → 명함첩 → 우측 상단 메뉴 → 내보내기',
              '내보낸 파일을 위 이메일로 첨부해서 보내기',
              '확인 후 네트워크 데이터가 업데이트돼요',
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

          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              메일 보냈어요
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
