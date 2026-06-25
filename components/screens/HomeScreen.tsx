'use client'

import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/screens/home/sections/HeroSection'
import { HighlightSection } from '@/components/screens/home/sections/HighlightSection'
import { ProblemSection } from '@/components/screens/home/sections/ProblemSection'
import { ProductPreviewSection } from '@/components/screens/home/sections/ProductPreviewSection'
import { ReputationSection } from '@/components/screens/home/sections/ReputationSection'
import { SolutionSection } from '@/components/screens/home/sections/SolutionSection'
import { TargetUserSection } from '@/components/screens/home/sections/TargetUserSection'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-strong)] antialiased">
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 h-14 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)]">
        <span className="text-[18px] font-black tracking-tight text-[var(--color-text-strong)]">Byro</span>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold text-white"
          style={{ backgroundColor: 'var(--color-accent-dark)' }}
        >
          서비스 바로가기
        </button>
      </div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HighlightSection />
      <ProductPreviewSection />
      <ReputationSection />
      <TargetUserSection />
    </div>
  )
}
