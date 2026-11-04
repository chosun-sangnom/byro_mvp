'use client'

/**
 * [임시] UI/UX 전면 개편 IA 와이어프레임 (니즈·기능 정의서 v0.2 6장)
 * 하단 탭 3개(오늘의 제안 / 내 사람들 / 내 소개) + 어느 탭에서든 떠 있는 플로팅 버튼(말하기, 메모, 녹음, 올리기).
 * 상태별(비회원 / 가입 직후 / 가져오는 중 / 사용 중) 화면을 대충 보여주는 용도.
 * 데이터는 전부 허구 인물. 기존 화면으로 가는 링크는 실제 목업 화면으로 연결된다.
 */

import { createContext, useContext, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Bell, Settings, Sparkles, Users, User, ChevronRight, ChevronLeft, Search,
  Mic, PenLine, Lock, CalendarClock, MessageCircle, Send, Upload, Plus,
  QrCode, BarChart3, Coins, Eye, ShieldCheck, BadgeCheck, X, UserPlus, Check, Square,
  Clock, GitMerge, ArrowUp, FileText, Image as ImageIcon, RefreshCw, CalendarDays, Mail, TriangleAlert,
} from 'lucide-react'

type Tab = 'today' | 'people' | 'me'
type Mode = 'guest' | 'new' | 'importing' | 'active'
type Channel = 'ig' | 'in' | 'kakao' | 'tg' | 'mail' | 'cal'

type Person = {
  id: string
  name: string
  title: string
  member: boolean
  met: string
  tags: string[]
  accounts: { ch: Channel; handle: string }[]
  tone?: string
  note?: string
  /** 회원 본인이 프로필에 쓴 정보. 비회원은 가입한 뒤에 붙는다 */
  self?: string[]
  /** AI가 모은 공개 정보와 내가 고친 내용, 출처와 함께 */
  facts?: Fact[]
  /** 대화와 기록에서 새로 알게 된 것. 확인해야 카드에 붙는다 */
  pending?: Fact[]
}

type Fact = { t: string; src: string }

const PEOPLE: Person[] = [
  { id: 'p1', name: '한서윤', title: '루프벤처스 심사역', member: true, met: '10/29 성수 네트워킹', tags: ['투자'], accounts: [{ ch: 'kakao', handle: '한서윤' }, { ch: 'in', handle: 'seoyun-han' }], tone: '존댓말, 일 얘기 위주', note: '헬스케어 관심, 다음 달 IR 자료 요청', self: ['루프벤처스 심사역, 헬스케어와 바이오 초기 투자', '주말엔 와인 모임', '연락은 카톡이 편해요'] },
  { id: 'p2', name: '도민혁', title: '오르빗랩 대표', member: true, met: '10/24 판교 미팅', tags: ['고객'], accounts: [{ ch: 'ig', handle: '@minhyuk.run' }, { ch: 'kakao', handle: '민혁' }], tone: '반말, 친한 사이', note: '러닝 크루 운영, 둘째 입학 준비 중', self: ['오르빗랩 대표, B2B 물류 SaaS', '러닝 크루 운영 중'], pending: [{ t: '주말 하프 마라톤 완주', src: '인스타 게시물' }] },
  { id: 'p3', name: '윤채린', title: '브랜드 디렉터', member: false, met: '10/18 지인 소개', tags: ['협업'], accounts: [{ ch: 'mail', handle: 'chaerin@studio-yun.kr' }], tone: '존댓말',
    facts: [{ t: '스튜디오 윤 브랜드 디렉터', src: '메일 서명' }, { t: '010-2718-****', src: '메일 서명' }, { t: '지인 소개로 만남, 협업 검토 중', src: '내 메모' }],
    pending: [{ t: '12월에 성수에서 팝업 전시 준비 중', src: '10/31 메일' }, { t: '브랜드 리뉴얼 프로젝트를 맡을 파트너를 찾는 중', src: '10/31 메일' }],
    self: ['스튜디오 윤 브랜드 디렉터, 패션과 리빙 브랜드 전문', '협업 문의는 메일로 받아요'] },
  { id: 'p4', name: '서지환', title: '그린필드 파트너', member: true, met: '7/02 저녁 모임', tags: ['투자'], accounts: [{ ch: 'tg', handle: '@jihwan_s' }] },
  { id: 'p5', name: '마예린', title: '프리랜서 PD', member: false, met: '9/11 행사', tags: [], accounts: [{ ch: 'ig', handle: '@yerin.pd' }],
    facts: [{ t: '프리랜서 PD, 유튜브 예능', src: '인스타 소개글' }], pending: [{ t: '다음 달 부산 촬영', src: '인스타 DM' }] },
]

/** 자동으로 가져왔지만 아직 내 사람으로 올리지 않은 사람 */
const IMPORTED: (Person & { why: string; spam?: boolean })[] = [
  { id: 'i1', name: '@soyeon.film', title: '', member: false, met: '', tags: [], accounts: [{ ch: 'ig', handle: '@soyeon.film' }], why: '인스타 댓글 1회' },
  { id: 'i2', name: '권도윤', title: '', member: true, met: '', tags: [], accounts: [{ ch: 'kakao', handle: '권도윤' }], why: '카톡 단체방 \'성수 네트워킹\'에서' },
  { id: 'i3', name: '박시온', title: '', member: false, met: '', tags: [], accounts: [{ ch: 'cal', handle: 'sion@bluetide.io' }], why: '11/12 일정 참석자' },
  { id: 'i4', name: '@growth.hack.kr', title: '', member: false, met: '', tags: [], accounts: [{ ch: 'ig', handle: '@growth.hack.kr' }], why: '인스타 DM 1회', spam: true },
  { id: 'i5', name: '이준호', title: '', member: false, met: '', tags: [], accounts: [{ ch: 'in', handle: 'junho-lee' }], why: '링크드인 1촌, 대화 없음' },
]

type Draft = {
  id: string
  ch: Channel
  personId: string
  kind: string
  original: string
  context: string
  text: string
  /** 상대가 비회원이면 내 프로필 링크를 붙일지 묻는다 */
  profileLink?: boolean
}

const DRAFTS: Draft[] = [
  { id: 'd1', ch: 'ig', personId: 'p2', kind: '댓글', original: '형 러닝 사진 미쳤다 🔥', context: '친한 사이, 러닝 크루 같이 함', text: 'ㅋㅋ 고마워! 이번 주말에 같이 뛰자' },
  { id: 'd2', ch: 'kakao', personId: 'p1', kind: '메시지', original: '대표님, 말씀하신 IR 자료 언제쯤 받아볼 수 있을까요?', context: '10/29 미팅에서 자료 보내기로 약속함', text: '서윤님, 금요일까지 정리해서 보내드릴게요. 기다려 주셔서 감사합니다.' },
  { id: 'd3', ch: 'mail', personId: 'p3', kind: '메일', original: '포트폴리오 첨부드립니다. 편하실 때 보시고 의견 주세요.', context: '10/18 지인 소개로 만남, 협업 검토 중', text: '채린님, 포트폴리오 잘 받았습니다. 이번 주 안에 보고 의견 드릴게요.', profileLink: true },
  { id: 'd4', ch: 'tg', personId: 'p4', kind: '메시지', original: '다음 주에 저녁 한번 할까요?', context: '7월 이후 연락 없었음', text: '좋아요! 다음 주 목요일 저녁 어떠세요?' },
]

const CH: Record<Channel, { label: string; cls: string }> = {
  ig: { label: '인스타', cls: 'bg-pink-50 text-pink-600' },
  in: { label: '링크드인', cls: 'bg-sky-50 text-sky-700' },
  kakao: { label: '카톡', cls: 'bg-yellow-50 text-yellow-700' },
  tg: { label: '텔레그램', cls: 'bg-blue-50 text-blue-600' },
  mail: { label: '메일', cls: 'bg-neutral-100 text-neutral-600' },
  cal: { label: '캘린더', cls: 'bg-violet-50 text-violet-600' },
}

const personById = (id: string) => PEOPLE.find((p) => p.id === id)!

/* ───────── 연결 ─────────
 * 인스타, 링크드인은 펠로어 화면에서 직접 로그인(서버에서 웹 접속), 텔레그램은 공식 API,
 * 지메일, 구글 캘린더는 구글 동의 화면으로 권한을 하나씩 받는다. 카톡은 대화 파일 올리기만.
 */

type Src = 'ig' | 'in' | 'tg' | 'kakao' | 'gmail' | 'gcal'
type Level = 'read' | 'draft' | 'send'
type Conn = { status: 'on' | 'off' | 'broken'; level: Level; last?: string }
type ConnMap = Record<Src, Conn>

const ALL_LEVELS: Level[] = ['read', 'draft', 'send']

const SRC: Record<Src, { label: string; ch: Channel; group: 'talk' | 'google'; how: 'web' | 'api' | 'google' | 'file'; desc: string; levels: Level[]; note?: string }> = {
  ig: { label: '인스타그램', ch: 'ig', group: 'talk', how: 'web', desc: 'DM과 댓글을 남긴 사람', levels: ALL_LEVELS },
  in: { label: '링크드인', ch: 'in', group: 'talk', how: 'web', desc: '1촌과 메시지 상대', levels: ALL_LEVELS },
  tg: { label: '텔레그램', ch: 'tg', group: 'talk', how: 'api', desc: '대화 상대', levels: ALL_LEVELS },
  kakao: { label: '카톡', ch: 'kakao', group: 'talk', how: 'file', desc: '내보낸 대화 파일', levels: ['read', 'draft'], note: '카톡은 대화 파일만 읽을 수 있어요. 보낼 때는 초안을 복사하거나 카톡 공유로 보내요' },
  gmail: { label: '지메일', ch: 'mail', group: 'google', how: 'google', desc: '주고받은 메일 상대', levels: ALL_LEVELS },
  gcal: { label: '구글 캘린더', ch: 'cal', group: 'google', how: 'google', desc: '일정과 참석자', levels: ['read'], note: '일정 만들기는 다음 단계예요' },
}

const LEVEL: Record<Level, { t: string; d: string }> = {
  read: { t: '읽기만', d: '사람과 대화를 정리만 해요' },
  draft: { t: '초안까지', d: '답장 초안을 만들어 오늘의 제안에 올려요' },
  send: { t: '보내기까지', d: '내가 승인한 초안을 이 계정으로 보내요' },
}

const off = (level: Level = 'draft'): Conn => ({ status: 'off', level })

function initConn(mode: Mode): ConnMap {
  const base: ConnMap = { ig: off(), in: off(), tg: off(), kakao: off(), gmail: off(), gcal: off('read') }
  if (mode === 'importing') {
    return { ...base, ig: { status: 'on', level: 'draft', last: '방금' }, kakao: { status: 'on', level: 'draft', last: '방금' }, in: { status: 'on', level: 'draft', last: '가져오는 중' } }
  }
  if (mode === 'active') {
    return {
      ...base,
      ig: { status: 'on', level: 'send', last: '10분 전' },
      in: { status: 'broken', level: 'send', last: '어제 밤' },
      tg: { status: 'on', level: 'send', last: '10분 전' },
      kakao: { status: 'on', level: 'draft', last: '어제 파일 올림' },
      gmail: { status: 'on', level: 'draft', last: '10분 전' },
    }
  }
  return base
}

const ConnectCtx = createContext<{
  conn: ConnMap
  start: (s: Src) => void
  update: (s: Src, patch: Partial<Conn>) => void
  openHub: () => void
}>({ conn: initConn('new'), start: () => {}, update: () => {}, openHub: () => {} })

const useConnect = () => useContext(ConnectCtx)

/* ───────── 공통 조각 ───────── */

function Tag({ kind }: { kind: 'old' | 'new' | 'later' | 'review' }) {
  const map = {
    old: ['기존', 'bg-neutral-100 text-neutral-500'],
    new: ['신규', 'bg-emerald-50 text-emerald-600'],
    later: ['다음 단계', 'bg-amber-50 text-amber-600'],
    review: ['검토', 'bg-rose-50 text-rose-500'],
  } as const
  const [label, cls] = map[kind]
  return <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>
}

function ChannelBadge({ ch, handle }: { ch: Channel; handle?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${CH[ch].cls}`}>
      {CH[ch].label}{handle && <span className="font-normal opacity-80">{handle}</span>}
    </span>
  )
}

function SectionTitle({ children, tag, right }: { children: ReactNode; tag?: 'old' | 'new' | 'later' | 'review'; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="flex items-center text-[15px] font-bold text-[var(--color-text-strong)]">
        {children}
        {tag && <Tag kind={tag} />}
      </h2>
      {right}
    </div>
  )
}

function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[var(--color-border-soft)] bg-white p-4 ${onClick ? 'cursor-pointer active:bg-neutral-50' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

function Avatar({ name, size = 40, member = true }: { name: string; size?: number; member?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${member ? 'bg-[#25313D] text-white' : 'border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500'}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name.replace('@', '')[0]}
    </div>
  )
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full rounded-full bg-[#0D0D0D] py-3.5 text-[15px] font-semibold text-white disabled:opacity-40">
      {children}
    </button>
  )
}

function Row({ icon, label, desc, href, tag, right, onClick }: { icon: ReactNode; label: string; desc?: ReactNode; href?: string; tag?: 'old' | 'new' | 'later' | 'review'; right?: ReactNode; onClick?: () => void }) {
  const body = (
    <div onClick={onClick} className={`flex items-center gap-3 py-3 ${onClick ? 'cursor-pointer' : ''}`}>
      <span className="text-neutral-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center text-[14px] font-medium text-[var(--color-text-strong)]">
          {label}
          {tag && <Tag kind={tag} />}
        </div>
        {desc && <div className="mt-0.5 text-[12px] text-neutral-500">{desc}</div>}
      </div>
      {right ?? <ChevronRight size={16} className="text-neutral-300" />}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

function PrivateBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
      <Lock size={11} /> 나만 볼 수 있어요
    </span>
  )
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-3">
      <h1 className="text-[20px] font-bold text-[var(--color-text-strong)]">{title}</h1>
      <div className="relative text-neutral-700">
        <Bell size={22} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
      </div>
    </div>
  )
}

/* ───────── 오늘의 제안 ───────── */

function DraftItem({ d, include, text, editing, link, onToggle, onEdit, onChange, onLink, openPerson }: {
  d: Draft; include: boolean; text: string; editing: boolean; link: boolean
  onToggle: () => void; onEdit: () => void; onChange: (v: string) => void; onLink: () => void; openPerson: (p: Person) => void
}) {
  const p = personById(d.personId)
  const edited = text !== d.text
  return (
    <div className={`py-3 ${include ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-2">
        <button onClick={() => openPerson(p)} className="flex items-center gap-2">
          <Avatar name={p.name} size={28} member={p.member} />
          <span className="text-[13px] font-semibold">{p.name}</span>
        </button>
        <ChannelBadge ch={d.ch} />
        <span className="text-[11px] text-neutral-400">{d.kind}</span>
        <button onClick={onToggle} className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full border ${include ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300'}`} aria-label="보낼지 선택">
          {include && <Check size={12} />}
        </button>
      </div>
      <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">&ldquo;{d.original}&rdquo;</p>
      <p className="mt-1.5 text-[11px] text-neutral-400">맥락: {d.context}{p.tone && <> / 말투: {p.tone}</>}</p>
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#25313D] p-3 text-[13px] leading-relaxed outline-none"
          rows={3}
        />
      ) : (
        <button onClick={onEdit} className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-left text-[13px] leading-relaxed">
          {text}
          <span className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400"><PenLine size={11} /> 눌러서 고치기</span>
        </button>
      )}
      {edited && <p className="mt-1 text-[11px] text-emerald-600">고친 내용은 {p.name}님 말투로 기억해요</p>}
      {d.profileLink && (
        <button onClick={onLink} className="mt-2 flex w-full items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-left">
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${link ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300 bg-white'}`}>
            {link && <Check size={10} />}
          </span>
          <span className="flex-1">
            <span className="flex items-center text-[12px] font-medium">내 프로필 링크 붙이기<Tag kind="new" /></span>
            <span className="block text-[11px] text-neutral-500">{p.name}님은 아직 펠로어 회원이 아니에요. 링크로 가입하면 서로 저장돼요</span>
          </span>
        </button>
      )}
    </div>
  )
}

function DraftBatch({ openPerson }: { openPerson: (p: Person) => void }) {
  const [include, setInclude] = useState<Record<string, boolean>>(Object.fromEntries(DRAFTS.map((d) => [d.id, true])))
  const [texts, setTexts] = useState<Record<string, string>>(Object.fromEntries(DRAFTS.map((d) => [d.id, d.text])))
  const [editing, setEditing] = useState<string | null>(null)
  const [links, setLinks] = useState<Record<string, boolean>>(Object.fromEntries(DRAFTS.map((d) => [d.id, !!d.profileLink])))
  const [sent, setSent] = useState(false)

  const count = DRAFTS.filter((d) => include[d.id]).length
  const editedCount = DRAFTS.filter((d) => include[d.id] && texts[d.id] !== d.text).length

  if (sent) {
    return (
      <Card className="text-center">
        <Check size={26} className="mx-auto text-emerald-600" />
        <p className="mt-2 text-[15px] font-bold">{count}개를 보냈어요</p>
        <p className="mt-1 text-[12px] text-neutral-500">
          {editedCount > 0 ? `고친 ${editedCount}건은 관계 맥락으로 저장했어요. ` : ''}빠진 메시지는 다음 묶음에 다시 보여드려요.
        </p>
        <button onClick={() => setSent(false)} className="mt-3 text-[12px] text-neutral-400 underline">다시 보기 (목업)</button>
      </Card>
    )
  }

  return (
    <Card className="!py-1">
      <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] py-3">
        <Clock size={15} className="text-neutral-500" />
        <span className="text-[13px] font-semibold">오전 10시 묶음</span>
        <span className="text-[12px] text-neutral-500">답장 초안 {DRAFTS.length}개</span>
        <span className="ml-auto text-[11px] text-neutral-400">답장 필요 없는 2개 제외</span>
      </div>
      <div className="divide-y divide-[var(--color-border-soft)]">
        {DRAFTS.map((d) => (
          <DraftItem
            key={d.id}
            d={d}
            include={include[d.id]}
            text={texts[d.id]}
            editing={editing === d.id}
            link={links[d.id]}
            onLink={() => setLinks((s) => ({ ...s, [d.id]: !s[d.id] }))}
            onToggle={() => setInclude((s) => ({ ...s, [d.id]: !s[d.id] }))}
            onEdit={() => setEditing(d.id)}
            onChange={(v) => setTexts((s) => ({ ...s, [d.id]: v }))}
            openPerson={openPerson}
          />
        ))}
      </div>
      <div className="pb-3 pt-1">
        <PrimaryButton disabled={count === 0} onClick={() => { setEditing(null); setSent(true) }}>
          {count}개 보내기
        </PrimaryButton>
        <p className="mt-2 text-center text-[11px] text-neutral-400">각자 받은 채널로 내 이름으로 보내져요</p>
      </div>
    </Card>
  )
}

function BriefingCard({ person, sample, onOpen }: { person: Person; sample?: boolean; onOpen?: () => void }) {
  return (
    <Card className="!p-0 overflow-hidden" onClick={onOpen}>
      <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 text-[12px] text-neutral-600">
        <CalendarClock size={14} /> 오후 3시 {person.name}님과 미팅 {sample && <span className="ml-auto text-neutral-400">예시</span>}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={person.name} />
          <div>
            <div className="text-[15px] font-bold">{person.name}</div>
            <div className="text-[12px] text-neutral-500">{person.title}</div>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-[13px] leading-relaxed">
          <p><span className="font-semibold">지난번에</span> {person.note ?? '처음 만나는 사람이에요'}</p>
          <p><span className="font-semibold">최근 인스타</span> 주말 하프 마라톤 완주 사진을 올렸어요</p>
          <p className="font-semibold">꺼내볼 이야기</p>
          <ul className="list-disc space-y-0.5 pl-4 text-neutral-600">
            <li>하프 마라톤 완주 축하</li>
            <li>둘째 입학 준비는 어떻게 되고 있는지</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

/** 가입 직후 화면용. 캘린더를 맨 위에 두고, 하나만 골라도 되게 한다 */
function ConnectList() {
  const { conn, start } = useConnect()
  const order: Src[] = ['gcal', 'ig', 'in', 'kakao', 'tg', 'gmail']
  return (
    <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
      {order.map((s) => (
        <Row
          key={s}
          icon={<ChannelBadge ch={SRC[s].ch} />}
          label={s === 'kakao' ? '카톡 대화 올리기' : `${SRC[s].label} 연결`}
          desc={SRC[s].desc}
          tag={s === 'gcal' ? 'new' : undefined}
          onClick={conn[s].status === 'on' ? undefined : () => start(s)}
          right={conn[s].status === 'on' ? <Check size={16} className="text-emerald-600" /> : undefined}
        />
      ))}
    </Card>
  )
}

function ConnStatus({ c }: { c: Conn }) {
  if (c.status === 'broken') return <span className="text-rose-500">다시 연결이 필요해요</span>
  if (c.status === 'off') return <span>연결 안 함</span>
  return <span>{LEVEL[c.level].t}{c.last && <span className="text-neutral-400">, 마지막 확인 {c.last}</span>}</span>
}

/** 내 소개 > 연결. 곳마다 상태와 비서가 할 수 있는 일을 보여준다 */
function ConnectScreen({ onBack, onDetail }: { onBack: () => void; onDetail: (s: Src) => void }) {
  const { conn, start } = useConnect()
  const groups: { id: 'talk' | 'google'; t: string }[] = [
    { id: 'talk', t: '대화' },
    { id: 'google', t: '메일과 일정' },
  ]
  return (
    <div className="pb-28">
      <div className="flex items-center gap-2 px-3 py-3">
        <button onClick={onBack}><ChevronLeft size={24} /></button>
        <span className="text-[15px] font-semibold">연결</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
      </div>
      <div className="px-5">
        <p className="text-[13px] leading-relaxed text-neutral-500">연결한 곳의 대화와 일정으로 내 사람들을 정리해요. 곳마다 비서가 어디까지 할지 정할 수 있어요.</p>
        {groups.map((g) => (
          <div key={g.id}>
            <SectionTitle>{g.t}</SectionTitle>
            <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
              {(Object.keys(SRC) as Src[]).filter((s) => SRC[s].group === g.id).map((s) => {
                const c = conn[s]
                return (
                  <Row
                    key={s}
                    icon={<ChannelBadge ch={SRC[s].ch} />}
                    label={SRC[s].label}
                    desc={<ConnStatus c={c} />}
                    onClick={() => (c.status === 'on' ? onDetail(s) : start(s))}
                    right={
                      c.status === 'on' ? undefined
                        : c.status === 'broken'
                          ? <span className="rounded-full bg-rose-500 px-3 py-1 text-[12px] font-semibold text-white">다시 연결</span>
                          : <span className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">{s === 'kakao' ? '올리기' : '연결'}</span>
                    }
                  />
                )
              })}
            </Card>
          </div>
        ))}
        <div className="mt-6 space-y-1.5 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] leading-relaxed text-neutral-500">
          <p>비밀번호는 펠로어에 저장하지 않아요. 로그인 상태만 암호화해서 보관해요.</p>
          <p>보내기까지 골라도 내가 승인한 초안만 보내요.</p>
          <p>연결을 끊으면 그곳에서 가져온 대화도 함께 지워요.</p>
        </div>
      </div>
    </div>
  )
}

function LevelPicker({ src, value, onChange }: { src: Src; value: Level; onChange: (l: Level) => void }) {
  return (
    <div className="space-y-2">
      {SRC[src].levels.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${value === l ? 'border-[#25313D] bg-[#25313D]/5' : 'border-neutral-200'}`}
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${value === l ? 'border-[#25313D] bg-[#25313D]' : 'border-neutral-300'}`}>
            {value === l && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          </span>
          <span>
            <span className="block text-[13px] font-semibold">{LEVEL[l].t}</span>
            <span className="block text-[12px] text-neutral-500">{LEVEL[l].d}</span>
          </span>
        </button>
      ))}
      {SRC[src].note && <p className="text-[11px] text-neutral-400">{SRC[src].note}</p>}
    </div>
  )
}

/** 연결된 곳을 눌렀을 때: 할 수 있는 일 바꾸기, 연결 끊기 */
function ConnectDetailSheet({ src, onClose }: { src: Src; onClose: () => void }) {
  const { conn, update } = useConnect()
  const c = conn[src]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><ChannelBadge ch={SRC[src].ch} />{SRC[src].label}</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-1 text-[12px] text-neutral-500">연결됨, 마지막 확인 {c.last ?? '방금'}</p>
      <p className="mb-2 mt-5 text-[13px] font-semibold">비서가 할 수 있는 일</p>
      <LevelPicker src={src} value={c.level} onChange={(l) => update(src, { level: l })} />
      <button onClick={() => { update(src, { status: 'off', last: undefined }); onClose() }} className="mt-6 w-full text-center text-[13px] text-rose-500">연결 끊기</button>
    </Sheet>
  )
}

/**
 * 연결 흐름. 인스타, 링크드인은 펠로어 화면에서 로그인한 뒤 계정 제한 고지에 동의한다.
 * 끊겼다가 다시 연결할 때는 동의를 건너뛴다. 구글은 구글 동의 화면에서 이 항목 권한만 받는다.
 */
function ConnectFlowSheet({ src, onClose }: { src: Src; onClose: () => void }) {
  const { conn, update } = useConnect()
  const meta = SRC[src]
  const reconnect = conn[src].status === 'broken'
  const [step, setStep] = useState<'login' | 'consent' | 'google' | 'done'>(meta.how === 'google' ? 'google' : 'login')
  const [agree, setAgree] = useState(false)
  const [level, setLevel] = useState<Level>(conn[src].level)
  const otherGoogle = (['gmail', 'gcal'] as Src[]).find((s) => s !== src && conn[s].status === 'on')

  const finish = () => { update(src, { status: 'on', level, last: '방금' }); setStep('done') }

  const doneText: Record<Src, string> = {
    ig: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    in: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    tg: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    kakao: '',
    gmail: '주고받은 메일을 인물 카드에 이어 붙여요',
    gcal: '내일부터 아침마다 그날 만날 사람을 미리 정리해 드려요',
  }

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><ChannelBadge ch={meta.ch} />{reconnect ? '다시 연결' : `${meta.label} 연결`}</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      {step === 'login' && (
        <>
          <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
            <Lock size={22} className="mx-auto text-neutral-400" />
            <p className="mt-2 text-[13px] font-semibold">{meta.label} 로그인 화면</p>
            <p className="mt-1 text-[12px] text-neutral-500">
              {meta.how === 'api' ? '텔레그램 앱으로 받은 로그인 코드를 입력해요' : `${meta.label} 공식 로그인 화면이 펠로어 안에서 열려요`}
            </p>
          </div>
          <p className="mt-3 text-[12px] text-neutral-500">비밀번호는 펠로어에 저장하지 않아요. 로그인 상태만 암호화해서 보관해요.</p>
          <div className="mt-5">
            <PrimaryButton onClick={() => (meta.how === 'web' && !reconnect ? setStep('consent') : finish())}>로그인했어요 (목업)</PrimaryButton>
          </div>
        </>
      )}

      {step === 'consent' && (
        <>
          <p className="mt-4 text-[15px] font-bold">연결 전에 알아두세요</p>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-neutral-600">
            <li className="flex gap-2"><TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-500" />{meta.label}은 자동 이용을 막고 있어서, 드물게 계정이 잠시 제한될 수 있어요.</li>
            <li className="flex gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-neutral-400" />펠로어는 사람처럼 천천히, 하루 정해진 양만 읽고 보내요.</li>
            <li className="flex gap-2"><RefreshCw size={15} className="mt-0.5 shrink-0 text-neutral-400" />보안 확인이 뜨면 연결이 풀릴 수 있어요. 그때는 다시 연결만 누르면 돼요.</li>
          </ul>
          <p className="mb-2 mt-5 text-[13px] font-semibold">비서가 할 수 있는 일</p>
          <LevelPicker src={src} value={level} onChange={setLevel} />
          <label className="mt-4 flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 위 내용을 확인했어요
          </label>
          <div className="mt-4"><PrimaryButton disabled={!agree} onClick={finish}>연결하기</PrimaryButton></div>
        </>
      )}

      {step === 'google' && (
        <>
          <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
            <p className="text-[11px] text-neutral-400">구글 동의 화면 (구글이 보여줘요)</p>
            <p className="mt-2 text-[14px] font-semibold">펠로어가 요청하는 권한</p>
            <ul className="mt-2 space-y-1.5 text-[13px] text-neutral-600">
              {src === 'gcal' ? (
                <li className="flex items-center gap-2"><CalendarDays size={14} />캘린더 일정과 참석자 보기</li>
              ) : (
                <>
                  <li className="flex items-center gap-2"><Mail size={14} />메일 읽기</li>
                  {level !== 'read' && <li className="flex items-center gap-2"><PenLine size={14} />메일 초안 만들기</li>}
                  {level === 'send' && <li className="flex items-center gap-2"><Send size={14} />메일 보내기</li>}
                </>
              )}
            </ul>
          </div>
          {otherGoogle && <p className="mt-2 text-[12px] text-neutral-500">이미 연결한 구글 계정에 {meta.label} 권한만 더해요</p>}
          {meta.levels.length > 1 && (
            <>
              <p className="mb-2 mt-5 text-[13px] font-semibold">비서가 할 수 있는 일</p>
              <LevelPicker src={src} value={level} onChange={setLevel} />
            </>
          )}
          {meta.note && meta.levels.length === 1 && <p className="mt-2 text-[11px] text-neutral-400">{meta.note}</p>}
          <div className="mt-5"><PrimaryButton onClick={finish}>구글로 계속하기 (목업)</PrimaryButton></div>
        </>
      )}

      {step === 'done' && (
        <div className="py-4 text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">{reconnect ? '다시 연결됐어요' : '연결됐어요'}</p>
          <p className="mt-1 text-[13px] text-neutral-500">{reconnect ? '그 사이 온 메시지를 정리해서 다음 묶음에 올릴게요' : doneText[src]}</p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      )}
    </Sheet>
  )
}

/** 필요한 순간에 띄우는 연결 제안 */
function ConnectSuggest({ src, icon, text }: { src: Src; icon: ReactNode; text: string }) {
  const { start } = useConnect()
  return (
    <Card className="border-dashed">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[#25313D]">{icon}</span>
        <p className="flex-1 text-[13px] leading-relaxed text-neutral-600">{text}</p>
      </div>
      <button onClick={() => start(src)} className="mt-3 w-full rounded-full bg-[#25313D] py-2 text-[13px] font-semibold text-white">{SRC[src].label} 연결</button>
    </Card>
  )
}

/** 끊긴 연결은 오류 배너 대신 오늘의 제안 맨 위 할 일로 */
function ReconnectCard({ src }: { src: Src }) {
  const { start } = useConnect()
  return (
    <Card className="mt-3 border-rose-100 bg-rose-50/40">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <RefreshCw size={15} className="text-rose-500" /> {SRC[src].label} 연결이 잠깐 풀렸어요
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">보안 확인 때문에 로그인이 풀렸어요. 그 사이 온 메시지 2개는 다시 연결하면 바로 정리해 둘게요.</p>
      <button onClick={() => start(src)} className="mt-3 rounded-full bg-[#0D0D0D] px-4 py-2 text-[12px] font-semibold text-white">다시 연결</button>
    </Card>
  )
}

function MergeCandidate({ a, b, reason }: { a: string; b: string; reason: string }) {
  const [state, setState] = useState<'ask' | 'merged' | 'no'>('ask')
  return (
    <Card>
      <div className="flex items-center gap-2 text-[13px]">
        <GitMerge size={15} className="text-[#25313D]" />
        <span className="font-semibold">{a}</span>
        <span className="text-neutral-400">와</span>
        <span className="font-semibold">{b}</span>
      </div>
      <p className="mt-1 text-[12px] text-neutral-500">같은 사람일까요? {reason}</p>
      {state === 'ask' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setState('no')} className="rounded-full border border-neutral-200 py-2 text-[13px]">아니에요</button>
          <button onClick={() => setState('merged')} className="rounded-full bg-[#25313D] py-2 text-[13px] font-semibold text-white">합치기</button>
        </div>
      ) : (
        <p className="mt-2 text-[12px] font-medium text-emerald-600">{state === 'merged' ? '한 사람으로 합쳤어요' : '다른 사람으로 둘게요'}</p>
      )}
    </Card>
  )
}

function TodayTab({ mode, openPerson }: { mode: Mode; openPerson: (p: Person) => void }) {
  const { conn } = useConnect()
  const broken = (Object.keys(conn) as Src[]).filter((s) => conn[s].status === 'broken')
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-28">
        <div className="mt-4 rounded-3xl bg-[#25313D] p-6 text-white">
          <p className="text-[13px] opacity-70">펠로어</p>
          <p className="mt-2 text-[22px] font-bold leading-snug">흩어진 연락은 모으고,<br />답장은 펠로어가 써둘게요</p>
          <p className="mt-3 text-[13px] leading-relaxed opacity-80">하루 두 번, 답할 메시지와 챙길 사람을 정리해 드려요. 고르고 보내기만 하세요.</p>
        </div>
        <SectionTitle tag="new">이런 제안을 받아요</SectionTitle>
        <Card>
          <div className="flex items-center gap-2">
            <Avatar name="도민혁" size={28} />
            <span className="text-[13px] font-semibold">도민혁</span>
            <ChannelBadge ch="ig" />
            <span className="ml-auto text-[11px] text-neutral-400">예시</span>
          </div>
          <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">&ldquo;형 러닝 사진 미쳤다 🔥&rdquo;</p>
          <p className="mt-2 rounded-xl border border-neutral-200 p-3 text-[13px]">ㅋㅋ 고마워! 이번 주말에 같이 뛰자</p>
        </Card>
        <div className="mt-6"><PrimaryButton>펠로어 시작하기</PrimaryButton></div>
        <Link href="/landing" className="mt-3 block text-center text-[13px] text-neutral-500 underline">서비스 소개 더 보기</Link>
      </div>
    )
  }

  if (mode === 'new') {
    return (
      <div className="px-5 pb-28">
        <p className="mt-4 text-[22px] font-bold leading-snug text-[var(--color-text-strong)]">내 사람들을<br />가져와 볼까요?</p>
        <p className="mt-2 text-[13px] text-neutral-500">연결한 곳의 대화 상대가 인물 카드로 만들어져요. 하나만 먼저 연결해도 충분해요.</p>
        <SectionTitle tag="new">연결</SectionTitle>
        <ConnectList />
        <SectionTitle>다른 방법</SectionTitle>
        <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
          <Row icon={<Send size={18} />} label="내 프로필 링크 보내기" desc="받은 사람이 가입하면 서로 저장돼요" tag="old" />
          <Row icon={<UserPlus size={18} />} label="직접 추가하기" desc="이름만으로도 인물 카드를 만들어요" />
        </Card>
      </div>
    )
  }

  if (mode === 'importing') {
    return (
      <div className="px-5 pb-28">
        <Card className="mt-3">
          <p className="text-[15px] font-bold">사람들을 가져오고 있어요</p>
          <div className="mt-3 space-y-2 text-[13px]">
            <div className="flex items-center gap-2"><ChannelBadge ch="ig" /> 128명 <Check size={14} className="ml-auto text-emerald-600" /></div>
            <div className="flex items-center gap-2"><ChannelBadge ch="kakao" /> 대화 파일 3개에서 42명 <Check size={14} className="ml-auto text-emerald-600" /></div>
            <div className="flex items-center gap-2"><ChannelBadge ch="in" /> 가져오는 중 <span className="ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100"><span className="block h-full w-2/3 bg-[#25313D]" /></span></div>
          </div>
        </Card>
        <SectionTitle tag="new" right={<span className="text-[12px] text-neutral-400">12건</span>}>같은 사람 합치기</SectionTitle>
        <div className="space-y-2">
          <MergeCandidate a="@minhyuk.run" b="도민혁 (카톡)" reason="이름 발음과 말투가 비슷해요" />
          <MergeCandidate a="seoyun-han" b="한서윤 (카톡)" reason="이름과 회사가 같아요" />
        </div>
        <p className="mt-3 text-[12px] text-neutral-500">모르겠으면 플로팅 버튼의 말하기로 &ldquo;A랑 B는 같은 사람이야&rdquo;라고 알려주세요.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-28">
      {broken.map((s) => <ReconnectCard key={s} src={s} />)}
      <div className="mt-2 flex items-center gap-2 text-[12px] text-neutral-500">
        <Clock size={13} /> 다음 묶음 오후 6시
        <span className="ml-auto">하루 두 번 (오전 10시, 오후 6시)</span>
      </div>

      <SectionTitle tag="new">답장할 메시지</SectionTitle>
      <DraftBatch openPerson={openPerson} />

      <SectionTitle tag="new" right={<span className="text-[12px] text-neutral-400">3건</span>}>할 일</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        {[
          { p: PEOPLE[1], t: '어제 미팅 감사 인사 보내기', from: '녹음 요약에서', a: '초안 보기' },
          { p: PEOPLE[0], t: 'IR 자료 보내기 (금요일까지)', from: '약속', a: '완료' },
          { p: PEOPLE[2], t: '포트폴리오 의견 주기', from: '메일에서', a: '완료' },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3 py-3">
            <Avatar name={x.p.name} size={32} member={x.p.member} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px]"><span className="font-semibold">{x.p.name}</span>님 {x.t}</div>
              <div className="text-[11px] text-neutral-400">{x.from}</div>
            </div>
            <button className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">{x.a}</button>
          </div>
        ))}
      </Card>

      <SectionTitle tag="new">오늘 만날 사람</SectionTitle>
      {conn.gcal.status === 'on'
        ? <BriefingCard person={PEOPLE[1]} onOpen={() => openPerson(PEOPLE[1])} />
        : <ConnectSuggest src="gcal" icon={<CalendarDays size={18} />} text="캘린더를 연결하면 그날 만날 사람과 지난 대화를 아침에 미리 정리해 드려요" />}

      <SectionTitle tag="new">챙길 사람</SectionTitle>
      <Card onClick={() => openPerson(PEOPLE[3])}>
        <div className="flex items-center gap-3">
          <Avatar name={PEOPLE[3].name} size={36} />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{PEOPLE[3].name}</div>
            <div className="text-[12px] text-neutral-500">4개월째 연락이 없어요. 최근 새 펀드 결성 소식이 있어요</div>
          </div>
          <ChevronRight size={16} className="text-neutral-300" />
        </div>
      </Card>
    </div>
  )
}

/* ───────── 내 사람들 ───────── */

function PersonRow({ p, onClick, saveable }: { p: Person; onClick?: () => void; saveable?: boolean }) {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center gap-3 py-2.5">
      <Avatar name={p.name} member={p.member} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold">{p.name}</div>
        <div className="truncate text-[12px] text-neutral-500">{p.title}</div>
        {!saveable && (
          <div className="mt-1 flex flex-wrap gap-1">
            {p.accounts.map((a) => <ChannelBadge key={a.ch} ch={a.ch} />)}
          </div>
        )}
      </div>
      {saveable
        ? <button className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">저장</button>
        : <ChevronRight size={16} className="text-neutral-300" />}
    </div>
  )
}

function SearchResults({ query, mode, openPerson }: { query: string; mode: Mode; openPerson: (p: Person) => void }) {
  const mine = mode === 'active' ? PEOPLE.filter((p) => p.name.includes(query)) : []
  return (
    <>
      {mine.length > 0 && (
        <>
          <SectionTitle>내 사람</SectionTitle>
          {mine.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
        </>
      )}
      <SectionTitle tag="old">펠로어 회원</SectionTitle>
      <PersonRow p={{ id: 'x1', name: `${query}수`, title: '제품 디자이너', member: true, met: '', tags: [], accounts: [] }} saveable />
      <SectionTitle tag="old">공개 인물</SectionTitle>
      <PersonRow p={{ id: 'x2', name: `${query}영`, title: '공개 정보로 만든 프로필', member: true, met: '', tags: [], accounts: [] }} saveable />
    </>
  )
}

/**
 * 자동으로 가져온 사람은 바로 내 사람이 되지 않는다. 대화하거나 기록하거나 고정하면 내 사람으로 올라가고,
 * 필요 없는 사람은 숨긴다. 비회원에게는 이게 "저장" 버튼 역할.
 */
function ImportedList({ openPerson }: { openPerson: (p: Person) => void }) {
  const [state, setState] = useState<Record<string, 'mine' | 'hidden'>>({})
  const set = (id: string, v: 'mine' | 'hidden') => setState((s) => ({ ...s, [id]: v }))
  const hiddenCount = Object.values(state).filter((v) => v === 'hidden').length
  return (
    <>
      <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">연결한 곳에서 가져왔지만 아직 정리하지 않은 사람이에요. 대화하거나 기록하거나 내 사람으로 올리면 목록으로 옮겨요.</p>
      <div className="mt-2 divide-y divide-[var(--color-border-soft)]">
        {IMPORTED.map((p) => {
          const v = state[p.id]
          return (
            <div key={p.id} className="py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => openPerson(p)}><Avatar name={p.name} size={36} member={p.member} /></button>
                <button onClick={() => openPerson(p)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5 text-[14px] font-semibold">{p.name}<ChannelBadge ch={p.accounts[0].ch} /></div>
                  <div className={`text-[12px] ${p.spam ? 'text-rose-500' : 'text-neutral-500'}`}>{p.spam ? `${p.why}, 광고 계정으로 보여요` : p.why}</div>
                </button>
              </div>
              {v ? (
                <p className="mt-2 pl-12 text-[12px] font-medium text-emerald-600">{v === 'mine' ? '내 사람으로 옮겼어요' : '숨겼어요. 다시 연락이 오면 알려드려요'}</p>
              ) : (
                <div className="mt-2 flex gap-2 pl-12">
                  <button onClick={() => set(p.id, 'hidden')} className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">숨기기</button>
                  <button onClick={() => set(p.id, 'mine')} className="rounded-full bg-[#25313D] px-3 py-1 text-[12px] font-semibold text-white">내 사람으로</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[12px] text-neutral-400">숨긴 사람 {12 + hiddenCount}명</p>
    </>
  )
}

/** 사람 추가: 프로필 링크 붙여넣기 또는 이름만으로 */
function AddPersonSheet({ onClose }: { onClose: () => void }) {
  const [way, setWay] = useState<'link' | 'name'>('link')
  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)
  const fromLink = way === 'link'
  return (
    <Sheet onClose={onClose}>
      {done ? (
        <div className="text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">인물 카드를 만들었어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            {fromLink ? '공개된 소개글과 직함을 출처와 함께 넣어뒀어요. 틀린 건 카드에서 고칠 수 있어요' : '메모나 녹음을 남기면 카드가 채워져요'}
          </p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">사람 추가<Tag kind="new" /></h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <div className="mt-1"><PrivateBadge /></div>
          <div className="mt-4 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-[13px]">
            {([['link', '프로필 링크로'], ['name', '이름으로']] as const).map(([id, label]) => (
              <button key={id} onClick={() => { setWay(id); setValue('') }} className={`rounded-full py-1.5 ${way === id ? 'bg-white font-semibold shadow-sm' : 'text-neutral-500'}`}>{label}</button>
            ))}
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={fromLink ? '인스타나 링크드인 프로필 주소 붙여넣기' : '이름'}
            className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-3 text-[13px] outline-none focus:border-[#25313D]"
          />
          <p className="mt-2 text-[12px] text-neutral-500">
            {fromLink ? '인스타나 링크드인 앱에서 공유를 누르고 펠로어를 골라도 돼요' : '이름만 있어도 돼요. 나머지는 기록하면서 채워져요'}
          </p>
          <div className="mt-5"><PrimaryButton disabled={!value.trim()} onClick={() => setDone(true)}>만들기</PrimaryButton></div>
        </>
      )}
    </Sheet>
  )
}

function PeopleTab({ mode, openPerson, fromLink }: { mode: Mode; openPerson: (p: Person) => void; fromLink: boolean }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('전체')
  const [view, setView] = useState<'mine' | 'imported'>('mine')
  const [adding, setAdding] = useState(false)

  const search = (
    <div className="mt-1 flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
      <Search size={16} className="text-neutral-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="내 사람, 펠로어 회원, 공개 인물 검색"
        className="flex-1 bg-transparent text-[13px] outline-none"
      />
      {query && <button onClick={() => setQuery('')}><X size={14} className="text-neutral-400" /></button>}
    </div>
  )

  if (query) {
    return <div className="px-5 pb-28">{search}<SearchResults query={query} mode={mode} openPerson={openPerson} /></div>
  }

  if (mode === 'guest') {
    return (
      <div className="px-5 pb-28">
        {search}
        {fromLink ? (
          <>
            <Card className="mt-4">
              <div className="flex items-center gap-3">
                <Avatar name={PEOPLE[0].name} size={48} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold">{PEOPLE[0].name}</div>
                  <div className="text-[12px] text-neutral-500">방금 프로필을 봤어요</div>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-neutral-600">가입하면 {PEOPLE[0].name}님이 내 사람에 저장돼요.</p>
            </Card>
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-[12px] text-amber-700">링크를 받고 24시간 안에 가입하면 보너스 재화 5개를 드려요</div>
            <div className="mt-4"><PrimaryButton>가입하고 저장하기</PrimaryButton></div>
          </>
        ) : (
          <>
            <p className="mt-6 text-[13px] text-neutral-500">가입하면 이렇게 내 사람들이 정리돼요</p>
            <Card className="mt-2 !py-1 divide-y divide-[var(--color-border-soft)]">
              {PEOPLE.slice(0, 3).map((p) => <PersonRow key={p.id} p={p} />)}
            </Card>
            <div className="mt-4"><PrimaryButton>펠로어 시작하기</PrimaryButton></div>
          </>
        )}
      </div>
    )
  }

  if (mode === 'new') {
    return (
      <div className="px-5 pb-28">
        {search}
        <div className="pt-14 text-center">
          <Users size={40} className="mx-auto text-neutral-300" />
          <p className="mt-4 text-[16px] font-bold">아직 내 사람이 없어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">계정을 연결하면 대화 상대가 여기에 쌓여요</p>
        </div>
        <div className="mt-6"><ConnectList /></div>
      </div>
    )
  }

  const filters = ['전체', '투자', '고객', '협업', '최근 연락']
  const list = filter === '전체' || filter === '최근 연락' ? PEOPLE : PEOPLE.filter((p) => p.tags.includes(filter))

  const segment = (
    <div className="mt-3 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-[13px]">
      {([['mine', '내 사람', mode === 'importing' ? 42 : 214], ['imported', '가져온 사람', mode === 'importing' ? 128 : 86]] as const).map(([id, label, n]) => (
        <button key={id} onClick={() => setView(id)} className={`rounded-full py-1.5 ${view === id ? 'bg-white font-semibold shadow-sm' : 'text-neutral-500'}`}>
          {label} <span className="text-[11px] text-neutral-400">{n}</span>
        </button>
      ))}
    </div>
  )

  const addButton = (
    <button onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[12px]">
      <UserPlus size={13} /> 추가
    </button>
  )

  if (view === 'imported') {
    return (
      <div className="px-5 pb-28">
        {search}
        {segment}
        <ImportedList openPerson={openPerson} />
        {adding && <AddPersonSheet onClose={() => setAdding(false)} />}
      </div>
    )
  }

  return (
    <div className="px-5 pb-28">
      {search}
      {segment}
      {mode === 'importing' ? (
        <div className="mt-3 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] text-neutral-600">170명 가져옴, 링크드인 가져오는 중</div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#25313D]/5 px-4 py-3 text-[12px]">
          <GitMerge size={14} className="text-[#25313D]" />
          <span>같은 사람일 수 있는 계정 <b>3건</b></span>
          <ChevronRight size={14} className="ml-auto text-neutral-400" />
        </div>
      )}
      <div className="mt-3 flex gap-1.5 overflow-x-auto">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] ${filter === f ? 'bg-[#25313D] text-white' : 'bg-neutral-100 text-neutral-600'}`}>{f}</button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <PrivateBadge />
        {addButton}
      </div>
      <div className="divide-y divide-[var(--color-border-soft)]">
        {list.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
      </div>
      {adding && <AddPersonSheet onClose={() => setAdding(false)} />}
    </div>
  )
}

function PersonDetail({ p, onBack }: { p: Person; onBack: () => void }) {
  const { conn } = useConnect()
  const [tone, setTone] = useState(p.tone ?? '')
  const [editingTone, setEditingTone] = useState(false)
  // 목업: 비회원이 가입한 뒤 모습을 보여주기 위한 상태
  const [joined, setJoined] = useState(false)
  const [invited, setInvited] = useState(false)
  const [facts, setFacts] = useState<Fact[]>(p.facts ?? [])
  const [pending, setPending] = useState<Fact[]>(p.pending ?? [])
  const [editingFact, setEditingFact] = useState<number | null>(null)
  const member = p.member || joined

  const confirm = (f: Fact, ok: boolean) => {
    setPending((list) => list.filter((x) => x !== f))
    if (ok) setFacts((list) => [...list, f])
  }
  const editFact = (i: number, t: string) => setFacts((list) => list.map((f, j) => (j === i ? { t, src: '내가 고침' } : f)))

  return (
    <div className="pb-28">
      <div className="flex items-center gap-2 px-3 py-3">
        <button onClick={onBack}><ChevronLeft size={24} /></button>
        <span className="text-[15px] font-semibold">인물 카드</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
      </div>
      <div className="px-5">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} size={64} member={member} />
          <div>
            <div className="text-[20px] font-bold">{p.name}</div>
            <div className="text-[13px] text-neutral-500">{p.title || facts[0]?.t}</div>
            {member
              ? <Link href="/" className="mt-1 inline-flex items-center text-[12px] font-medium text-[#25313D]">공개 프로필 보기 <ChevronRight size={12} /></Link>
              : <span className="mt-1 inline-block text-[12px] text-neutral-400">펠로어 회원 아님</span>}
          </div>
        </div>

        {joined && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[12px] leading-relaxed text-emerald-700">
            {p.name}님이 펠로어에 가입했어요. 본인이 쓴 프로필이 카드에 붙었어요. 내 메모와 알게 된 정보는 그대로 나만 봐요.
          </div>
        )}

        <SectionTitle tag="new">연결된 계정</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {p.accounts.map((a) => <ChannelBadge key={a.ch} ch={a.ch} handle={a.handle} />)}
          <button className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-[11px] text-neutral-500"><Plus size={11} /> 계정 합치기</button>
        </div>

        {member && p.self && (
          <>
            <SectionTitle tag="new" right={<span className="text-[11px] text-neutral-400">{p.name}님이 직접 관리해요</span>}>본인이 쓴 정보</SectionTitle>
            <Card className="!py-2">
              <ul className="divide-y divide-[var(--color-border-soft)] text-[13px]">
                {p.self.map((t) => <li key={t} className="py-2">{t}</li>)}
              </ul>
            </Card>
          </>
        )}

        {(!member || facts.length > 0) && (
          <>
            <SectionTitle tag="new" right={<span className="text-[11px] text-neutral-400">눌러서 고치기</span>}>알게 된 정보</SectionTitle>
            <Card className="!py-2">
              {facts.length === 0 ? (
                <p className="py-2 text-[13px] text-neutral-400">아직 없어요. 대화하거나 기록하면 채워져요</p>
              ) : (
                <ul className="divide-y divide-[var(--color-border-soft)]">
                  {facts.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 py-2">
                      {editingFact === i ? (
                        <input autoFocus value={f.t} onChange={(e) => editFact(i, e.target.value)} onBlur={() => setEditingFact(null)} className="flex-1 text-[13px] outline-none" />
                      ) : (
                        <button onClick={() => setEditingFact(i)} className="flex-1 text-left text-[13px]">{f.t}</button>
                      )}
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${f.src === '내가 고침' ? 'bg-[#25313D]/10 text-[#25313D]' : 'bg-neutral-100 text-neutral-500'}`}>{f.src}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <p className="mt-1.5 text-[11px] text-neutral-400">공개된 소개글, 메일 서명, 내 기록에서 모았어요. 내가 고친 내용이 우선이에요</p>
          </>
        )}

        {pending.length > 0 && (
          <>
            <SectionTitle tag="new" right={<span className="text-[12px] text-neutral-400">{pending.length}건</span>}>새로 알게 된 것</SectionTitle>
            <div className="space-y-2">
              {pending.map((f) => (
                <Card key={f.t}>
                  <p className="text-[13px]">{f.t}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{f.src}에서</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => confirm(f, false)} className="rounded-full border border-neutral-200 py-1.5 text-[12px]">아니에요</button>
                    <button onClick={() => confirm(f, true)} className="rounded-full bg-[#25313D] py-1.5 text-[12px] font-semibold text-white">맞아요, 붙이기</button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <SectionTitle tag="new">관계와 말투</SectionTitle>
        <Card>
          {editingTone ? (
            <input autoFocus value={tone} onChange={(e) => setTone(e.target.value)} onBlur={() => setEditingTone(false)} className="w-full text-[13px] outline-none" placeholder="예: 반말, 대학 동기" />
          ) : (
            <button onClick={() => setEditingTone(true)} className="w-full text-left text-[13px]">
              {tone || <span className="text-neutral-400">아직 몰라요. 답장을 고치면 배워요</span>}
            </button>
          )}
          <p className="mt-2 text-[11px] text-neutral-400">답장 초안을 고친 내용과 말하기로 알려준 내용이 쌓여요</p>
        </Card>

        <SectionTitle tag="new">최근 대화</SectionTitle>
        <div className="space-y-3 border-l-2 border-neutral-100 pl-4">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-neutral-400"><ChannelBadge ch={p.accounts[0]?.ch ?? 'kakao'} /> 오늘 오전</div>
            <p className="mt-1 text-[13px]">받은 메시지에 답장함 (초안 고쳐서 보냄)</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[12px] text-neutral-400"><Mic size={12} /> {p.met} 녹음 요약 (32분)</div>
            <p className="mt-0.5 text-[13px]">{p.note ?? '처음 만남. 서로 하는 일 소개'}</p>
          </div>
        </div>
        {conn.gmail.status !== 'on' && (
          <div className="mt-3">
            <ConnectSuggest src="gmail" icon={<Mail size={18} />} text={`지메일을 연결하면 ${p.name}님과 주고받은 메일도 여기 모아요`} />
          </div>
        )}

        {member && (
          <>
            <SectionTitle tag="old">케미</SectionTitle>
            <Card><div className="flex items-center gap-2 text-[13px]"><Sparkles size={15} /> 나와의 케미 리포트 <ChevronRight size={14} className="ml-auto text-neutral-300" /></div></Card>
          </>
        )}

        <SectionTitle tag="old">연락처</SectionTitle>
        <Card className="text-[13px] text-neutral-600">{member ? '공개 프로필에 등록된 연락처' : '메일 서명에서 가져온 것과 직접 입력한 전화번호, 이메일'}</Card>

        {!member && (
          <Card className="mt-6 bg-neutral-50">
            <p className="text-[13px] font-semibold">{p.name}님은 아직 펠로어 회원이 아니에요</p>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">가입하면 이 카드에 {p.name}님이 직접 쓴 프로필이 붙고, 연락처도 본인이 최신으로 유지해요. 케미 리포트도 볼 수 있어요.</p>
            <button
              onClick={() => setInvited(true)}
              disabled={invited}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Send size={14} />{invited ? '다음 답장에 링크를 붙여둘게요' : '내 프로필 링크 보내기'}
            </button>
            {p.self && <button onClick={() => setJoined(true)} className="mt-2 w-full text-center text-[11px] text-neutral-400 underline">가입한 뒤 모습 보기 (목업)</button>}
          </Card>
        )}
      </div>
    </div>
  )
}

/* ───────── 내 소개 ───────── */

function MeTab({ mode }: { mode: Mode }) {
  const { conn, openHub } = useConnect()
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-28 pt-10 text-center">
        <User size={40} className="mx-auto text-neutral-300" />
        <p className="mt-4 text-[16px] font-bold">로그인하고 내 프로필을 만들어요</p>
        <div className="mx-auto mt-6 max-w-[260px]"><PrimaryButton>로그인 / 회원가입</PrimaryButton></div>
        <div className="mt-8 text-left">
          <Row icon={<Settings size={18} />} label="언어" desc="한국어" href="/settings" tag="old" />
        </div>
      </div>
    )
  }
  const srcs = Object.keys(conn) as Src[]
  const onList = srcs.filter((s) => conn[s].status === 'on')
  const brokenCount = srcs.filter((s) => conn[s].status === 'broken').length
  return (
    <div className="px-5 pb-28">
      <Card className="mt-3">
        <div className="flex items-center gap-3">
          <Avatar name="김" size={52} />
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[16px] font-bold">김펠로 <BadgeCheck size={15} className="text-[#25313D]" /></div>
            <div className="text-[12px] text-neutral-500">스타트업 대표</div>
          </div>
          <Link href="/me" className="rounded-full border border-neutral-200 px-3 py-1.5 text-[12px]">프로필 보기</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white"><Send size={14} />링크 공유</button>
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2.5 text-[13px]"><QrCode size={14} />QR 보여주기</button>
        </div>
      </Card>

      <SectionTitle tag="old">내 프로필</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row icon={<PenLine size={18} />} label="프로필 관리" desc="기본정보, 하이라이트, SNS, 바이브, 연락처, 리멤버 네트워크" href="/me?edit=true" />
        <Row icon={<ShieldCheck size={18} />} label="인증" desc="본인인증, 경력, 학력" />
        <Row icon={<Eye size={18} />} label="공개범위" href="/me?section=visibility" />
        <Row icon={<BarChart3 size={18} />} label="내 프로필 본 사람" />
      </Card>

      <SectionTitle tag="new">비서 설정</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row
          icon={<MessageCircle size={18} />}
          label="연결"
          desc={
            onList.length || brokenCount
              ? <>{srcs.length}곳 중 {onList.length}곳 연결됨{brokenCount > 0 && <span className="text-rose-500">, {brokenCount}곳 다시 연결 필요</span>}</>
              : '인스타, 링크드인, 지메일, 캘린더 등'
          }
          onClick={openHub}
          right={<span className="flex items-center gap-1">{onList.slice(0, 3).map((s) => <ChannelBadge key={s} ch={SRC[s].ch} />)}<ChevronRight size={16} className="text-neutral-300" /></span>}
        />
        <Row icon={<Clock size={18} />} label="묶음 처리 시간" desc="오전 10시, 오후 6시" tag="review" />
      </Card>

      <SectionTitle>재화와 설정</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row icon={<Coins size={18} />} label="내 재화" desc="12개 보유 (이름 미정)" tag="new" />
        <Row icon={<Settings size={18} />} label="계정, 언어, 약관, 문의" href="/settings" tag="old" />
      </Card>
    </div>
  )
}

/* ───────── 플로팅 버튼 메뉴 ───────── */

type FabAction = 'chat' | 'memo' | 'record' | 'upload'

function FabMenu({ onPick, onClose }: { onPick: (a: FabAction) => void; onClose: () => void }) {
  const items: { a: FabAction; icon: ReactNode; t: string; d: string }[] = [
    { a: 'chat', icon: <MessageCircle size={18} />, t: '말하기', d: '합치기, 관계 고치기, 궁금한 것 묻기' },
    { a: 'memo', icon: <PenLine size={18} />, t: '메모', d: '누구와 있었는지 고르고 적기' },
    { a: 'record', icon: <Mic size={18} />, t: '녹음', d: '대화를 녹음하면 요약과 할 일이 생겨요' },
    { a: 'upload', icon: <Upload size={18} />, t: '올리기', d: '대화 캡처, 카톡 대화 파일' },
  ]
  return (
    <div className="absolute inset-0 z-30 bg-black/40" onClick={onClose}>
      <div className="absolute bottom-[156px] right-4 w-[260px] space-y-2" onClick={(e) => e.stopPropagation()}>
        {items.map((x) => (
          <button key={x.a} onClick={() => onPick(x.a)} className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">{x.icon}</span>
            <div>
              <div className="text-[14px] font-semibold">{x.t}</div>
              <div className="text-[11px] text-neutral-500">{x.d}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />
        {children}
      </div>
    </div>
  )
}

function LoginNotice({ onClose }: { onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div className="text-center">
        <Lock size={26} className="mx-auto text-neutral-400" />
        <p className="mt-3 text-[16px] font-bold">로그인하면 쓸 수 있어요</p>
        <p className="mt-1 text-[13px] text-neutral-500">기록과 대화는 내 계정에 나만 볼 수 있게 저장돼요</p>
        <div className="mt-5"><PrimaryButton onClick={onClose}>로그인 / 회원가입</PrimaryButton></div>
      </div>
    </Sheet>
  )
}

/**
 * 메모와 녹음은 "누구와"를 먼저 고른다. 끝나면 고른 사람들의 인물 카드에 요약과 할 일이 붙고,
 * 후속 연락 초안은 다음 묶음 때 오늘의 제안에 올라온다.
 */
function RecordSheet({ kind, onClose }: { kind: 'memo' | 'record'; onClose: () => void }) {
  // 지금 진행 중인 일정(오늘 오후 3시 도민혁)을 미리 골라둔다
  const [picked, setPicked] = useState<string[]>([PEOPLE[1].id])
  const [newNames, setNewNames] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [step, setStep] = useState<'pick' | 'memo' | 'recording' | 'done'>('pick')

  const filtered = query ? PEOPLE.filter((p) => p.name.includes(query)) : PEOPLE.slice(0, 4)
  const pickedNames = [...PEOPLE.filter((p) => picked.includes(p.id)).map((p) => p.name), ...newNames]
  const hasPick = pickedNames.length > 0
  const toggle = (id: string) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const addNew = () => {
    const name = query.trim()
    if (!name) return
    setNewNames((prev) => [...prev, name])
    setQuery('')
  }

  return (
    <Sheet onClose={onClose}>
      {step === 'pick' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">누구와 이야기하나요?<Tag kind="new" /></h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <div className="mt-1"><PrivateBadge /></div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">
            <CalendarClock size={14} /> 지금 일정: 오후 3시 {PEOPLE[1].name}님과 미팅
          </div>

          {hasPick && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pickedNames.map((n) => (
                <span key={n} className="inline-flex items-center gap-1 rounded-full bg-[#25313D] px-3 py-1 text-[12px] text-white">
                  {n}
                  <button
                    onClick={() => {
                      const hit = PEOPLE.find((p) => p.name === n)
                      if (hit) toggle(hit.id)
                      else setNewNames((prev) => prev.filter((x) => x !== n))
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
            <Search size={16} className="text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="내 사람에서 찾거나 이름 입력" className="flex-1 bg-transparent text-[13px] outline-none" />
          </div>

          <div className="mt-2 space-y-1">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => toggle(p.id)} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left">
                <Avatar name={p.name} size={32} member={p.member} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{p.name}</div>
                  <div className="text-[11px] text-neutral-500">{p.title}</div>
                </div>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${picked.includes(p.id) ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300'}`}>
                  {picked.includes(p.id) && <Check size={12} />}
                </span>
              </button>
            ))}
            {query.trim() && !PEOPLE.some((p) => p.name === query.trim()) && (
              <button onClick={addNew} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-[13px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-neutral-300"><UserPlus size={14} /></span>
                &lsquo;{query.trim()}&rsquo; 새 사람으로 추가
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] text-neutral-400">여러 명과 함께 있으면 모두 골라요. 기록이 각자의 인물 카드에 붙어요.</p>
          <div className="mt-4">
            <PrimaryButton disabled={!hasPick} onClick={() => setStep(kind === 'memo' ? 'memo' : 'recording')}>
              {kind === 'memo' ? '메모 쓰기' : '녹음 시작'}
            </PrimaryButton>
          </div>
          {!hasPick && <p className="mt-2 text-center text-[11px] text-neutral-400">대화 상대를 먼저 골라주세요</p>}
        </>
      )}

      {step === 'memo' && (
        <>
          <h3 className="text-[17px] font-bold">{pickedNames.join(', ')}님과의 메모</h3>
          <div className="mt-1"><PrivateBadge /></div>
          <textarea className="mt-4 h-32 w-full rounded-2xl border border-neutral-200 p-3 text-[13px] outline-none" placeholder="아무렇게나 적어도 AI가 정리하고 할 일을 뽑아요" />
          <div className="mt-4"><PrimaryButton onClick={() => setStep('done')}>저장</PrimaryButton></div>
        </>
      )}

      {step === 'recording' && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] text-rose-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> 녹음 중 03:12
          </div>
          <div className="mt-4 flex justify-center -space-x-2">
            {pickedNames.map((n) => <div key={n} className="rounded-full ring-2 ring-white"><Avatar name={n} size={44} /></div>)}
          </div>
          <p className="mt-2 text-[15px] font-bold">{pickedNames.join(', ')}님과 대화 중</p>
          <div className="mx-auto mt-4 flex h-12 max-w-[240px] items-end justify-center gap-1">
            {[6, 14, 22, 10, 30, 18, 8, 26, 12, 20, 9, 16].map((h, i) => (
              <span key={i} className="w-1.5 rounded-full bg-neutral-300" style={{ height: h }} />
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-amber-50 px-3 py-2 text-left text-[11px] leading-relaxed text-amber-700">
            대화에 참여한 사람만 녹음할 수 있어요. 상대에게 녹음 사실을 알려주세요.
          </div>
          <button onClick={() => setStep('done')} className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white">
            <Square size={22} fill="white" />
          </button>
          <p className="mt-2 text-[12px] text-neutral-500">끝내기</p>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center">
          <Sparkles size={28} className="mx-auto text-[#25313D]" />
          <p className="mt-3 text-[16px] font-bold">AI가 정리하고 있어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">{pickedNames.join(', ')}님 인물 카드에 요약과 할 일이 붙어요.<br />감사 인사 초안은 다음 묶음에 올려둘게요.</p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      )}
    </Sheet>
  )
}

function UploadSheet({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false)
  return (
    <Sheet onClose={onClose}>
      {done ? (
        <div className="text-center">
          <Sparkles size={28} className="mx-auto text-[#25313D]" />
          <p className="mt-3 text-[16px] font-bold">대화를 읽고 있어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">대화 상대를 인물 카드에 연결하고, 같은 사람 후보가 있으면 알려드릴게요</p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">무엇을 올릴까요?<Tag kind="new" /></h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <div className="mt-1"><PrivateBadge /></div>
          <div className="mt-4 space-y-2">
            <Card onClick={() => setDone(true)}>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-neutral-500" />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">카톡 대화 파일</div>
                  <div className="text-[12px] text-neutral-500">대화방 설정에서 대화 내보내기로 받은 파일</div>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </Card>
            <Card onClick={() => setDone(true)}>
              <div className="flex items-center gap-3">
                <ImageIcon size={20} className="text-neutral-500" />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">대화 캡처</div>
                  <div className="text-[12px] text-neutral-500">어느 앱이든 대화 화면 스크린샷</div>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </Card>
          </div>
        </>
      )}
    </Sheet>
  )
}

/* ───────── 말하기 (채팅) ───────── */

type Msg = { from: 'me' | 'ai'; text: string; merge?: { a: string; b: string } }

const CHAT_SEED: Msg[] = [
  { from: 'me', text: '도민혁이랑 인스타 @minhyuk.run 같은 사람이야, 합쳐줘' },
  { from: 'ai', text: '이렇게 합칠게요. 맞으면 눌러주세요.', merge: { a: '도민혁 (카톡)', b: '@minhyuk.run (인스타)' } },
  { from: 'me', text: '민혁이한테는 반말로 해. 대학 동기야' },
  { from: 'ai', text: '도민혁님 관계를 "반말, 대학 동기"로 저장했어요. 다음 답장 초안부터 반영할게요.' },
]

function ChatScreen({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(CHAT_SEED)
  const [merged, setMerged] = useState(false)
  const [input, setInput] = useState('')
  const send = (text: string) => {
    if (!text.trim()) return
    setMsgs((m) => [...m, { from: 'me', text }, { from: 'ai', text: '(목업) 내 사람들과 기록에서 찾아서 답해요' }])
    setInput('')
  }
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] px-3 py-3">
        <button onClick={onClose}><ChevronLeft size={24} /></button>
        <span className="text-[15px] font-semibold">펠로어에게 말하기</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.from === 'me' ? 'bg-[#25313D] text-white' : 'bg-neutral-100'}`}>
              {m.text}
              {m.merge && (
                <div className="mt-2 rounded-xl bg-white p-3">
                  <div className="flex items-center gap-2 text-[12px]"><GitMerge size={13} /> {m.merge.a}</div>
                  <div className="ml-5 text-[12px] text-neutral-500">+ {m.merge.b}</div>
                  {merged
                    ? <p className="mt-2 text-[12px] font-medium text-emerald-600">합쳤어요</p>
                    : <button onClick={() => setMerged(true)} className="mt-2 w-full rounded-full bg-[#25313D] py-1.5 text-[12px] font-semibold text-white">합치기</button>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-2">
        {['지난번에 서윤님이랑 무슨 얘기 했지?', '이번 주에 챙길 사람', '지환님은 존댓말로'].map((s) => (
          <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-[12px]">{s}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--color-border-soft)] px-4 pb-6 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(input) }}
          placeholder="사람, 관계, 할 일에 대해 말해 주세요"
          className="flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-[13px] outline-none"
        />
        <button onClick={() => send(input)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D0D0D] text-white"><ArrowUp size={16} /></button>
      </div>
    </div>
  )
}

/* ───────── 화면 ───────── */

export default function V2IaPage() {
  const [tab, setTab] = useState<Tab>('today')
  const [mode, setMode] = useState<Mode>('active')
  const [fromLink, setFromLink] = useState(true)
  const [person, setPerson] = useState<Person | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [action, setAction] = useState<FabAction | null>(null)
  const [conn, setConn] = useState<ConnMap>(() => initConn('active'))
  const [hub, setHub] = useState(false)
  const [flow, setFlow] = useState<Src | null>(null)
  const [detail, setDetail] = useState<Src | null>(null)

  const connectCtx = {
    conn,
    start: (s: Src) => (s === 'kakao' ? setAction('upload') : setFlow(s)),
    update: (s: Src, patch: Partial<Conn>) => setConn((c) => ({ ...c, [s]: { ...c[s], ...patch } })),
    openHub: () => { setPerson(null); setHub(true) },
  }

  const changeMode = (m: Mode) => { setMode(m); setPerson(null); setHub(false); setConn(initConn(m)) }
  const goTab = (t: Tab) => { setPerson(null); setHub(false); setTab(t) }
  const titles: Record<Tab, string> = { today: '오늘의 제안', people: '내 사람들', me: '내 소개' }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'today', label: '오늘의 제안', icon: <Sparkles size={22} /> },
    { id: 'people', label: '내 사람들', icon: <Users size={22} /> },
    { id: 'me', label: '내 소개', icon: <User size={22} /> },
  ]

  const pick = (a: FabAction) => { setFabOpen(false); setAction(a) }
  const closeAction = () => setAction(null)

  return (
    <div className="min-h-dvh bg-neutral-200 py-4 max-sm:bg-white max-sm:py-0">
      {/* 기획 확인용 컨트롤 */}
      <div className="mx-auto mb-3 flex max-w-[390px] flex-wrap items-center gap-2 px-3 text-[12px]">
        <span className="font-semibold text-neutral-600">상태</span>
        {([['guest', '비회원'], ['new', '가입 직후'], ['importing', '가져오는 중'], ['active', '사용 중']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} onClick={() => changeMode(m)} className={`rounded-full px-3 py-1 ${mode === m ? 'bg-[#25313D] text-white' : 'bg-white'}`}>{l}</button>
        ))}
        {mode === 'guest' && (
          <label className="ml-1 flex items-center gap-1 text-neutral-600">
            <input type="checkbox" checked={fromLink} onChange={(e) => setFromLink(e.target.checked)} /> 링크로 들어옴
          </label>
        )}
      </div>

      <ConnectCtx.Provider value={connectCtx}>
      <div className="relative mx-auto flex h-[800px] max-w-[390px] flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl max-sm:h-[calc(100dvh-44px)] max-sm:rounded-none max-sm:shadow-none">
        <div className="flex-1 overflow-y-auto">
          {person ? (
            <PersonDetail key={person.id} p={person} onBack={() => setPerson(null)} />
          ) : hub ? (
            <ConnectScreen onBack={() => setHub(false)} onDetail={setDetail} />
          ) : (
            <>
              <Header title={titles[tab]} />
              {tab === 'today' && <TodayTab mode={mode} openPerson={setPerson} />}
              {tab === 'people' && <PeopleTab mode={mode} openPerson={setPerson} fromLink={fromLink} />}
              {tab === 'me' && <MeTab mode={mode} />}
            </>
          )}
        </div>

        {/* 어느 탭, 어느 화면에서든 같은 자리에 떠 있는 버튼 */}
        <button
          onClick={() => setFabOpen((v) => !v)}
          className="absolute bottom-[88px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0D0D0D] text-white shadow-xl"
          aria-label="기록하고 말하기"
        >
          {fabOpen ? <X size={24} /> : <Plus size={26} />}
        </button>

        <nav className="flex shrink-0 items-center justify-around border-t border-[var(--color-border-soft)] bg-white pb-5 pt-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => goTab(t.id)}
              className={`flex w-20 flex-col items-center gap-0.5 text-[11px] ${tab === t.id && !person && !hub ? 'font-semibold text-[#0D0D0D]' : 'text-neutral-400'}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {fabOpen && <FabMenu onPick={pick} onClose={() => setFabOpen(false)} />}
        {action && mode === 'guest' && <LoginNotice onClose={closeAction} />}
        {action && mode !== 'guest' && (
          <>
            {action === 'chat' && <ChatScreen onClose={closeAction} />}
            {(action === 'memo' || action === 'record') && <RecordSheet kind={action} onClose={closeAction} />}
            {action === 'upload' && <UploadSheet onClose={closeAction} />}
          </>
        )}
        {flow && <ConnectFlowSheet key={flow} src={flow} onClose={() => setFlow(null)} />}
        {detail && <ConnectDetailSheet src={detail} onClose={() => setDetail(null)} />}
      </div>
      </ConnectCtx.Provider>

      <p className="mx-auto mt-3 max-w-[390px] px-3 text-[11px] leading-relaxed text-neutral-500">
        기획 확인용 와이어프레임 (니즈·기능 정의서 v0.2). 태그: 기존(지금 있는 기능을 옮김), 신규, 다음 단계, 검토(결정 필요). 채널별 가져오기와 보내기 가능 범위는 기술 검토 중.
      </p>
    </div>
  )
}
