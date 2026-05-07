'use client'

import { useState } from 'react'
import { useByroStore } from '@/store/useByroStore'
import { Button, CheckRow, InfoBox } from '@/components/ui'
import { StepFooter, StepIntro } from '@/components/screens/onboarding/OnboardingShared'

export function Step1Login() {
  const store = useByroStore()

  const handleSocial = () => {
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
          3분이면 만들고, 만난 사람에게 바로 공유할 수 있어요.
        </div>
      </div>
      <div className="space-y-3">
        <Button variant="kakao" onClick={handleSocial}>카카오로 시작하기</Button>
        <Button variant="google" onClick={handleSocial}>G  구글로 시작하기</Button>
        <Button variant="naver" onClick={handleSocial}>N  네이버로 시작하기</Button>
      </div>
      <p className="micro-text text-center mt-6">
        시작하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
      </p>
    </div>
  )
}

export function Step2Verify() {
  const store = useByroStore()
  const { agreedTerms, agreedPrivacy, agreedMarketing } = store
  const allChecked = agreedTerms && agreedPrivacy && agreedMarketing
  const canProceed = agreedTerms && agreedPrivacy

  const handleVerify = () => {
    if (!canProceed) return
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Verification"
        title={'본인 확인이 필요해요'}
        description={'인증한 이름은 프로필에 실명으로 표시돼요.\n인증 후에는 바꾸기 어려워요.'}
      />

      <div className="surface-card-soft rounded-[24px] p-4 mb-4">
        <div className="pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          <CheckRow
            label="전체 동의"
            checked={allChecked}
            onToggle={store.toggleAllAgreed}
          />
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
        <Button variant="outline" disabled={!canProceed} onClick={handleVerify}>
          SMS로 인증하기
        </Button>
        <Button variant="kakao" disabled={!canProceed} onClick={handleVerify}>
          카카오로 인증하기
        </Button>
      </div>
      <StepFooter
        canNext={canProceed}
        onNext={handleVerify}
        onPrev={() => store.prevStep()}
      />
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
          status === 'valid' ? 'border-[#1A7A1A]' : status === 'error' ? 'border-[#E53935]' : 'border-[#ddd]',
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
