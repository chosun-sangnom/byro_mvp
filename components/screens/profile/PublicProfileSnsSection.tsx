'use client'

import { ArrowUpRight } from 'lucide-react'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'

interface SnsItem {
  key: string
  icon: React.ReactNode
  title: string
  href: string
}

export function ProfileSnsSection({
  instagramConnected,
  linkedinConnected,
  instagram,
  linkedin,
}: {
  instagramConnected: boolean
  linkedinConnected: boolean
  instagram: { username: string; profileUrl: string }
  linkedin: { profileUrl: string }
}) {
  const items: SnsItem[] = [
    instagramConnected && {
      key: 'instagram',
      icon: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
      ),
      title: 'Instagram',
      href: instagram.profileUrl,
    },
    linkedinConnected && {
      key: 'linkedin',
      icon: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
      ),
      title: 'LinkedIn',
      href: linkedin.profileUrl,
    },
  ].filter(Boolean) as SnsItem[]

  if (items.length === 0) return null

  return (
    <AnimatedSection className="px-5 pt-6 pb-2">
      <SectionTitle title="SNS" />
      <div className="divide-y divide-[var(--color-border-soft)]">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 py-3.5"
          >
            <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <p className="flex-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
            <ArrowUpRight size={15} className="flex-shrink-0 text-[var(--color-text-tertiary)] opacity-40" />
          </a>
        ))}
      </div>
    </AnimatedSection>
  )
}
