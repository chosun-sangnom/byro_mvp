'use client'

/**
 * KemiReportScreen — 케미 리포트 전용 페이지 (2026-09 재설계)
 *
 * 이전엔 PublicProfileCompatibilitySheet(바텀시트)였으나, 축당 근거를
 * "좋은 점 / 짚어볼 점"으로 세세하게 풀어 보여주는 밀도라 시트에는 안 들어가
 * 전용 페이지(`/[username]/kemi-report`)로 전환했다. 사주 궁합처럼 세세하게
 * 푸는 건 "풀이의 밀도" 얘기지 사주 로직을 쓴다는 뜻이 아니다 — 모든 문장은
 * 여전히 실제 프로필 필드 근거를 단다 (생년월일·생시 미사용).
 *
 * TODO(real API): GAP-8 — kemiReport.ts의 목업 규칙 생성을 서버/LLM으로 교체.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Download, Share2 } from 'lucide-react'
import { showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import { useProfileOwner } from '@/hooks/useProfileOwner'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import {
  AXIS_ORDER,
  buildKemiReport,
  computeKemiScore,
} from '@/components/screens/profile/kemiReport'
import type { KemiAxisReport, KemiPurpose } from '@/types'

import {
  ACCENT,
  BODY,
  FAINT,
  HAIRLINE,
  HERO_GRADIENT,
  INK,
  KEMI_ANIM_CSS,
  KemiAxisCard,
  KemiLockedOverlay,
  MUTED,
  PointGroup,
  WARN,
} from '@/components/screens/profile/kemiReportUi'

// ── 오각형 레이더 차트 ───────────────────────────────────────────────────
function KemiRadar({ axes, score }: { axes: KemiAxisReport[]; score: number }) {
  const cx = 120
  const cy = 112
  const maxR = 78

  const [filled, setFilled] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 160)
    return () => clearTimeout(t)
  }, [])

  const angleFor = (i: number) => (360 / axes.length) * i - 90
  const point = (i: number, r: number) => {
    const rad = (angleFor(i) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const ringPoints = (r: number) => axes.map((_, i) => point(i, r)).map((p) => `${p.x},${p.y}`).join(' ')
  const valueR = (a: KemiAxisReport) => (Math.max(a.strength, 4) / 100) * maxR
  const areaPoints = axes.map((a, i) => point(i, valueR(a))).map((p) => `${p.x},${p.y}`).join(' ')
  const centerOrigin = { transformOrigin: `${cx}px ${cy}px` } as const

  return (
    <div className="relative mx-auto w-full max-w-[248px]">
    <svg viewBox="0 0 240 224" role="img" aria-label="다섯 항목 케미 레이더" className="w-full">
      <defs>
        <linearGradient id="kemiRadarFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.26} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0.08} />
        </linearGradient>
        <radialGradient id="kemiRadarBed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.09} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* 배경 — 그리드가 허공에 떠 보이지 않게, 그리고 중앙 글라스가 굴절할
          바탕이 생기게 아주 옅은 네이비 헤이즈를 깐다 */}
      <circle cx={cx} cy={cy} r={maxR + 4} fill="url(#kemiRadarBed)" />

      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={ringPoints(maxR * f)}
          fill="none"
          stroke={HAIRLINE}
          strokeWidth={f === 1 ? 1.2 : 1}
          strokeOpacity={f === 1 ? 1 : 0.7}
        />
      ))}
      {axes.map((_, i) => {
        const p = point(i, maxR)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={HAIRLINE} strokeWidth={1} strokeOpacity={0.8} />
      })}

      <polygon
        points={areaPoints}
        fill="url(#kemiRadarFill)"
        stroke={ACCENT}
        strokeWidth={2.2}
        strokeLinejoin="round"
        style={{
          ...centerOrigin,
          transform: filled ? 'scale(1)' : 'scale(0.02)',
          opacity: filled ? 1 : 0,
          transition: 'transform 0.85s cubic-bezier(0.34,1.4,0.5,1), opacity 0.5s ease',
        }}
      />
      {axes.map((a, i) => {
        const p = point(i, valueR(a))
        // 데이터가 없는 항목(잠김·부분)은 "0점"이 아니라 "없음"으로 읽히게 옅은 점으로
        const noData = a.locked || a.partial
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={noData ? 2.6 : 3.4}
            fill={noData ? FAINT : ACCENT}
            stroke="#fff"
            strokeWidth={1.5}
            style={{
              ...centerOrigin,
              transform: filled ? 'scale(1)' : 'scale(0)',
              opacity: filled ? 1 : 0,
              transition: `transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.05}s, opacity 0.3s ease ${0.2 + i * 0.05}s`,
            }}
          />
        )
      })}
      {axes.map((a, i) => {
        const p = point(i, maxR + 19)
        const anchor = Math.abs(p.x - cx) < 4 ? 'middle' : p.x > cx ? 'start' : 'end'
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11.5}
            fontWeight={700}
            letterSpacing="-0.01em"
            fill={a.locked ? FAINT : BODY}
          >
            {a.label}
          </text>
        )
      })}

    </svg>

    {/*
      중앙 케미 점수 — SVG는 backdrop-filter를 쓸 수 없어서 HTML로 얹는다.
      아래 폴리곤 채움과 네이비 헤이즈를 흐리게 통과시켜 유리처럼 보이게.
      viewBox(240×224) 기준 cx=120, cy=112 = 정확히 가운데, 지름 62 ≈ 25%.
    */}
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 flex aspect-square w-[25%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(9px) saturate(160%)',
        WebkitBackdropFilter: 'blur(9px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 6px 18px rgba(37,49,61,0.14), inset 0 1px 1px rgba(255,255,255,0.95)',
        opacity: filled ? 1 : 0,
        transform: filled
          ? 'translate(-50%,-50%) scale(1)'
          : 'translate(-50%,-50%) scale(0.82)',
        transition: 'opacity .45s ease .2s, transform .55s cubic-bezier(0.34,1.4,0.5,1) .2s',
      }}
    >
      <span className="text-[24px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: INK }}>{score}</span>
      <span className="mt-[3px] text-[8.5px] font-bold tracking-[0.06em]" style={{ color: MUTED }}>케미 점수</span>
    </div>
    </div>
  )
}

// ── 공유 카드 (html2canvas 캡처 + 미리보기 겸용) ────────────────────────────
function AvatarCircle({
  src,
  name,
  size,
  fontSize,
  ring,
}: {
  src?: string
  name: string
  size: number
  fontSize: number
  /** 히어로처럼 컬러 배경 위에 올릴 때 — 흰 링 + 그림자로 아바타를 띄운다 */
  ring?: boolean
}) {
  const shell = ring
    ? { border: '2.5px solid rgba(255,255,255,0.92)', boxShadow: '0 6px 18px rgba(9, 34, 82, 0.28)' }
    : { border: '0.66px solid rgba(255,255,255,0.85)' }

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...shell }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(150deg, #DCEBFF 0%, #9CC6FF 45%, #4E8BE8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, ...shell,
    }}>
      <span style={{ fontSize, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{name.charAt(0)}</span>
    </div>
  )
}

function ShareCard({
  cardRef,
  viewerName,
  viewerAvatar,
  profileName,
  profileAvatar,
  score,
  tags,
  offscreen,
}: {
  cardRef?: React.RefObject<HTMLDivElement>
  viewerName: string
  viewerAvatar?: string
  profileName: string
  profileAvatar?: string
  score: number
  tags: string[]
  offscreen?: boolean
}) {
  return (
    <div
      ref={cardRef}
      style={{
        ...(offscreen ? { position: 'fixed', left: '-9999px', top: 0, width: '328px' } : { width: '100%' }),
        background: '#FFFFFF',
        borderRadius: '12px',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        border: offscreen ? undefined : `0.66px solid ${HAIRLINE}`,
      }}
    >
      <div style={{
        position: 'relative',
        background: HERO_GRADIENT,
        padding: '24px',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)',
          background: '#FFFFFF', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px',
          padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '2px',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kemi/report-badge-icon.svg" alt="" style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#25313D' }}>Kemi Report</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={viewerAvatar} name={viewerName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{viewerName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={profileAvatar} name={profileName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{profileName}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6C7786' }}>케미 점수</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D' }}>{score}점</span>
          </div>
          <div style={{ height: '4px', borderRadius: '100px', background: HAIRLINE, width: '100%' }}>
            <div style={{ height: '100%', borderRadius: '100px', background: '#25313D', width: `${score}%` }} />
          </div>
        </div>
        {tags.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: '12px' }}>강한 항목</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((tag) => (
                <span key={tag} style={{ background: '#F0F5FF', color: '#25313D', borderRadius: '8px', padding: '6px 10px', fontSize: '14px', fontWeight: 700 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 분석 중 로딩 화면 (학력 OCR 인증 화면과 동일한 스피너·레이아웃) ─────────────
const KEMI_ANALYZE_STEPS = [
  '이름·프로필 인식 중...',
  '경력·평판 분석 중...',
  '성격·생활·취향 분석 중...',
  '케미 리포트 정리 중...',
]

function KemiAnalyzing({ targetName, onBack, onDone }: { targetName: string; onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2100),
      setTimeout(onDone, 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <div className="flex h-12 flex-shrink-0 items-center px-2" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <button onClick={onBack} className="flex items-center p-2" style={{ color: '#0D0D0D' }}>
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="px-5 pt-2">
        <h1 className="text-[22px] font-bold text-[#0D0D0D]">{targetName}님과의 케미 리포트</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/ai-tools/ocr-loading-spinner.svg" alt="" className="h-12 w-12 animate-spin" />
        <p className="text-[14px] font-semibold text-[#475058]">{KEMI_ANALYZE_STEPS[step]}</p>
      </div>
    </div>
  )
}

// ── 메인 스크린 ─────────────────────────────────────────────────────────
export default function KemiReportScreen({ username }: { username: string }) {
  const router = useRouter()
  const store = useFeloreStore()
  const { isOwner, isLoggedIn, user } = useProfileOwner(username)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (isOwner || !isLoggedIn) router.replace(`/${username}`)
  }, [mounted, isOwner, isLoggedIn, router, username])

  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })

  const [purpose, setPurpose] = useState<KemiPurpose>('work')
  const [sharing, setSharing] = useState(false)
  const [analyzing, setAnalyzing] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  const viewerName = user?.name ?? '나'
  const viewerAvatar = user?.profileImages?.[0] ?? user?.avatarImage
  const profileAvatar = profile.profileImages?.[0] ?? profile.avatarImage

  const report = buildKemiReport(
    purpose,
    { name: viewerName, title: user?.title ?? '', whoIAm: user?.whoIAm, life: user?.life },
    profile,
    // [임시] 강명구 리포트에선 생활 축 잠금(뷰어 미입력) 패턴을 목업으로 보여준다
    { forceLifeLock: username === 'mk' },
  )

  if (!mounted || isOwner || !isLoggedIn) return null

  if (analyzing) {
    return <KemiAnalyzing targetName={profile.name} onBack={() => router.back()} onDone={() => setAnalyzing(false)} />
  }

  const archetype = report.archetype
  const score = computeKemiScore(report.axes, purpose)
  const strongTags = [...report.axes]
    .filter((a) => !a.locked && !a.partial)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((a) => a.label)

  const handleShare = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true, logging: false })
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(); return }
          const file = new File([blob], `felore-kemi-${profile.name}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: `${profile.name}님과의 케미 리포트`, text: `felore에서 ${profile.name}님과의 케미를 확인했어요!` })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `felore-kemi-${profile.name}.png`
              a.click()
              URL.revokeObjectURL(url)
              showToast('이미지가 저장됐어요')
            }
          } catch {
            // 사용자가 공유 시트를 취소한 경우 등 — 에러로 취급하지 않음
          }
          resolve()
        }, 'image/png')
      })
    } catch {
      showToast('공유에 실패했어요', 'error')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <style>{KEMI_ANIM_CSS}</style>
      {/* 헤더 */}
      <div className="flex h-12 flex-shrink-0 items-center justify-between border-b px-2" style={{ borderColor: HAIRLINE }}>
        <button onClick={() => router.back()} className="flex items-center p-2" style={{ color: '#0D0D0D' }}>
          <ChevronLeft size={20} />
        </button>
        <span className="text-[16px] font-bold" style={{ color: '#0D0D0D' }}>{profile.name}님과의 케미</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto" data-kemi-report>
        {/* 히어로 — 전면 배경이 아니라 카드로 띄워서 앱의 카드 언어와 맞춘다 */}
        <div className="px-5 pt-3">
          <div
            className="relative overflow-hidden px-6 pb-7 pt-6 text-center"
            style={{
              background: HERO_GRADIENT,
              borderRadius: 28,
              boxShadow: '0 14px 32px rgba(14, 48, 110, 0.20)',
            }}
          >
            {/* 우하단 음영 — 단색처럼 평평해 보이지 않게 깊이만 더한다 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(75% 55% at 82% 110%, rgba(10,28,66,0.40) 0%, rgba(10,28,66,0) 72%)' }}
            />

            <div className="relative">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/75">Kemi Report</span>

              <div className="mt-4 flex items-start justify-center gap-3">
                <div
                  className="flex w-[92px] flex-col items-center gap-2.5"
                  data-kemi-anim
                  style={{ animation: 'kemiCrossL .55s cubic-bezier(.22,1,.36,1) both' }}
                >
                  <AvatarCircle src={viewerAvatar} name={viewerName} size={62} fontSize={22} ring />
                  <span className="line-clamp-1 text-[12.5px] font-bold text-white">{viewerName}</span>
                </div>
                <span
                  className="mt-[22px] flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white/90"
                  data-kemi-anim
                  style={{
                    background: 'rgba(255,255,255,0.16)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    animation: 'kemiPop .4s ease .32s both',
                  }}
                >
                  ×
                </span>
                <div
                  className="flex w-[92px] flex-col items-center gap-2.5"
                  data-kemi-anim
                  style={{ animation: 'kemiCrossR .55s cubic-bezier(.22,1,.36,1) both' }}
                >
                  <AvatarCircle src={profileAvatar} name={profile.name} size={62} fontSize={22} ring />
                  <span className="line-clamp-1 text-[12.5px] font-bold text-white">{profile.name}</span>
                </div>
              </div>

              <div data-kemi-anim style={{ animation: 'kemiFadeUp .5s ease .38s both' }}>
                <h1 className="mt-5 text-[24px] font-bold leading-[1.25] tracking-[-0.03em] text-white">{archetype.name}</h1>
                <p className="mx-auto mt-2 max-w-[286px] text-[13.5px] font-medium leading-[1.6] text-white/85">{archetype.verdict}</p>
                <span
                  className="mt-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.32)' }}
                >
                  {archetype.grade}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*
          관점 토글 — 카드 안이 아니라 바깥, 그리고 아래 모든 블록보다 위에 둔다.
          그래프 안에 있으면 "그래프만 바뀐다"로 읽히지만 실제로는 레이더·항목·종합이
          전부 바뀌기 때문. 반대로 위의 요약 히어로는 토글과 무관하게 고정이다.
        */}
        <div className="px-5 pt-5">
          <div className="mx-auto flex w-full max-w-[236px] gap-1 rounded-full p-1" style={{ background: '#F2F3F5' }}>
            {(['work', 'relationship'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className="flex-1 whitespace-nowrap rounded-full py-2 text-[13px] font-bold transition-colors"
                style={purpose === p
                  ? { background: INK, color: '#fff', boxShadow: '0 2px 8px rgba(13,13,13,0.16)' }
                  : { color: MUTED }}
              >
                {p === 'work' ? '협업' : '관계'}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-center text-[11.5px] font-medium" style={{ color: FAINT }}>
            관점을 바꾸면 아래 분석이 모두 달라져요
          </p>
        </div>

        {/* 레이더 */}
        <div className="px-5 pt-4">
          <div
            className="rounded-[24px] px-4 py-5"
            style={{ border: `1px solid ${HAIRLINE}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <KemiRadar axes={report.axes} score={score} />
          </div>
        </div>

        {/* 항목별 상세 분석 */}
        <div className="px-5 pt-6">
          <p className="mb-3 text-[15px] font-bold tracking-[-0.02em]" style={{ color: INK }}>항목별 상세 분석</p>
          <div className="flex flex-col gap-3">
            {AXIS_ORDER.map((id, idx) => {
              const axis = report.axes.find((a) => a.id === id)!
              return (
                <div key={id} data-kemi-anim style={{ animation: `kemiFadeUp .45s ease ${0.15 + idx * 0.08}s both` }}>
                <KemiAxisCard>
                  {/* 타이틀은 잠긴 항목이어도 항상 노출 — 안의 분석 내용만 가린다 */}
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-[15.5px] font-bold tracking-[-0.02em]" style={{ color: INK }}>{axis.label}</span>
                    {!axis.locked && !axis.partial && (
                      <span
                        className="rounded-[6px] px-[7px] py-[3px] text-[10.5px] font-bold"
                        style={axis.signalKind === 'same'
                          ? { background: '#F0F5FF', color: ACCENT }
                          : { background: '#FFF4E0', color: WARN }}
                      >
                        {axis.signalKind === 'same' ? '같음' : '보완'}
                      </span>
                    )}
                  </div>

                  {axis.locked ? (
                    <div className="relative">
                      <div className="select-none" style={{ filter: 'blur(5px)' }} aria-hidden>
                        <p className="mb-3.5 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>
                          내 정보를 채우면 이 항목에서 {profile.name}님과 얼마나 잘 맞는지, 어떤 점을 조심하면 좋을지 함께 정리해 드려요.
                        </p>
                        <PointGroup
                          tone="good"
                          title="잘 맞는 점"
                          items={['두 사람의 공통점이 여기에 표시돼요', '서로 잘 맞는 부분을 짚어 드려요']}
                        />
                      </div>
                      <KemiLockedOverlay missingItems={axis.missingItems} />
                    </div>
                  ) : (
                    <>
                      {axis.lead && (
                        <p className="mb-3.5 text-[13.5px] leading-[1.65]" style={{ color: BODY }}>{axis.lead}</p>
                      )}
                      <div className="flex flex-col gap-3.5">
                        {axis.goodPoints.length > 0 && (
                          <PointGroup tone="good" title="잘 맞는 점" items={axis.goodPoints} />
                        )}
                        {axis.watchPoints.length > 0 && (
                          <PointGroup tone="watch" title="보완이 필요한 점" items={axis.watchPoints} />
                        )}
                      </div>
                    </>
                  )}
                </KemiAxisCard>
                </div>
              )
            })}
          </div>
        </div>

        {/* 종합 노트 — 왼쪽 컬러 바로 두 카드의 성격을 구분한다 */}
        <div className="px-5 pt-6">
          <p className="mb-3 text-[15px] font-bold tracking-[-0.02em]" style={{ color: INK }}>종합</p>
          <div className="flex flex-col gap-2.5">
            {([
              { title: '잘 맞는 지점', body: report.goodNote, color: ACCENT, delay: 0.6 },
              { title: '조심할 지점', body: report.watchNote, color: WARN, delay: 0.68 },
            ] as const).map((note) => (
              <div
                key={note.title}
                data-kemi-anim
                className="overflow-hidden rounded-[18px] py-4 pl-4 pr-[18px]"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderLeft: `3px solid ${note.color}`,
                  animation: `kemiFadeUp .45s ease ${note.delay}s both`,
                }}
              >
                <p className="text-[13px] font-bold" style={{ color: note.color }}>{note.title}</p>
                <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: BODY }}>{note.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 저장/공유 — 미니 카드는 상단 히어로와 중복이라 화면엔 숨기고 캡처용으로만 렌더 */}
        <div className="px-5 pb-9 pt-7">
          <ShareCard
            cardRef={cardRef}
            viewerName={viewerName}
            viewerAvatar={viewerAvatar}
            profileName={profile.name}
            profileAvatar={profileAvatar}
            score={score}
            tags={strongTags}
            offscreen
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-[13px] text-[14px] font-bold transition-opacity active:opacity-70 disabled:opacity-50"
              style={{ border: `1px solid ${HAIRLINE}`, color: ACCENT }}
            >
              <Download size={16} />
              {sharing ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-[13px] text-[14px] font-bold text-white transition-opacity active:opacity-80 disabled:opacity-50"
              style={{ background: INK, boxShadow: '0 4px 14px rgba(13,13,13,0.16)' }}
            >
              <Share2 size={16} />
              {sharing ? '공유 중…' : '공유'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
