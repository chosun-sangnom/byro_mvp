'use client'

import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  Award,
  Boxes,
  Briefcase,
  Building2,
  Check,
  CreditCard,
  Crown,
  FileText,
  Globe2,
  Lightbulb,
  Link as LinkIcon,
  Link2,
  Megaphone,
  Rocket,
  Settings,
  Sparkles,
  Star,
  Stars,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button } from '@/components/ui'

const problems = [
  {
    icon: CreditCard,
    title: '명함은 너무 얕습니다',
    description: '이름, 직함, 회사는 보여주지만 어떤 사람인지 전달되지 않습니다.',
  },
  {
    icon: Building2,
    title: 'SNS는 비즈니스 맥락에 맞지 않습니다',
    description: '개인적인 콘텐츠와 섞여있고, 첫인상을 만들기엔 정리되지 않았습니다.',
  },
  {
    icon: Sparkles,
    title: '신뢰와 평판은 흩어져 있습니다',
    description: '경험, 관계, 인상, 활동 이력이 한 곳에 정리되어 있지 않습니다.',
  },
] as const

const solutionSteps = [
  {
    icon: Link2,
    title: '연결하기',
    items: ['SNS 연결', '키워드 선택', '하이라이트 추가'],
  },
  {
    icon: Sparkles,
    title: '정리하기',
    items: ['AI가 자기소개 초안 생성', '프로필을 더 명확한 정체성으로 구조화'],
  },
  {
    icon: TrendingUp,
    title: '쌓이기',
    items: ['평판 키워드 누적', '방명록/피드백 축적', '관계 속 신뢰 자산이 계속 쌓임'],
  },
] as const

const highlightCards = [
  {
    icon: Briefcase,
    label: '커리어 지속성',
    value: '평균 대비 128% 장기 재직',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    label: '리멤버 네트워크',
    value: '스타트업 중심 인맥 구조',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    label: '강연 / 협업 경험',
    value: 'TEDx Seoul 발표',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: FileText,
    label: '특허 / 출판',
    value: '등록 특허 보유',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Globe2,
    label: '글로벌 활동',
    value: '최근 3년간 국제 활동 이력 다수',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Crown,
    label: '프리미엄 멤버십',
    value: '상위 등급 멤버십 보유',
    gradient: 'from-amber-500 to-yellow-500',
  },
] as const

const comparisons: Array<{
  icon: typeof CreditCard
  name: string
  color: string
  isHighlight?: boolean
  features: Array<{ text: string; available: boolean }>
}> = [
  {
    icon: CreditCard,
    name: '전통 명함',
    color: 'from-gray-400 to-gray-500',
    features: [
      { text: '이름, 직함, 연락처', available: true },
      { text: '신뢰 검증', available: false },
      { text: '평판 정보', available: false },
      { text: '오프라인 활용', available: true },
    ],
  },
  {
    icon: Building2,
    name: 'SNS 프로필',
    color: 'from-blue-600 to-blue-700',
    features: [
      { text: '정제된 정보', available: false },
      { text: '신뢰 검증', available: false },
      { text: '평판 정보', available: true },
      { text: '오프라인 활용', available: false },
    ],
  },
  {
    icon: Sparkles,
    name: 'Byro',
    color: 'from-indigo-600 to-purple-600',
    isHighlight: true,
    features: [
      { text: '정제된 정보', available: true },
      { text: '신뢰 검증', available: true },
      { text: '평판 정보', available: true },
      { text: '오프라인 활용', available: true },
    ],
  },
] as const

const uiElements = [
  {
    icon: User,
    title: '프로필 헤더',
    description: '간결하고 인상적인 첫인상',
  },
  {
    icon: Lightbulb,
    title: 'AI 자기소개',
    description: '핵심만 담은 명확한 소개',
  },
  {
    icon: Star,
    title: '검증 하이라이트',
    description: '신뢰를 만드는 증거들',
  },
  {
    icon: LinkIcon,
    title: 'SNS 연결',
    description: '모든 채널을 한 곳에',
  },
] as const

const reputationKeywords = [
  '신뢰할 수 있는',
  '통찰력 있는',
  '전략적인',
  '전문적인',
  '사람을 잘 연결하는',
  '실행력 있는',
  '배려심 있는',
  '창의적인',
] as const

const testimonials = [
  {
    text: '함께 프로젝트를 진행하면서 정말 많이 배웠어요. 체계적이고 빠른 분이에요',
    author: '박지민',
    role: 'Product Designer',
  },
  {
    text: '비즈니스 감각이 뛰어나고 신뢰할 수 있는 파트너입니다',
    author: '최민수',
    role: 'Startup Founder',
  },
] as const

const targetUsers = [
  { icon: Rocket, label: '창업가' },
  { icon: Boxes, label: '프로덕트 매니저' },
  { icon: Megaphone, label: '마케터' },
  { icon: TrendingUp, label: '투자자' },
  { icon: Users, label: '사업개발' },
  { icon: Settings, label: '운영 리더' },
] as const

export default function HomeScreen() {
  const router = useRouter()
  const { isLoggedIn, logout } = useByroStore()

  const primaryLabel = isLoggedIn ? '내 Byro 보러가기' : '내 Byro 만들기'
  const secondaryLabel = isLoggedIn ? '로그아웃' : '샘플 프로필 보기'

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
    router.push('/jiminlee')
  }

  const handleLogin = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-strong)] antialiased">
      <HeroSection
        isLoggedIn={isLoggedIn}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
        onLogin={handleLogin}
      />
      <ProblemSection />
      <SolutionSection />
      <HighlightSection />
      <ComparisonSection />
      <ProductPreviewSection />
      <ReputationSection />
      <TargetUserSection />
      <FinalCTASection
        isLoggedIn={isLoggedIn}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
        onLogin={handleLogin}
      />
      <FixedCTA isLoggedIn={isLoggedIn} label={primaryLabel} onClick={handlePrimary} />
    </div>
  )
}

function HeroSection({
  isLoggedIn,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onLogin,
}: {
  isLoggedIn: boolean
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onLogin: () => void
}) {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold shadow-sm" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}>
            <Stars size={12} style={{ color: 'var(--color-accent-brand)' }} />
            Live it, Prove It
          </div>
          <h1 className="mt-6 text-2xl tracking-tight text-[var(--color-text-strong)]">Byro</h1>
        </div>

        <h2 className="text-5xl tracking-tight mb-4 text-[var(--color-text-strong)]">
          Live it, Prove It
        </h2>

        <p className="text-xl mb-6 text-[var(--color-text-primary)]">
          설명하기 전에, 먼저 증명되는 프로필
        </p>

        <p className="text-sm leading-relaxed mb-10 text-[var(--color-text-secondary)] max-w-sm mx-auto">
          하나의 링크로 정체성, 검증된 하이라이트, 평판, SNS, 자기소개를 정리해 오프라인 비즈니스 네트워킹에 활용할 수 있는 프로필 서비스
        </p>

        <div className="flex flex-col gap-3 mb-12">
          <Button
            onClick={onPrimary}
            className="w-full h-12 text-white rounded-2xl shadow-lg"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            {primaryLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onSecondary}
            className="w-full h-12 border-2 rounded-2xl"
          >
            {secondaryLabel}
          </Button>
          {!isLoggedIn && (
            <div className="text-xs text-[var(--color-text-tertiary)]">
              샘플 프로필은 실제 기능이 아니라 플로우 검증용 화면이에요.
            </div>
          )}
          {!isLoggedIn && (
            <button
              onClick={onLogin}
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              로그인
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="rounded-[2rem] p-4 shadow-2xl max-w-[320px] mx-auto" style={{ background: 'linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-soft))', border: '1px solid var(--color-border-default)' }}>
            <div className="surface-card rounded-[1.5rem] p-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                <div className="flex-1 text-left">
                  <div className="text-sm text-[var(--color-text-strong)]">김지원</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Product Designer</div>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-primary)] mb-4 text-left leading-relaxed">
                사용자 경험과 비즈니스 임팩트를 연결하는 디자이너입니다
              </p>

              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 text-left">
                  <div className="text-[10px] text-indigo-600 mb-1">커리어 지속성</div>
                  <div className="text-xs text-[var(--color-text-primary)]">평균 대비 128% 장기 재직</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 text-left">
                  <div className="text-[10px] text-blue-600 mb-1">글로벌 활동</div>
                  <div className="text-xs text-[var(--color-text-primary)]">국제 프로젝트 다수 참여</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>신뢰할 수 있는</span>
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>통찰력 있는</span>
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>전문적인</span>
              </div>

              <div className="rounded-xl p-3 text-left" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                <p className="text-[10px] text-[var(--color-text-secondary)] italic">&quot;함께 일하고 싶은 사람이에요&quot;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="px-6 py-20" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-soft) 70%, transparent)' }}>
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          명함은 연락처를 보여주지만,
          <br />
          나를 증명해주지는 않습니다
        </motion.h2>

        <div className="space-y-4">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface-card rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <problem.icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1.5 text-[var(--color-text-strong)]">{problem.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          Byro는 흩어진 신호를
          <br />
          하나의 신뢰 프로필로 정리합니다
        </motion.h2>

        <div className="space-y-6">
          {solutionSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg">
                {index + 1}
              </div>

              <div className="surface-card rounded-2xl p-6 pl-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg pt-2 text-[var(--color-text-strong)]">{step.title}</h3>
                </div>

                <ul className="space-y-2 ml-1">
                  {step.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {index < solutionSteps.length - 1 && (
                <div className="absolute left-1 top-full w-0.5 h-6 bg-gradient-to-b from-purple-300 to-transparent -mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HighlightSection() {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-bg-soft) 70%, transparent), var(--color-bg-page))' }}>
      <div className="max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl tracking-tight mb-3 text-[var(--color-text-strong)]">
            자기소개보다 먼저 보이는
            <br />
            검증 하이라이트
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            말보다 신뢰를 남기는 정보만 골라 보여줍니다
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mt-10"
      >
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide">
          {highlightCards.map((highlight, index) => (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="surface-card rounded-2xl p-6 shadow-lg h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${highlight.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <highlight.icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wide">
                  {highlight.label}
                </div>

                <div className="text-base text-[var(--color-text-strong)] leading-relaxed">
                  {highlight.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-center gap-1.5 mt-6">
        {highlightCards.map((item) => (
          <div
            key={item.label}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-text-tertiary)' }}
          />
        ))}
      </div>
    </section>
  )
}

function ComparisonSection() {
  return (
    <section className="px-6 py-20" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-soft) 45%, transparent)' }}>
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-4 text-[var(--color-text-strong)]"
        >
          간단함과 전문성,
          <br />
          그 사이의 완벽한 균형
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          오프라인 네트워킹에 최적화된 신뢰 프로필
        </motion.p>

        <div className="grid grid-cols-3 gap-3">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${
                item.isHighlight
                  ? 'bg-white border-2 shadow-lg'
                  : 'bg-white border shadow-sm'
              } rounded-2xl p-4 relative`}
              style={item.isHighlight ? { borderColor: 'var(--color-accent-brand-soft)' } : { borderColor: 'var(--color-border-default)' }}
            >
              {item.isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] px-3 py-1 rounded-full shadow-md">
                    Best
                  </div>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 mx-auto`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>

              <div className={`text-sm text-center mb-4 ${item.isHighlight ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-primary)]'}`}>
                {item.name}
              </div>

              <div className="space-y-2">
                {item.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-1.5">
                    {feature.available ? (
                      <Check className={`w-3 h-3 flex-shrink-0 ${item.isHighlight ? 'text-indigo-600' : 'text-[var(--color-text-tertiary)]'}`} />
                    ) : (
                      <X className="w-3 h-3 flex-shrink-0 text-[var(--color-border-default)]" />
                    )}
                    <span className={`text-[10px] leading-tight ${
                      feature.available
                        ? item.isHighlight ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-secondary)]'
                        : 'text-[var(--color-text-tertiary)]'
                    }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs text-indigo-700">신뢰 기반 오프라인 네트워킹의 새로운 기준</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProductPreviewSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          실제로는 이렇게 보입니다
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="rounded-[2rem] p-4 shadow-2xl max-w-[360px] mx-auto" style={{ background: 'linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-soft))', border: '1px solid var(--color-border-default)' }}>
            <div className="surface-card rounded-[1.5rem] p-6 shadow-inner">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600" />
                  <div className="flex-1 text-left">
                    <div className="text-base text-[var(--color-text-strong)] mb-0.5">이서연</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Growth Product Manager</div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                    데이터 기반 성장 전략을 설계하고 실행합니다. B2B SaaS 프로덕트 경험 4년차
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2">Highlights</div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                    <div className="text-[10px] text-indigo-600 mb-1">리멤버 네트워크</div>
                    <div className="text-xs text-[var(--color-text-primary)]">스타트업 중심 인맥 구조</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3">
                    <div className="text-[10px] text-blue-600 mb-1">강연 경험</div>
                    <div className="text-xs text-[var(--color-text-primary)]">Startup Conference 2025</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>전략적인</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>데이터 기반</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}>실행력 있는</span>
                </div>

                <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                    <div className="flex-1">
                      <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed italic">
                        &quot;문제를 빠르게 파악하고 해결하는 능력이 인상적이었습니다&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {uiElements.map((element, index) => (
            <motion.div
              key={element.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="surface-card rounded-xl p-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                <element.icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xs text-[var(--color-text-strong)] mb-1">{element.title}</div>
              <div className="text-[10px] text-[var(--color-text-tertiary)] leading-relaxed">
                {element.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReputationSection() {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-white to-gray-50/30">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-4 text-[#111]"
        >
          프로필은 한 번 만들고,
          <br />
          신뢰는 계속 쌓입니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[#111]/60 text-center mb-12 leading-relaxed"
        >
          평판 키워드가 누적되고, 방명록과 피드백이 쌓이며,
          <br />
          오프라인 만남의 인상이 기록으로 남습니다
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
        >
          <div className="text-xs text-[#111]/50 uppercase tracking-wide mb-4">
            평판 키워드
          </div>
          <div className="flex flex-wrap gap-2">
            {reputationKeywords.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm border border-indigo-100"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-[#111]/70 leading-relaxed mb-4 italic">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
                <div className="text-left">
                  <div className="text-xs text-[#111]">{testimonial.author}</div>
                  <div className="text-[10px] text-[#111]/50">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse" />
            <span className="text-xs text-indigo-700">신뢰 자산이 실시간으로 쌓입니다</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TargetUserSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[#111]"
        >
          사람을 자주 만나는 사람에게
          <br />
          특히 잘 맞습니다
        </motion.h2>

        <div className="grid grid-cols-2 gap-3">
          {targetUsers.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-sm text-[#111]">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTASection({
  isLoggedIn,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onLogin,
}: {
  isLoggedIn: boolean
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onLogin: () => void
}) {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-gray-50/30 to-white">
      <div className="max-w-md mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight mb-12 text-[var(--color-text-strong)]"
        >
          설명보다 먼저 전해지는
          <br />
          프로필을 만들어보세요
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 mb-16"
        >
          <Button
            onClick={onPrimary}
            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-lg group"
          >
            <span>{primaryLabel}</span>
            <ArrowRight className="w-5 h-5 ml-2 inline-block" />
          </Button>
          <Button
            variant="outline"
            onClick={onSecondary}
            className="w-full h-12 border-2 rounded-2xl"
          >
            {isLoggedIn ? '샘플 보기' : secondaryLabel}
          </Button>
          {!isLoggedIn && (
            <div className="text-xs text-[var(--color-text-tertiary)]">
              샘플 프로필은 실제 기능이 아니라 플로우 검증용 화면이에요.
            </div>
          )}
          {!isLoggedIn && (
            <button
              onClick={onLogin}
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              로그인
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-12 border-t"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <div className="text-2xl tracking-tight mb-4 text-[var(--color-text-strong)]">Byro</div>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-8">
            Live it, Prove It
          </p>
          <div className="flex justify-center gap-6 text-xs text-[var(--color-text-tertiary)]">
            <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">서비스 소개</a>
            <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">문의하기</a>
            <a href="#" className="hover:text-[var(--color-text-secondary)] transition-colors">개인정보처리방침</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FixedCTA({
  isLoggedIn,
  label,
  onClick,
}: {
  isLoggedIn: boolean
  label: string
  onClick: () => void
}) {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

  return (
    <motion.div
      style={{ opacity }}
      className="sticky bottom-0 left-0 right-0 z-50 pb-6 px-6 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="rounded-2xl shadow-2xl border p-4 backdrop-blur-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-surface) 95%, transparent)', borderColor: 'var(--color-border-default)' }}>
          <Button
            onClick={onClick}
            className={[
              'w-full h-12 rounded-xl shadow-md',
              isLoggedIn
                ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
            ].join(' ')}
          >
            <span>{label}</span>
            <ArrowRight className="w-4 h-4 ml-2 inline-block" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
