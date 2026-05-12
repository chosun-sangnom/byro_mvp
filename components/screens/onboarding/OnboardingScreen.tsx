'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button, Modal, NavBar, StepBar } from '@/components/ui'
import type { OnboardingStep } from '@/types'
import { Step1Login, Step2Verify, Step3LinkId } from '@/components/screens/onboarding/steps/OnboardingIntroSteps'
import { Step5SNS, Step6Contact } from '@/components/screens/onboarding/steps/OnboardingSocialContactSteps'
import { Step7Highlight } from '@/components/screens/onboarding/steps/OnboardingHighlightStep'
import { Step8AI, Step8Select, Step9Complete } from '@/components/screens/onboarding/steps/OnboardingBioSteps'

const STEP_NUMS: Record<OnboardingStep, number> = {
  login: 0,
  verify: 1,
  linkid: 2,
  sns: 3,
  contact: 4,
  highlight: 5,
  'bio-select': 6,
  'bio-ai': 7,
  complete: 8,
}

const STEP_COMPONENTS: Record<OnboardingStep, () => JSX.Element> = {
  login: Step1Login,
  verify: Step2Verify,
  linkid: Step3LinkId,
  sns: Step5SNS,
  contact: Step6Contact,
  highlight: Step7Highlight,
  'bio-select': Step8Select,
  'bio-ai': Step8AI,
  complete: Step9Complete,
}

export default function OnboardingScreen() {
  const router = useRouter()
  const store = useByroStore()
  const [showExitModal, setShowExitModal] = useState(false)

  const stepNum = STEP_NUMS[store.step]
  const CurrentStep = STEP_COMPONENTS[store.step]
  const hasBack = stepNum >= 1 && stepNum <= 7

  const handleClose = () => setShowExitModal(true)
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar
        onBack={hasBack ? () => store.prevStep() : undefined}
        onClose={handleClose}
      />

      {stepNum >= 1 && stepNum <= 7 && (
        <StepBar current={stepNum} total={7} />
      )}

      <div className="flex-1 overflow-hidden">
        <CurrentStep />
      </div>

      <Modal open={showExitModal} onClose={() => setShowExitModal(false)}>
        <div className="text-center">
          <div className="text-base font-black mb-2">온보딩을 종료할까요?</div>
          <div className="meta-text mb-5 leading-relaxed">
            지금 나가면 입력한 정보가<br />저장되지 않아요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExitModal(false)}>계속 작성하기</Button>
            <Button variant="danger" size="sm" onClick={handleExitConfirm}>종료하기</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
