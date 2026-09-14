'use client'

// ─── Spotify API 연동 가이드 (백엔드 구현 시 참고) ────────────────────────────
//
// [인증] Client Credentials Flow
//   POST https://accounts.spotify.com/api/token
//   Headers: Authorization: Basic base64(client_id:client_secret)
//   Body: grant_type=client_credentials
//   → { access_token, expires_in: 3600 }  ※ 서버에서 캐싱 (TTL 3500s)
//
// [검색] GET https://api.spotify.com/v1/search?q={query}&type=track&limit=10&market=KR
//   tracks.items[].name             → 곡명 (LifeMediaItem.label)
//   tracks.items[].artists[0].name  → 아티스트 (LifeMediaItem.sublabel)
//   tracks.items[].album.images[1].url → 앨범아트 300×300 (LifeMediaItem.posterUrl)
//   tracks.items[].preview_url      → 30초 미리듣기 (LifeMediaItem.previewUrl, null 가능)
//
// Next.js Route: GET /api/spotify/search?q={query}&market=KR
// ※ SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET → .env.local (클라이언트 노출 금지)
// ※ Spotify 미연동 상태에서 preview_url 없는 경우 → 재생 버튼 비활성화 처리 예정
//
// TODO(real API): 연동 후 아래 MOCK_TRACKS 및 AI 검색을 폴백으로 전환
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { Loader2, Music, PenLine, Search, Sparkles, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'
import type { AiSearchItem } from '@/app/api/ai-search/route'

interface MockTrack {
  id: string
  title: string
  artist: string
  album: string
  placeholderColor: string
  // TODO(real API): posterUrl: string  — Spotify album.images[1].url
  // TODO(real API): previewUrl: string | null — Spotify preview_url
}

// TODO(real API): 아래 MOCK_TRACKS를 /api/spotify/search 호출로 교체
const MOCK_TRACKS: MockTrack[] = [
  { id: 'iu-blueming',  title: 'Blueming',         artist: '아이유',         album: 'LILAC',            placeholderColor: '#8B7EC8' },
  { id: 'iu-celebrity', title: 'Celebrity',         artist: '아이유',         album: 'Lilac',            placeholderColor: '#6B9BD2' },
  { id: 'iu-lovepoem',  title: 'Love poem',         artist: '아이유',         album: 'Love poem',        placeholderColor: '#5B8C5A' },
  { id: 'gi-tomboy',    title: 'TOMBOY',             artist: '(여자)아이들',  album: 'I NEVER DIE',      placeholderColor: '#C0392B' },
  { id: 'nj-hypebay',   title: 'Hype Boy',           artist: 'NewJeans',      album: 'New Jeans',        placeholderColor: '#E8A838' },
  { id: 'nj-ditto',     title: 'Ditto',              artist: 'NewJeans',      album: 'OMG',              placeholderColor: '#7FB3D3' },
  { id: 'nj-eta',       title: 'ETA',                artist: 'NewJeans',      album: 'Get Up',           placeholderColor: '#82E0AA' },
  { id: 'bts-dynamite', title: 'Dynamite',           artist: 'BTS',           album: 'BE',               placeholderColor: '#F0B27A' },
  { id: 'lsf-anti',     title: 'ANTIFRAGILE',        artist: 'LE SSERAFIM',   album: 'ANTIFRAGILE',      placeholderColor: '#A569BD' },
  { id: 'yh-event',     title: '사건의 지평선',      artist: '윤하',           album: 'PADO',             placeholderColor: '#2C3E50' },
  { id: 'hyuk-tomboy',  title: 'Tomboy',             artist: '혁오',           album: '22',               placeholderColor: '#2E4057' },
  { id: 'bcs-every',    title: 'Everything',         artist: '검정치마',       album: 'Team Baby',        placeholderColor: '#1C2833' },
  { id: 'swja-fire',    title: 'Fireworks',          artist: '선우정아',       album: '선우정아',          placeholderColor: '#E74C3C' },
  { id: 'im-love',      title: '사랑은 늘 도망가',   artist: '임영웅',         album: '사랑은 늘 도망가', placeholderColor: '#76D7C4' },
  { id: 'tw-blinding',  title: 'Blinding Lights',    artist: 'The Weeknd',    album: 'After Hours',      placeholderColor: '#C0392B' },
  { id: 'es-shape',     title: 'Shape of You',       artist: 'Ed Sheeran',    album: '÷',                placeholderColor: '#27AE60' },
  { id: 'hs-asitwas',   title: 'As It Was',          artist: 'Harry Styles',  album: "Harry's House",    placeholderColor: '#E91E63' },
  { id: 'dl-levitate',  title: 'Levitating',         artist: 'Dua Lipa',      album: 'Future Nostalgia', placeholderColor: '#9C27B0' },
  { id: 'ga-heatwaves', title: 'Heat Waves',         artist: 'Glass Animals', album: 'Dreamland',        placeholderColor: '#FF9800' },
  { id: 'ol-drivers',   title: "drivers license",    artist: 'Olivia Rodrigo', album: 'SOUR',            placeholderColor: '#5DADE2' },
]

function AlbumArt({ posterUrl, placeholderColor, size = 44 }: { posterUrl?: string; placeholderColor: string; size?: number }) {
  if (posterUrl) {
    // TODO(real API): Spotify 앨범아트 URL
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={posterUrl} alt="앨범 커버" className="rounded-lg object-cover flex-shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: placeholderColor }}>
      <Music size={size * 0.35} color="rgba(255,255,255,0.7)" />
    </div>
  )
}

function CheckCircle({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className="h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
      style={{
        borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
        background: isSelected ? 'var(--color-accent-dark)' : 'transparent',
      }}
    >
      {isSelected && <span className="text-[9px] font-black text-white">✓</span>}
    </div>
  )
}

export function MusicSearchPicker({
  selected,
  onChange,
  maxItems,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
  maxItems?: number
}) {
  const limit = maxItems ?? 5
  const [query, setQuery] = useState('')
  const [aiResults, setAiResults] = useState<AiSearchItem[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showDirect, setShowDirect] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customArtist, setCustomArtist] = useState('')

  // TODO(real API): query 변경 시 debounce(300ms) 후 /api/spotify/search?q={query}&market=KR 호출로 교체
  const mockResults = query.trim()
    ? MOCK_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase()) ||
          t.album.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  useEffect(() => {
    if (!query.trim() || mockResults.length > 0) { setAiResults([]); setAiLoading(false); return }
    setAiLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ai-search?q=${encodeURIComponent(query)}&type=music`)
        const data = await res.json()
        setAiResults(data.items ?? [])
      } catch {
        setAiResults([])
      } finally {
        setAiLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mockResults.length])

  const selectedIds = new Set(selected.map((s) => `${s.label}__${s.sublabel}`))
  const isAtLimit = selected.length >= limit

  const toggleMock = (track: MockTrack) => {
    const key = `${track.title}__${track.artist}`
    if (selectedIds.has(key)) {
      onChange(selected.filter((s) => `${s.label}__${s.sublabel}` !== key))
    } else {
      if (isAtLimit) return
      onChange([...selected, {
        label: track.title,
        sublabel: track.artist,
        // TODO(real API): posterUrl: track.posterUrl, previewUrl: track.previewUrl
      }])
    }
  }

  const toggleAi = (item: AiSearchItem) => {
    const key = `${item.title}__${item.subtitle}`
    if (selectedIds.has(key)) {
      onChange(selected.filter((s) => `${s.label}__${s.sublabel}` !== key))
    } else {
      if (isAtLimit) return
      onChange([...selected, { label: item.title, sublabel: item.subtitle }])
    }
  }

  const addCustom = () => {
    const title = customTitle.trim()
    if (!title || isAtLimit) return
    const key = `${title}__${customArtist.trim()}`
    if (selectedIds.has(key)) return
    onChange([...selected, { label: title, sublabel: customArtist.trim() || undefined }])
    setCustomTitle('')
    setCustomArtist('')
  }

  const remove = (item: LifeMediaItem) => {
    onChange(selected.filter((s) => !(s.label === item.label && s.sublabel === item.sublabel)))
  }

  const getPlaceholderColor = (item: LifeMediaItem) =>
    MOCK_TRACKS.find((t) => t.title === item.label && t.artist === item.sublabel)?.placeholderColor ?? '#888'

  return (
    <div>
      {/* 선택된 트랙 */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-2">
          {selected.map((item) => (
            <div
              key={`${item.label}__${item.sublabel}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
            >
              <AlbumArt posterUrl={item.posterUrl} placeholderColor={getPlaceholderColor(item)} size={36} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>
              </div>
              <button onClick={() => remove(item)} className="flex-shrink-0 p-1">
                <X size={14} className="text-[var(--color-text-tertiary)]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAtLimit && (
        <p className="mb-3 text-center text-[12px] text-[var(--color-text-tertiary)]">
          슬롯이 가득 찼어요 · Pro로 업그레이드하면 더 추가할 수 있어요
        </p>
      )}

      <div className={isAtLimit ? 'pointer-events-none opacity-40' : undefined}>
          {/* 검색창 */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="곡명 또는 아티스트 검색..."
              disabled={isAtLimit}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>

          {/* Mock 결과 */}
          {mockResults.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
              {mockResults.map((track) => {
                const key = `${track.title}__${track.artist}`
                const isSelected = selectedIds.has(key)
                return (
                  <button
                    key={track.id}
                    onClick={() => toggleMock(track)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                  >
                    <AlbumArt placeholderColor={track.placeholderColor} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{track.title}</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">{track.artist} · {track.album}</p>
                    </div>
                    <CheckCircle isSelected={isSelected} />
                  </button>
                )
              })}
            </div>
          )}

          {/* AI 검색 결과 */}
          {aiLoading && (
            <div className="mt-3 flex items-center justify-center gap-2 py-3 text-[12px] text-[var(--color-text-tertiary)]">
              <Loader2 size={14} className="animate-spin" />
              AI 검색 중...
            </div>
          )}
          {!aiLoading && aiResults.length > 0 && (
            <div className="mt-2">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <Sparkles size={11} className="text-[var(--color-accent-dark)]" />
                <span className="text-[10px] font-bold tracking-wide text-[var(--color-text-tertiary)]">AI 추천</span>
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
                {aiResults.map((item) => {
                  const key = `${item.title}__${item.subtitle}`
                  const isSelected = selectedIds.has(key)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAi(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                    >
                      <AlbumArt posterUrl={item.posterUrl ?? undefined} placeholderColor="#3D4451" size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.subtitle} · {item.detail}</p>
                      </div>
                      <CheckCircle isSelected={isSelected} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {query.trim() && mockResults.length === 0 && !aiLoading && aiResults.length === 0 && (
            <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
              검색 결과가 없어요
            </p>
          )}
          {!query.trim() && selected.length === 0 && (
            <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
              좋아하는 곡이나 아티스트를 검색해보세요
            </p>
          )}

          {/* 직접 입력 */}
          <button
            onClick={() => setShowDirect((v) => !v)}
            disabled={isAtLimit}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-tertiary)]"
          >
            <PenLine size={12} />
            직접 입력
          </button>

          {showDirect && (
            <div className="mt-2 space-y-2">
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder="곡명 *"
                disabled={isAtLimit}
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
              <div className="flex gap-2">
                <input
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                  placeholder="아티스트 (선택)"
                  disabled={isAtLimit}
                  className="flex-1 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
                <button
                  onClick={addCustom}
                  disabled={!customTitle.trim() || isAtLimit}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: 'var(--color-accent-dark)' }}
                >
                  추가
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
