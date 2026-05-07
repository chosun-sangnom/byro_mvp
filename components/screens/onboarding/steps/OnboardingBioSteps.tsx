'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Pencil, Sparkles } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { AiBounce, Button, Modal, TextArea, showToast } from '@/components/ui'
import { StepIntro, SelectionCard } from '@/components/screens/onboarding/OnboardingShared'
import { AI_BIO_CANDIDATES } from '@/lib/mocks/bioCandidates'

export function Step8Select() {
  const store = useByroStore()
  const [noDataModal, setNoDataModal] = useState(false)

  const hasData = store.instagramConnected || store.linkedinConnected || store.selectedKeywords.length > 0

  const handleAI = () => {
    if (!hasData) {
      setNoDataModal(true)
      return
    }
    store.setSelectedBioMethod('ai')
    store.goToStep('bio-ai')
  }

  const handleManual = () => {
    store.setSelectedBioMethod('manual')
    store.goToStep('bio-ai')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Bio"
        title={'자기소개를\n어떻게 작성할까요?'}
        description={'직접 쓰거나 AI 초안을 받을 수 있어요.'}
      />

      <div className="space-y-3">
        <SelectionCard
          icon={<Sparkles size={18} />}
          title="AI가 자기소개 작성하기"
          subtitle="SNS·키워드 기반으로 초안을 만들어드려요"
          tone="accent"
          onClick={handleAI}
        >
          {!hasData && (
            <div className="rounded-lg px-2 py-1.5 text-xs bg-[var(--color-state-warn-bg)] text-[var(--color-state-warn-text)]">
              AI 초안을 만들려면 키워드, SNS, 하이라이트 중 하나 이상이 필요해요
            </div>
          )}
          {hasData && (
            <div className="flex flex-wrap gap-1">
              {store.instagramConnected && <span className="inline-flex items-center gap-1 text-xs bg-[var(--color-bg-muted)] rounded-full px-2 py-0.5 border border-[var(--color-border-default)] text-[var(--color-text-secondary)]"><Image src="/images/Instagram.svg" alt="" width={12} height={12} className="w-3 h-3" /> Instagram</span>}
              {store.linkedinConnected && <span className="inline-flex items-center gap-1 text-xs bg-[var(--color-bg-muted)] rounded-full px-2 py-0.5 border border-[var(--color-border-default)] text-[var(--color-text-secondary)]"><Image src="/images/linkedin.png" alt="" width={12} height={12} className="w-3 h-3" /> LinkedIn</span>}
              {store.selectedKeywords.length > 0 && <span className="text-xs bg-[var(--color-bg-muted)] rounded-full px-2 py-0.5 border border-[var(--color-border-default)] text-[var(--color-text-secondary)]">키워드 {store.selectedKeywords.length}개</span>}
            </div>
          )}
        </SelectionCard>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
          <span>또는</span>
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        </div>

        <SelectionCard
          icon={<Pencil size={18} />}
          title="직접 작성하기"
          subtitle="내 말로 바로 작성할게요"
          onClick={handleManual}
        />
      </div>

      <button className="text-center text-sm text-[var(--color-text-secondary)] mt-6" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
        나중에 작성하기
      </button>

      <Modal open={noDataModal} onClose={() => { setNoDataModal(false); store.prevStep() }}>
        <div className="text-center">
          <div className="mb-2 flex justify-center text-[var(--color-state-danger-text)]">
            <AlertCircle size={20} />
          </div>
          <div className="text-sm font-black mb-2">정보가 부족해요</div>
          <div className="meta-text leading-relaxed mb-4">
            AI 초안을 만들려면 아래 정보가 하나 이상 필요해요.
            <br /><br />
            <b>· 평판 키워드</b><br />
            <b>· SNS 연동</b><br />
            <b>· 하이라이트</b>
          </div>
          <div className="space-y-2">
            <Button onClick={() => { setNoDataModal(false); store.goToStep('keywords') }}>정보 추가하러 가기</Button>
            <Button variant="outline" onClick={() => { setNoDataModal(false); handleManual() }}>직접 작성하기</Button>
            <button className="text-xs text-[var(--color-text-secondary)] mt-1" onClick={() => { setNoDataModal(false); store.completeOnboarding(); store.goToStep('complete') }}>나중에 작성하기</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export function Step8AI() {
  const store = useByroStore()
  const isManual = store.selectedBioMethod === 'manual'
  const [phase, setPhase] = useState<'loading' | 'done' | 'edit'>(isManual ? 'edit' : 'loading')
  const [bioText, setBioText] = useState('')
  const [aiIndex, setAiIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isManual) return
    timerRef.current = setTimeout(() => {
      setBioText(AI_BIO_CANDIDATES[aiIndex])
      setPhase('done')
    }, 2200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [aiIndex, isManual])

  const handleRegenerate = () => {
    setPhase('loading')
    const next = (aiIndex + 1) % AI_BIO_CANDIDATES.length
    setAiIndex(next)
    timerRef.current = setTimeout(() => {
      setBioText(AI_BIO_CANDIDATES[next])
      setPhase('done')
    }, 2200)
  }

  const handleComplete = () => {
    store.setBio(bioText, isManual ? 'manual' : 'ai')
    store.completeOnboarding()
    store.goToStep('complete')
  }

  if (isManual) {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
        <StepIntro
          eyebrow="Bio"
          title={'자기소개를 직접\n작성해주세요'}
          description={'나를 잘 보여주는 문장으로 적어주세요.'}
        />

        <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">자기소개</label>
        <TextArea
          value={bioText}
          onChange={setBioText}
          placeholder="예: 창업 3년차. 사람을 만나고 연결하는 걸 좋아합니다."
          maxLength={200}
          rows={6}
        />
        <div className="bg-[var(--color-state-info-bg)] border border-[var(--color-border-soft)] rounded-lg px-3 py-2 text-xs text-[var(--color-state-info-text)] mt-3 mb-6">
          나중에 AI 초안으로 바꿀 수 있어요.
        </div>

        <div className="space-y-2">
          <Button onClick={handleComplete}>완료</Button>
          <button className="w-full text-center text-sm text-[var(--color-text-tertiary)]" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
            나중에 작성하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="AI Draft"
        title={'AI가 나를 소개해드릴게요'}
        description={'입력한 정보를 바탕으로 초안을 만들었어요.'}
      />

      {phase === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AiBounce />
          <div className="text-sm text-[var(--color-text-tertiary)]">소개 문구를 만들고 있어요</div>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="relative bg-[var(--color-bg-soft)] border border-[var(--color-border-default)] rounded-xl p-4 mb-3">
            <div className="text-xs font-bold text-[var(--color-state-success-text)] mb-2">AI 초안</div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed pr-10">{bioText}</p>
            <button
              onClick={() => setPhase('edit')}
              className="absolute top-3 right-3 flex items-center gap-1 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] rounded-lg px-2 py-1"
            >
              수정
            </button>
          </div>
          <Button variant="outline" onClick={handleRegenerate}>다시 만들기</Button>
          <div className="h-4" />
        </>
      )}

      {phase === 'edit' && (
        <div className="mb-4">
          <TextArea value={bioText} onChange={setBioText} placeholder="자기소개를 입력해주세요" rows={6} />
        </div>
      )}

      {phase !== 'loading' && (
        <div className="space-y-2">
          <Button onClick={handleComplete}>완료</Button>
          <button className="w-full text-center text-sm text-[var(--color-text-tertiary)]" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
            나중에 작성하기
          </button>
        </div>
      )}
    </div>
  )
}

export function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.linkId || 'myongkoo'

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

  const handleCopy = () => {
    navigator.clipboard.writeText(`byro.io/@${linkId}`).catch(() => {})
    showToast('링크가 복사됐어요!')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6 items-center text-center">
      <div className="w-full rounded-[30px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-7 mb-6">
        <div className="mb-4 flex justify-center text-[var(--color-state-success-text)]">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-[var(--color-text-strong)]">Byro를<br />만들었어요</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">이제 링크로 바로 공유할 수 있어요.</p>

        <div className="w-full flex items-center bg-[var(--color-bg-muted)] border border-[var(--color-border-soft)] rounded-xl px-4 py-3">
          <span className="flex-1 text-sm text-[var(--color-text-primary)] text-left">byro.io/@{linkId}</span>
          <button onClick={handleCopy} className="text-xs font-bold text-[var(--color-accent-dark)] ml-3 flex-shrink-0">복사</button>
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button onClick={() => router.push('/me')}>내 Byro 보러가기</Button>
        <Button variant="outline" onClick={() => router.push('/me')}>프로필 더 꾸미기</Button>
      </div>
    </div>
  )
}
