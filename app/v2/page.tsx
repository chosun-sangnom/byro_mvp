'use client'

/**
 * [임시] UI/UX 전면 개편 IA 와이어프레임 (니즈·기능 정의서 6장)
 * 하단 탭 5개(홈 / 검색 / 기록 / 사람 / 나) 구조와 상태별(비회원 / 가입 직후 / 사용 중) 화면을 대충 보여주는 용도.
 * 데이터는 전부 허구 인물. 기존 화면으로 가는 링크는 실제 목업 화면으로 연결된다.
 */

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Bell, Settings, Home, Search, Plus, Users, User, ChevronRight, ChevronLeft,
  Mic, PenLine, Lock, CalendarClock, Sparkles, MessageCircle, Send,
  QrCode, Link2, BarChart3, Coins, Eye, ShieldCheck, BadgeCheck, Gift, X, UserPlus, Check, Square,
} from 'lucide-react'

type Tab = 'home' | 'search' | 'people' | 'me'
type Mode = 'guest' | 'new' | 'active'

type Person = {
  id: string
  name: string
  title: string
  member: boolean
  met: string
  tags: string[]
  note?: string
}

const PEOPLE: Person[] = [
  { id: 'p1', name: '한서윤', title: '루프벤처스 심사역', member: true, met: '10/29 성수 네트워킹', tags: ['투자'], note: '헬스케어 관심, 다음 달 IR 자료 요청' },
  { id: 'p2', name: '도민혁', title: '오르빗랩 대표', member: true, met: '10/24 판교 미팅', tags: ['고객'], note: '러닝 크루 운영, 둘째 입학 준비 중' },
  { id: 'p3', name: '윤채린', title: '브랜드 디렉터', member: false, met: '10/18 지인 소개', tags: ['협업'] },
  { id: 'p4', name: '서지환', title: '그린필드 파트너', member: true, met: '7/02 저녁 모임', tags: ['투자'] },
  { id: 'p5', name: '마예린', title: '프리랜서 PD', member: false, met: '9/11 행사 (직접 입력)', tags: [] },
]

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
      {name[0]}
    </div>
  )
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-full bg-[#0D0D0D] py-3.5 text-[15px] font-semibold text-white">
      {children}
    </button>
  )
}

function Row({ icon, label, desc, href, tag }: { icon: ReactNode; label: string; desc?: string; href?: string; tag?: 'old' | 'new' | 'later' | 'review' }) {
  const body = (
    <div className="flex items-center gap-3 py-3">
      <span className="text-neutral-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center text-[14px] font-medium text-[var(--color-text-strong)]">
          {label}
          {tag && <Tag kind={tag} />}
        </div>
        {desc && <div className="mt-0.5 text-[12px] text-neutral-500">{desc}</div>}
      </div>
      <ChevronRight size={16} className="text-neutral-300" />
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

/* ───────── 헤더 ───────── */

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-3">
      <h1 className="text-[20px] font-bold text-[var(--color-text-strong)]">{title}</h1>
      <div className="flex items-center gap-3 text-neutral-700">
        <div className="relative">
          <Bell size={22} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <Link href="/settings"><Settings size={22} /></Link>
      </div>
    </div>
  )
}

/* ───────── 홈 ───────── */

function HomeTab({ mode, openPerson, goTab }: { mode: Mode; openPerson: (p: Person) => void; goTab: (t: Tab) => void }) {
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-8">
        <div className="mt-4 rounded-3xl bg-[#25313D] p-6 text-white">
          <p className="text-[13px] opacity-70">펠로어</p>
          <p className="mt-2 text-[22px] font-bold leading-snug">만나는 사람마다,<br />펠로어가 먼저 챙겨줘요</p>
          <p className="mt-3 text-[13px] leading-relaxed opacity-80">만날 사람의 이야기와 지난 대화를 미리 정리해 드려요.</p>
        </div>
        <SectionTitle tag="new">이런 브리핑을 받아요</SectionTitle>
        <BriefingCard person={PEOPLE[0]} sample />
        <div className="mt-6"><PrimaryButton>펠로어 시작하기</PrimaryButton></div>
        <Link href="/landing" className="mt-3 block text-center text-[13px] text-neutral-500 underline">서비스 소개 더 보기</Link>
      </div>
    )
  }

  if (mode === 'new') {
    return (
      <div className="px-5 pb-8">
        <p className="mt-4 text-[22px] font-bold leading-snug text-[var(--color-text-strong)]">첫 번째 사람을<br />저장해 볼까요?</p>
        <p className="mt-2 text-[13px] text-neutral-500">사람이 쌓이면 홈에 브리핑과 할 일이 생겨요.</p>
        <div className="mt-5 space-y-2">
          {[
            { icon: <Link2 size={18} />, t: '내 프로필 링크 보내기', d: '받은 사람이 가입하면 서로 저장돼요' },
            { icon: <Search size={18} />, t: '아는 사람 검색하기', d: '펠로어 회원과 공개 인물을 찾아요', tab: 'search' as Tab },
            { icon: <UserPlus size={18} />, t: '직접 추가하기', d: '펠로어를 안 쓰는 사람도 이름만으로 저장해요' },
          ].map((x) => (
            <Card key={x.t} onClick={x.tab ? () => goTab(x.tab!) : undefined}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">{x.icon}</span>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{x.t}</div>
                  <div className="text-[12px] text-neutral-500">{x.d}</div>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </Card>
          ))}
        </div>
        <SectionTitle tag="old">내 프로필 채우기</SectionTitle>
        <Card>
          <div className="flex items-center justify-between text-[13px]"><span>프로필 완성도</span><b>40%</b></div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100"><div className="h-full w-2/5 rounded-full bg-[#25313D]" /></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-5 pb-8">
      <SectionTitle tag="new">오늘</SectionTitle>
      <BriefingCard person={PEOPLE[1]} onOpen={() => openPerson(PEOPLE[1])} />

      <SectionTitle tag="new" right={<span className="text-[12px] text-neutral-400">3건</span>}>할 일</SectionTitle>
      <Card className="divide-y divide-[var(--color-border-soft)] !py-1">
        {[
          { p: PEOPLE[0], t: '감사 인사 보내기', a: '초안 보기' },
          { p: PEOPLE[0], t: 'IR 자료 보내기 (약속)', a: '완료' },
          { p: PEOPLE[2], t: '포트폴리오 받기로 함', a: '완료' },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3 py-3">
            <Avatar name={x.p.name} size={32} member={x.p.member} />
            <div className="flex-1 text-[13px]"><b>{x.p.name}</b>님 {x.t}</div>
            <button className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">{x.a}</button>
          </div>
        ))}
      </Card>

      <SectionTitle tag="new">챙길 사람</SectionTitle>
      <Card onClick={() => openPerson(PEOPLE[3])}>
        <div className="flex items-center gap-3">
          <Avatar name={PEOPLE[3].name} size={40} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{PEOPLE[3].name}님과 4개월째 연락이 없어요</div>
            <div className="text-[12px] text-neutral-500">마지막 만남 {PEOPLE[3].met}</div>
          </div>
        </div>
      </Card>

      <SectionTitle tag="new">최근 기록</SectionTitle>
      <Card onClick={() => openPerson(PEOPLE[0])}>
        <div className="flex items-center justify-between"><b className="text-[13px]">{PEOPLE[0].name}</b><PrivateBadge /></div>
        <p className="mt-1 text-[13px] text-neutral-600">{PEOPLE[0].note}</p>
      </Card>

      <SectionTitle tag="review">오늘의 추천</SectionTitle>
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name="정" size={40} />
          <div className="flex-1 text-[13px]"><b>정하람</b> 핀테크 PM<br /><span className="text-neutral-500">공통점 3개</span></div>
          <button className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">보기</button>
        </div>
      </Card>
      <p className="mt-2 text-[11px] text-neutral-400">기존 홈의 신규 가입자, 활발한 사람 목록은 제거</p>
    </div>
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
          <p className="font-semibold">꺼내볼 이야기</p>
          <ul className="list-disc space-y-0.5 pl-4 text-neutral-600">
            <li>최근 시작한 러닝 크루 이야기</li>
            <li>둘째 입학 준비는 어떻게 되고 있는지</li>
            <li>둘 다 좋아하는 성수 카페</li>
          </ul>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[12px] font-medium text-[#25313D]">
          <Sparkles size={13} /> 케미 리포트 보기 <ChevronRight size={13} />
        </div>
      </div>
    </Card>
  )
}

/* ───────── 검색 ───────── */

function SearchTab({ openPerson }: { openPerson: (p: Person) => void }) {
  const [q, setQ] = useState('')
  return (
    <div className="px-5 pb-8">
      <div className="mt-3 flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3">
        <Search size={18} className="text-neutral-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름, 회사, 직함으로 찾기" className="flex-1 bg-transparent text-[14px] outline-none" />
      </div>
      {!q ? (
        <>
          <SectionTitle tag="old">최근 검색</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {['한서윤', '오르빗랩', '심사역'].map((s) => (
              <button key={s} onClick={() => setQ(s)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-[13px]">{s}</button>
            ))}
          </div>
          <SectionTitle tag="old">최근 본 프로필</SectionTitle>
          <div className="space-y-2">
            {PEOPLE.slice(0, 3).map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
          </div>
          <p className="mt-3 text-[11px] text-neutral-400">기존 저장 화면의 최근 본 탭을 이곳으로 이동</p>
        </>
      ) : (
        <>
          <SectionTitle tag="new">내 사람</SectionTitle>
          <PersonRow p={PEOPLE[0]} onClick={() => openPerson(PEOPLE[0])} />
          <SectionTitle tag="old">펠로어 회원</SectionTitle>
          <div className="space-y-2">
            <PersonRow p={{ id: 'x1', name: '한서준', title: '디자인 스튜디오 대표', member: true, met: '', tags: [] }} saveable />
            <PersonRow p={{ id: 'x2', name: '한유나', title: '마케터', member: true, met: '', tags: [] }} saveable />
          </div>
          <SectionTitle tag="old">공개 인물</SectionTitle>
          <PersonRow p={{ id: 'x3', name: '한도윤', title: '공개 정보 기반', member: false, met: '', tags: [] }} saveable />
        </>
      )}
    </div>
  )
}

function PersonRow({ p, onClick, saveable }: { p: Person; onClick?: () => void; saveable?: boolean }) {
  return (
    <Card onClick={onClick} className="!py-3">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} member={p.member} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            {p.name}
            {!p.member && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">비회원</span>}
          </div>
          <div className="truncate text-[12px] text-neutral-500">{p.title}{p.met && ` / ${p.met}`}</div>
        </div>
        {saveable && <button className="rounded-full bg-[#0D0D0D] px-3 py-1.5 text-[12px] font-semibold text-white">저장</button>}
      </div>
    </Card>
  )
}

/* ───────── 사람 ───────── */

function PeopleTab({ mode, openPerson, fromLink }: { mode: Mode; openPerson: (p: Person) => void; fromLink: boolean }) {
  const [filter, setFilter] = useState('전체')
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-8">
        {fromLink ? (
          <>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
              <Gift size={16} /> 23시간 안에 가입하면 보너스 재화 5개
            </div>
            <Card className="mt-3">
              <div className="flex items-center gap-3">
                <Avatar name={PEOPLE[1].name} size={48} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold">{PEOPLE[1].name}</div>
                  <div className="text-[12px] text-neutral-500">{PEOPLE[1].title}</div>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-neutral-600">가입하면 {PEOPLE[1].name}님이 내 사람에 저장돼요. 다음에 만나기 전에 펠로어가 먼저 챙겨드려요.</p>
              <div className="mt-4"><PrimaryButton>가입하고 저장하기</PrimaryButton></div>
            </Card>
          </>
        ) : (
          <>
            <p className="mt-4 text-[20px] font-bold leading-snug">아는 사람이 여기에<br />쌓여요</p>
            <div className="mt-4 space-y-2 opacity-60">
              {PEOPLE.slice(0, 3).map((p) => <PersonRow key={p.id} p={p} />)}
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">예시 인물 (완전 허구 데이터)</p>
            <div className="mt-5"><PrimaryButton>로그인하고 시작하기</PrimaryButton></div>
          </>
        )}
      </div>
    )
  }
  if (mode === 'new') {
    return (
      <div className="px-5 pb-8 pt-16 text-center">
        <Users size={40} className="mx-auto text-neutral-300" />
        <p className="mt-4 text-[16px] font-bold">아직 저장한 사람이 없어요</p>
        <p className="mt-1 text-[13px] text-neutral-500">프로필을 저장하거나 직접 추가하면 여기에 쌓여요</p>
        <div className="mx-auto mt-6 flex max-w-[260px] flex-col gap-2">
          <PrimaryButton>직접 추가하기</PrimaryButton>
        </div>
      </div>
    )
  }
  const list = filter === '전체' ? PEOPLE : PEOPLE.filter((p) => p.tags.includes(filter) || (filter === '비회원' && !p.member))
  return (
    <div className="px-5 pb-8">
      <div className="mt-3 flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
        <Search size={16} className="text-neutral-400" />
        <span className="text-[13px] text-neutral-400">내 사람 {PEOPLE.length}명 중에서 찾기</span>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {['전체', '투자', '고객', '협업', '비회원'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] ${filter === f ? 'bg-[#25313D] text-white' : 'border border-neutral-200'}`}>{f}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {list.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
      </div>
      <Card className="mt-4 !p-3 text-center text-[13px]"><UserPlus size={18} className="mx-auto mb-1" />직접 추가하기<Tag kind="new" /></Card>
      <p className="mt-3 text-[11px] text-neutral-400">기존 저장(아카이브)을 확장. 저장하는 순간 인물 카드가 생김</p>
    </div>
  )
}

/* ───────── 인물 카드 상세 ───────── */

function PersonDetail({ p, onBack }: { p: Person; onBack: () => void }) {
  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-3 py-3">
        <button onClick={onBack}><ChevronLeft size={24} /></button>
        <span className="text-[15px] font-semibold">인물 카드</span>
        <Tag kind="new" />
      </div>
      <div className="px-5">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} size={64} member={p.member} />
          <div>
            <div className="text-[20px] font-bold">{p.name}</div>
            <div className="text-[13px] text-neutral-500">{p.title}</div>
            {p.member
              ? <Link href="/" className="mt-1 inline-flex items-center text-[12px] font-medium text-[#25313D]">공개 프로필 보기 <ChevronRight size={12} /></Link>
              : <span className="mt-1 inline-block text-[12px] text-neutral-400">비회원 (직접 추가)</span>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
          <button className="rounded-xl border border-neutral-200 py-2.5"><CalendarClock size={16} className="mx-auto mb-1" />곧 만나요</button>
          <button className="rounded-xl border border-neutral-200 py-2.5"><PenLine size={16} className="mx-auto mb-1" />기록</button>
          <button className="rounded-xl border border-neutral-200 py-2.5"><MessageCircle size={16} className="mx-auto mb-1" />연락하기</button>
        </div>

        <SectionTitle tag="new" right={<PrivateBadge />}>만남 기록</SectionTitle>
        <div className="space-y-3 border-l-2 border-neutral-100 pl-4">
          <div>
            <div className="text-[12px] text-neutral-400">{p.met}</div>
            <p className="mt-0.5 text-[13px]">{p.note ?? '처음 만남. 서로 하는 일 소개'}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[12px] text-neutral-400"><Mic size={12} /> 녹음 요약 (32분)</div>
            <p className="mt-0.5 text-[13px]">다음 분기 협업 범위를 이야기함. 1월 중 제안서를 보내기로 함</p>
          </div>
          <div>
            <div className="text-[12px] text-neutral-400">할 일</div>
            <p className="mt-0.5 text-[13px]">감사 인사 보내기 <span className="text-neutral-400">(초안 있음)</span></p>
          </div>
        </div>

        {p.member && (
          <>
            <SectionTitle tag="old">케미</SectionTitle>
            <Card><div className="flex items-center gap-2 text-[13px]"><Sparkles size={15} /> 나와의 케미 리포트 <ChevronRight size={14} className="ml-auto text-neutral-300" /></div></Card>
            <SectionTitle tag="old">이 사람의 프로필 요약</SectionTitle>
            <Card><p className="text-[13px] leading-relaxed text-neutral-600">AI 탭 요약을 그대로 보여줌. 경력, 취향, 다른 사람이 남긴 이야기 요약</p></Card>
          </>
        )}

        <SectionTitle tag="old">연락처</SectionTitle>
        <Card className="text-[13px] text-neutral-600">{p.member ? '공개 프로필에 등록된 연락처' : '직접 입력한 전화번호, 이메일'}</Card>

        <SectionTitle tag="later">연동 정보</SectionTitle>
        <Card className="text-[13px] text-neutral-400">캘린더 일정이 쌓이는 자리</Card>
      </div>
    </div>
  )
}

/* ───────── 나 ───────── */

function MeTab({ mode }: { mode: Mode }) {
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-8 pt-10 text-center">
        <User size={40} className="mx-auto text-neutral-300" />
        <p className="mt-4 text-[16px] font-bold">로그인하고 내 프로필을 만들어요</p>
        <div className="mx-auto mt-6 max-w-[260px]"><PrimaryButton>로그인 / 회원가입</PrimaryButton></div>
        <div className="mt-8 text-left">
          <Row icon={<Settings size={18} />} label="언어" desc="한국어" href="/settings" tag="old" />
        </div>
      </div>
    )
  }
  return (
    <div className="px-5 pb-8">
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
        <Row icon={<MessageCircle size={18} />} label="받은 이야기" desc="방명록, 피드백, 평판을 하나로" tag="review" />
        <Row icon={<Eye size={18} />} label="공개범위" href="/me?section=visibility" />
      </Card>

      <SectionTitle>활동</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row icon={<BarChart3 size={18} />} label="내 프로필 본 사람" desc="방문자 통계를 재화 사용처로 교체" tag="old" />
        <Row icon={<Sparkles size={18} />} label="케미 리포트 모아보기" tag="new" />
        <Row icon={<Coins size={18} />} label="내 재화" desc="12개 보유 (이름 미정)" tag="new" />
      </Card>

      <SectionTitle tag="old">설정</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row icon={<Settings size={18} />} label="계정, 언어, 약관, 문의" href="/settings" />
      </Card>
    </div>
  )
}

/* ───────── 기록 시트 ───────── */

/**
 * 기록은 "누구와"를 먼저 고른다. 녹음은 대화 상대가 정해져야 시작되고,
 * 끝나면 고른 사람들의 인물 카드에 요약과 할 일이 붙는다.
 */
function RecordSheet({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const isGuest = mode === 'guest'
  // 사용 중 회원은 지금 진행 중인 일정(오늘 오후 3시 도민혁)을 미리 골라둔다
  const [picked, setPicked] = useState<string[]>(mode === 'active' ? [PEOPLE[1].id] : [])
  const [newNames, setNewNames] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [step, setStep] = useState<'pick' | 'memo' | 'recording' | 'done'>('pick')

  const candidates = mode === 'active' ? PEOPLE : []
  const filtered = query ? candidates.filter((p) => p.name.includes(query)) : candidates.slice(0, 4)
  const pickedNames = [
    ...candidates.filter((p) => picked.includes(p.id)).map((p) => p.name),
    ...newNames,
  ]
  const hasPick = pickedNames.length > 0
  const toggle = (id: string) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const addNew = () => {
    const name = query.trim()
    if (!name) return
    setNewNames((prev) => [...prev, name])
    setQuery('')
  }

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div className="max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />

        {step === 'pick' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center text-[17px] font-bold">누구와 이야기하나요?<Tag kind="new" /></h3>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            <div className="mt-1"><PrivateBadge /></div>

            {mode === 'active' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">
                <CalendarClock size={14} /> 지금 일정: 오후 3시 {PEOPLE[1].name}님과 미팅
              </div>
            )}

            {hasPick && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pickedNames.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 rounded-full bg-[#25313D] px-3 py-1 text-[12px] text-white">
                    {n}
                    <button
                      onClick={() => {
                        const hit = candidates.find((p) => p.name === n)
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
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isGuest ? '상대 이름 입력' : '내 사람에서 찾거나 이름 입력'}
                className="flex-1 bg-transparent text-[13px] outline-none"
              />
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
              {query.trim() && !candidates.some((p) => p.name === query.trim()) && (
                <button onClick={addNew} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-[13px]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-neutral-300"><UserPlus size={14} /></span>
                  &lsquo;{query.trim()}&rsquo; 새 사람으로 추가
                </button>
              )}
            </div>

            <p className="mt-2 text-[11px] text-neutral-400">여러 명과 함께 있으면 모두 골라요. 기록이 각자의 인물 카드에 붙어요.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                disabled={!hasPick}
                onClick={() => setStep('memo')}
                className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-3 text-[14px] disabled:opacity-40"
              >
                <PenLine size={16} /> 메모
              </button>
              <button
                disabled={!hasPick}
                onClick={() => setStep('recording')}
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-3 text-[14px] font-semibold text-white disabled:opacity-40"
              >
                <Mic size={16} /> 녹음 시작
              </button>
            </div>
            {!hasPick && <p className="mt-2 text-center text-[11px] text-neutral-400">대화 상대를 먼저 골라주세요</p>}
          </>
        )}

        {step === 'memo' && (
          <>
            <h3 className="text-[17px] font-bold">{pickedNames.join(', ')}님과의 메모</h3>
            <div className="mt-1"><PrivateBadge /></div>
            <div className="mt-4 h-32 rounded-2xl border border-neutral-200 p-3 text-[13px] text-neutral-400">
              아무렇게나 적어도 AI가 정리하고 할 일을 뽑아요
            </div>
            <div className="mt-4"><PrimaryButton onClick={() => setStep('done')}>{isGuest ? '로그인하고 저장' : '저장'}</PrimaryButton></div>
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
            <p className="mt-1 text-[12px] text-neutral-500">화면을 켜둔 상태에서 녹음돼요</p>
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
            <p className="mt-3 text-[16px] font-bold">{isGuest ? '로그인하면 저장돼요' : 'AI가 정리하고 있어요'}</p>
            <p className="mt-1 text-[13px] text-neutral-500">
              {pickedNames.join(', ')}님 인물 카드에 요약과 할 일이 붙어요
            </p>
            <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────── 화면 ───────── */

export default function V2IaPage() {
  const [tab, setTab] = useState<Tab>('home')
  const [mode, setMode] = useState<Mode>('active')
  const [fromLink, setFromLink] = useState(true)
  const [person, setPerson] = useState<Person | null>(null)
  const [recordOpen, setRecordOpen] = useState(false)

  const goTab = (t: Tab) => { setPerson(null); setTab(t) }
  const titles: Record<Tab, string> = { home: '홈', search: '검색', people: '사람', me: '나' }

  const tabs: { id: Tab | 'record'; label: string; icon: ReactNode }[] = [
    { id: 'home', label: '홈', icon: <Home size={22} /> },
    { id: 'search', label: '검색', icon: <Search size={22} /> },
    { id: 'record', label: '', icon: <Plus size={24} /> },
    { id: 'people', label: '사람', icon: <Users size={22} /> },
    { id: 'me', label: '나', icon: <User size={22} /> },
  ]

  return (
    <div className="min-h-dvh bg-neutral-200 py-4 max-sm:bg-white max-sm:py-0">
      {/* 기획 확인용 컨트롤 */}
      <div className="mx-auto mb-3 flex max-w-[390px] flex-wrap items-center gap-2 px-3 text-[12px]">
        <span className="font-semibold text-neutral-600">상태</span>
        {([['guest', '비회원'], ['new', '가입 직후'], ['active', '사용 중']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setPerson(null) }} className={`rounded-full px-3 py-1 ${mode === m ? 'bg-[#25313D] text-white' : 'bg-white'}`}>{l}</button>
        ))}
        {mode === 'guest' && (
          <label className="ml-1 flex items-center gap-1 text-neutral-600">
            <input type="checkbox" checked={fromLink} onChange={(e) => setFromLink(e.target.checked)} /> 링크로 들어옴
          </label>
        )}
      </div>

      <div className="relative mx-auto flex h-[800px] max-w-[390px] flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl max-sm:h-[calc(100dvh-44px)] max-sm:rounded-none max-sm:shadow-none">
        <div className="flex-1 overflow-y-auto">
          {person ? (
            <PersonDetail p={person} onBack={() => setPerson(null)} />
          ) : (
            <>
              <Header title={titles[tab]} />
              {tab === 'home' && <HomeTab mode={mode} openPerson={setPerson} goTab={goTab} />}
              {tab === 'search' && <SearchTab openPerson={setPerson} />}
              {tab === 'people' && <PeopleTab mode={mode} openPerson={setPerson} fromLink={fromLink} />}
              {tab === 'me' && <MeTab mode={mode} />}
            </>
          )}
        </div>

        <nav className="flex shrink-0 items-center justify-around border-t border-[var(--color-border-soft)] bg-white pb-5 pt-2">
          {tabs.map((t) =>
            t.id === 'record' ? (
              <button key="record" onClick={() => setRecordOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D0D0D] text-white" aria-label="기록">
                {t.icon}
              </button>
            ) : (
              <button
                key={t.id}
                onClick={() => goTab(t.id as Tab)}
                className={`flex w-14 flex-col items-center gap-0.5 text-[11px] ${tab === t.id && !person ? 'text-[#0D0D0D] font-semibold' : 'text-neutral-400'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ),
          )}
        </nav>

        {recordOpen && <RecordSheet mode={mode} onClose={() => setRecordOpen(false)} />}
      </div>

      <p className="mx-auto mt-3 max-w-[390px] px-3 text-[11px] leading-relaxed text-neutral-500">
        기획 확인용 와이어프레임. 태그: 기존(지금 있는 기능을 옮김), 신규, 다음 단계, 검토(결정 필요). 채팅과 실행(발송, 예약)은 추후 기획.
      </p>
    </div>
  )
}
