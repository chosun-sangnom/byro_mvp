'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const { isLoggedIn } = useByroStore()

  useEffect(() => {
    if (isLoggedIn) router.replace('/me')
  }, [isLoggedIn, router])

  if (isLoggedIn) return null

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-strong)] antialiased">
      <HeroSection
        isLoggedIn={false}
        primaryLabel="내 Byro 만들기"
        secondaryLabel="로그인"
        onPrimary={() => router.push('/signup')}
        onSecondary={() => router.push('/signup')}
        onSampleProfile={() => router.push('/jiminlee')}
      />
      <ProblemSection />
      <SolutionSection />
      <HighlightSection />
      <ProductPreviewSection />
      <ReputationSection />
      <TargetUserSection />
    </div>
  )
}
