'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button, Modal, NavBar, StepBar } from '@/components/ui'
import type { OnboardingStep } from '@/types'
import { Step1Login, StepTermsAgreement, Step2Verify, Step2BasicInfo, Step4Profile, type Mode } from '@/components/screens/onboarding/steps/OnboardingIntroSteps'
import { Step9Complete } from '@/components/screens/onboarding/steps/OnboardingBioSteps'

const STEP_NUMS: Record<OnboardingStep, number> = {
  login: 0,
  terms: 1,
  verify: 2,
  basicinfo: 3,
  profile: 4,
  complete: 5,
}

const STEP_COMPONENTS: Record<OnboardingStep, () => JSX.Element> = {
  login: Step1Login,
  terms: StepTermsAgreement,
  verify: Step2Verify,
  basicinfo: Step2BasicInfo,
  profile: Step4Profile,
  complete: Step9Complete,
}

export default function OnboardingScreen() {
  const router = useRouter()
  const store = useByroStore()
  const [showExitModal, setShowExitModal] = useState(false)
  const [loginFlowMode, setLoginFlowMode] = useState<Mode>('choose')

  const stepNum = STEP_NUMS[store.step]
  const CurrentStep = STEP_COMPONENTS[store.step]
  const hasBack = stepNum >= 1 && stepNum <= 4
  const isLoginFlow = store.step === 'login' && loginFlowMode === 'login'

  const handleClose = () => setShowExitModal(true)
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar
        onBack={hasBack ? () => store.prevStep() : undefined}
        onClose={stepNum < 5 ? handleClose : undefined}
      />

      {stepNum >= 1 && stepNum <= 4 && (
        <StepBar current={stepNum} total={4} />
      )}

      <div className="flex-1 overflow-hidden">
        {store.step === 'login' ? <Step1Login onModeChange={setLoginFlowMode} /> : <CurrentStep />}
      </div>

      <Modal open={showExitModal} onClose={() => setShowExitModal(false)}>
        <div className="text-center">
          <div className="text-base font-black mb-2">
            {isLoginFlow ? '로그인을 종료할까요?' : '회원가입을 종료할까요?'}
          </div>
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
