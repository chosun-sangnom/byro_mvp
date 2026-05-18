'use client'

// ─── Spotify API 연동 가이드 (백엔드 구현 시 참고) ────────────────────────────
//
// [인증] Client Credentials Flow — 유저 로그인 불필요
//   POST https://accounts.spotify.com/api/token
//   Headers: Authorization: Basic base64(client_id:client_secret)
//   Body: grant_type=client_credentials
//   → { access_token, expires_in: 3600 }
//   ※ access_token은 서버에서 캐싱 권장 (Redis or in-memory, TTL 3500s)
//
// [검색 엔드포인트]
//   GET https://api.spotify.com/v1/search?q={query}&type=track&limit=10&market=KR
//   Headers: Authorization: Bearer {access_token}
//
// [응답에서 추출할 필드]
//   tracks.items[].id               → 고유 ID
//   tracks.items[].name             → 트랙명 (= LifeMediaItem.label)
//   tracks.items[].artists[0].name  → 아티스트명 (= LifeMediaItem.sublabel)
//   tracks.items[].album.images[1].url  → 앨범아트 300x300 (= LifeMediaItem.posterUrl)
//   tracks.items[].preview_url      → 30초 미리듣기 URL (= LifeMediaItem.previewUrl)
//                                     ※ null인 경우 많음 (한국 포함 일부 지역 제한)
//
// [Next.js API Route 예시]
//   GET /api/spotify/search?q=아이유&market=KR
//   → { tracks: Array<{ id, title, artist, albumArt, previewUrl }> }
//
// [주의사항]
//   - SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET은 .env.local에 저장 (클라이언트 노출 금지)
//   - 앨범아트 이미지는 Spotify ToS상 직접 CDN 저장 불가, URL만 참조할 것
//   - 검색 결과 캐싱 시 TTL 짧게 유지 (Spotify 정책)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Music, Search, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'

interface MockTrack {
  id: string
  title: string
  artist: string
  album: string
  // TODO(backend): 이 color 필드를 posterUrl(앨범아트 URL)로 교체
  // Spotify 응답: tracks.items[n].album.images[1].url
  placeholderColor: string
}

// TODO(backend): 아래 MOCK_TRACKS를 /api/spotify/search 호출로 교체
// 쿼리가 비어있을 때는 빈 배열 또는 최근 검색/인기 트랙 반환
const MOCK_TRACKS: MockTrack[] = [
  // ── K-Pop / K-인디 ──────────────────────────────────────────────────────
  { id: 'iu-blueming',    title: 'Blueming',       artist: '아이유',           album: 'LILAC',          placeholderColor: '#8B7EC8' },
  { id: 'iu-celebrity',   title: 'Celebrity',       artist: '아이유',           album: 'Lilac',          placeholderColor: '#6B9BD2' },
  { id: 'iu-lovepoem',    title: 'Love poem',       artist: '아이유',           album: 'Love poem',      placeholderColor: '#5B8C5A' },
  { id: 'gi-tomboy',      title: 'TOMBOY',           artist: '(여자)아이들',     album: 'I NEVER DIE',   placeholderColor: '#C0392B' },
  { id: 'nj-hypebay',     title: 'Hype Boy',         artist: 'NewJeans',        album: 'New Jeans',      placeholderColor: '#E8A838' },
  { id: 'nj-ditto',       title: 'Ditto',            artist: 'NewJeans',        album: 'OMG',            placeholderColor: '#7FB3D3' },
  { id: 'nj-eta',         title: 'ETA',              artist: 'NewJeans',        album: 'Get Up',         placeholderColor: '#82E0AA' },
  { id: 'bts-dynamite',   title: 'Dynamite',         artist: 'BTS',             album: 'BE',             placeholderColor: '#F0B27A' },
  { id: 'lsf-anti',       title: 'ANTIFRAGILE',      artist: 'LE SSERAFIM',     album: 'ANTIFRAGILE',   placeholderColor: '#A569BD' },
  { id: 'yh-event',       title: '사건의 지평선',    artist: '윤하',             album: 'PADO',           placeholderColor: '#2C3E50' },
  { id: 'hyuk-tomboy',    title: 'Tomboy',           artist: '혁오',             album: '22',             placeholderColor: '#2E4057' },
  { id: 'bcs-every',      title: 'Everything',       artist: '검정치마',         album: 'Team Baby',      placeholderColor: '#1C2833' },
  { id: 'swja-fire',      title: 'Fireworks',        artist: '선우정아',         album: '선우정아',       placeholderColor: '#E74C3C' },
  { id: 'im-love',        title: '사랑은 늘 도망가', artist: '임영웅',           album: '사랑은 늘 도망가', placeholderColor: '#76D7C4' },
  // ── 글로벌 ──────────────────────────────────────────────────────────────
  { id: 'tw-blinding',    title: 'Blinding Lights',  artist: 'The Weeknd',      album: 'After Hours',    placeholderColor: '#C0392B' },
  { id: 'es-shape',       title: 'Shape of You',     artist: 'Ed Sheeran',      album: '÷',              placeholderColor: '#27AE60' },
  { id: 'hs-asitwas',     title: 'As It Was',        artist: 'Harry Styles',    album: "Harry's House",  placeholderColor: '#E91E63' },
  { id: 'dl-levitate',    title: 'Levitating',       artist: 'Dua Lipa',        album: 'Future Nostalgia', placeholderColor: '#9C27B0' },
  { id: 'ga-heatwaves',   title: 'Heat Waves',       artist: 'Glass Animals',   album: 'Dreamland',      placeholderColor: '#FF9800' },
  { id: 'ol-drivers',     title: "drivers license",  artist: 'Olivia Rodrigo',  album: 'SOUR',           placeholderColor: '#5DADE2' },
]

// 앨범아트 플레이스홀더 — 백엔드 연동 후 실제 이미지로 교체
function AlbumArt({
  posterUrl,
  placeholderColor,
  size = 44,
}: {
  posterUrl?: string
  placeholderColor: string
  size?: number
}) {
  if (posterUrl) {
    // TODO(backend): Spotify에서 받은 실제 앨범아트 URL
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={posterUrl} alt="앨범 커버" className="rounded-lg object-cover flex-shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: placeholderColor }}
    >
      <Music size={size * 0.35} color="rgba(255,255,255,0.7)" />
    </div>
  )
}

export function MusicSearchPicker({
  selected,
  onChange,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [query, setQuery] = useState('')

  // TODO(backend): query 변경 시 debounce(300ms) 후 /api/spotify/search?q={query}&market=KR 호출
  // const [isLoading, setIsLoading] = useState(false)
  // useEffect(() => {
  //   if (!query.trim()) return setResults([])
  //   const timer = setTimeout(async () => {
  //     setIsLoading(true)
  //     const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&market=KR`)
  //     const data = await res.json()
  //     setResults(data.tracks) // { id, title, artist, albumArt, previewUrl }
  //     setIsLoading(false)
  //   }, 300)
  //   return () => clearTimeout(timer)
  // }, [query])
  const results = query.trim()
    ? MOCK_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase()) ||
          t.album.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  const selectedIds = new Set(selected.map((s) => `${s.label}__${s.sublabel}`))

  const toggle = (track: MockTrack) => {
    const key = `${track.title}__${track.artist}`
    if (selectedIds.has(key)) {
      onChange(selected.filter((s) => `${s.label}__${s.sublabel}` !== key))
    } else {
      onChange([
        ...selected,
        {
          label: track.title,
          sublabel: track.artist,
          // TODO(backend): posterUrl: track.albumArt (Spotify API 응답값)
          // previewUrl: track.previewUrl (null일 수 있음)
        },
      ])
    }
  }

  const remove = (item: LifeMediaItem) => {
    onChange(selected.filter((s) => !(s.label === item.label && s.sublabel === item.sublabel)))
  }

  // 선택된 트랙에 해당하는 mock 색상 찾기 (백엔드 연동 후 posterUrl로 대체)
  const getPlaceholderColor = (item: LifeMediaItem) =>
    MOCK_TRACKS.find((t) => t.title === item.label && t.artist === item.sublabel)?.placeholderColor ?? '#888'

  return (
    <div>
      {/* 선택된 트랙 목록 */}
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

      {/* 검색창 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="곡명 또는 아티스트 검색..."
          // TODO(backend): onChange → debounce API 호출
          className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
          {results.map((track) => {
            const key = `${track.title}__${track.artist}`
            const isSelected = selectedIds.has(key)
            return (
              <button
                key={track.id}
                onClick={() => toggle(track)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
              >
                <AlbumArt placeholderColor={track.placeholderColor} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{track.title}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{track.artist} · {track.album}</p>
                </div>
                <div
                  className="h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                    background: isSelected ? 'var(--color-accent-dark)' : 'transparent',
                  }}
                >
                  {isSelected && <span className="text-[9px] font-black text-white">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 검색어 있는데 결과 없을 때 */}
      {query.trim() && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
          검색 결과가 없어요
          {/* TODO(backend): 실제 API 연동 후 이 케이스가 줄어듦 */}
        </p>
      )}

      {/* 검색 전 안내 */}
      {!query.trim() && selected.length === 0 && (
        <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
          좋아하는 곡이나 아티스트를 검색해보세요
        </p>
      )}
    </div>
  )
}
