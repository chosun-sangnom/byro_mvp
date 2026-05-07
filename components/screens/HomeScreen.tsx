'use client'

import { useRouter } from 'next/navigation'
import { ComparisonSection } from '@/components/screens/home/sections/ComparisonSection'
import { HeroSection } from '@/components/screens/home/sections/HeroSection'
import { HighlightSection } from '@/components/screens/home/sections/HighlightSection'
import { ProblemSection } from '@/components/screens/home/sections/ProblemSection'
import { ProductPreviewSection } from '@/components/screens/home/sections/ProductPreviewSection'
import { ReputationSection } from '@/components/screens/home/sections/ReputationSection'
import { SolutionSection } from '@/components/screens/home/sections/SolutionSection'
import { TargetUserSection } from '@/components/screens/home/sections/TargetUserSection'
import { useByroStore } from '@/store/useByroStore'

export default function HomeScreen() {
  const router = useRouter()
  const { isLoggedIn, login, logout } = useByroStore()

  const primaryLabel = isLoggedIn ? '내 Byro 보러가기' : '내 Byro 만들기'
  const secondaryLabel = isLoggedIn ? '로그아웃' : '로그인'

  const handlePrimary = () => {
    if (isLoggedIn) {
      router.push('/me')
      return
    }
    router.push('/onboarding')
  }

  const handleSecondary = () => {
    if (isLoggedIn) {
      logout()
      return
    }
    login()
  }

  const handleSampleProfile = () => {
    router.push('/jiminlee')
  }

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-strong)] antialiased">
      <HeroSection
        isLoggedIn={isLoggedIn}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
        onSampleProfile={handleSampleProfile}
      />
      <ProblemSection />
      <SolutionSection />
      <HighlightSection />
      <ComparisonSection />
      <ProductPreviewSection />
      <ReputationSection />
      <TargetUserSection />
    </div>
  )
}
