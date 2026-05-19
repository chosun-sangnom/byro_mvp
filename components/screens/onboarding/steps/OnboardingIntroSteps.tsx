'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, CheckCircle2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, TextArea, showToast } from '@/components/ui'
import { StepFooter, StepIntro } from '@/components/screens/onboarding/OnboardingShared'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

export function Step1Login() {
  const store = useByroStore()

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
      <div className="space-y-3">
        <Button variant="kakao" onClick={() => store.nextStep()}>카카오로 시작하기</Button>
        <Button variant="google" onClick={() => store.nextStep()}>G  구글로 시작하기</Button>
        <Button variant="naver" onClick={() => store.nextStep()}>N  네이버로 시작하기</Button>
      </div>
      <p className="micro-text text-center mt-6">
        시작하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
      </p>
    </div>
  )
}

export function Step2BasicInfo() {
  const store = useByroStore()
  const [nickname, setNickname] = useState(store.onboardingNickname)
  const [birthDate, setBirthDate] = useState(store.onboardingBirthDate)
  const [showAge, setShowAge] = useState(store.onboardingShowAge)
  const [isVerified, setIsVerified] = useState(store.isVerified)

  const canProceed = nickname.trim().length > 0

  const handleNext = () => {
    if (!canProceed) return
    store.setOnboardingNameAndBirth({ nickname: nickname.trim(), birthDate, showAge })
    if (isVerified) store.setVerified(true)
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Profile"
        title={'어떻게\n불러드릴까요?'}
        description={'별명은 프로필에 표시돼요.\n기본정보 편집에서 언제든 바꿀 수 있어요.'}
      />

      {/* 별명 */}
      <div className="mb-5">
        <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">별명 *</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 명구, Alex, 크리에이터K"
          maxLength={30}
          className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)]"
        />
      </div>

      {/* 생년월일 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-[var(--color-text-tertiary)]">생년월일 (선택)</label>
          <button
            type="button"
            onClick={() => setShowAge((prev) => !prev)}
            className="flex items-center gap-1.5"
          >
            <div className={`relative w-7 h-4 rounded-full transition-colors ${showAge ? 'bg-[var(--color-accent-dark)]' : 'bg-[var(--color-border-default)]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${showAge ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">나이 공개</span>
          </button>
        </div>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
        />
      </div>

      {/* 본인인증 (선택) */}
      <div className="surface-card-soft rounded-[20px] p-4 mb-4">
        {isVerified ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-[var(--color-state-success-text)] flex-shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-[var(--color-text-strong)]">본인인증 완료</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">프로필에 인증 뱃지가 표시돼요</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-bold text-[var(--color-text-strong)] mb-0.5">실명 인증하기 (선택)</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mb-3">인증 완료 시 프로필에 인증 뱃지가 붙어요</p>
            {/* [임시] 본인인증 API 미연동 — 클릭 시 인증 완료 목업 */}
            <Button variant="outline" onClick={() => setIsVerified(true)}>본인인증하기</Button>
          </>
        )}
      </div>

      <StepFooter canNext={canProceed} onNext={handleNext} onPrev={() => store.prevStep()} />
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
      <div className="mb-5">
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
