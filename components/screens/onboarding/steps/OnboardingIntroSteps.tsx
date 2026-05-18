'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Camera } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, CheckRow, InfoBox, TextArea, showToast } from '@/components/ui'
import { StepFooter, StepIntro } from '@/components/screens/onboarding/OnboardingShared'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

export function Step1Login() {
  const store = useByroStore()
  const { agreedTerms, agreedPrivacy, agreedMarketing } = store
  const allChecked = agreedTerms && agreedPrivacy && agreedMarketing
  const canProceed = agreedTerms && agreedPrivacy

  const handleSocial = () => {
    if (!canProceed) return
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      <div className="surface-card rounded-[32px] px-5 py-6 text-center mb-5">
        <div className="micro-text uppercase tracking-[0.18em] mb-2">Branding Profile</div>
        <div className="text-3xl font-black mb-2">Byro</div>
        <div className="meta-text mt-3 leading-relaxed">
          진짜 나를 보여주는 프로필.
          <br />
          만난 사람에게 바로 공유할 수 있어요.
        </div>
      </div>

      <div className="surface-card-soft rounded-[24px] p-4 mb-4">
        <div className="pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          <CheckRow label="전체 동의" checked={allChecked} onToggle={store.toggleAllAgreed} />
        </div>
        <CheckRow
          label="[필수] 서비스 이용약관"
          checked={agreedTerms}
          onToggle={() => store.setAgreedTerms(!agreedTerms)}
          onDetail={() => {}}
        />
        <CheckRow
          label="[필수] 개인정보 처리방침"
          checked={agreedPrivacy}
          onToggle={() => store.setAgreedPrivacy(!agreedPrivacy)}
          onDetail={() => {}}
        />
        <CheckRow
          label="[선택] 마케팅 정보 수신 동의"
          checked={agreedMarketing}
          onToggle={() => store.setAgreedMarketing(!agreedMarketing)}
          onDetail={() => {}}
        />
      </div>

      <div className="space-y-3">
        <Button variant="kakao" disabled={!canProceed} onClick={handleSocial}>카카오로 시작하기</Button>
        <Button variant="google" disabled={!canProceed} onClick={handleSocial}>G  구글로 시작하기</Button>
        <Button variant="naver" disabled={!canProceed} onClick={handleSocial}>N  네이버로 시작하기</Button>
      </div>
    </div>
  )
}

export function Step3LinkId() {
  const store = useByroStore()
  const [input, setInput] = useState(store.linkId)
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')

  const LINK_REGEX = /^[a-z0-9_]{2,20}$/

  const handleChange = (value: string) => {
    setInput(value)
    store.setLinkId(value)
    if (value.length === 0) setStatus('idle')
    else if (LINK_REGEX.test(value)) setStatus('valid')
    else setStatus('error')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Link"
        title={'나만의 Byro 링크를\n만들어보세요'}
        description={'한 번 정하면 바꾸기 어려워요.\n공유하기 쉬운 이름을 추천해요.'}
      />
      <InfoBox variant="warn">
        지금은 무료로 만들 수 있어요.
        <br />
        정식 출시 후에는 유료로 전환될 수 있어요.
      </InfoBox>

      <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Byro 링크 ID</label>
      <input
        value={input}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="예: myongkoo"
        className={[
          'w-full border rounded-xl px-4 py-3 text-sm outline-none mb-1',
          status === 'valid' ? 'border-[var(--color-state-success-text)]' : status === 'error' ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]',
        ].join(' ')}
      />
      {status === 'valid' && <p className="text-xs text-[var(--color-state-success-text)] mb-3">사용할 수 있는 ID예요</p>}
      {status === 'error' && <p className="text-xs text-[var(--color-state-danger-text)] mb-3">영문 소문자, 숫자, 밑줄(_)만 가능 · 2~20자</p>}
      <p className="meta-text mb-6">· 영문 소문자, 숫자, 밑줄(_) &nbsp;· 2~20자 이내</p>
      {input && status !== 'error' && (
        <div className="surface-card-soft rounded-2xl px-4 py-3 mb-5">
          <div className="micro-text mb-1">미리보기</div>
          <div className="text-sm font-semibold text-[var(--color-text-strong)]">byro.io/@{input}</div>
        </div>
      )}

      <StepFooter
        canNext={status === 'valid'}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
      />
    </div>
  )
}

const MBTI_DIMS = [
  { options: ['E', 'I'] as const, labels: ['외향', '내향'] },
  { options: ['N', 'S'] as const, labels: ['직관', '감각'] },
  { options: ['T', 'F'] as const, labels: ['사고', '감정'] },
  { options: ['J', 'P'] as const, labels: ['판단', '인식'] },
]

export function Step4Profile() {
  const store = useByroStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarImage, setAvatarImage] = useState('')
  const [mbti, setMbti] = useState('')
  const [bio, setBio] = useState('')

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatarImage(reader.result as string)
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleNext = () => {
    store.completeOnboarding()
    if (avatarImage) store.updateUserInfo({ avatarImage, profileImages: [avatarImage] })
    if (bio.trim()) store.updateUserInfo({ bio: bio.trim() })
    if (mbti.length === 4) store.updateUserWhoIAm({ ...SAMPLE_PROFILE.whoIAm, mbti })
    store.goToStep('complete')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Profile"
        title={'프로필을\n채워볼까요?'}
        description={'나중에 편집에서 언제든 바꿀 수 있어요.'}
      />

      {/* 프로필 사진 */}
      <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
      <div className="mb-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] transition-opacity active:opacity-70"
        >
          {avatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarImage} alt="프로필" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--color-text-tertiary)]">
              <Camera size={22} />
              <span className="text-[10px] font-semibold">사진 추가</span>
            </div>
          )}
        </button>
        {avatarImage && (
          <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-semibold text-[var(--color-accent-dark)]">
            변경하기
          </button>
        )}
      </div>

      {/* MBTI */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--color-text-tertiary)]">MBTI</label>
          {mbti && <span className="text-sm font-bold text-[var(--color-text-primary)]">{mbti}</span>}
        </div>
        <div className="space-y-2">
          {MBTI_DIMS.map((dim, dimIndex) => {
            const selectedLetter = mbti[dimIndex] ?? ''
            return (
              <div key={dimIndex} className="flex overflow-hidden rounded-xl border border-[var(--color-border-default)]">
                {dim.options.map((letter, optIndex) => {
                  const isSelected = selectedLetter === letter
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        const parts = (mbti || '    ').split('')
                        parts[dimIndex] = letter
                        setMbti(parts.join('').trimEnd())
                      }}
                      className="flex-1 py-2.5 px-4 text-left transition-colors"
                      style={{
                        background: isSelected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        borderRight: optIndex === 0 ? '1px solid var(--color-border-default)' : undefined,
                      }}
                    >
                      <span className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>{letter}</span>
                      <span className={`ml-1.5 text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--color-text-tertiary)]'}`}>{dim.labels[optIndex]}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* 자기소개 */}
      <div className="mb-6">
        <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">자기소개</label>
        <TextArea
          value={bio}
          onChange={setBio}
          placeholder="예: 창업 3년차. 사람을 만나고 연결하는 걸 좋아합니다."
          rows={3}
          maxLength={200}
        />
      </div>

      <StepFooter
        canNext
        onNext={handleNext}
        onPrev={() => store.prevStep()}
        onSkip={handleNext}
        skipLabel="건너뛰기"
      />
    </div>
  )
}
