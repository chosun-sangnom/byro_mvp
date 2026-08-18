'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button, Modal, NavBar, StepBar } from '@/components/ui'
import type { OnboardingStep } from '@/types'
import { Step1Login, Step2Verify, Step2BasicInfo, Step4Profile, type Mode } from '@/components/screens/onboarding/steps/OnboardingIntroSteps'
import { Step9Complete } from '@/components/screens/onboarding/steps/OnboardingBioSteps'

const STEP_NUMS: Record<OnboardingStep, number> = {
  login: 0,
  verify: 1,
  basicinfo: 2,
  profile: 3,
  complete: 4,
}

const STEP_COMPONENTS: Record<OnboardingStep, () => JSX.Element> = {
  login: Step1Login,
  verify: Step2Verify,
  basicinfo: Step2BasicInfo,
  profile: Step4Profile,
  complete: Step9Complete,
}

export default function OnboardingScreen() {
  const router = useRouter()
  const store = useFeloreStore()
  const [showExitModal, setShowExitModal] = useState(false)
  const [loginFlowMode, setLoginFlowMode] = useState<Mode>('choose')
  const [loginBackHandler, setLoginBackHandler] = useState<(() => void) | null>(null)
  const handleLoginBackHandlerChange = useCallback((handler: (() => void) | null) => {
    setLoginBackHandler(() => handler)
  }, [])

  const stepNum = STEP_NUMS[store.step]
  const CurrentStep = STEP_COMPONENTS[store.step]
  const hasBack = stepNum >= 1 && stepNum <= 3
  const skipExitModal = store.step === 'login' && loginFlowMode !== 'signup'

  const handleClose = () => {
    if (skipExitModal) {
      router.push('/')
      return
    }
    setShowExitModal(true)
  }
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.push('/')
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <NavBar
        onBack={hasBack ? () => store.prevStep() : (store.step === 'login' ? loginBackHandler ?? undefined : undefined)}
        onClose={stepNum < 4 ? handleClose : undefined}
      />

      {stepNum >= 1 && stepNum <= 3 && (
        <StepBar current={stepNum} total={3} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {store.step === 'login'
          ? (
            <Step1Login
              onModeChange={setLoginFlowMode}
              onBackHandlerChange={handleLoginBackHandlerChange}
            />
          )
          : <CurrentStep />}
      </div>

      <Modal open={showExitModal} onClose={() => setShowExitModal(false)} widthClassName="w-[calc(100%-40px)]">
        <div className="text-left">
          <div className="text-lg font-black mb-2">회원가입을 종료할까요?</div>
          <div className="meta-text mb-5 leading-relaxed">
            지금 나가면 입력된 정보가 저장되지 않아요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExitModal(false)}>계속 작성</Button>
            <Button
              variant="danger"
              onClick={handleExitConfirm}
              style={{ backgroundColor: '#EF4444', borderColor: 'transparent', color: '#fff' }}
            >
              종료하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
