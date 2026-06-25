'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button, Modal, NavBar, StepBar } from '@/components/ui'
import type { OnboardingStep } from '@/types'
import { AuthStep, VerifyStep, BasicInfoStep, ProfileStep } from '@/components/screens/onboarding/steps/OnboardingIntroSteps'
import { CompleteStep } from '@/components/screens/onboarding/steps/OnboardingBioSteps'

const STEP_NUMS: Record<OnboardingStep, number> = {
  login: 0,
  verify: 1,
  basicinfo: 2,
  profile: 3,
  complete: 4,
}

const STEP_COMPONENTS: Record<OnboardingStep, () => JSX.Element> = {
  login: AuthStep,
  verify: VerifyStep,
  basicinfo: BasicInfoStep,
  profile: ProfileStep,
  complete: CompleteStep,
}

export default function SignupScreen() {
  const router = useRouter()
  const store = useByroStore()
  const [showExitModal, setShowExitModal] = useState(false)

  const stepNum = STEP_NUMS[store.step]
  const CurrentStep = STEP_COMPONENTS[store.step]
  const hasBack = stepNum >= 1 && stepNum <= 3

  const handleClose = () => setShowExitModal(true)
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar
        onBack={hasBack ? () => store.prevStep() : undefined}
        onClose={stepNum < 4 ? handleClose : undefined}
      />

      {stepNum >= 1 && stepNum <= 3 && (
        <StepBar current={stepNum} total={3} />
      )}

      <div className="flex-1 overflow-hidden">
        <CurrentStep />
      </div>

      <Modal open={showExitModal} onClose={() => setShowExitModal(false)}>
        <div className="text-center">
          <div className="text-base font-black mb-2">회원가입을 중단할까요?</div>
          <div className="meta-text mb-5 leading-relaxed">
            지금 나가면 입력한 정보가<br />저장되지 않아요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExitModal(false)}>계속 작성하기</Button>
            <Button variant="danger" size="sm" onClick={handleExitConfirm}>나가기</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
