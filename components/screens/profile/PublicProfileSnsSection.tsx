'use client'

import type { ReactNode } from 'react'
import { Play } from 'lucide-react'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'

type InstagramSectionData = {
  username: string
  profileUrl: string
}

type LinkedInSectionData = {
  profileUrl: string
}

function SnsRow({
  icon,
  title,
  href,
  linkLabel,
  disabled,
}: {
  icon: ReactNode
  title: string
  href?: string
  linkLabel?: string
  disabled?: boolean
}) {
  const inner = (
    <div className="flex items-center gap-3.5 py-3.5">
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</div>
        {linkLabel && (
          <div className={`mt-0.5 truncate text-[12px] ${disabled ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-accent-dark)]'}`}>
            {linkLabel}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }

  return inner
}

export function ProfileSnsSection({
  instagramConnected,
  linkedinConnected,
  instagram,
  linkedin,
}: {
  instagramConnected: boolean
  linkedinConnected: boolean
  instagram: InstagramSectionData
  linkedin: LinkedInSectionData
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2">
      <SectionTitle title="SNS" />
      <div className="divide-y divide-[var(--color-border-soft)]">
        <SnsRow
          icon={<Play size={15} color="#FF0000" />}
          title="YouTube"
          linkLabel="연결 정보 준비 중"
          disabled
        />
        <SnsRow
          icon={<span className="text-[13px] font-black text-black">T</span>}
          title="TikTok"
          linkLabel="연결 정보 준비 중"
          disabled
        />
        {instagramConnected ? (
          <SnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
            }
            title="Instagram"
            href={instagram.profileUrl}
            linkLabel={`@${instagram.username}`}
          />
        ) : (
          <SnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
            }
            title="Instagram"
            linkLabel="연결된 계정이 없습니다"
            disabled
          />
        )}
        {linkedinConnected ? (
          <SnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
            }
            title="LinkedIn"
            href={linkedin.profileUrl}
            linkLabel={linkedin.profileUrl.replace(/^https?:\/\/(www\.)?/, '')}
          />
        ) : (
          <SnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
            }
            title="LinkedIn"
            linkLabel="연결된 계정이 없습니다"
            disabled
          />
        )}
      </div>
    </AnimatedSection>
  )
}
