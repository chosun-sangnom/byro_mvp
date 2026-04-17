'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Building2, CreditCard, Link2, Sparkles, Stars } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button } from '@/components/ui'

const problems = [
  {
    icon: CreditCard,
    title: '명함은 너무 얕습니다',
    description: '이름, 직함, 회사는 보여주지만 어떤 사람인지까지는 전달되지 않습니다.',
  },
  {
    icon: Building2,
    title: 'SNS는 비즈니스 맥락에 맞지 않습니다',
    description: '개인적인 콘텐츠와 섞여 있고, 첫 만남 전에 보기에는 정리된 느낌이 약합니다.',
  },
  {
    icon: Sparkles,
    title: '신뢰와 평판은 흩어져 있습니다',
    description: '활동, 관계, 인상, 검증 신호가 한곳에 모이지 않아 나를 설명해야만 합니다.',
  },
] as const

const highlights = [
  {
    eyebrow: '검증된 하이라이트',
    title: '설명보다 먼저 전해지는 신뢰 신호',
    description: '재직기간 인증, 리멤버 직업 네트워크, 직접 입력한 경험을 하나의 프로필 안에서 보여줄 수 있습니다.',
  },
  {
    eyebrow: '평판 키워드',
    title: '만난 사람들이 남기는 인상까지 정리',
    description: '전문적인, 신뢰할 수 있는, 연결을 잘 만드는 사람 같은 평판이 축적됩니다.',
  },
  {
    eyebrow: '하나의 링크',
    title: '오프라인에서 바로 꺼내 보여주는 프로필',
    description: '명함 대신 공유할 수 있는 링크 하나로 나의 맥락과 강점을 빠르게 전달합니다.',
  },
] as const

const timeline = [
  { label: 'Before', text: '만나기 전에 링크 하나로 이 사람의 맥락과 검증 신호를 확인합니다.' },
  { label: 'During', text: '대화 중에는 짧은 소개와 하이라이트만으로도 나를 빠르게 이해시킬 수 있습니다.' },
  { label: 'After', text: '경험과 평판이 누적되면서 다음 만남의 신뢰 자산이 됩니다.' },
] as const

const targetUsers = [
  '비즈니스 모임에서 나를 더 정확히 보여주고 싶은 사람',
  '명함 이상의 첫인상을 만들고 싶은 창업가, 직장인, 프리랜서',
  '오프라인 네트워킹을 자산처럼 쌓고 싶은 사람',
] as const

export default function HomeScreen() {
  const router = useRouter()
  const { isLoggedIn, user, login } = useByroStore()

  const primaryLabel = isLoggedIn ? '내 Byro 관리하기' : '내 Byro 만들기'
  const secondaryLabel = isLoggedIn ? '내 공개 프로필 보기' : '로그인해서 둘러보기'

  const handlePrimary = () => {
    if (isLoggedIn && user) {
      router.push('/me')
      return
    }
    router.push('/onboarding')
  }

  const handleSecondary = () => {
    if (isLoggedIn && user) {
      router.push(`/${user.linkId}`)
      return
    }
    login()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[radial-gradient(circle_at_top,#f3f5ff_0%,#ffffff_38%)] text-[#0A0A0A]">
      <HeroSection
        isLoggedIn={isLoggedIn}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
      />

      <SectionShell className="bg-white/75">
        <SectionTitle
          title={'명함은 연락처를 보여주지만,\n나를 증명해주지는 않습니다'}
          subtitle="오프라인 비즈니스 네트워킹에서 필요한 건 더 선명한 자기 맥락입니다."
        />
        <div className="space-y-3">
          {problems.map((problem, index) => (
            <Reveal key={problem.title} delay={index * 0.06}>
              <ProblemCard {...problem} />
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionTitle
          title={'Byro는 나를 더 잘\n설명하게 만드는 게 아니라,\n먼저 보이게 만듭니다'}
          subtitle="설명하기 전에 납득되는 프로필을 만드는 모바일 웹 프로필입니다."
        />
        <div className="space-y-3">
          {highlights.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <HighlightCard {...item} />
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="bg-[#f7f8fc]">
        <SectionTitle
          title={'하나의 링크 안에 담기는\n나의 신뢰 자산'}
          subtitle="랜딩페이지 안에서도 실제 프로필이 어떤 인상을 주는지 바로 이해할 수 있게 구성했습니다."
        />
        <Reveal>
          <ProductPreview />
        </Reveal>
      </SectionShell>

      <SectionShell>
        <SectionTitle
          title={'오프라인 네트워킹의 흐름에\n딱 맞는 프로필'}
          subtitle="만남의 전후 맥락을 따라 Byro가 어떤 역할을 하는지 보여줍니다."
        />
        <div className="space-y-3">
          {timeline.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <TimelineCard {...item} index={index + 1} />
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="bg-[#f9fafb]">
        <SectionTitle
          title={'이런 사람에게 특히\n잘 맞습니다'}
          subtitle="Byro는 보여줄 것은 많은데, 지금까지 정리해 보여줄 수단이 없었던 사람을 위한 프로필입니다."
        />
        <div className="space-y-2">
          {targetUsers.map((item, index) => (
            <Reveal key={item} delay={index * 0.06}>
              <div className="rounded-[26px] border border-[#ECEEF3] bg-white px-4 py-4 text-sm leading-relaxed text-[#444] shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                {item}
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <FinalCTA
        isLoggedIn={isLoggedIn}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
      />

      <StickyCTA
        isLoggedIn={isLoggedIn}
        label={primaryLabel}
        onClick={handlePrimary}
      />
    </div>
  )
}

function HeroSection({
  isLoggedIn,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  isLoggedIn: boolean
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
}) {
  return (
    <section className="relative px-5 pt-10 pb-12 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,#dfe4ff_0%,rgba(223,228,255,0)_72%)]" />
      <Reveal className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E7EAF5] bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#586174] backdrop-blur">
            <Stars size={12} className="text-[#5B63FF]" />
            Live it, Prove it
          </div>
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] text-[#8A8FA1]">Byro</div>
          <h1 className="mt-4 text-[42px] font-black leading-[0.95] tracking-[-0.04em] text-[#111827]">
            설명하기 전에,
            <br />
            먼저 증명되는 프로필
          </h1>
          <p className="mt-5 px-2 text-[15px] leading-7 text-[#667085]">
            하나의 링크로 정체성, 검증된 하이라이트, 평판, SNS, 자기소개를 정리해
            오프라인 비즈니스 네트워킹에 활용할 수 있는 프로필 서비스
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onPrimary}
            className="h-13 rounded-[20px] bg-[linear-gradient(135deg,#1f2556_0%,#3c47b7_100%)] text-white shadow-[0_18px_42px_rgba(60,71,183,0.35)]"
          >
            <span className="inline-flex items-center gap-2">
              {primaryLabel}
              <ArrowRight size={16} />
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={onSecondary}
            className="h-13 rounded-[20px] border-[#D9DEEA] bg-white/90 text-[#222A3A]"
          >
            {secondaryLabel}
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2.5">
          <HeroStat label="하이라이트" value="인증 + 경험" />
          <HeroStat label="평판" value="키워드 축적" />
          <HeroStat label="공유" value="링크 1개" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-9 rounded-[34px] border border-[#E6E9F2] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fd_100%)] p-4 shadow-[0_30px_80px_rgba(41,53,108,0.14)]"
        >
          <div className="rounded-[28px] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#535CFF_0%,#8256FF_100%)] text-lg font-black text-white">
                김
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-base font-black text-[#101828]">김지원</div>
                  <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#4F46E5]">
                    검증됨
                  </span>
                </div>
                <div className="mt-1 text-sm text-[#667085]">Product Designer</div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#475467]">
              사용자 경험과 비즈니스 임팩트를 연결하는 디자이너입니다.
            </p>

            <div className="mt-4 space-y-2.5">
              <PreviewHighlight
                tone="indigo"
                title="커리어 지속성"
                description="평균 대비 128% 장기 재직"
              />
              <PreviewHighlight
                tone="blue"
                title="리멤버 직업 네트워크"
                description="스타트업·마케팅 중심 네트워크"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {['신뢰할 수 있는', '통찰력 있는', '전문적인'].map((item) => (
                <span key={item} className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] font-medium text-[#475467]">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#F8FAFC] px-3 py-3">
              <div className="text-[11px] text-[#98A2B3]">최근 받은 인상</div>
              <p className="mt-1 text-xs leading-5 text-[#475467]">“함께 일하고 싶은 사람이에요”</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 rounded-[26px] border border-[#E7EAF5] bg-white/85 px-4 py-3 text-center text-xs leading-5 text-[#667085]">
          {isLoggedIn ? '로그인 상태에서는 이 랜딩에서 바로 내 Byro 관리 화면으로 이동할 수 있습니다.' : '비로그인 상태에서는 여기서 바로 Byro 생성 흐름으로 진입합니다.'}
        </div>
      </Reveal>
    </section>
  )
}

function SectionShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`px-5 py-12 ${className}`}>
      <div className="mx-auto max-w-[360px]">{children}</div>
    </section>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-8 text-center">
      <h2 className="whitespace-pre-line text-[30px] font-black leading-[1.12] tracking-[-0.04em] text-[#111827]">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-6 text-[#667085]">{subtitle}</p>
    </div>
  )
}

function ProblemCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CreditCard
  title: string
  description: string
}) {
  return (
    <div className="rounded-[28px] border border-[#EEF1F6] bg-white px-4 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7FB] text-[#525D73]">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold text-[#111827]">{title}</div>
          <p className="mt-1.5 text-sm leading-6 text-[#667085]">{description}</p>
        </div>
      </div>
    </div>
  )
}

function HighlightCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-[30px] border border-[#E8EBF4] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] px-5 py-5 shadow-[0_22px_56px_rgba(84,98,154,0.08)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7AFF]">{eyebrow}</div>
      <div className="mt-3 text-[22px] font-black leading-[1.15] tracking-[-0.03em] text-[#111827]">{title}</div>
      <p className="mt-3 text-sm leading-6 text-[#667085]">{description}</p>
    </div>
  )
}

function ProductPreview() {
  return (
    <div className="rounded-[34px] border border-[#E6E9F2] bg-white p-4 shadow-[0_25px_70px_rgba(31,41,55,0.08)]">
      <div className="rounded-[28px] bg-[linear-gradient(180deg,#111827_0%,#20293a_100%)] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Byro Preview</div>
            <div className="mt-1 text-lg font-black">한 화면으로 보는 신뢰 프로필</div>
          </div>
          <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">mobile</div>
        </div>

        <div className="mt-5 rounded-[24px] bg-white p-4 text-[#101828]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE9FE] font-black text-[#6D28D9]">
              이
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black">이명구</div>
              <div className="mt-0.5 text-xs text-[#667085]">초기 스타트업 마케터</div>
            </div>
            <div className="rounded-full bg-[#ECFDF3] px-2 py-1 text-[10px] font-bold text-[#027A48]">공유중</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#F8FAFC] px-3 py-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#475467]">
                <BadgeCheck size={12} />
                재직기간 인증
              </div>
              <div className="mt-1 text-xs text-[#667085]">평균 대비 128%</div>
            </div>
            <div className="rounded-2xl bg-[#EFF6FF] px-3 py-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1D4ED8]">
                <Link2 size={12} />
                리멤버 네트워크
              </div>
              <div className="mt-1 text-xs text-[#5B6B8A]">스타트업 중심</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#EEF2F6] px-3 py-3">
            <div className="text-[11px] font-bold text-[#98A2B3]">평판 키워드</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['전문적인', '논리적인', '연결을 잘하는'].map((item) => (
                <span key={item} className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] text-[#475467]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineCard({
  label,
  text,
  index,
}: {
  label: string
  text: string
  index: number
}) {
  return (
    <div className="flex gap-3 rounded-[26px] border border-[#E9EDF5] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F2556] text-xs font-black text-white">
        {index}
      </div>
      <div>
        <div className="text-sm font-black text-[#111827]">{label}</div>
        <p className="mt-1 text-sm leading-6 text-[#667085]">{text}</p>
      </div>
    </div>
  )
}

function FinalCTA({
  isLoggedIn,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  isLoggedIn: boolean
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
}) {
  return (
    <section className="px-5 pt-12 pb-28">
      <div className="mx-auto max-w-[360px] rounded-[36px] border border-[#E7EAF2] bg-[linear-gradient(180deg,#f8f9ff_0%,#ffffff_100%)] px-5 py-8 text-center shadow-[0_30px_80px_rgba(75,85,155,0.10)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#7A86A1]">Final CTA</div>
        <h2 className="mt-4 text-[30px] font-black leading-[1.1] tracking-[-0.04em] text-[#111827]">
          설명보다 먼저 전해지는
          <br />
          프로필을 만들어보세요
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#667085]">
          {isLoggedIn
            ? '지금은 이미 Byro를 가지고 있으니, 랜딩에서 바로 관리와 공유로 이어질 수 있게 구성했습니다.'
            : '처음 보는 사람에게도 나를 빠르게 이해시키는 프로필을, 명함보다 가볍고 정확하게 공유할 수 있습니다.'}
        </p>

        <div className="mt-7 space-y-3">
          <Button
            onClick={onPrimary}
            className="h-13 rounded-[20px] bg-[linear-gradient(135deg,#4F46E5_0%,#7C3AED_100%)] text-white shadow-[0_18px_42px_rgba(99,102,241,0.32)]"
          >
            <span className="inline-flex items-center gap-2">
              {primaryLabel}
              <ArrowRight size={16} />
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={onSecondary}
            className="h-12 rounded-[18px] border-[#D9DEEA] bg-white"
          >
            {secondaryLabel}
          </Button>
        </div>

        <div className="mt-10 border-t border-[#E8EBF4] pt-6">
          <div className="text-xl font-black text-[#141B2D]">Byro</div>
          <div className="mt-1 text-xs text-[#98A2B3]">Live it, Prove it</div>
        </div>
      </div>
    </section>
  )
}

function StickyCTA({
  isLoggedIn,
  label,
  onClick,
}: {
  isLoggedIn: boolean
  label: string
  onClick: () => void
}) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-[#E7EAF2] bg-white/92 px-4 py-3 backdrop-blur">
      <Button
        onClick={onClick}
        className={[
          'h-12 rounded-[18px] shadow-[0_12px_28px_rgba(31,37,86,0.18)]',
          isLoggedIn
            ? 'bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)] text-white'
            : 'bg-[linear-gradient(135deg,#1F2556_0%,#3C47B7_100%)] text-white',
        ].join(' ')}
      >
        {label}
      </Button>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#E8EBF4] bg-white/85 px-3 py-3 text-center shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
      <div className="text-[11px] text-[#98A2B3]">{label}</div>
      <div className="mt-1 text-xs font-black text-[#111827]">{value}</div>
    </div>
  )
}

function PreviewHighlight({
  title,
  description,
  tone,
}: {
  title: string
  description: string
  tone: 'indigo' | 'blue'
}) {
  const styles = tone === 'indigo'
    ? 'from-[#EEF2FF] to-[#F5F3FF] text-[#4F46E5]'
    : 'from-[#EFF6FF] to-[#ECFEFF] text-[#0369A1]'

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${styles} px-3 py-3`}>
      <div className="text-[11px] font-bold">{title}</div>
      <div className="mt-1 text-xs text-[#475467]">{description}</div>
    </div>
  )
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
