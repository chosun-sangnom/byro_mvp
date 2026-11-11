'use client'

/**
 * [임시] UI/UX 전면 개편 IA 와이어프레임 (니즈·기능 정의서 v0.2 6장)
 * 하단 탭 3개(오늘의 제안 / 내 사람들 / 마이페이지) + 어느 탭에서든 떠 있는 플로팅 버튼(말하기, 메모, 녹음, 올리기).
 * 상태별(비회원 / 가입 직후 / 가져오는 중 / 사용 중) 화면을 보여주고, 가입부터 온보딩, 사람 정리, 묶음 발송, 기록까지 눌러서 이어진다.
 * 사람, 초안, 할 일, 기록은 화면끼리 이어지는 한 벌의 상태(AppCtx)로 움직인다. 새로고침하면 처음으로 돌아간다.
 * 데이터는 전부 허구 인물. 기존 화면으로 가는 링크는 실제 목업 화면으로 연결된다.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useFeloreStore } from '@/store/useFeloreStore'
import Link from 'next/link'
import { clearV2Flow, MODE_KEY, readV2Mode } from '@/lib/v2Flow'
import { V2ModeBar, V2TabBar } from '@/components/layout/V2Chrome'
import {
  Bell, Settings, Sparkles, Users, User, ChevronRight, ChevronLeft, Search,
  Mic, PenLine, Lock, CalendarClock, MessageCircle, Send, Upload, Plus,
  QrCode, BarChart3, Coins, Eye, ShieldCheck, BadgeCheck, X, UserPlus, Check, Square,
  Clock, GitMerge, ArrowUp, FileText, Image as ImageIcon, RefreshCw, CalendarDays, Mail, TriangleAlert, Menu,
  Phone, KeyRound, Copy, Link2, MoreHorizontal, EyeOff, Gift, Share2,
} from 'lucide-react'

type Tab = 'today' | 'people' | 'me'
type Mode = 'guest' | 'new' | 'importing' | 'active'
type Channel = 'ig' | 'in' | 'kakao' | 'tg' | 'mail' | 'cal' | 'phone' | 'call' | 'memo' | 'card'

type Person = {
  id: string
  name: string
  title: string
  member: boolean
  /** [임시] 기존 프로필 서비스의 공개 프로필 주소와 사진 */
  linkId?: string
  img?: string
  met: string
  tags: string[]
  /** why: 이 계정이 왜 이 사람으로 묶였는지 */
  accounts: { ch: Channel; handle: string; why?: string }[]
  /** 펠로어 프로필을 보고 저장한 사람 */
  origin?: 'felore'
  tone?: string
  /** 답장 초안을 고친 내용에서 배운 것 */
  learned?: string
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
  { id: 'p6', name: '이지민', title: '스타트업 마케터', member: true, linkId: 'jiminlee', img: '/images/jimin-profile-5x4.jpg', met: '3월 비즈니스 살롱', tags: ['협업'], origin: 'felore', accounts: [{ ch: 'ig', handle: '@jimin.mkt', why: '본인 프로필에 적은 인스타예요' }], tone: '존댓말, 편한 사이', note: '마케팅 인사이트가 좋음. 커뮤니티 행사 같이 해보기로 함', self: ['Brand Lab 스타트업 마케터, 브랜드와 커뮤니티', '러닝하고 혁오 듣는 편'] },
  { id: 'p1', name: '한서윤', title: '루프벤처스 심사역', member: true, met: '10/29 성수 네트워킹', tags: ['투자'], accounts: [{ ch: 'phone', handle: '010-3321-****', why: '펠로어 회원 인증 번호와 같아요' }, { ch: 'kakao', handle: '한서윤', why: '연락처 이름과 같아요' }, { ch: 'in', handle: 'seoyun-han', why: '본인 프로필에 적은 링크드인이에요' }], tone: '존댓말, 일 얘기 위주', note: '헬스케어 관심, 다음 달 IR 자료 요청', self: ['루프벤처스 심사역, 헬스케어와 바이오 초기 투자', '주말엔 와인 모임', '연락은 카톡이 편해요'] },
  { id: 'p2', name: '도민혁', title: '오르빗랩 대표', member: true, met: '10/24 판교 미팅', tags: ['고객'], accounts: [{ ch: 'phone', handle: '010-5590-****', why: '펠로어 회원 인증 번호와 같아요' }, { ch: 'ig', handle: '@minhyuk.run', why: '본인 프로필에 적은 인스타예요' }, { ch: 'kakao', handle: '민혁', why: '내가 같은 사람이라고 했어요' }], tone: '반말, 친한 사이', note: '러닝 크루 운영, 둘째 입학 준비 중', self: ['오르빗랩 대표, B2B 물류 SaaS', '러닝 크루 운영 중'], pending: [{ t: '주말 하프 마라톤 완주', src: '인스타 게시물' }] },
  { id: 'p3', name: '윤채린', title: '브랜드 디렉터', member: false, met: '10/18 지인 소개', tags: ['협업'], accounts: [{ ch: 'mail', handle: 'chaerin@studio-yun.kr' }, { ch: 'phone', handle: '010-2718-****', why: '메일 서명의 번호가 연락처와 같아요' }], tone: '존댓말',
    facts: [{ t: '스튜디오 윤 브랜드 디렉터', src: '메일 서명' }, { t: '010-2718-****', src: '메일 서명' }, { t: '지인 소개로 만남, 협업 검토 중', src: '내 메모' }],
    pending: [{ t: '12월에 성수에서 팝업 전시 준비 중', src: '10/31 메일' }, { t: '브랜드 리뉴얼 프로젝트를 맡을 파트너를 찾는 중', src: '10/31 메일' }],
    self: ['스튜디오 윤 브랜드 디렉터, 패션과 리빙 브랜드 전문', '협업 문의는 메일로 받아요'] },
  { id: 'p4', name: '서지환', title: '그린필드 파트너', member: true, met: '7/02 저녁 모임', tags: ['투자'], origin: 'felore', accounts: [{ ch: 'tg', handle: '@jihwan_s', why: '본인 프로필에 적은 텔레그램이에요' }] },
  { id: 'p5', name: '마예린', title: '프리랜서 PD', member: false, met: '9/11 행사', tags: [], accounts: [{ ch: 'ig', handle: '@yerin.pd' }],
    facts: [{ t: '프리랜서 PD, 유튜브 예능', src: '인스타 소개글' }], pending: [{ t: '다음 달 부산 촬영', src: '인스타 DM' }] },
  { id: 'p7', name: '윤채원', title: '', member: false, met: '11/6 네트워킹 행사', tags: [], accounts: [], note: '행사에서 처음 인사. 브랜드 협업에 관심',
    facts: [{ t: '네트워킹 행사에서 처음 만남', src: '내 메모' }] },
]

const JIMIN = PEOPLE[0]

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
  /** 보낸 계정이 누구인지 몰라서 초안보다 먼저 같은 사람인지 묻는다 */
  unknown?: { handle: string; q: MergeQ }
  /** 어디서 생긴 초안인지 (할 일, 챙길 사람, 기록 뒤 후속 연락) */
  origin?: string
}

const DRAFTS: Draft[] = [
  { id: 'd1', ch: 'ig', personId: 'p2', kind: '댓글', original: '형 러닝 사진 미쳤다 🔥', context: '친한 사이, 러닝 크루 같이 함', text: 'ㅋㅋ 고마워! 이번 주말에 같이 뛰자' },
  { id: 'd2', ch: 'kakao', personId: 'p1', kind: '메시지', original: '민준님, 말씀하신 IR 자료 언제쯤 받아볼 수 있을까요?', context: '10/29 미팅에서 자료 보내기로 약속함', text: '서윤님, 금요일까지 정리해서 보내드릴게요. 기다려 주셔서 감사합니다.' },
  { id: 'd3', ch: 'mail', personId: 'p3', kind: '메일', original: '포트폴리오 첨부드립니다. 편하실 때 보시고 의견 주세요.', context: '10/18 지인 소개로 만남, 협업 검토 중', text: '채린님, 포트폴리오 잘 받았습니다. 이번 주 안에 보고 의견 드릴게요.', profileLink: true },
  { id: 'd4', ch: 'tg', personId: 'p4', kind: '메시지', original: '다음 주에 저녁 한번 할까요?', context: '7월 이후 연락 없었음', text: '좋아요! 다음 주 목요일 저녁 어떠세요?' },
  { id: 'd5', ch: 'ig', personId: 'p7', kind: 'DM', original: '안녕하세요, 지난주 행사에서 인사드린 윤채원입니다. 말씀하신 협업 자료 보내드려도 될까요?', context: '11/6 행사에서 처음 만남, 브랜드 협업에 관심', text: '채원님, 반갑습니다. 자료 보내주시면 이번 주 안에 보고 연락드릴게요.', profileLink: true,
    unknown: { handle: '@chaewon.yy', q: { a: { ch: 'ig', h: '@chaewon.yy' }, b: { ch: 'memo', h: '윤채원' }, why: 'DM에서 밝힌 이름이 메모로 만든 카드의 이름과 같아요', talk: 'DM 1개' } } },
]

type Todo = { id: string; personId: string; t: string; from: string; draft?: string; done?: boolean }

const TODOS: Todo[] = [
  { id: 't1', personId: 'p2', t: '어제 미팅 감사 인사 보내기', from: '녹음 요약에서', draft: '민혁아, 어제 시간 내줘서 고마워. 얘기한 물류 데모 자료는 이번 주 안에 보낼게!' },
  { id: 't2', personId: 'p1', t: 'IR 자료 보내기 (금요일까지)', from: '카톡에서 한 약속' },
  { id: 't3', personId: 'p3', t: '포트폴리오 의견 주기', from: '메일에서' },
]

/** 오래 연락하지 못했거나 근황이 생긴 사람 */
const CARE: { personId: string; why: string; draft: string }[] = [
  { personId: 'p4', why: '4개월째 연락이 없어요. 최근 새 펀드 결성 소식이 있어요', draft: '지환님, 오랜만에 연락드려요. 새 펀드 결성 소식 봤습니다. 축하드려요! 조만간 식사 한번 하시죠.' },
  { personId: 'p5', why: '두 달째 연락이 없어요. 다음 달 부산 촬영을 준비 중이에요', draft: '예린님, 잘 지내시죠? 부산 촬영 준비는 잘 되고 있나요? 다녀오시면 얘기 들려주세요.' },
]

/** 기록 한 건. 원문과 녹음은 지우고 요약만 남는다 */
type Rec = { id: string; kind: 'memo' | 'record' | 'call' | 'kakao' | 'reply'; when: string; text: string }

type Noti = { id: string; kind: 'draft' | 'call' | 'broken' | 'join' | 'feedback'; t: string; d: string }

const NOTIS: Noti[] = [
  { id: 'n1', kind: 'draft', t: '답장 초안 5개가 준비됐어요', d: '오전 10시 묶음' },
  { id: 'n2', kind: 'call', t: '도민혁님과 통화한 녹음이 있어요', d: '오늘 오후 4:12, 12분' },
  { id: 'n3', kind: 'broken', t: '링크드인 연결이 잠깐 풀렸어요', d: '다시 연결하면 그 사이 온 메시지를 정리해요' },
  { id: 'n4', kind: 'join', t: '윤채린님이 펠로어에 가입했어요', d: '본인이 쓴 프로필이 카드에 붙었어요' },
  { id: 'n5', kind: 'feedback', t: '이지민님이 피드백을 남겼어요', d: '내 프로필에서 확인해요' },
]

const CH: Record<Channel, { label: string; cls: string }> = {
  ig: { label: '인스타', cls: 'bg-pink-50 text-pink-600' },
  in: { label: '링크드인', cls: 'bg-sky-50 text-sky-700' },
  kakao: { label: '카톡', cls: 'bg-yellow-50 text-yellow-700' },
  tg: { label: '텔레그램', cls: 'bg-blue-50 text-blue-600' },
  mail: { label: '메일', cls: 'bg-neutral-100 text-neutral-600' },
  cal: { label: '캘린더', cls: 'bg-violet-50 text-violet-600' },
  phone: { label: '연락처', cls: 'bg-emerald-50 text-emerald-700' },
  call: { label: '통화', cls: 'bg-teal-50 text-teal-700' },
  memo: { label: '메모', cls: 'bg-neutral-100 text-neutral-600' },
  card: { label: '명함', cls: 'bg-orange-50 text-orange-700' },
}

/** 초안을 보내는 채널이 어느 연결에 달려 있는지 */
const CH_SRC: Partial<Record<Channel, Src>> = { ig: 'ig', in: 'in', kakao: 'kakao', tg: 'tg', mail: 'gmail' }

/** 그 사람에게 연락할 때 쓸 채널. 대화가 오가는 곳을 먼저 고른다 */
const talkChannel = (p: Person): Channel => p.accounts.find((a) => CH_SRC[a.ch])?.ch ?? 'kakao'

/** [임시] 나. 기존 프로필 서비스의 강민준 프로필과 이어진다 */
const ME = { name: '강민준', title: 'B2B SaaS Product Owner', linkId: 'gangminjun', img: '/images/mj1.jpg' }

const personById = (id: string) => PEOPLE.find((p) => p.id === id)!

/* ───────── 한 장짜리 프로필 ─────────
 * 에이전트가 중심이 되면 프로필은 직접 채우는 긴 이력서가 아니라 처음 만난 사람이 30초에 훑는 소개 한 장이면 된다.
 * 탭 없이 페르소나, 케미, 명함(경력과 학력), 연결된 사람들, 평판만 둔다. 취향과 근황은 인스타에서 고른 사진과 키워드로 대신한다.
 * 통화나 대화에서 나온 정보는 여기에 나오지 않고 각자의 인물 카드에만 쌓인다.
 */
type ProfSec = 'persona' | 'card' | 'net' | 'rep'
type Job = { org: string; role: string; when: string; ok?: boolean }
type Prof = {
  /** 한 줄 소개 */
  line: string
  /** 펠로어가 인스타를 보고 건넨 한마디 */
  word?: string
  persona: string
  keywords: string[]
  /** 인스타에서 고른 사진. 주소가 없으면 색 블록 */
  photos: string[]
  career: Job[]
  edu: Job[]
  net: { total: number; from: string; groups: [string, number][] }
  mutual: string[]
  rep: [string, number][]
  quotes: { from: string; text: string }[]
  kemi: { score: number; rows: [string, string][] }
}

const MY_PROF: Prof = {
  line: '커뮤니티로 성장을 만드는 B2B SaaS 빌더',
  word: '평일엔 성수, 주말엔 한강',
  persona: '사람을 만나며 일을 넓히는 실행형 프로덕트 오너. 주말 러닝으로 리듬을 지키고, 새로운 공간과 전시에서 영감을 얻어요.',
  keywords: ['러닝', '성수', '스타트업', '커피', '전시'],
  photos: ['/images/mj1.jpg', '/images/mj2.jpg', '#C9D7E3', '#D8E3C9'],
  career: [
    { org: 'Felore', role: 'B2B SaaS Product Owner', when: '2022 ~ 지금', ok: true },
    { org: '스타트업 공동창업', role: '제품 총괄', when: '2019 ~ 2022' },
  ],
  edu: [{ org: 'KAIST', role: '경영학과', when: '졸업', ok: true }],
  net: { total: 312, from: '리멤버 명함', groups: [['스타트업', 128], ['투자', 54], ['마케팅', 47], ['그 밖', 83]] },
  mutual: [],
  rep: [['추진력이 좋아요', 12], ['큰 방향을 빨리 잡아요', 9], ['인사이트가 많아요', 7]],
  quotes: [
    { from: '이지민', text: '큰 방향을 빠르게 정리하고 실제 실행으로 옮기는 힘이 분명한 분이에요.' },
    { from: '한서윤', text: '생각이 깊은데 실행이 느리지 않아서 같이 일할 때 추진력이 좋았습니다.' },
  ],
  kemi: { score: 0, rows: [['커리어', '제품을 만드는 사람, 사업을 넓히는 사람과 잘 맞아요'], ['성격', '결정이 빠른 편이라 꼼꼼한 사람과 균형이 맞아요'], ['취향', '러닝과 새로운 공간을 좋아하는 사람과 금방 친해져요']] },
}

/** 막 가입한 사람의 프로필. 인스타와 리멤버를 연결하기 전이라 직접 적은 것만 있다 */
const FRESH_PROF: Prof = { ...MY_PROF, line: '', career: [], edu: [], rep: [], quotes: [] }

const PROFS: Record<string, Prof> = {
  p6: {
    line: '러닝하고 혁오 듣는 스타트업 마케터',
    word: '브랜드 얘기엔 진심, 주말엔 한남동',
    persona: '브랜드와 사람을 잇는 마케터. 처음엔 거리를 두지만 신뢰가 쌓이면 깊이 연결되는 편이에요. 방향을 먼저 잡고 실행은 빠르게 가요.',
    keywords: ['러닝', '혁오', '브랜드', '커뮤니티', '한남동'],
    photos: ['/images/jimin-photo-2.jpg', '/images/jimin-photo-3.jpg', '/images/jimin-photo-4.jpg'],
    career: [{ org: 'Brand Lab', role: '스타트업 마케터', when: '2022 ~ 지금', ok: true }],
    edu: [{ org: '연세대학교', role: '경영학', when: '2021 졸업', ok: true }],
    net: { total: 184, from: '리멤버 명함', groups: [['스타트업', 71], ['브랜드', 46], ['미디어', 30], ['그 밖', 37]] },
    mutual: ['한서윤', '도민혁'],
    rep: [['대화하면 생각이 넓어져요', 8], ['전문성이 느껴져요', 6], ['끝까지 챙겨요', 5]],
    quotes: [{ from: '한서윤', text: '행사를 같이 준비했는데 끝까지 챙기는 분이에요.' }],
    kemi: { score: 82, rows: [['커리어', 'B2B 제품과 브랜드 마케팅, 서로의 일에 바로 도움이 돼요'], ['취향', '둘 다 러닝을 해요. 주말 한강에서 만나기 좋아요'], ['성격', '방향을 먼저 잡는 사람과 사람을 잇는 사람이 만나요']] },
  },
}

/** 예시 인물은 인물 카드에 있는 정보로 간단한 프로필을 만든다 */
function profOf(p: Person): Prof {
  if (PROFS[p.id]) return PROFS[p.id]
  const [org, ...role] = p.title.split(' ')
  return {
    line: p.self?.[0] ?? p.title ?? '',
    persona: p.self?.length ? `${p.self.join('. ')}.` : `${p.title || p.name}. 공개된 정보로 만든 소개예요.`,
    keywords: p.tags.length ? p.tags : ['스타트업'],
    photos: ['#E9D8C4', '#C9D7E3', '#D8E3C9'],
    career: p.title ? [{ org, role: role.join(' ') || p.title, when: '지금', ok: p.member }] : [],
    edu: [],
    net: { total: 96, from: '리멤버 명함', groups: [['스타트업', 41], ['투자', 22], ['그 밖', 33]] },
    mutual: [],
    rep: [['믿고 맡길 수 있어요', 4], ['말이 잘 통해요', 3]],
    quotes: [],
    kemi: { score: 74, rows: [['커리어', '서로의 일에 바로 도움이 되는 사이예요'], ['성격', '결정이 빠른 쪽과 꼼꼼한 쪽이 만나 균형이 맞아요'], ['취향', '새로운 공간을 좋아하는 점이 겹쳐요']] },
  }
}

/* ───────── 화면끼리 이어지는 상태 ───────── */

type MergeQ = { a: { ch: Channel; h: string }; b: { ch: Channel; h: string }; why: string; talk?: string }
type MergeAnswer = 'same' | 'diff' | 'later'
type ShareSpec = { title: string; url?: string; text?: string }
type Panel =
  | { k: 'qr' | 'verify' | 'viewers' | 'batch' | 'coin' | 'noti' | 'hidden' | 'add' }
  | { k: 'kemi'; p: Person | null }
  | { k: 'editProf' | 'vis' }
  | { k: 'feedback'; p: Person }
  | { k: 'compose'; personId: string; title: string; text: string; todoId?: string }
type FabAction = 'chat' | 'memo' | 'record' | 'upload'
/** 내 약속 링크 설정 */
type MeetSet = { on: boolean; days: string[]; from: number; to: number; dur: number }
type ImportedPerson = Person & { why: string; spam?: boolean }
type BatchSt = {
  label: string
  include: Record<string, boolean>
  texts: Record<string, string>
  links: Record<string, boolean>
  /** 초안까지만 맡긴 곳은 복사해서 직접 보낸다 */
  copied: Record<string, boolean>
  /** 모르는 계정에 대한 같은 사람 확인 결과 */
  who: Record<string, MergeAnswer>
  sent: boolean
}
type Msg = {
  from: 'me' | 'ai'
  text: string
  merge?: { q: MergeQ; personId?: string; ans?: MergeAnswer }
  tone?: { personId: string; tone: string; ans?: boolean }
  connect?: Src
  record?: string
  tips?: boolean
  /** 채팅 안에서 받는 로그인 정보 카드 (피클 방식) */
  login?: { src: Src; stage: 'key' | 'form' | 'saved' }
  /** 가운데에 뜨는 처리 알림 */
  chip?: string
  /** 눌러서 바로 답하는 말 */
  quick?: string[]
  /** 어디까지 맡길지 고르기 */
  levels?: { src: Src; picked?: Level }
}

type App = {
  mode: Mode
  me: typeof ME
  people: Person[]
  imported: ImportedPerson[]
  getPerson: (id: string) => Person | undefined
  addPerson: (p: Person) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  /** 가져온 사람을 내 사람으로 올린다 */
  promote: (id: string) => void
  hide: (id: string) => void
  unhide: (id: string) => void
  hidden: ImportedPerson[]
  recs: Record<string, Rec[]>
  addRec: (ids: string[], r: Omit<Rec, 'id'>) => void
  drafts: Draft[]
  batchSt: BatchSt
  setBatchSt: (f: (s: BatchSt) => BatchSt) => void
  /** 다음 묶음에 올라갈 초안 */
  queue: Draft[]
  queueDraft: (d: Omit<Draft, 'id'>) => void
  loadNextBatch: () => void
  todos: Todo[]
  addTodo: (t: Omit<Todo, 'id'>) => void
  doneTodo: (id: string, done: boolean) => void
  cands: MergeQ[]
  answerCand: (q: MergeQ, a: MergeAnswer) => void
  setCands: (c: MergeQ[]) => void
  joinedIds: string[]
  markJoined: (id: string) => void
  /** 챙길 사람에서 넘긴 사람 */
  careOff: string[]
  skipCare: (id: string) => void
  notiSeen: boolean
  callImport: 'ask' | 'working' | 'done' | 'skip'
  setCallImport: (v: 'ask' | 'working' | 'done' | 'skip') => void
  coins: number
  addCoins: (n: number) => void
  meet: MeetSet
  setMeet: (m: MeetSet) => void
  logout: () => void
  batchTimes: [string, string]
  setBatchTimes: (t: [string, string]) => void
  chat: Msg[]
  setChat: (f: (m: Msg[]) => Msg[]) => void
  toast: (msg: string) => void
  openPerson: (p: Person | string) => void
  openAction: (a: FabAction, personId?: string) => void
  openShare: (s: ShareSpec) => void
  openPanel: (p: Panel) => void
  goTab: (t: Tab) => void
  onboarding: boolean
  /** 한 장짜리 프로필 열기. 'me'는 내 프로필 */
  openProfile: (t: Person | 'me') => void
  myProf: Prof
  setMyProf: (p: Prof) => void
  /** 내 프로필에서 구역별로 공개할지 */
  vis: Record<ProfSec, boolean>
  setVis: (v: Record<ProfSec, boolean>) => void
  /** 기획 확인용 태그(신규, 기존, 검토)를 보일지 */
  planTags: boolean
  /** 말하기를 열면서 바로 한마디 건넨다 */
  ask: string | null
  askAgent: (text: string | null) => void
}

const AppCtx = createContext<App>(null as unknown as App)
const useApp = () => useContext(AppCtx)

const freshBatch = (drafts: Draft[], label: string): BatchSt => ({
  label,
  include: Object.fromEntries(drafts.map((d) => [d.id, true])),
  texts: Object.fromEntries(drafts.map((d) => [d.id, d.text])),
  links: Object.fromEntries(drafts.map((d) => [d.id, !!d.profileLink])),
  copied: {},
  who: {},
  sent: false,
})

/* ───────── 연결 ─────────
 * 인스타, 링크드인 에이전트 대행은 로그인 정보를 받아 사용자가 만든 암호화 키로 잠가 보관하고 서버에서 로그인한다(피클 방식).
 * 인스타 프로필 연동(본인 확인, 피드 분석)은 마이페이지에서 DM 코드로 따로 한다(망원동 이자카야 방식).
 * 텔레그램은 공식 API, 지메일, 구글 캘린더는 구글 동의 화면으로 권한을 하나씩 받는다.
 * 카톡은 대화방의 대화 내보내기를 공유하기로 받는다. 자동 내보내기는 하지 않는다.
 * 휴대폰 연락처는 이름과 번호를 읽고 계속 동기화한다. 통화 녹음은 갤럭시는 녹음 파일 권한, 아이폰은 공유하기로 받는다.
 * 원천 대화와 녹음은 요약을 만든 뒤 지운다.
 */

type Src = 'contacts' | 'calls' | 'ig' | 'in' | 'tg' | 'kakao' | 'gmail' | 'gcal' | 'remember'
type Level = 'read' | 'draft' | 'send'
type Conn = { status: 'on' | 'off' | 'broken'; level: Level; last?: string }
type ConnMap = Record<Src, Conn>

const ALL_LEVELS: Level[] = ['read', 'draft', 'send']

const SRC: Record<Src, { label: string; ch: Channel; group: 'phone' | 'talk' | 'google' | 'card'; how: 'device' | 'web' | 'api' | 'google' | 'share'; desc: string; levels: Level[]; note?: string }> = {
  contacts: { label: '휴대폰 연락처', ch: 'phone', group: 'phone', how: 'device', desc: '이름과 번호, 바뀌면 계속 맞춰요', levels: ['read'], note: '이름과 번호만 읽고, 추가하거나 바꾼 연락처는 계속 맞춰요. 연락처를 고치거나 지우지 않아요' },
  calls: { label: '통화 녹음', ch: 'call', group: 'phone', how: 'device', desc: '휴대폰이 녹음한 통화', levels: ['read'], note: '고른 녹음만 요약해서 인물 카드에 붙이고, 녹음은 지워요' },
  ig: { label: '인스타그램', ch: 'ig', group: 'talk', how: 'web', desc: 'DM과 댓글을 대신 읽고 답해요', levels: ALL_LEVELS },
  in: { label: '링크드인', ch: 'in', group: 'talk', how: 'web', desc: '1촌과 메시지를 대신 읽고 답해요', levels: ALL_LEVELS },
  tg: { label: '텔레그램', ch: 'tg', group: 'talk', how: 'api', desc: '대화 상대', levels: ALL_LEVELS },
  kakao: { label: '카톡', ch: 'kakao', group: 'talk', how: 'share', desc: '대화방에서 내보낸 대화', levels: ['read', 'draft'], note: '카톡은 대화방에서 내보낸 대화만 읽어요. 보낼 때는 초안을 복사하거나 카톡 공유로 보내요' },
  gmail: { label: '지메일', ch: 'mail', group: 'google', how: 'google', desc: '주고받은 메일 상대', levels: ALL_LEVELS },
  gcal: { label: '구글 캘린더', ch: 'cal', group: 'google', how: 'google', desc: '일정과 참석자', levels: ['read'], note: '일정 만들기는 다음 단계예요' },
  remember: { label: '리멤버', ch: 'card', group: 'card', how: 'web', desc: '받은 명함과 내 경력', levels: ['read'], note: '받은 명함으로 연결된 사람들을 채우고, 내 프로필의 명함에 경력을 넣어요' },
}

const LEVEL: Record<Level, { t: string; d: string }> = {
  read: { t: '읽기만', d: '사람과 대화를 정리만 해요' },
  draft: { t: '초안까지', d: '답장 초안을 만들어 오늘의 제안에 올려요' },
  send: { t: '보내기까지', d: '내가 승인한 초안을 이 계정으로 보내요' },
}

const off = (level: Level = 'draft'): Conn => ({ status: 'off', level })

function initConn(mode: Mode): ConnMap {
  const base: ConnMap = { contacts: off('read'), calls: off('read'), ig: off(), in: off(), tg: off(), kakao: off(), gmail: off(), gcal: off('read'), remember: off('read') }
  if (mode === 'importing') {
    return { ...base, contacts: { status: 'on', level: 'read', last: '방금' }, ig: { status: 'on', level: 'draft', last: '방금' }, kakao: { status: 'on', level: 'draft', last: '방금' }, in: { status: 'on', level: 'draft', last: '가져오는 중' } }
  }
  if (mode === 'active') {
    return {
      ...base,
      remember: { status: 'on', level: 'read', last: '어제' },
      contacts: { status: 'on', level: 'read', last: '오늘 아침' },
      calls: { status: 'on', level: 'read', last: '오후 4시' },
      ig: { status: 'on', level: 'send', last: '10분 전' },
      in: { status: 'broken', level: 'send', last: '어제 밤' },
      tg: { status: 'on', level: 'send', last: '10분 전' },
      kakao: { status: 'on', level: 'draft', last: '어제' },
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
  /** 가져온 계정을 사람으로 묶고 나누는 화면. 가입 직후와 가져오는 중에만 */
  openSort?: () => void
  /** 비회원이 가입한다. viaLink면 링크로 본 프로필의 주인이 내 사람에 들어간다 */
  join: (viaLink?: boolean) => void
  joinedViaLink: boolean
  /** 마이페이지 > 인스타 연동. DM 코드로 내 계정을 확인하고 피드를 분석한다 */
  openInsta: () => void
  /** 인스타 연동을 마쳤는지와 앨범에 넣은 사진 수 */
  instaDone: boolean
  instaPhotos: number
  finishInsta: (photos: number) => void
  openMeetLink: () => void
}>({ conn: initConn('new'), start: () => {}, update: () => {}, openHub: () => {}, join: () => {}, joinedViaLink: false, openInsta: () => {}, instaDone: false, instaPhotos: 6, finishInsta: () => {}, openMeetLink: () => {} })

const useConnect = () => useContext(ConnectCtx)

/* ───────── 공통 조각 ───────── */

function Tag({ kind }: { kind: 'old' | 'new' | 'later' | 'review' }) {
  const app = useApp()
  const map = {
    old: ['기존', 'bg-neutral-100 text-neutral-500'],
    new: ['신규', 'bg-emerald-50 text-emerald-600'],
    later: ['다음 단계', 'bg-amber-50 text-amber-600'],
    review: ['검토', 'bg-rose-50 text-rose-500'],
  } as const
  // 기획 확인용 표시. 맨 위 줄에서 켰을 때만 보인다
  if (!app?.planTags) return null
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

function Avatar({ name, size = 40, member = true, img }: { name: string; size?: number; member?: boolean; img?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (img) return <img src={img} alt={name} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
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

/** 헤더 오른쪽: 펠로어 사람 검색, 알림, 앱 전체 설정. 내 사람들 탭 안의 검색은 내 사람 안에서만 찾는다 */
function Header({ title, onSearch }: { title: string; onSearch: () => void }) {
  const app = useApp()
  const icon = 'p-2 text-[var(--color-text-secondary)]'
  return (
    <>
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-bg-page)] px-5">
        <button onClick={() => app.goTab('today')} aria-label="Felore">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/felore-wordmark.svg" alt="Felore" className="h-[18px] w-auto" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onSearch} className={icon} aria-label="펠로어에서 사람 찾기"><Search size={20} /></button>
          {app.mode !== 'guest' && (
            <button onClick={() => app.openPanel({ k: 'noti' })} className={`relative ${icon}`} aria-label="알림">
              <Bell size={20} />
              {app.mode === 'active' && !app.notiSeen && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          )}
          <Link href="/settings?from=v2" className={icon} aria-label="설정"><Menu size={20} /></Link>
        </div>
      </header>
      <h1 className="px-5 pb-1 pt-4 text-[20px] font-black text-[var(--color-text-strong)]">{title}</h1>
    </>
  )
}

/* ───────── 오늘의 제안 ───────── */

function DraftItem({ d, openPerson }: { d: Draft; openPerson: (p: Person) => void }) {
  const app = useApp()
  const { conn } = useConnect()
  const { batchSt: st, setBatchSt } = app
  const [editing, setEditing] = useState(false)
  const who: MergeAnswer | undefined = d.unknown ? st.who[d.id] : 'same'
  const p = (who === 'diff' ? app.getPerson(`u-${d.id}`) : undefined) ?? app.getPerson(d.personId) ?? personById(d.personId)
  const include = st.include[d.id]
  const text = st.texts[d.id] ?? d.text
  const link = st.links[d.id]
  const edited = text !== d.text
  const src = CH_SRC[d.ch]
  const canSend = !!src && conn[src].status === 'on' && conn[src].level === 'send'
  const patch = (k: 'include' | 'links' | 'copied', v: boolean) => setBatchSt((s) => ({ ...s, [k]: { ...s[k], [d.id]: v } }))

  const answer = (a: MergeAnswer) => {
    setBatchSt((s) => ({ ...s, who: { ...s.who, [d.id]: a } }))
    if (a === 'same') {
      const base = app.getPerson(d.personId)
      if (base && !base.accounts.some((x) => x.handle === d.unknown!.handle)) {
        app.updatePerson(base.id, { accounts: [...base.accounts, { ch: d.ch, handle: d.unknown!.handle, why: '내가 같은 사람이라고 했어요' }] })
      }
      app.toast(`${base?.name ?? ''}님 카드에 ${CH[d.ch].label} 계정을 합쳤어요`)
    }
    if (a === 'diff') {
      app.addPerson({ id: `u-${d.id}`, name: d.unknown!.handle, title: '', member: false, met: '', tags: [], accounts: [{ ch: d.ch, handle: d.unknown!.handle }], facts: [] })
      app.toast('새 사람으로 따로 뒀어요')
    }
  }

  if (d.unknown && !who) {
    return (
      <div className="py-3">
        <div className="flex items-center gap-2">
          <Avatar name={d.unknown.handle} size={28} member={false} />
          <span className="text-[13px] font-semibold">{d.unknown.handle}</span>
          <ChannelBadge ch={d.ch} />
          <span className="text-[11px] text-neutral-400">{d.kind}</span>
        </div>
        <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">&ldquo;{d.original}&rdquo;</p>
        <p className="mb-2 mt-3 text-[12px] font-semibold">누가 보냈는지 먼저 확인해 주세요</p>
        <MergeAskCard q={d.unknown.q} onAnswer={answer} />
      </div>
    )
  }

  if (who === 'later') {
    return (
      <div className="flex items-center gap-2 py-3 text-[12px] text-neutral-500">
        <Avatar name={d.unknown!.handle} size={28} member={false} />
        <span className="flex-1">{d.unknown!.handle}님은 다음 묶음에서 다시 물어볼게요</span>
        <button onClick={() => setBatchSt((s) => { const w = { ...s.who }; delete w[d.id]; return { ...s, who: w } })} className="underline">지금 확인</button>
      </div>
    )
  }

  return (
    <div className={`py-3 ${include ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-2">
        <button onClick={() => openPerson(p)} className="flex min-w-0 items-center gap-2">
          <Avatar name={p.name} size={28} member={p.member} img={p.img} />
          <span className="truncate text-[13px] font-semibold">{p.name}</span>
        </button>
        <ChannelBadge ch={d.ch} />
        <span className="shrink-0 text-[11px] text-neutral-400">{d.kind}</span>
        <button onClick={() => patch('include', !include)} className={`ml-auto flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] ${include ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300 text-neutral-500'}`} aria-label="이번 묶음에 넣을지 선택">
          {include ? <><Check size={11} />넣음</> : '뺌'}
        </button>
      </div>
      {d.origin
        ? <p className="mt-2 text-[11px] text-neutral-400">{d.origin}</p>
        : <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">&ldquo;{d.original}&rdquo;</p>}
      <p className="mt-1.5 text-[11px] text-neutral-400">맥락: {d.context}{p.tone && <> / 말투: {p.tone}</>}</p>
      {editing ? (
        <div className="mt-2">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setBatchSt((s) => ({ ...s, texts: { ...s.texts, [d.id]: e.target.value } }))}
            className="w-full rounded-xl border border-[#25313D] p-3 text-[13px] leading-relaxed outline-none"
            rows={3}
          />
          <div className="mt-1 flex justify-end gap-3 text-[12px]">
            {edited && <button onClick={() => setBatchSt((s) => ({ ...s, texts: { ...s.texts, [d.id]: d.text } }))} className="text-neutral-400">처음 초안으로</button>}
            <button onClick={() => setEditing(false)} className="font-semibold text-[#25313D]">다 고쳤어요</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-left text-[13px] leading-relaxed">
          {text}
          <span className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400"><PenLine size={11} /> 눌러서 고치기</span>
        </button>
      )}
      {edited && <p className="mt-1 text-[11px] text-emerald-600">고친 내용은 {p.name}님 말투로 기억해요</p>}
      {d.profileLink && !p.member && (
        <button onClick={() => patch('links', !link)} className="mt-2 flex w-full items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-left">
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${link ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300 bg-white'}`}>
            {link && <Check size={10} />}
          </span>
          <span className="flex-1">
            <span className="flex items-center text-[12px] font-medium">내 프로필 링크 붙이기<Tag kind="new" /></span>
            <span className="block text-[11px] text-neutral-500">{p.name}님은 아직 펠로어 회원이 아니에요. 링크로 가입하면 서로 내 사람에 추가돼요</span>
          </span>
        </button>
      )}
      {!canSend && include && (
        <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-amber-700">{d.ch === 'kakao' ? '카톡은 펠로어가 대신 보낼 수 없어요. 복사하거나 카톡 공유로 직접 보내 주세요.' : `${CH[d.ch].label}에는 초안까지만 맡겼어요. 복사해서 직접 보내 주세요.`}</p>
          {st.copied[d.id] ? (
            <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-emerald-700"><Check size={12} />복사했어요. 보낸 것으로 정리할게요</p>
          ) : (
            <div className="mt-2 flex gap-2">
              <button onClick={() => { patch('copied', true); app.toast('초안을 복사했어요') }} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium"><Copy size={12} />복사</button>
              {d.ch === 'kakao' && <button onClick={() => { patch('copied', true); app.toast('카톡 공유 창을 열었어요 (목업)') }} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium"><Share2 size={12} />카톡으로 공유</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 답장이 필요 없다고 보고 묶음에서 뺀 메시지 */
const NO_REPLY: { name: string; ch: Channel; text: string; why: string }[] = [
  { name: '도민혁', ch: 'ig', text: '👍', why: '확인 응답' },
  { name: '한서윤', ch: 'in', text: '게시물을 공유했어요', why: '게시물 공유' },
]

function DraftBatch({ openPerson }: { openPerson: (p: Person) => void }) {
  const app = useApp()
  const { conn } = useConnect()
  const { batchSt: st, setBatchSt } = app
  // 연결한 곳에서 온 메시지와, 내가 만든 초안(안부, 감사 인사)만 보여준다
  const drafts = app.drafts.filter((d) => { const s = CH_SRC[d.ch]; return !!d.origin || (!!s && conn[s].status !== 'off') })
  const [showSkipped, setShowSkipped] = useState(false)

  const canSend = (d: Draft) => { const s = CH_SRC[d.ch]; return !!s && conn[s].status === 'on' && conn[s].level === 'send' }
  const decided = (d: Draft) => st.include[d.id] && (!d.unknown || (!!st.who[d.id] && st.who[d.id] !== 'later'))
  const active = drafts.filter(decided)
  const toSend = active.filter(canSend)
  const toCopy = active.filter((d) => !canSend(d))
  const leftCopy = toCopy.filter((d) => !st.copied[d.id])
  const carried = drafts.filter((d) => !decided(d)).length + leftCopy.length
  const editedCount = toSend.filter((d) => st.texts[d.id] !== d.text).length
  const target = (d: Draft) => (d.unknown && st.who[d.id] === 'diff' ? `u-${d.id}` : d.personId)
  const nextLabel = st.label.startsWith(app.batchTimes[0]) ? app.batchTimes[1] : `내일 ${app.batchTimes[0]}`

  const send = () => {
    toSend.forEach((d) => {
      const text = st.texts[d.id]
      const edited = text !== d.text
      if (edited) app.updatePerson(target(d), { learned: `고친 답장에서 배웠어요: “${text.slice(0, 26)}${text.length > 26 ? '…' : ''}”` })
      app.addRec([target(d)], { kind: 'reply', when: '방금', text: `${CH[d.ch].label} ${d.origin ? '메시지를 보냄' : '메시지에 답장함'}${edited ? ' (초안을 고쳐서 보냄)' : ''}` })
    })
    setBatchSt((s) => ({ ...s, sent: true }))
  }

  if (drafts.length === 0) {
    return (
      <Card className="text-center">
        <Check size={24} className="mx-auto text-emerald-600" />
        <p className="mt-2 text-[14px] font-bold">지금은 답할 메시지가 없어요</p>
        <p className="mt-1 text-[12px] text-neutral-500">새 메시지가 오면 다음 묶음 때 초안을 올려둘게요</p>
      </Card>
    )
  }

  if (st.sent) {
    return (
      <Card className="text-center">
        <Check size={26} className="mx-auto text-emerald-600" />
        <p className="mt-2 text-[15px] font-bold">{toSend.length}개를 보냈어요</p>
        <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">
          {editedCount > 0 && <>고친 {editedCount}건은 그 사람의 관계와 말투로 저장했어요.<br /></>}
          받은 메시지 원문은 지우고 요약만 남겼어요.
        </p>
        {leftCopy.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-left">
            <p className="text-[12px] font-medium text-amber-700">직접 보내야 하는 {leftCopy.length}건이 남았어요</p>
            {leftCopy.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-[12px]">
                <ChannelBadge ch={d.ch} />
                <span className="min-w-0 flex-1 truncate">{(app.getPerson(target(d)) ?? personById(d.personId)).name}님</span>
                <button onClick={() => { setBatchSt((s) => ({ ...s, copied: { ...s.copied, [d.id]: true } })); app.toast('초안을 복사했어요') }} className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium"><Copy size={11} />복사</button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-left text-[12px] text-neutral-600">
          <p><span className="font-semibold">{nextLabel} 묶음</span>에 올라갈 초안 {carried + app.queue.length}개</p>
          <p className="mt-0.5 text-[11px] text-neutral-400">결정하지 않은 {carried}개와 새로 만든 {app.queue.length}개</p>
        </div>
        <button onClick={app.loadNextBatch} className="mt-3 text-[12px] text-neutral-500 underline">{nextLabel} 묶음 미리 보기 (목업)</button>
      </Card>
    )
  }

  return (
    <Card className="!py-1">
      <div className="flex items-center gap-2 border-b border-[var(--color-border-soft)] py-3">
        <Clock size={15} className="text-neutral-500" />
        <span className="text-[13px] font-semibold">{st.label}</span>
        <span className="text-[12px] text-neutral-500">초안 {drafts.length}개</span>
        <button onClick={() => setShowSkipped((v) => !v)} className="ml-auto text-[11px] text-neutral-400 underline">답장 필요 없는 {NO_REPLY.length}개 제외</button>
      </div>
      {showSkipped && (
        <div className="space-y-1.5 border-b border-[var(--color-border-soft)] py-2.5">
          {NO_REPLY.map((x) => (
            <div key={x.name + x.ch} className="flex items-center gap-2 text-[12px] text-neutral-500">
              <ChannelBadge ch={x.ch} /><span className="font-medium text-neutral-700">{x.name}</span><span className="min-w-0 flex-1 truncate">{x.text}</span><span className="text-[11px] text-neutral-400">{x.why}</span>
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-[var(--color-border-soft)]">
        {drafts.map((d) => <DraftItem key={d.id} d={d} openPerson={openPerson} />)}
      </div>
      <div className="pb-3 pt-1">
        <PrimaryButton disabled={toSend.length === 0} onClick={send}>{toSend.length}개 보내기</PrimaryButton>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-neutral-400">
          각자 받은 채널로 내 이름으로 보내져요.
          {toCopy.length > 0 && ` 복사해서 직접 보낼 ${toCopy.length}개는 따로예요.`}
          {carried > 0 && ` 결정하지 않은 ${drafts.filter((d) => !decided(d)).length}개는 ${nextLabel} 묶음에 다시 나와요.`}
        </p>
      </div>
    </Card>
  )
}

function BriefingCard({ person, sample, onOpen, from }: { person: Person; sample?: boolean; onOpen?: () => void; from?: string }) {
  const app = useApp()
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 text-[12px] text-neutral-600">
        <CalendarClock size={14} /> 오후 3시 {person.name}님과 미팅 {sample ? <span className="ml-auto text-neutral-400">예시</span> : from && <span className="ml-auto text-neutral-400">{from}</span>}
      </div>
      <div className={`p-4 ${onOpen ? 'cursor-pointer active:bg-neutral-50' : ''}`} onClick={onOpen}>
        <div className="flex items-center gap-3">
          <Avatar name={person.name} img={person.img} />
          <div className="flex-1">
            <div className="text-[15px] font-bold">{person.name}</div>
            <div className="text-[12px] text-neutral-500">{person.title}</div>
          </div>
          {onOpen && <ChevronRight size={16} className="text-neutral-300" />}
        </div>
        <div className="mt-3 space-y-2 text-[13px] leading-relaxed">
          <p><span className="font-semibold">지난번에</span> {person.note ?? '처음 만나는 사람이에요'}</p>
          <p><span className="font-semibold">최근 인스타</span> 주말 하프 마라톤 완주 사진을 올렸어요</p>
          <p className="font-semibold">꺼내볼 이야기</p>
          <ul className="list-disc space-y-0.5 pl-4 text-neutral-600">
            <li>하프 마라톤 완주 축하</li>
            <li>둘째 입학 준비는 어떻게 되고 있는지</li>
          </ul>
          <p><span className="font-semibold">약속한 일</span> 물류 데모 자료 보내기</p>
        </div>
      </div>
      {!sample && (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border-soft)] px-4 py-3">
          <button onClick={() => app.openAction('memo', person.id)} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px]"><PenLine size={13} />만난 뒤 메모</button>
          <button onClick={() => app.openAction('record', person.id)} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px]"><Mic size={13} />녹음</button>
        </div>
      )}
    </Card>
  )
}

/**
 * 가입 직후 화면용. 사람을 알아보는 기준이 되는 연락처를 맨 위에 두고, 하나만 골라도 되게 한다.
 * 캘린더는 사람을 모으는 곳이 아니라 이미 모인 사람에게 만남을 붙이는 곳이라 맨 아래.
 */
function ConnectList() {
  const { conn, start } = useConnect()
  const order: Src[] = ['contacts', 'calls', 'ig', 'kakao', 'in', 'remember', 'gmail', 'tg', 'gcal']
  return (
    <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
      {order.map((s) => (
        <Row
          key={s}
          icon={<ChannelBadge ch={SRC[s].ch} />}
          label={s === 'kakao' ? '카톡 대화 보내기' : s === 'calls' ? '통화 녹음 가져오기' : `${SRC[s].label} 연결`}
          desc={SRC[s].desc}
          tag={s === 'contacts' || s === 'calls' ? 'new' : undefined}
          onClick={conn[s].status === 'on' ? undefined : () => start(s)}
          right={conn[s].status === 'on' ? <Check size={16} className="text-emerald-600" /> : undefined}
        />
      ))}
    </Card>
  )
}

function ConnStatus({ c, file }: { c: Conn; file?: boolean }) {
  if (c.status === 'broken') return <span className="text-rose-500">다시 연결이 필요해요</span>
  if (c.status === 'off') return <span>{file ? '아직 보내지 않음' : '연결 안 함'}</span>
  // 카톡은 계속 연결되는 게 아니라 보낸 대화까지만 반영된다
  if (file) return <span>{LEVEL[c.level].t}<span className="text-neutral-400">, 마지막으로 보낸 날 {c.last ?? '오늘'}</span></span>
  return <span>{LEVEL[c.level].t}{c.last && <span className="text-neutral-400">, 마지막 확인 {c.last}</span>}</span>
}

/** 마이페이지 > 연결. 곳마다 상태와 비서가 할 수 있는 일을 보여준다 */
function ConnectScreen({ onBack, onDetail }: { onBack: () => void; onDetail: (s: Src) => void }) {
  const { conn, start } = useConnect()
  const groups: { id: 'phone' | 'talk' | 'google' | 'card'; t: string }[] = [
    { id: 'card', t: '명함' },
    { id: 'phone', t: '휴대폰' },
    { id: 'talk', t: '대화' },
    { id: 'google', t: '메일과 일정' },
  ]
  return (
    <div className="pb-28">
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={onBack}><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <span className="text-[15px] font-black">연결</span>
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
                    desc={<ConnStatus c={c} file={SRC[s].how === 'share'} />}
                    onClick={() => (c.status === 'on' && SRC[s].how !== 'share' ? onDetail(s) : start(s))}
                    right={
                      SRC[s].how === 'share' ? <span className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">{c.status === 'on' ? '새로 보내기' : '보내기'}</span>
                        : c.status === 'on' ? undefined
                        : c.status === 'broken'
                          ? <span className="rounded-full bg-rose-500 px-3 py-1 text-[12px] font-semibold text-white">다시 연결</span>
                          : <span className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">{s === 'contacts' || s === 'calls' ? '허용' : '연결'}</span>
                    }
                  />
                )
              })}
            </Card>
          </div>
        ))}
        <div className="mt-6 space-y-1.5 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] leading-relaxed text-neutral-500">
          <p>로그인 정보는 내가 만든 암호화 키로 잠가서 보관해요. 펠로어도 열어볼 수 없어요.</p>
          <p>대화와 녹음은 정리한 뒤 지우고 요약만 남겨요.</p>
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
  const app = useApp()
  const [asking, setAsking] = useState(false)
  const c = conn[src]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><ChannelBadge ch={SRC[src].ch} />{SRC[src].label}</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-1 text-[12px] text-neutral-500">연결됨, 마지막 확인 {c.last ?? '방금'}</p>
      <p className="mb-2 mt-5 text-[13px] font-semibold">비서가 할 수 있는 일</p>
      <LevelPicker src={src} value={c.level} onChange={(l) => { update(src, { level: l }); app.toast(`할 수 있는 일을 바꿨어요: ${LEVEL[l].t}`) }} />
      {asking ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3">
          <p className="text-[13px] font-semibold text-rose-600">연결을 끊을까요?</p>
          <p className="mt-1 text-[12px] leading-relaxed text-rose-600/80">{SRC[src].label}에서 가져온 대화와 요약도 함께 지워요. 인물 카드와 내가 쓴 메모는 남아요.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setAsking(false)} className="rounded-full border border-neutral-200 bg-white py-2 text-[13px]">취소</button>
            <button onClick={() => { update(src, { status: 'off', last: undefined }); app.toast(`${SRC[src].label} 연결을 끊었어요`); onClose() }} className="rounded-full bg-rose-500 py-2 text-[13px] font-semibold text-white">끊기</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAsking(true)} className="mt-6 w-full text-center text-[13px] text-rose-500">연결 끊기</button>
      )}
    </Sheet>
  )
}

/**
 * 연결 흐름.
 * 인스타, 링크드인(에이전트 대행)은 피클 방식: 처음이면 암호화 키를 만들고, 로그인 정보를 넣고, 2단계 인증은 안내대로 승인한 뒤
 * 계정 제한 고지에 동의한다. 다시 연결할 때는 키 만들기와 동의를 건너뛴다.
 * 통화 녹음은 갤럭시는 녹음 파일 권한, 아이폰은 공유하기 안내. 구글은 구글 동의 화면에서 이 항목 권한만 받는다.
 */
function ConnectFlowSheet({ src, onClose }: { src: Src; onClose: () => void }) {
  const { conn, update, openSort } = useConnect()
  const app = useApp()
  const meta = SRC[src]
  // 열 때 끊겨 있었는지를 기억한다. 다시 연결을 마친 뒤에도 안내 문구가 바뀌지 않게
  const [reconnect] = useState(conn[src].status === 'broken')
  // 목업: 다른 곳을 이미 로그인 정보로 연결했다면 암호화 키가 있다
  const hasKey = reconnect || (['ig', 'in', 'remember'] as Src[]).some((s) => s !== src && conn[s].status !== 'off')
  const first = meta.how === 'google' ? 'google' : meta.how === 'device' ? 'device' : meta.how === 'web' && !hasKey ? 'key' : 'login'
  const [step, setStep] = useState<'device' | 'key' | 'login' | 'verify' | 'consent' | 'google' | 'done'>(first)
  const [agree, setAgree] = useState(false)
  const [level, setLevel] = useState<Level>(conn[src].level)
  const [phone, setPhone] = useState<'galaxy' | 'iphone'>('galaxy')
  const [key1, setKey1] = useState('')
  const [key2, setKey2] = useState('')
  const [uid, setUid] = useState(src === 'ig' ? 'minjun.k' : reconnect ? 'minjun@felore.io' : '')
  const [pw, setPw] = useState('')
  const [tgPhone, setTgPhone] = useState('')
  const [tgSent, setTgSent] = useState(false)
  const [code, setCode] = useState('')
  const otherGoogle = (['gmail', 'gcal'] as Src[]).find((s) => s !== src && conn[s].status === 'on')
  const keyOk = key1.length >= 6 && key1 === key2
  const input = 'w-full rounded-xl border border-neutral-200 px-3 py-3 text-[13px] outline-none focus:border-[#25313D]'

  const finish = () => {
    update(src, { status: 'on', level, last: '방금' })
    if (src === 'remember' && app.myProf.career.length === 0) app.setMyProf({ ...app.myProf, career: MY_PROF.career, edu: MY_PROF.edu })
    setStep('done')
  }
  const deny = () => { app.toast(`${meta.label} 없이도 쓸 수 있어요. 마이페이지 > 연결에서 언제든 허용해요`); onClose() }

  const doneText: Record<Src, string> = {
    contacts: '연락처의 이름과 번호로 카톡, 메일 상대가 누구인지 알아볼게요. 바뀐 연락처는 계속 맞춰요',
    calls: phone === 'galaxy' ? '새 통화 녹음이 생기면 가져올지 물어볼게요' : '통화 녹음을 공유하면 그 사람 카드에 요약을 붙여요',
    ig: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    in: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    tg: '대화 상대를 가져오고 있어요. 다 되면 내 사람들에 쌓여요',
    kakao: '',
    gmail: '주고받은 메일을 인물 카드에 이어 붙여요',
    gcal: '내일부터 아침마다 그날 만날 사람을 미리 정리해 드려요',
    remember: '받은 명함으로 연결된 사람들을 채우고, 내 프로필의 명함에 경력을 넣었어요',
  }

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><ChannelBadge ch={meta.ch} />{reconnect ? '다시 연결' : `${meta.label} 연결`}</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      {step === 'device' && src === 'contacts' && (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">연락처 이름과 번호가 있으면 카톡 대화방 이름, 메일 서명, 펠로어 회원 번호로 같은 사람을 정확하게 묶을 수 있어요.</p>
          <OsDialog title="‘펠로어’가 연락처에 접근하려고 해요" body={meta.note} onDeny={deny} onAllow={finish} />
          <p className="mt-4 text-center text-[11px] text-neutral-400">앱에서 열려요. 웹에서는 연락처 파일(vcf)을 올려요</p>
        </>
      )}

      {step === 'device' && src === 'calls' && (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">펠로어가 통화를 직접 녹음하지는 않아요. 휴대폰이 녹음한 통화 중 고른 것만 요약해서 그 사람 카드에 붙여요.</p>
          <div className="mt-4 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-[13px]">
            {([['galaxy', '갤럭시'], ['iphone', '아이폰']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPhone(k)} className={`rounded-full py-2 ${phone === k ? 'bg-white font-semibold shadow-sm' : 'text-neutral-500'}`}>{l}</button>
            ))}
          </div>
          {phone === 'galaxy' ? (
            <>
              <p className="mt-4 text-[12px] leading-relaxed text-neutral-500">전화 앱 설정에서 통화 자동 녹음을 켜 두면, 녹음 파일을 읽어 새 녹음이 생길 때마다 가져올지 물어봐요.</p>
              <OsDialog title="‘펠로어’에서 기기의 음악 및 오디오에 액세스하도록 허용하시겠습니까?" body="통화 녹음 파일을 찾는 데만 써요" onDeny={deny} onAllow={finish} />
            </>
          ) : (
            <>
              <p className="mt-4 text-[12px] leading-relaxed text-neutral-500">아이폰은 다른 앱이 통화 녹음을 가져갈 수 없어서, 녹음할 때마다 직접 보내 주셔야 해요.</p>
              <ShareSteps steps={['통화 중 왼쪽 위 녹음 버튼으로 녹음 (상대에게 안내가 나가요)', '메모 앱에 저장된 통화 녹음 열기', '공유 버튼 누르기', '펠로어 고르기']} />
              <div className="mt-5"><PrimaryButton onClick={finish}>알겠어요</PrimaryButton></div>
            </>
          )}
        </>
      )}

      {step === 'key' && (
        <>
          <div className="mt-4 flex items-center gap-2 text-[15px] font-bold"><KeyRound size={18} />먼저 암호화 키를 만들어요</div>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">로그인 정보는 이 키로 잠가서 보관해요. 키는 나만 알고, 펠로어도 열어볼 수 없어요. 한 번 만들면 다른 곳을 연결할 때도 써요.</p>
          <input type="password" value={key1} onChange={(e) => setKey1(e.target.value)} placeholder="암호화 키 (6자 이상)" className={`mt-4 ${input}`} />
          <input type="password" value={key2} onChange={(e) => setKey2(e.target.value)} placeholder="한 번 더 입력" className={`mt-2 ${input}`} />
          <p className={`mt-2 text-[11px] ${key2 && key1 !== key2 ? 'text-rose-500' : 'text-neutral-400'}`}>
            {key1 && key1.length < 6 ? '6자 이상으로 만들어 주세요' : key2 && key1 !== key2 ? '두 키가 서로 달라요' : '키를 잊으면 연결한 곳을 다시 로그인해야 해요'}
          </p>
          <div className="mt-5"><PrimaryButton disabled={!keyOk} onClick={() => setStep('login')}>키 만들기</PrimaryButton></div>
        </>
      )}

      {step === 'login' && meta.how === 'api' && (
        <>
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">텔레그램에 가입한 전화번호를 넣으면 텔레그램 앱으로 로그인 코드가 와요.</p>
          <input value={tgPhone} onChange={(e) => setTgPhone(e.target.value.replace(/[^0-9+\- ]/g, ''))} inputMode="tel" placeholder="전화번호 (예: 010-1234-5678)" className={`mt-4 ${input}`} />
          {tgSent ? (
            <>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" placeholder="로그인 코드 5자리" className={`mt-2 text-center tracking-[0.3em] placeholder:tracking-normal ${input}`} />
              <p className="mt-2 text-[11px] text-neutral-400">목업에서는 아무 숫자 5자리를 넣으면 돼요</p>
              <div className="mt-5"><PrimaryButton disabled={code.length < 5} onClick={finish}>연결하기</PrimaryButton></div>
            </>
          ) : (
            <div className="mt-5"><PrimaryButton disabled={tgPhone.replace(/\D/g, '').length < 9} onClick={() => { setTgSent(true); app.toast('텔레그램 앱으로 코드를 보냈어요') }}>코드 받기</PrimaryButton></div>
          )}
          <p className="mb-2 mt-5 text-[13px] font-semibold">비서가 할 수 있는 일</p>
          <LevelPicker src={src} value={level} onChange={setLevel} />
        </>
      )}

      {step === 'login' && meta.how === 'web' && (
        <>
          <p className="mt-4 text-[13px] text-neutral-600">{meta.label} 로그인 정보를 넣어 주세요. 펠로어 서버가 이 계정으로 로그인해서 대신 읽고 답해요.</p>
          <input value={uid} onChange={(e) => setUid(e.target.value)} placeholder={src === 'ig' ? '인스타그램 아이디' : `${meta.label} 이메일`} className={`mt-4 ${input}`} />
          {src === 'ig' && uid === 'minjun.k' && <p className="mt-1 text-[11px] text-emerald-700">마이페이지에서 확인한 계정이라 미리 채웠어요</p>}
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" className={`mt-2 ${input}`} />
          <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-500"><KeyRound size={12} />내 암호화 키로 잠가서 보관해요. 목업에서는 아무 값이나 넣으면 돼요</p>
          <div className="mt-5"><PrimaryButton disabled={!uid.trim() || !pw} onClick={() => setStep('verify')}>로그인</PrimaryButton></div>
        </>
      )}

      {step === 'verify' && (
        <>
          <p className="mt-4 text-[15px] font-bold">{meta.label}에서 로그인 확인을 요청했어요</p>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">휴대폰의 {meta.label} 앱이나 문자로 온 확인 요청을 승인하거나, 받은 코드를 넣어 주세요. 새 기기에서 로그인했다는 알림이 갈 수 있어요.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="인증 코드 6자리" className="mt-4 w-full rounded-xl border border-neutral-200 px-3 py-3 text-center text-[16px] tracking-[0.3em] outline-none placeholder:tracking-normal focus:border-[#25313D]" />
          <div className="mt-5"><PrimaryButton onClick={() => (reconnect ? finish() : setStep('consent'))}>{code ? '코드 확인' : '앱에서 승인했어요'}</PrimaryButton></div>
          <p className="mt-2 text-center text-[11px] text-neutral-400">말하기에서 연결을 요청해도 같은 순서로 채팅 안에서 안내해요</p>
        </>
      )}

      {step === 'consent' && (
        <>
          <p className="mt-4 text-[15px] font-bold">연결 전에 알아두세요</p>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-neutral-600">
            <li className="flex gap-2"><TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-500" />{meta.label}에서는 자동 이용을 막고 있어서, 드물게 계정이 잠시 제한될 수 있어요.</li>
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
          <p className="mt-3 text-[16px] font-bold">{reconnect ? '다시 연결됐어요' : src === 'calls' && phone === 'iphone' ? '준비됐어요' : '연결됐어요'}</p>
          <p className="mt-1 text-[13px] text-neutral-500">{reconnect ? '그 사이 온 메시지를 정리해서 다음 묶음에 올릴게요' : doneText[src]}</p>
          {app.onboarding ? (
            <div className="mt-5"><PrimaryButton onClick={onClose}>계속</PrimaryButton></div>
          ) : openSort && !reconnect && src !== 'gcal' && src !== 'calls' ? (
            <>
              <div className="mt-5"><PrimaryButton onClick={() => { onClose(); openSort() }}>사람 정리 시작</PrimaryButton></div>
              <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">다른 곳도 연결하기</button>
            </>
          ) : (
            <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
          )}
        </div>
      )}
    </Sheet>
  )
}

/** 휴대폰이 보여주는 권한 창 흉내 */
function OsDialog({ title, body, onDeny, onAllow }: { title: string; body?: string; onDeny: () => void; onAllow: () => void }) {
  return (
    <div className="mx-auto mt-4 max-w-[270px] overflow-hidden rounded-2xl bg-neutral-100 text-center">
      <p className="px-4 pt-4 text-[11px] text-neutral-400">휴대폰이 보여주는 창</p>
      <p className="px-4 pt-1 text-[14px] font-semibold">{title}</p>
      {body && <p className="px-4 pb-4 pt-1 text-[12px] text-neutral-500">{body}</p>}
      <div className="grid grid-cols-2 border-t border-neutral-200 text-[14px]">
        <button onClick={onDeny} className="py-3 text-neutral-500">허용 안 함</button>
        <button onClick={onAllow} className="border-l border-neutral-200 py-3 font-semibold text-blue-600">허용</button>
      </div>
    </div>
  )
}

/** 다른 앱에서 공유하기로 펠로어에 보내는 순서 */
function ShareSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-3 space-y-2">
      {steps.map((t, i) => (
        <li key={t} className="flex items-start gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-[13px]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25313D] text-[11px] font-semibold text-white">{i + 1}</span>
          {t}
        </li>
      ))}
    </ol>
  )
}

/** 분석하는 동안 확인 단계를 하나씩 체크해 보여준다 (망원동 이자카야 방식) */
function ProgressSteps({ steps, onDone }: { steps: string[]; onDone?: () => void }) {
  const [n, setN] = useState(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  useEffect(() => {
    if (n >= steps.length) {
      const t = setTimeout(() => doneRef.current?.(), 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setN(n + 1), 800)
    return () => clearTimeout(t)
  }, [n, steps.length])
  return (
    <ul className="space-y-2.5">
      {steps.map((t, i) => (
        <li key={t} className={`flex items-center gap-2.5 text-[14px] ${i < n ? 'text-[var(--color-text-strong)]' : i === n ? 'text-neutral-600' : 'text-neutral-300'}`}>
          {i < n ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={12} /></span>
          ) : i === n ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-[#25313D]" />
          ) : (
            <span className="h-5 w-5 rounded-full border-2 border-neutral-200" />
          )}
          {t}
        </li>
      ))}
    </ul>
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

/* ───────── 사람 정리 ─────────
 * 연결하면 사람이 아니라 계정이 먼저 모인다. 확실한 단서(같은 번호, 같은 메일, 회원 프로필에 적은 아이디)는
 * 자동으로 묶고, 애매한 것만 대화가 많은 순서로 몇 건 묻는다. 마지막에 내 사람과 가져온 사람으로 나눈다.
 */

const GATHER: Partial<Record<Src, { n: number; unit: string }>> = {
  contacts: { n: 486, unit: '연락처 486개' },
  ig: { n: 128, unit: 'DM과 댓글 상대 128명' },
  kakao: { n: 42, unit: '대화방 3개에서 42명' },
  in: { n: 97, unit: '1촌과 메시지 상대 97명' },
  gmail: { n: 210, unit: '메일 상대 210명' },
  tg: { n: 31, unit: '대화 상대 31명' },
}

const AUTO_MERGED: { name: string; member: boolean; chs: Channel[]; why: string }[] = [
  { name: '한서윤', member: true, chs: ['phone', 'kakao', 'in'], why: '연락처 번호가 펠로어 회원 인증 번호와 같아요' },
  { name: '도민혁', member: true, chs: ['phone', 'ig'], why: '본인 프로필에 적은 인스타 아이디와 같아요' },
  { name: '윤채린', member: false, chs: ['mail', 'phone'], why: '메일 서명의 번호가 연락처와 같아요' },
]

const ASK: MergeQ[] = [
  { a: { ch: 'kakao', h: '민혁' }, b: { ch: 'phone', h: '도민혁' }, why: '카톡 대화방 이름이 연락처의 이름과 비슷해요', talk: '대화 312개' },
  { a: { ch: 'kakao', h: '채린 디렉터님' }, b: { ch: 'mail', h: '윤채린' }, why: '대화방 이름에 같은 이름과 직함이 있어요', talk: '대화 48개' },
  { a: { ch: 'ig', h: '@yerin.pd' }, b: { ch: 'phone', h: '마예린 PD' }, why: '아이디와 연락처 이름이 비슷해요', talk: 'DM 21개' },
  { a: { ch: 'ig', h: '@sss_uuo' }, b: { ch: 'kakao', h: '서수오' }, why: '아이디 발음이 이름과 비슷하고 말투가 같아요', talk: 'DM 9개' },
  { a: { ch: 'in', h: 'junho-lee' }, b: { ch: 'phone', h: '이준호' }, why: '이름이 같아요. 다른 사람일 수도 있어요', talk: '대화 없음' },
]

function AccountFace({ x }: { x: { ch: Channel; h: string } }) {
  return (
    <div className="min-w-0">
      <div className="mx-auto w-fit"><Avatar name={x.h.replace('@', '')} size={48} member={false} /></div>
      <div className="mt-2 truncate text-[13px] font-semibold">{x.h}</div>
      <div className="mt-1"><ChannelBadge ch={x.ch} /></div>
    </div>
  )
}

/** 같은 사람인지 묻는 카드. 사람 정리, 내 사람들 후보, 인물 카드, 말하기 어디서 열든 이 모양 하나 */
function MergeAskCard({ q, onAnswer, done }: { q: MergeQ; onAnswer: (v: MergeAnswer) => void; done?: MergeAnswer }) {
  return (
    <Card>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <AccountFace x={q.a} />
        <GitMerge size={18} className="text-neutral-300" />
        <AccountFace x={q.b} />
      </div>
      <p className="mt-4 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">{q.why}</p>
      {q.talk && <p className="mt-1 text-[11px] text-neutral-400">{q.talk}</p>}
      {done ? (
        <p className="mt-3 text-center text-[12px] font-medium text-emerald-600">{done === 'same' ? '한 사람으로 합쳤어요' : done === 'diff' ? '다른 사람으로 둘게요' : '나중에 다시 물어볼게요'}</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => onAnswer('diff')} className="rounded-full border border-neutral-200 py-2.5 text-[13px]">다른 사람</button>
            <button onClick={() => onAnswer('same')} className="rounded-full bg-[#25313D] py-2.5 text-[13px] font-semibold text-white">같은 사람</button>
          </div>
          <button onClick={() => onAnswer('later')} className="mt-3 w-full text-center text-[12px] text-neutral-400">모르겠어요, 나중에</button>
        </>
      )}
    </Card>
  )
}

/** 사람 정리 밖에서 합치기 후보를 열 때 쓰는 시트 */
function MergeSheet({ cands, onClose, onAnswer }: { cands: MergeQ[]; onClose: () => void; onAnswer?: (q: MergeQ, a: MergeAnswer) => void }) {
  // 열 때의 후보를 그대로 들고 차례로 묻는다. 답할 때마다 바깥 목록이 줄어도 순서가 흔들리지 않게
  const [list] = useState(cands)
  const [i, setI] = useState(0)
  const q = list[i]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-[17px] font-bold">같은 사람일까요?<Tag kind="new" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      {q ? (
        <>
          {list.length > 1 && <p className="mt-1 text-[12px] text-neutral-400">{i + 1} / {list.length}</p>}
          <div className="mt-3"><MergeAskCard key={i} q={q} onAnswer={(a) => { onAnswer?.(q, a); setI(i + 1) }} /></div>
        </>
      ) : (
        <div className="py-4 text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[15px] font-bold">{list.length ? '다 확인했어요' : '합칠 후보가 없어요'}</p>
          <p className="mt-1 text-[13px] text-neutral-500">모르는 계정이 같은 사람이면 말하기로 알려주세요</p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      )}
    </Sheet>
  )
}

function SortFlow({ onBack, onDone }: { onBack: () => void; onDone: (later: MergeQ[]) => void }) {
  const { conn, start } = useConnect()
  const [step, setStep] = useState<'gather' | 'auto' | 'ask' | 'split'>('gather')
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<MergeAnswer[]>([])
  const [working, setWorking] = useState(false)
  const got = (Object.keys(GATHER) as Src[]).filter((s) => conn[s].status === 'on')
  const total = got.reduce((n, s) => n + GATHER[s]!.n, 0)
  const answer = (v: MergeAnswer) => {
    setAnswers((a) => [...a, v])
    if (i + 1 >= ASK.length) setStep('split')
    else setI(i + 1)
  }
  const laterQs = ASK.filter((_, j) => answers[j] === 'later')
  const order = ['gather', 'auto', 'ask', 'split'] as const
  const q = ASK[i]
  const back = () => {
    if (working) return
    if (step === 'gather') onBack()
    else if (step === 'ask' && i > 0) { setI(i - 1); setAnswers((a) => a.slice(0, -1)) }
    else setStep(order[order.indexOf(step) - 1])
  }

  return (
    <div className="pb-28">
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={back}><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <span className="text-[15px] font-black">사람 정리</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
      </div>
      <div className="px-5">
        <div className="mb-4 flex gap-1">
          {order.map((s, j) => (
            <span key={s} className={`h-1 flex-1 rounded-full ${j <= order.indexOf(step) ? 'bg-[#25313D]' : 'bg-neutral-200'}`} />
          ))}
        </div>

        {step === 'gather' && (
          <>
            <p className="text-[22px] font-bold leading-snug">계정 {total.toLocaleString()}개를<br />찾았어요</p>
            <p className="mt-2 text-[13px] text-neutral-500">한 사람이 여러 곳에 있을 수 있어서, 아직 사람이 아니라 계정이에요. 같은 사람끼리 묶어 볼게요.</p>
            <Card className="mt-4 !py-1 divide-y divide-[var(--color-border-soft)]">
              {got.map((s) => (
                <div key={s} className="flex items-center gap-2 py-3 text-[13px]">
                  <ChannelBadge ch={SRC[s].ch} /> {GATHER[s]!.unit}
                  <Check size={14} className="ml-auto text-emerald-600" />
                </div>
              ))}
              {got.length === 0 && <p className="py-3 text-[13px] text-neutral-400">아직 연결한 곳이 없어요</p>}
            </Card>
            {conn.contacts.status !== 'on' && (
              <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3">
                <p className="text-[12px] leading-relaxed text-amber-700">연락처를 허용하면 카톡 대화방 이름과 메일 서명의 번호로 더 많이 자동으로 묶을 수 있어요</p>
                <button onClick={() => start('contacts')} className="mt-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-amber-700">연락처 허용</button>
              </div>
            )}
            {working ? (
              <div className="mt-6"><ProgressSteps steps={['같은 번호와 메일 찾기', '회원 프로필에 적은 아이디 맞추기', '메일 서명의 번호 맞추기']} onDone={() => { setWorking(false); setStep('auto') }} /></div>
            ) : (
              <div className="mt-6"><PrimaryButton disabled={got.length === 0} onClick={() => setWorking(true)}>같은 사람 묶기</PrimaryButton></div>
            )}
          </>
        )}

        {step === 'auto' && (
          <>
            <p className="text-[22px] font-bold leading-snug">확실한 37명은<br />바로 묶었어요</p>
            <p className="mt-2 text-[13px] text-neutral-500">번호, 메일 주소, 펠로어 회원이 프로필에 적은 아이디가 같으면 같은 사람이에요.</p>
            <div className="mt-4 space-y-2">
              {AUTO_MERGED.map((m) => (
                <Card key={m.name}>
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size={36} member={m.member} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[14px] font-semibold">
                        {m.name}
                        {m.member && <span className="rounded bg-[#25313D]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#25313D]">펠로어 회원</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">{m.chs.map((c) => <ChannelBadge key={c} ch={c} />)}</div>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[12px] text-emerald-700"><Check size={12} />{m.why}</p>
                </Card>
              ))}
            </div>
            <p className="mt-2 text-center text-[12px] text-neutral-400">외 34명</p>
            <div className="mt-6"><PrimaryButton onClick={() => setStep('ask')}>애매한 것 확인하기 ({ASK.length}건)</PrimaryButton></div>
            <button onClick={() => { setAnswers(ASK.map(() => 'later')); setStep('split') }} className="mt-3 w-full text-center text-[13px] text-neutral-500">나중에 확인할게요</button>
          </>
        )}

        {step === 'ask' && (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-[18px] font-bold">같은 사람일까요?</p>
              <span className="text-[12px] text-neutral-400">{i + 1} / {ASK.length}</span>
            </div>
            <p className="mt-1 text-[12px] text-neutral-500">대화를 많이 나눈 사람부터 물어봐요. 나머지는 쓰면서 천천히 정리돼요.</p>
            <div className="mt-4"><MergeAskCard key={i} q={q} onAnswer={answer} /></div>
          </>
        )}

        {step === 'split' && (
          <>
            <p className="text-[22px] font-bold leading-snug">520명으로 정리했어요</p>
            <p className="mt-2 text-[13px] text-neutral-500">실제로 연락하는 사람만 내 사람에 두고, 나머지는 필요할 때 꺼내 쓰도록 따로 뒀어요.</p>
            <div className="mt-4 space-y-2">
              {[
                { t: '내 사람', n: 58, d: '서로 대화했거나 내가 기록을 남긴 사람', strong: true },
                { t: '가져온 사람', n: 449, d: '연락처에만 있거나 댓글, 단체방으로만 아는 사람. 대화가 생기면 내 사람에 추가돼요' },
                { t: '숨김', n: 13, d: '광고나 스팸으로 보이는 계정' },
              ].map((x) => (
                <Card key={x.t} className={x.strong ? 'border-[#25313D]' : ''}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] font-semibold">{x.t}</span>
                    <span className="text-[18px] font-bold">{x.n}명</span>
                  </div>
                  <p className="mt-1 text-[12px] text-neutral-500">{x.d}</p>
                </Card>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-neutral-500">
              펠로어 회원 11명은 본인이 쓴 프로필이 카드에 붙었어요.{laterQs.length > 0 && ` 나중에 볼 ${laterQs.length}건은 내 사람들 위에 남겨둘게요.`}
            </p>
            <div className="mt-6"><PrimaryButton onClick={() => onDone(laterQs)}>내 사람들 보기</PrimaryButton></div>
          </>
        )}
      </div>
    </div>
  )
}

/** 가입 직후, 가져오는 중 화면에서 정리로 들어가는 카드 */
function SortEntryCard() {
  const { conn, openSort } = useConnect()
  const got = (Object.keys(GATHER) as Src[]).filter((s) => conn[s].status === 'on')
  if (!openSort || got.length === 0) return null
  return (
    <Card className="mt-3 border-[#25313D]">
      <p className="text-[15px] font-bold">{got.length}곳에서 계정을 모았어요</p>
      <div className="mt-2 flex flex-wrap gap-1">{got.map((s) => <ChannelBadge key={s} ch={SRC[s].ch} />)}</div>
      <p className="mt-2 text-[12px] text-neutral-500">같은 사람끼리 묶고 내 사람을 골라 볼게요. 확인할 것은 {ASK.length}건이에요.</p>
      <button onClick={openSort} className="mt-3 w-full rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white">사람 정리 시작</button>
    </Card>
  )
}

/** 휴대폰이 녹음한 통화를 가져올지 묻는 카드. 고르면 요약하고 녹음은 지운다 */
function CallImportCard({ openPerson }: { openPerson: (p: Person) => void }) {
  const app = useApp()
  const p = app.getPerson('p2') ?? personById('p2')
  const state = app.callImport
  const finish = () => {
    app.setCallImport('done')
    app.addRec([p.id], { kind: 'call', when: '오늘 오후 4:12 통화 (12분)', text: '다음 주 화요일 판교에서 다시 만나기로 함. 물류 데모 자료를 먼저 보내기로 함' })
    app.addTodo({ personId: p.id, t: '물류 데모 자료 보내기', from: '통화 요약에서' })
  }
  if (state === 'skip') return null
  return (
    <Card className="mt-2">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size={36} member={p.member} img={p.img} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px]"><span className="font-semibold">{p.name}</span>님과 통화한 녹음이 있어요</div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400"><Phone size={11} />오늘 오후 4:12, 12분</div>
        </div>
      </div>
      {state === 'ask' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => { app.setCallImport('skip'); app.toast('이 녹음은 가져오지 않을게요') }} className="rounded-full border border-neutral-200 py-2 text-[13px]">괜찮아요</button>
          <button onClick={() => app.setCallImport('working')} className="rounded-full bg-[#25313D] py-2 text-[13px] font-semibold text-white">가져오기</button>
        </div>
      )}
      {state === 'working' && (
        <div className="mt-4">
          <ProgressSteps steps={['받아쓰기', '약속과 할 일 찾기', `${p.name}님 카드에 요약 붙이기`, '녹음 지우기']} onDone={finish} />
        </div>
      )}
      {state === 'done' && (
        <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-[12px] leading-relaxed text-neutral-600">
          <p>다음 주 화요일 판교에서 다시 만나기로 했어요. 물류 데모 자료를 먼저 보내기로 했어요.</p>
          <p className="mt-1 text-[11px] text-neutral-400">할 일에 &lsquo;물류 데모 자료 보내기&rsquo;를 넣었어요. 녹음은 지웠어요</p>
          <button onClick={() => openPerson(p)} className="mt-1.5 flex items-center gap-0.5 font-semibold text-[#25313D]">카드에서 보기<ChevronRight size={12} /></button>
        </div>
      )}
    </Card>
  )
}

/** 오래 안 보낸 카톡 방을 다시 보내자고 묻는 카드 */
function KakaoStaleCard({ onSkip }: { onSkip: () => void }) {
  const { start } = useConnect()
  return (
    <Card className="mt-2">
      <div className="flex items-center gap-3">
        <ChannelBadge ch="kakao" />
        <div className="min-w-0 flex-1 text-[13px]"><span className="font-semibold">한서윤</span>님 방, 마지막으로 보낸 지 2주 지났어요</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={onSkip} className="rounded-full border border-neutral-200 py-2 text-[13px]">나중에</button>
        <button onClick={() => start('kakao')} className="rounded-full bg-[#25313D] py-2 text-[13px] font-semibold text-white">새로 보내기</button>
      </div>
    </Card>
  )
}

/** 가입 직후 맨 위. 인스타로 내 프로필부터 채우게 한다 */
function InstaStartCard() {
  const { openInsta } = useConnect()
  return (
    <Card className="mt-4 !border-transparent !bg-[#25313D] text-white" onClick={openInsta}>
      <p className="text-[12px] opacity-70">1분이면 돼요</p>
      <p className="mt-1 text-[17px] font-bold leading-snug">인스타로 내 프로필부터 채워요</p>
      <p className="mt-1.5 text-[12px] leading-relaxed opacity-80">DM 코드로 내 계정만 확인하면, 피드에서 사진과 관심사를 골라 프로필과 페르소나 초안을 만들어 드려요.</p>
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0D0D0D]">시작하기<ChevronRight size={12} /></span>
    </Card>
  )
}

/* ───────── 온보딩 (가입 직후) ─────────
 * 망원동 이자카야 방식. 펠로어가 말을 걸고, 한 화면에 한 가지만 묻는다. 건너뛰면 목록 화면으로 간다.
 */

type ObStep = 'hello' | 'insta' | 'contacts' | 'calls' | 'talk' | 'end'
const OB_STEPS: ObStep[] = ['hello', 'insta', 'contacts', 'calls', 'talk', 'end']
/** 온보딩 맨 앞의 짧은 이야기. 한 장에 한 마디, 탭해서 넘긴다 */
const OB_STORY: string[][] = [
  ['연락은 카톡에, 인스타에,', '메일에 흩어져 있고'],
  ['누가 누구였는지,', '무슨 얘기를 나눴는지', '자꾸 잊어버리죠.'],
  ['펠로어가 사람 단위로 모으고,', '답장은 미리 써 둘게요.'],
]

function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const { conn, start, openInsta, instaDone, openSort, joinedViaLink } = useConnect()
  const app = useApp()
  const [i, setI] = useState(0)
  const [story, setStory] = useState(0)
  const [talkPick, setTalkPick] = useState<Src | null>(null)
  const step = OB_STEPS[i]
  const next = () => (i + 1 < OB_STEPS.length ? setI(i + 1) : onDone())
  const got = (Object.keys(GATHER) as Src[]).filter((s) => conn[s].status === 'on')

  const talkDone = (['ig', 'kakao', 'in', 'gmail', 'tg'] as Src[]).find((s) => conn[s].status === 'on')
  const done: Record<ObStep, boolean> = {
    hello: false,
    insta: instaDone,
    contacts: conn.contacts.status === 'on',
    calls: conn.calls.status === 'on',
    talk: !!talkDone,
    end: false,
  }

  const copy: Record<ObStep, { t: ReactNode; d: string; cta: string; act?: () => void; doneText?: string }> = {
    hello: {
      t: <>{app.me.name}님, 반가워요<br />펠로어예요</>,
      d: joinedViaLink
        ? `${JIMIN.name}님은 내 사람에 넣어 뒀고, 보너스 재화 5개도 드렸어요. 이제 흩어진 연락을 사람 단위로 모아 볼게요. 몇 가지만 같이 정해요.`
        : '흩어진 연락을 사람 단위로 모으고, 답장은 미리 써 둘게요. 몇 가지만 같이 정해요.',
      cta: '시작하기',
    },
    insta: { t: <>인스타로 내 프로필부터<br />채워 볼까요?</>, d: 'DM 코드로 내 계정인지만 확인하고, 피드에서 사진과 관심사를 골라 프로필과 페르소나 초안을 만들어요. 로그인은 필요 없어요.', cta: '인스타 아이디 넣기', act: openInsta, doneText: '내 프로필에 앨범과 페르소나 초안을 넣었어요' },
    contacts: { t: <>연락처를<br />읽어도 될까요?</>, d: '이름과 번호로 카톡, 메일, 펠로어 회원이 같은 사람인지 알아봐요. 바뀐 연락처는 계속 맞춰요.', cta: '연락처 허용', act: () => start('contacts'), doneText: '연락처를 읽고 있어요' },
    calls: { t: <>통화한 뒤에<br />요약을 남겨 드릴까요?</>, d: '펠로어가 통화를 녹음하지는 않아요. 휴대폰이 녹음한 통화 중 고른 것만 요약해서 그 사람 카드에 붙여요.', cta: '통화 녹음 가져오기', act: () => start('calls'), doneText: '새 통화 녹음이 생기면 물어볼게요' },
    talk: { t: <>연락이 오는 곳을<br />하나 골라 주세요</>, d: '하나만 연결해도 충분해요. 나머지는 마이페이지 > 연결에서 언제든 더할 수 있어요.', cta: '연결하기', act: () => talkPick && start(talkPick), doneText: `${talkDone ? SRC[talkDone].label : ''} 연결을 마쳤어요` },
    end: { t: got.length ? <>{got.length}곳에서<br />계정을 모았어요</> : <>준비됐어요</>, d: got.length ? '같은 사람끼리 묶고 내 사람을 골라 볼게요. 확인할 것은 몇 건 안 돼요.' : '연결은 나중에 해도 돼요. 오늘의 제안에서 하나씩 이어 갈 수 있어요.', cta: got.length && openSort ? '사람 정리 시작' : '오늘의 제안 보기', act: got.length && openSort ? openSort : undefined },
  }
  const c = copy[step]

  if (story < OB_STORY.length) {
    return (
      <button onClick={() => setStory(story + 1)} className="flex min-h-full w-full flex-col bg-[#161D25] px-7 pb-10 pt-5 text-left text-white">
        <span onClick={(e) => { e.stopPropagation(); setStory(OB_STORY.length) }} className="self-end text-[12px] opacity-50">건너뛰기</span>
        <span key={story} className="mt-auto block animate-[fadeIn_.5s_ease]">
          {OB_STORY[story].map((l) => <span key={l} className="block text-[24px] font-bold leading-[1.5]">{l}</span>)}
        </span>
        <span className="mt-10 flex items-center justify-between">
          <span className="flex gap-1">{OB_STORY.map((_, j) => <span key={j} className={`h-1 rounded-full ${j === story ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />)}</span>
          <span className="text-[12px] opacity-50">탭해서 계속</span>
        </span>
      </button>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-4">
      <div className="flex h-6 items-center gap-2">
        {i > 0 && <button onClick={() => setI(i - 1)} className="-ml-1.5" aria-label="이전"><ChevronLeft size={22} /></button>}
        <div className="flex gap-1">
          {OB_STEPS.map((s, j) => <span key={s} className={`h-1 rounded-full ${j === i ? 'w-6 bg-[#25313D]' : j < i ? 'w-1.5 bg-[#25313D]/40' : 'w-1.5 bg-neutral-200'}`} />)}
        </div>
        {step !== 'end' && <button onClick={onDone} className="ml-auto text-[12px] text-neutral-400">건너뛰기</button>}
      </div>

      <div className="mt-10 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25313D] text-white"><Sparkles size={18} /></span>
        <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3">
          <p className="text-[20px] font-bold leading-snug">{c.t}</p>
        </div>
      </div>
      <p className="mt-5 text-[14px] leading-relaxed text-neutral-600">{c.d}</p>

      {step === 'hello' && joinedViaLink && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] p-3">
          <Avatar name={JIMIN.name} size={40} img={JIMIN.img} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">{JIMIN.name}</div>
            <div className="text-[11px] text-neutral-500">내 사람에 추가됨</div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700"><Gift size={12} />재화 5개</span>
        </div>
      )}

      {step === 'insta' && !instaDone && (
        <div className="mt-6 grid grid-cols-3 gap-1.5 opacity-70">
          {FEED_TONES.slice(0, 6).map((bg) => <div key={bg} className="aspect-square rounded-lg" style={{ background: bg }} />)}
        </div>
      )}

      {step === 'talk' && !talkDone && (
        <div className="mt-6 space-y-2">
          {(['ig', 'kakao', 'in'] as Src[]).map((s) => (
            <button key={s} onClick={() => setTalkPick(s)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${talkPick === s ? 'border-[#25313D] bg-[#25313D]/5' : 'border-neutral-200'}`}>
              <ChannelBadge ch={SRC[s].ch} />
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">{SRC[s].label}</span>
                <span className="block text-[11px] text-neutral-500">{SRC[s].desc}</span>
              </span>
              {talkPick === s && <Check size={16} className="text-[#25313D]" />}
            </button>
          ))}
        </div>
      )}

      {done[step] && (
        <p className="mt-6 flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"><Check size={14} />{c.doneText}</p>
      )}

      <div className="mt-auto pt-8">
        {done[step] || !c.act ? (
          <PrimaryButton onClick={next}>{done[step] ? '다음' : c.cta}</PrimaryButton>
        ) : (
          <>
            <PrimaryButton disabled={step === 'talk' && !talkPick} onClick={c.act}>{c.cta}</PrimaryButton>
            <button onClick={next} className="mt-3 w-full text-center text-[13px] text-neutral-500">나중에</button>
          </>
        )}
      </div>
    </div>
  )
}

/** 내 약속 링크 (모이닷 참고). 상대가 비어 있는 시간을 골라 약속을 잡는다 */
const WEEK = ['월', '화', '수', '목', '금', '토', '일']
const meetSummary = (m: MeetSet) => `${m.days.join(', ')} ${m.from}:00~${m.to}:00, ${m.dur}분`

function MeetLinkSheet({ onClose }: { onClose: () => void }) {
  const { conn, start } = useConnect()
  const app = useApp()
  const m = app.meet
  const [view, setView] = useState<'main' | 'edit' | 'peer' | 'booked'>('main')
  const [draft, setDraft] = useState<MeetSet>(m)
  const [slot, setSlot] = useState<string | null>(null)
  const calOn = conn.gcal.status === 'on'
  const url = `felore.app/meet/${app.me.linkId}`
  const slots = Array.from({ length: Math.min(8, Math.max(0, Math.floor(((m.to - m.from) * 60) / m.dur))) }, (_, i) => {
    const t = m.from * 60 + i * m.dur
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
  }).filter((s) => !(calOn && s === `${m.from + 1}:00`))
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold">
          {view !== 'main' && <button onClick={() => setView('main')} className="-ml-1"><ChevronLeft size={20} /></button>}
          <Link2 size={18} />{view === 'edit' ? '시간 바꾸기' : view === 'main' ? '내 약속 링크' : '상대가 보는 화면'}<Tag kind="review" />
        </h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      {view === 'main' && (
        <>
          <p className="mt-2 text-[13px] text-neutral-500">링크를 보내면 상대가 비어 있는 시간을 골라 약속을 잡아요. 잡힌 약속은 오늘 만날 사람에 올라와요.</p>
          <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 break-all text-[13px] font-semibold">{url}</p>
              <button onClick={() => app.setMeet({ ...m, on: !m.on })} className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${m.on ? 'bg-[#25313D]' : 'bg-neutral-300'}`} aria-label="약속 링크 켜기">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${m.on ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-400">{m.on ? '켜짐. 링크를 받은 사람이 약속을 잡을 수 있어요' : '꺼짐. 복사하거나 공유하면 켜져요'}</p>
            <div className="mt-2 space-y-0.5 text-[12px] text-neutral-600">
              <p>{meetSummary(m)}</p>
              <p>직접 만나기 또는 화상</p>
              <p>{calOn ? '구글 캘린더의 일정과 겹치지 않게 보여줘요' : '캘린더를 연결하면 이미 있는 일정은 빼고 보여줘요'}</p>
            </div>
            {!calOn && <button onClick={() => start('gcal')} className="mt-2 text-[12px] font-medium text-[#25313D] underline">구글 캘린더 연결</button>}
          </div>
          <div className="mt-4">
            <PrimaryButton onClick={() => { app.setMeet({ ...m, on: true }); app.toast('약속 링크를 복사했어요') }}><span className="inline-flex items-center gap-1.5"><Copy size={14} />{m.on ? '링크 복사' : '켜고 복사'}</span></PrimaryButton>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button onClick={() => { app.setMeet({ ...m, on: true }); app.openShare({ title: '내 약속 링크 공유', url, text: '상대가 비어 있는 시간을 골라 약속을 잡아요' }) }} className="rounded-full border border-neutral-200 py-2.5 text-[13px]">공유</button>
            <button onClick={() => { setDraft(m); setView('edit') }} className="rounded-full border border-neutral-200 py-2.5 text-[13px]">시간 바꾸기</button>
            <button onClick={() => { setSlot(null); setView('peer') }} className="rounded-full border border-neutral-200 py-2.5 text-[13px]">미리 보기</button>
          </div>
          <p className="mt-3 text-center text-[11px] text-neutral-400">비회원에게 보내는 답장 초안에 프로필 링크 대신 붙일 수 있어요</p>
        </>
      )}

      {view === 'edit' && (
        <>
          <p className="mt-4 text-[13px] font-semibold">요일</p>
          <div className="mt-2 flex gap-1.5">
            {WEEK.map((d) => (
              <button key={d} onClick={() => setDraft((x) => ({ ...x, days: x.days.includes(d) ? x.days.filter((y) => y !== d) : WEEK.filter((y) => y === d || x.days.includes(y)) }))} className={`h-9 flex-1 rounded-full text-[13px] ${draft.days.includes(d) ? 'bg-[#25313D] font-semibold text-white' : 'bg-neutral-100 text-neutral-500'}`}>{d}</button>
            ))}
          </div>
          <p className="mt-5 text-[13px] font-semibold">시간</p>
          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <select value={draft.from} onChange={(e) => setDraft((x) => ({ ...x, from: +e.target.value, to: Math.max(x.to, +e.target.value + 1) }))} className="flex-1 rounded-xl border border-neutral-200 px-3 py-2.5 outline-none">
              {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => <option key={h} value={h}>{h}:00</option>)}
            </select>
            부터
            <select value={draft.to} onChange={(e) => setDraft((x) => ({ ...x, to: +e.target.value }))} className="flex-1 rounded-xl border border-neutral-200 px-3 py-2.5 outline-none">
              {Array.from({ length: 15 }, (_, i) => i + 8).filter((h) => h > draft.from).map((h) => <option key={h} value={h}>{h}:00</option>)}
            </select>
            까지
          </div>
          <p className="mt-5 text-[13px] font-semibold">한 번에</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[30, 60, 90].map((d) => (
              <button key={d} onClick={() => setDraft((x) => ({ ...x, dur: d }))} className={`rounded-full py-2 text-[13px] ${draft.dur === d ? 'bg-[#25313D] font-semibold text-white' : 'bg-neutral-100 text-neutral-500'}`}>{d}분</button>
            ))}
          </div>
          <div className="mt-6"><PrimaryButton disabled={draft.days.length === 0} onClick={() => { app.setMeet(draft); setView('main'); app.toast('약속 가능한 시간을 바꿨어요') }}>저장</PrimaryButton></div>
        </>
      )}

      {view === 'peer' && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={app.me.name} size={44} img={app.me.img} />
            <div>
              <p className="text-[15px] font-bold">{app.me.name}님과 약속 잡기</p>
              <p className="text-[12px] text-neutral-500">{m.dur}분, 직접 만나기 또는 화상</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] font-semibold">다음 주 {m.days[0] ?? '월'}요일</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {slots.map((s) => (
              <button key={s} onClick={() => setSlot(s)} className={`rounded-xl py-2 text-[13px] ${slot === s ? 'bg-[#25313D] font-semibold text-white' : 'border border-neutral-200'}`}>{s}</button>
            ))}
          </div>
          {calOn && <p className="mt-2 text-[11px] text-neutral-400">캘린더에 일정이 있는 시간은 빠져 있어요</p>}
          <div className="mt-5"><PrimaryButton disabled={!slot} onClick={() => setView('booked')}>이 시간으로 잡기</PrimaryButton></div>
          <p className="mt-2 text-center text-[11px] text-neutral-400">링크를 받은 사람에게 이렇게 보여요</p>
        </>
      )}

      {view === 'booked' && (
        <div className="py-4 text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">약속이 잡혔어요</p>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">다음 주 {m.days[0] ?? '월'}요일 {slot}, {m.dur}분.<br />그날 오늘 만날 사람에 올라오고, 만나기 전 브리핑을 준비해요.</p>
          <div className="mt-5"><PrimaryButton onClick={onClose}>확인</PrimaryButton></div>
        </div>
      )}
    </Sheet>
  )
}

/** 홈 맨 위에서 펠로어가 먼저 말을 건다. 누르면 말하기로 이어진다 (피클처럼 에이전트가 중심) */
function AgentHello() {
  const app = useApp()
  const drafts = app.batchSt.sent ? 0 : app.drafts.length
  const todo = app.todos.filter((t) => !t.done).length
  const line = drafts + todo === 0
    ? '지금은 급한 일이 없어요. 궁금한 사람이나 정리할 일이 있으면 말해 주세요.'
    : `${app.batchSt.label}이에요. ${drafts > 0 ? `답장 초안 ${drafts}개` : ''}${drafts > 0 && todo > 0 ? '와 ' : ''}${todo > 0 ? `할 일 ${todo}건` : ''}을 준비해 뒀어요.`
  return (
    <div className="mt-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25313D] text-white"><Sparkles size={16} /></span>
        <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-[14px] leading-relaxed">
          <span className="font-semibold">{app.me.name}님,</span> {line}
        </div>
      </div>
      <button onClick={() => app.openAction('chat')} className="mt-3 flex w-full items-center gap-2 rounded-full border border-neutral-200 py-2 pl-4 pr-2 text-left">
        <span className="flex-1 text-[13px] text-neutral-400">펠로어에게 말하기</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D0D0D] text-white"><ArrowUp size={15} /></span>
      </button>
      <div className="mt-2 scrollbar-hide flex gap-1.5 overflow-x-auto">
        {['이번 주에 챙길 사람', '지난번에 서윤님이랑 무슨 얘기 했지?', '리멤버 연결해 줘'].map((s) => (
          <button key={s} onClick={() => app.askAgent(s)} className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-[12px] text-neutral-600">{s}</button>
        ))}
      </div>
    </div>
  )
}

function TodayTab({ mode, openPerson, onboarding, onOnboardDone }: { mode: Mode; openPerson: (p: Person) => void; onboarding?: boolean; onOnboardDone?: () => void }) {
  const { conn, start, instaDone, join } = useConnect()
  const app = useApp()
  const [kakaoSkip, setKakaoSkip] = useState(false)
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
        <div className="mt-3"><BriefingCard person={personById('p2')} sample /></div>
        <div className="mt-6"><PrimaryButton onClick={() => join()}>펠로어 시작하기</PrimaryButton></div>
        <Link href="/landing" className="mt-3 block text-center text-[13px] text-neutral-500 underline">서비스 소개 더 보기</Link>
      </div>
    )
  }

  if (mode === 'new' && onboarding && onOnboardDone) return <OnboardingFlow onDone={onOnboardDone} />

  if (mode === 'new') {
    return (
      <div className="px-5 pb-28">
        {!instaDone && <InstaStartCard />}
        <p className="mt-6 text-[22px] font-bold leading-snug text-[var(--color-text-strong)]">내 사람들을<br />가져와 볼까요?</p>
        <p className="mt-2 text-[13px] text-neutral-500">연결한 곳의 계정을 같은 사람끼리 묶어 인물 카드로 만들어요. 하나만 먼저 연결해도 충분해요.</p>
        <SortEntryCard />
        <SectionTitle tag="new">연결</SectionTitle>
        <ConnectList />
        <SectionTitle>다른 방법</SectionTitle>
        <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
          <Row icon={<Send size={18} />} label="내 프로필 링크 보내기" desc="받은 사람이 가입하면 서로 내 사람에 추가돼요" tag="old" onClick={() => app.openShare({ title: '내 프로필 링크 보내기', url: `felore.io/${app.me.linkId}`, text: '받은 사람이 이 링크로 가입하면 서로 내 사람에 추가돼요' })} />
          <Row icon={<UserPlus size={18} />} label="직접 추가하기" desc="이름만으로도 인물 카드를 만들어요" onClick={() => app.openPanel({ k: 'add' })} />
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
            <div className="flex items-center gap-2"><ChannelBadge ch="phone" /> 연락처 486개 <Check size={14} className="ml-auto text-emerald-600" /></div>
            <div className="flex items-center gap-2"><ChannelBadge ch="ig" /> 128명 <Check size={14} className="ml-auto text-emerald-600" /></div>
            <div className="flex items-center gap-2"><ChannelBadge ch="kakao" /> 대화방 3개에서 42명 <Check size={14} className="ml-auto text-emerald-600" /></div>
            <div className="flex items-center gap-2"><ChannelBadge ch="in" /> 가져오는 중 <span className="ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100"><span className="block h-full w-2/3 animate-pulse bg-[#25313D]" /></span></div>
          </div>
        </Card>
        <SortEntryCard />
        <button onClick={() => app.openAction('chat')} className="mt-3 flex w-full items-center gap-1 text-left text-[12px] text-neutral-500">
          <MessageCircle size={13} className="shrink-0" />모르겠으면 말하기로 &ldquo;A랑 B는 같은 사람이야&rdquo;라고 알려주세요<ChevronRight size={12} className="shrink-0" />
        </button>
      </div>
    )
  }

  const showCall = conn.calls.status === 'on' && app.callImport !== 'skip'
  const showKakao = conn.kakao.status === 'on' && conn.kakao.last !== '오늘' && !kakaoSkip
  const hasMeet = conn.kakao.status === 'on' || conn.gcal.status === 'on'
  const meet = app.getPerson('p2') ?? personById('p2')
  const openTodos = app.todos.filter((t) => !t.done)
  const care = CARE.filter((c) => !app.careOff.includes(c.personId) && app.getPerson(c.personId))

  return (
    <div className="px-5 pb-28">
      <AgentHello />
      {broken.map((s) => <ReconnectCard key={s} src={s} />)}
      <button onClick={() => app.openPanel({ k: 'batch' })} className="mt-2 flex w-full items-center gap-2 text-left text-[12px] text-neutral-500">
        <Clock size={13} /> 다음 묶음 {app.batchSt.label.startsWith(app.batchTimes[0]) ? app.batchTimes[1] : `내일 ${app.batchTimes[0]}`}
        <span className="ml-auto flex items-center">하루 두 번 ({app.batchTimes[0]}, {app.batchTimes[1]})<ChevronRight size={12} /></span>
      </button>

      {(showCall || showKakao) && (
        <>
          <SectionTitle tag="new">가져올 기록</SectionTitle>
          {showCall && <CallImportCard openPerson={openPerson} />}
          {showKakao && <KakaoStaleCard onSkip={() => { setKakaoSkip(true); app.toast('다음에 다시 알려드릴게요') }} />}
        </>
      )}

      <SectionTitle tag="new">답장할 메시지</SectionTitle>
      <DraftBatch openPerson={openPerson} />

      <SectionTitle tag="new" right={<span className="text-[12px] text-neutral-400">{openTodos.length}건</span>}>할 일</SectionTitle>
      {app.todos.length === 0 ? (
        <Card className="text-[13px] text-neutral-400">아직 할 일이 없어요. 기록을 남기면 약속한 일을 찾아 드려요</Card>
      ) : (
        <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
          {[...openTodos, ...app.todos.filter((t) => t.done)].map((x) => {
            const p = app.getPerson(x.personId) ?? personById(x.personId)
            return (
              <div key={x.id} className={`flex items-center gap-3 py-3 ${x.done ? 'opacity-50' : ''}`}>
                <button onClick={() => openPerson(p)}><Avatar name={p.name} size={32} member={p.member} img={p.img} /></button>
                <div className="min-w-0 flex-1">
                  <div className={`text-[13px] ${x.done ? 'line-through' : ''}`}><span className="font-semibold">{p.name}</span>님 {x.t}</div>
                  <div className="text-[11px] text-neutral-400">{x.from}</div>
                </div>
                {x.done ? (
                  <button onClick={() => app.doneTodo(x.id, false)} className="shrink-0 text-[12px] text-neutral-400 underline">되돌리기</button>
                ) : (
                  <span className="flex shrink-0 gap-1.5">
                    {x.draft && <button onClick={() => app.openPanel({ k: 'compose', personId: p.id, title: '감사 인사', text: x.draft!, todoId: x.id })} className="rounded-full bg-[#25313D] px-3 py-1 text-[12px] font-medium text-white">초안 보기</button>}
                    <button onClick={() => { app.doneTodo(x.id, true); app.toast('할 일을 마쳤어요') }} className="rounded-full border border-neutral-200 px-3 py-1 text-[12px]">완료</button>
                  </span>
                )}
              </div>
            )
          })}
        </Card>
      )}

      <SectionTitle tag="new">오늘 만날 사람</SectionTitle>
      {/* 약속은 대화에서 먼저 찾는다. 캘린더는 있으면 더 정확해지는 보조 */}
      {hasMeet && <BriefingCard person={meet} onOpen={() => openPerson(meet)} from={conn.kakao.status === 'on' ? (conn.gcal.status === 'on' ? '카톡 대화와 캘린더' : '카톡 대화에서 찾은 약속') : '캘린더'} />}
      {conn.gcal.status !== 'on' && (
        <button onClick={() => start('gcal')} className="mt-2 flex w-full items-center gap-1.5 text-left text-[12px] text-neutral-500">
          <CalendarDays size={13} className="shrink-0" /> {hasMeet ? '캘린더도 연결하면 대화에 없는 약속까지 챙겨요' : '오늘 잡힌 약속을 찾지 못했어요. 캘린더를 연결하면 일정에서 찾아요'} <ChevronRight size={12} className="shrink-0" />
        </button>
      )}
      {hasMeet && <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-400"><Mic size={12} className="shrink-0" />앱에서는 약속 시간에 녹음을 켤지 알림으로 물어봐요. 늘 켜 두는 녹음은 하지 않아요</p>}

      <SectionTitle tag="new">챙길 사람</SectionTitle>
      {care.length === 0 ? (
        <Card className="text-[13px] text-neutral-400">지금은 챙길 사람이 없어요</Card>
      ) : (
        <div className="space-y-2">
          {care.map((c) => {
            const p = app.getPerson(c.personId)!
            return (
              <Card key={c.personId}>
                <div className="flex cursor-pointer items-center gap-3" onClick={() => openPerson(p)}>
                  <Avatar name={p.name} size={36} member={p.member} img={p.img} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{p.name}</div>
                    <div className="text-[12px] text-neutral-500">{c.why}</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-neutral-300" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => { app.skipCare(c.personId); app.toast(`${p.name}님은 한동안 보여드리지 않을게요`) }} className="rounded-full border border-neutral-200 py-2 text-[12px]">넘기기</button>
                  <button onClick={() => app.openPanel({ k: 'compose', personId: p.id, title: '안부 인사', text: c.draft })} className="rounded-full bg-[#25313D] py-2 text-[12px] font-semibold text-white">안부 초안 만들기</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ───────── 내 사람들 ───────── */

function PersonRow({ p, onClick, onAdd, added }: { p: Person; onClick?: () => void; onAdd?: () => void; added?: boolean }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 py-2.5 ${onClick ? 'cursor-pointer' : ''}`}>
      <Avatar name={p.name} member={p.member} img={p.img} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold">{p.name}</div>
        <div className="truncate text-[12px] text-neutral-500">{p.title}{p.origin === 'felore' && !onAdd && <span className="text-[#25313D]">{p.title ? ', ' : ''}펠로어에서 저장</span>}</div>
        {!onAdd && p.accounts.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {p.accounts.map((a) => <ChannelBadge key={a.ch + a.handle} ch={a.ch} />)}
          </div>
        )}
      </div>
      {onAdd
        ? added
          ? <span className="shrink-0 text-[12px] font-medium text-emerald-600">추가했어요</span>
          : <button onClick={(e) => { e.stopPropagation(); onAdd() }} className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-[12px]">내 사람에 추가</button>
        : onClick && <ChevronRight size={16} className="shrink-0 text-neutral-300" />}
    </div>
  )
}

type Found = Person & { kind: '펠로어 회원' | '공개 인물' }

/** 목업: 어떤 검색어든 펠로어 회원 둘과 공개 인물 하나가 나온다. 이지민은 실제 프로필 화면으로 이어진다 */
function findOnFelore(q: string): Found[] {
  const list: Found[] = [
    { id: `x1-${q}`, name: `${q}수`, title: '제품 디자이너, 스튜디오 하루', member: true, met: '', tags: [], accounts: [], origin: 'felore', self: ['스튜디오 하루 제품 디자이너', '사이드 프로젝트 모임 운영'], kind: '펠로어 회원' },
    { id: `x3-${q}`, name: `${q}민`, title: '마케터, 브릿지랩', member: true, met: '', tags: [], accounts: [], origin: 'felore', self: ['브릿지랩 마케터', '러닝과 전시를 좋아해요'], kind: '펠로어 회원' },
    { id: `x2-${q}`, name: `${q}영`, title: '공개 정보로 만든 프로필', member: false, met: '', tags: [], accounts: [], facts: [{ t: '공개된 인터뷰 기사에서 확인한 직함', src: '공개 정보' }], kind: '공개 인물' },
  ]
  if (JIMIN.name.includes(q)) list.unshift({ ...JIMIN, kind: '펠로어 회원' })
  return list
}

/** 검색 결과에서 내 사람에 추가. 상대에게 알림이 가지 않는다. 비회원은 가입으로 이어진다 */
function useAddFound() {
  const app = useApp()
  const { join } = useConnect()
  return (o: Found) => {
    if (app.mode === 'guest') { join(); return }
    const { kind, ...p } = o
    app.addPerson({ ...p, origin: kind === '펠로어 회원' ? 'felore' : undefined })
    app.toast(`${p.name}님을 내 사람에 추가했어요. 상대에게 알림은 가지 않아요`)
  }
}

/**
 * 헤더 돋보기. 펠로어 회원과 공개 인물을 찾는다. 추가해도 나만 보는 내 사람에 들어갈 뿐이라
 * 상대에게 알림이 가지 않고, 다른 사람이 내 목록을 볼 수도 없다.
 */
function FeloreSearch({ mode, onBack, openPerson }: { mode: Mode; onBack: () => void; openPerson: (p: Person) => void }) {
  const app = useApp()
  const add = useAddFound()
  const [query, setQuery] = useState('')
  const q = query.trim()
  const mine = q && mode !== 'guest' ? app.people.filter((p) => p.name.includes(q) || p.title.includes(q)) : []
  const others = q ? findOnFelore(q).filter((o) => !mine.some((m) => m.id === o.id)) : []
  const recent = (mode === 'guest' ? [JIMIN, personById('p4')] : ['p6', 'p4'].map((id) => app.getPerson(id)).filter((x): x is Person => !!x))
  const open = (p: Person) => (mode === 'guest' ? app.openProfile(p) : openPerson(p))
  return (
    <div className="pb-28">
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={onBack}><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
          <Search size={16} className="text-neutral-400" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름, 회사, 아이디로 펠로어에서 찾기" className="flex-1 bg-transparent text-[13px] outline-none" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-neutral-400" /></button>}
        </div>
      </div>
      <div className="px-5">
        {!q ? (
          <>
            <SectionTitle tag="old">최근 본 프로필</SectionTitle>
            {recent.length === 0 ? (
              <p className="py-3 text-[13px] text-neutral-400">아직 본 프로필이 없어요</p>
            ) : (
              <div className="divide-y divide-[var(--color-border-soft)]">
                {recent.map((p) => <PersonRow key={p.id} p={p} onClick={() => open(p)} />)}
              </div>
            )}
            <p className="mt-6 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] leading-relaxed text-neutral-500">추가한 사람은 나만 보는 내 사람에 들어가요. 상대에게 알림이 가지 않아요.</p>
          </>
        ) : (
          <>
            {mine.length > 0 && (
              <>
                <SectionTitle>이미 내 사람</SectionTitle>
                {mine.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
              </>
            )}
            {(['펠로어 회원', '공개 인물'] as const).map((k) => (
              <div key={k}>
                <SectionTitle tag="old">{k}</SectionTitle>
                {others.filter((o) => o.kind === k).map((o) => (
                  <PersonRow key={o.id} p={o} onAdd={() => add(o)} added={!!app.people.find((x) => x.id === o.id)} onClick={() => (app.people.find((x) => x.id === o.id) ? openPerson(o) : app.openProfile(o))} />
                ))}
              </div>
            ))}
            <p className="mt-4 text-center text-[11px] text-neutral-400">{mode === 'guest' ? '추가하려면 가입이 필요해요' : '추가해도 상대에게 알림이 가지 않아요'}</p>
          </>
        )}
      </div>
    </div>
  )
}

function SearchResults({ query, mode, openPerson }: { query: string; mode: Mode; openPerson: (p: Person) => void }) {
  const app = useApp()
  const add = useAddFound()
  const q = query.trim()
  const mine = mode !== 'guest' ? app.people.filter((p) => p.name.includes(q) || p.title.includes(q)) : []
  const imported = mode !== 'guest' ? app.imported.filter((p) => p.name.includes(q)) : []
  const others = findOnFelore(q).filter((o) => !mine.some((m) => m.id === o.id))
  return (
    <>
      {mine.length > 0 && (
        <>
          <SectionTitle>내 사람</SectionTitle>
          {mine.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
        </>
      )}
      {imported.length > 0 && (
        <>
          <SectionTitle>가져온 사람</SectionTitle>
          {imported.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
        </>
      )}
      {(['펠로어 회원', '공개 인물'] as const).map((k) => (
        <div key={k}>
          <SectionTitle tag="old">{k}</SectionTitle>
          {others.filter((o) => o.kind === k).map((o) => <PersonRow key={o.id} p={o} onAdd={() => add(o)} added={!!app.people.find((x) => x.id === o.id)} />)}
        </div>
      ))}
    </>
  )
}

/**
 * 가져온 사람은 정리할 목록이 아니라 필요할 때 꺼내 쓰는 보관함. 줄마다 버튼을 달지 않고,
 * 눌러서 들어간 인물 카드에서 추가하거나 숨긴다. 대화가 생기면 알아서 내 사람에 추가된다.
 */
function ImportedList({ openPerson }: { openPerson: (p: Person) => void }) {
  const app = useApp()
  const list = app.imported
  return (
    <>
      <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">연결한 곳에서 가져온 사람을 모아둔 곳이에요. 하나씩 정리하지 않아도 돼요. 대화가 생기면 알아서 내 사람에 추가되고, 필요할 때 검색해서 꺼내 쓰면 돼요.</p>
      <div className="mt-2 divide-y divide-[var(--color-border-soft)]">
        {list.map((p) => (
          <button key={p.id} onClick={() => openPerson(p)} className="flex w-full items-center gap-3 py-3 text-left">
            <Avatar name={p.name} size={36} member={p.member} img={p.img} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[14px] font-semibold">{p.name}{p.accounts[0] && <ChannelBadge ch={p.accounts[0].ch} />}</div>
              <div className="text-[12px] text-neutral-500">{p.why}</div>
            </div>
            <ChevronRight size={16} className="text-neutral-300" />
          </button>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-[13px] text-neutral-400">가져온 사람이 없어요</p>}
      </div>
      <button onClick={() => app.openPanel({ k: 'hidden' })} className="mt-3 w-full text-center text-[12px] text-neutral-400 underline">광고로 보이거나 내가 숨긴 계정 {12 + app.hidden.length}개</button>
    </>
  )
}

/** 사람 추가: 프로필 링크 붙여넣기 또는 이름만으로 */
function AddPersonSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const [way, setWay] = useState<'link' | 'name'>('link')
  const [value, setValue] = useState('')
  const [made, setMade] = useState<Person | null>(null)
  const fromLink = way === 'link'
  const make = () => {
    const v = value.trim()
    const handle = '@' + (v.replace(/\/+$/, '').split('/').pop() ?? v).replace('@', '')
    const p: Person = fromLink
      ? { id: `n${Date.now()}`, name: handle, title: '', member: false, met: '', tags: [], accounts: [{ ch: v.includes('linkedin') ? 'in' : 'ig', handle }], facts: [{ t: '공개된 소개글에서 가져온 직함', src: v.includes('linkedin') ? '링크드인 소개' : '인스타 소개글' }] }
      : { id: `n${Date.now()}`, name: v, title: '', member: false, met: '', tags: [], accounts: [], facts: [] }
    app.addPerson(p)
    setMade(p)
  }
  return (
    <Sheet onClose={onClose}>
      {made ? (
        <div className="text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">{made.name}님 카드를 만들었어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            {fromLink ? '내 사람에 추가했어요. 공개된 소개글과 직함은 출처와 함께 넣어뒀어요' : '내 사람에 추가했어요. 메모나 녹음을 남기면 카드가 채워져요'}
          </p>
          <div className="mt-5"><PrimaryButton onClick={() => { onClose(); app.openPerson(made) }}>카드 보기</PrimaryButton></div>
          <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">닫기</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">내 사람에 추가<Tag kind="new" /></h3>
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && value.trim()) make() }}
            placeholder={fromLink ? '인스타나 링크드인 프로필 주소 붙여넣기' : '이름'}
            className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-3 text-[13px] outline-none focus:border-[#25313D]"
          />
          {fromLink && !value && <button onClick={() => setValue('instagram.com/haeun.studio')} className="mt-2 text-[12px] text-neutral-500 underline">예시 주소 넣기 (목업)</button>}
          <p className="mt-2 text-[12px] text-neutral-500">
            {fromLink ? '인스타나 링크드인 앱에서 공유를 누르고 펠로어를 골라도 돼요' : '이름만 있어도 돼요. 나머지는 기록하면서 채워져요'}
          </p>
          <div className="mt-5"><PrimaryButton disabled={!value.trim()} onClick={make}>만들기</PrimaryButton></div>
        </>
      )}
    </Sheet>
  )
}

function PeopleTab({ mode, openPerson, fromLink }: { mode: Mode; openPerson: (p: Person) => void; fromLink: boolean }) {
  const app = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('전체')
  const [view, setView] = useState<'mine' | 'imported'>('mine')
  const [merging, setMerging] = useState(false)
  const { joinedViaLink, join } = useConnect()

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

  if (query.trim()) {
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
                <Avatar name={JIMIN.name} size={48} img={JIMIN.img} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold">{JIMIN.name}</div>
                  <div className="text-[12px] text-neutral-500">방금 프로필을 봤어요</div>
                </div>
                <button onClick={() => app.openProfile(JIMIN)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-[12px]">프로필 보기</button>
              </div>
              <p className="mt-3 text-[13px] text-neutral-600">가입하면 {JIMIN.name}님이 내 사람에 추가돼요.</p>
            </Card>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[12px] text-amber-700"><Gift size={14} className="shrink-0" />링크를 받고 24시간 안에 가입하면 보너스 재화 5개를 드려요</div>
            <div className="mt-4"><PrimaryButton onClick={() => join(true)}>가입하고 내 사람에 추가</PrimaryButton></div>
          </>
        ) : (
          <>
            <p className="mt-6 text-[13px] text-neutral-500">가입하면 이렇게 내 사람들이 정리돼요</p>
            <Card className="mt-2 !py-1 divide-y divide-[var(--color-border-soft)]">
              {[personById('p1'), personById('p2'), personById('p3')].map((p) => <PersonRow key={p.id} p={p} />)}
            </Card>
            <p className="mt-2 text-center text-[11px] text-neutral-400">예시 인물이에요</p>
            <div className="mt-4"><PrimaryButton onClick={() => join()}>펠로어 시작하기</PrimaryButton></div>
          </>
        )}
      </div>
    )
  }

  const addButton = (
    <button onClick={() => app.openPanel({ k: 'add' })} className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[12px]">
      <UserPlus size={13} /> 추가
    </button>
  )

  if (mode === 'new') {
    return (
      <div className="px-5 pb-28">
        {search}
        {app.people.length > 0 ? (
          <>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold">{joinedViaLink && app.people.length === 1 ? '프로필 링크로 추가한 사람' : `내 사람 ${app.people.length}명`}</span>
              {addButton}
            </div>
            <Card className="mt-2 !py-1 divide-y divide-[var(--color-border-soft)]">
              {app.people.map((p) => <PersonRow key={p.id} p={p} onClick={() => openPerson(p)} />)}
            </Card>
            <p className="mt-6 text-[15px] font-bold">다른 사람들도 가져와 볼까요?</p>
            <p className="mt-1 text-[13px] text-neutral-500">계정을 연결하면 대화 상대가 여기에 쌓여요</p>
          </>
        ) : (
          <div className="pt-14 text-center">
            <Users size={40} className="mx-auto text-neutral-300" />
            <p className="mt-4 text-[16px] font-bold">아직 내 사람이 없어요</p>
            <p className="mt-1 text-[13px] text-neutral-500">계정을 연결하면 대화 상대가 여기에 쌓여요</p>
            <div className="mt-3 flex justify-center">{addButton}</div>
          </div>
        )}
        <SortEntryCard />
        <div className="mt-4"><ConnectList /></div>
      </div>
    )
  }

  const tagSet = Array.from(new Set(app.people.flatMap((p) => p.tags)))
  const filters = ['전체', ...tagSet, '최근 연락']
  const list = filter === '전체' ? app.people
    : filter === '최근 연락' ? [...app.people].sort((a, b) => (app.recs[b.id]?.length ?? 0) - (app.recs[a.id]?.length ?? 0))
    : app.people.filter((p) => p.tags.includes(filter))
  const mineN = (mode === 'importing' ? 37 : 58) + app.people.length - PEOPLE.length
  const importedN = (mode === 'importing' ? 483 : 449) + app.imported.length - IMPORTED.filter((x) => !x.spam).length

  const segment = (
    <div className="mt-3 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-[13px]">
      {([['mine', '내 사람', mineN], ['imported', '가져온 사람', importedN]] as const).map(([id, label, n]) => (
        <button key={id} onClick={() => setView(id)} className={`rounded-full py-1.5 ${view === id ? 'bg-white font-semibold shadow-sm' : 'text-neutral-500'}`}>
          {label} <span className="text-[11px] text-neutral-400">{n}</span>
        </button>
      ))}
    </div>
  )

  if (view === 'imported') {
    return (
      <div className="px-5 pb-28">
        {search}
        {segment}
        <ImportedList openPerson={openPerson} />
      </div>
    )
  }

  return (
    <div className="px-5 pb-28">
      {search}
      {segment}
      {mode === 'importing' ? (
        <div className="mt-3 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] text-neutral-600">확실한 37명만 먼저 묶었어요. 사람 정리를 마치면 나머지도 나눠요</div>
      ) : app.cands.length > 0 && (
        <button onClick={() => setMerging(true)} className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-[#25313D]/5 px-4 py-3 text-left text-[12px]">
          <GitMerge size={14} className="text-[#25313D]" />
          <span>같은 사람일 수 있는 계정 <b>{app.cands.length}건</b></span>
          <ChevronRight size={14} className="ml-auto text-neutral-400" />
        </button>
      )}
      {mode === 'importing' && <SortEntryCard />}
      <div className="mt-3 scrollbar-hide flex gap-1.5 overflow-x-auto">
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
        {list.length === 0 && <p className="py-8 text-center text-[13px] text-neutral-400">이 태그가 붙은 사람이 없어요</p>}
      </div>
      {merging && <MergeSheet cands={app.cands} onAnswer={app.answerCand} onClose={() => setMerging(false)} />}
    </div>
  )
}

const REC_ICON: Record<Rec['kind'], ReactNode> = {
  memo: <PenLine size={12} />,
  record: <Mic size={12} />,
  call: <Phone size={12} />,
  kakao: <FileText size={12} />,
  reply: <Send size={12} />,
}

function PersonDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const app = useApp()
  const { conn } = useConnect()
  const mine = app.getPerson(id)
  const imported = app.imported.find((x) => x.id === id)
  const p = mine ?? imported
  const [toneDraft, setToneDraft] = useState<string | null>(null)
  const [invited, setInvited] = useState(false)
  const [editingFact, setEditingFact] = useState<number | null>(null)
  const [merging, setMerging] = useState(false)
  const [menu, setMenu] = useState(false)
  const [tagInput, setTagInput] = useState<string | null>(null)

  if (!p) {
    return (
      <div className="px-5 pt-20 text-center">
        <p className="text-[14px] text-neutral-500">숨긴 사람이에요</p>
        <button onClick={onBack} className="mt-3 text-[13px] underline">돌아가기</button>
      </div>
    )
  }

  const joined = app.joinedIds.includes(p.id)
  const member = p.member || joined
  const facts = p.facts ?? []
  const pending = p.pending ?? []
  const recs = app.recs[p.id] ?? []
  const given = p.name.length > 2 && !p.name.startsWith('@') ? p.name.slice(1) : p.name
  const casual = (p.tone ?? '').includes('반말')
  const upd = (patch: Partial<Person>) => app.updatePerson(p.id, patch)

  const confirm = (f: Fact, ok: boolean) => {
    upd({ pending: pending.filter((x) => x !== f), facts: ok ? [...facts, f] : facts })
    app.toast(ok ? '카드에 붙였어요' : '붙이지 않았어요')
  }
  const editFact = (i: number, t: string) => upd({ facts: facts.map((f, j) => (j === i ? { t, src: '내가 고침' } : f)) })
  const saveTone = () => { if (toneDraft !== null) { upd({ tone: toneDraft.trim() }); setToneDraft(null) } }
  const addTag = () => { const t = (tagInput ?? '').trim(); if (t && !p.tags.includes(t)) upd({ tags: [...p.tags, t] }); setTagInput(null) }
  const myCands = app.cands.filter((q) => [q.a.h, q.b.h].some((h) => h.includes(p.name) || (given.length > 1 && h.includes(given))))

  return (
    <div className="pb-28">
      <div className="relative flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={onBack}><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <span className="text-[15px] font-black">인물 카드</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
        <button onClick={() => setMenu((v) => !v)} aria-label="더 보기"><MoreHorizontal size={20} /></button>
        {menu && (
          <div className="absolute right-3 top-11 z-20 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white text-[13px] shadow-lg">
            <button onClick={() => { setMenu(false); setMerging(true) }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left"><GitMerge size={14} />다른 계정 합치기</button>
            <button onClick={() => { app.hide(p.id); app.toast(`${p.name}님을 숨겼어요`); onBack() }} className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2.5 text-left text-rose-500"><EyeOff size={14} />{mine ? '내 사람에서 빼고 숨기기' : '숨기기'}</button>
          </div>
        )}
      </div>
      <div className="px-5">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} size={64} member={member} img={p.img} />
          <div className="min-w-0">
            <div className="text-[20px] font-bold">{p.name}</div>
            <div className="text-[13px] text-neutral-500">{p.title || facts[0]?.t}</div>
            {member ? (
              <button onClick={() => app.openProfile(p)} className="mt-1 inline-flex items-center text-[12px] font-medium text-[#25313D]">프로필 보기 <ChevronRight size={12} /></button>
            ) : <span className="mt-1 inline-block text-[12px] text-neutral-400">펠로어 회원 아님</span>}
          </div>
        </div>

        {mine && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button onClick={() => app.openAction('memo', p.id)} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px]"><PenLine size={13} />메모</button>
            <button onClick={() => app.openAction('record', p.id)} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px]"><Mic size={13} />녹음</button>
            <button onClick={() => app.openPanel({ k: 'compose', personId: p.id, title: '안부 인사', text: casual ? `${given}, 잘 지내? 조만간 얼굴 한번 보자!` : `${p.name}님, 잘 지내시죠? 조만간 한번 뵙고 싶어요.` })} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-[12px]"><Send size={13} />안부 초안</button>
          </div>
        )}

        {joined && !p.member && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[12px] leading-relaxed text-emerald-700">
            {p.name}님이 펠로어에 가입했어요. 본인이 쓴 프로필이 카드에 붙었어요. 내 메모와 알게 된 정보는 그대로 나만 봐요.
          </div>
        )}

        {p.origin === 'felore' && <p className="mt-3 text-[12px] text-neutral-500">펠로어에서 프로필을 보고 저장한 사람이에요</p>}

        {imported && (
          <Card className="mt-4 bg-neutral-50">
            <p className="text-[13px] font-semibold">가져온 사람이에요</p>
            <p className="mt-1 text-[12px] text-neutral-500">{imported.why}. 대화가 생기면 알아서 내 사람에 추가돼요.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => { app.hide(p.id); app.toast('숨겼어요. 다시 연락이 오면 알려드려요'); onBack() }} className="rounded-full border border-neutral-200 bg-white py-2 text-[12px]">숨기기</button>
              <button onClick={() => { app.promote(p.id); app.toast(`${p.name}님을 내 사람에 추가했어요`) }} className="rounded-full bg-[#25313D] py-2 text-[12px] font-semibold text-white">내 사람에 추가</button>
            </div>
          </Card>
        )}

        <SectionTitle tag="new" right={<span className="text-[11px] text-neutral-400">{p.accounts.length}곳</span>}>모인 곳</SectionTitle>
        <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
          {p.accounts.length === 0 && <p className="py-2.5 text-[12px] text-neutral-400">아직 이어진 계정이 없어요. 연결한 곳에서 같은 사람이 보이면 물어볼게요</p>}
          {p.accounts.map((a) => (
            <div key={a.ch + a.handle} className="py-2.5">
              <ChannelBadge ch={a.ch} handle={a.handle} />
              {a.why && <p className="mt-1 text-[11px] text-neutral-400">{a.why}</p>}
            </div>
          ))}
          <button onClick={() => setMerging(true)} className="flex w-full items-center gap-1 py-2.5 text-[12px] text-neutral-500"><Plus size={12} /> 다른 계정 합치기{myCands.length > 0 && <span className="ml-1 rounded-full bg-[#25313D] px-1.5 text-[10px] text-white">{myCands.length}</span>}</button>
        </Card>

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
                        <input autoFocus value={f.t} onChange={(e) => editFact(i, e.target.value)} onBlur={() => setEditingFact(null)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) setEditingFact(null) }} className="min-w-0 flex-1 text-[13px] outline-none" />
                      ) : (
                        <button onClick={() => setEditingFact(i)} className="min-w-0 flex-1 text-left text-[13px]">{f.t}</button>
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
          {toneDraft !== null ? (
            <input autoFocus value={toneDraft} onChange={(e) => setToneDraft(e.target.value)} onBlur={saveTone} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveTone() }} className="w-full text-[13px] outline-none" placeholder="예: 반말, 대학 동기" />
          ) : (
            <button onClick={() => setToneDraft(p.tone ?? '')} className="flex w-full items-center gap-2 text-left text-[13px]">
              <span className="flex-1">{p.tone || <span className="text-neutral-400">아직 몰라요. 답장을 고치면 배워요</span>}</span>
              <PenLine size={13} className="shrink-0 text-neutral-300" />
            </button>
          )}
          {p.learned && <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-700">{p.learned}</p>}
          <p className="mt-2 text-[11px] text-neutral-400">답장 초안을 고친 내용과 말하기로 알려준 내용이 쌓여요</p>
        </Card>

        {mine && (
          <>
            <SectionTitle>태그</SectionTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-[12px]">{t}<button onClick={() => upd({ tags: p.tags.filter((x) => x !== t) })} aria-label={`${t} 태그 지우기`}><X size={11} className="text-neutral-400" /></button></span>
              ))}
              {tagInput !== null ? (
                <input autoFocus value={tagInput} onChange={(e) => setTagInput(e.target.value)} onBlur={addTag} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addTag() }} placeholder="태그" className="w-20 rounded-full border border-[#25313D] px-3 py-1 text-[12px] outline-none" />
              ) : (
                <button onClick={() => setTagInput('')} className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-3 py-1 text-[12px] text-neutral-500"><Plus size={11} />태그</button>
              )}
            </div>
          </>
        )}

        <SectionTitle tag="new">만남과 대화</SectionTitle>
        {recs.length === 0 && !p.met ? (
          <Card className="text-[13px] text-neutral-400">아직 기록이 없어요. 메모나 녹음을 남기면 여기에 요약이 쌓여요</Card>
        ) : (
          <div className="space-y-3 border-l-2 border-neutral-100 pl-4">
            {recs.map((r) => (
              <div key={r.id}>
                <div className="flex items-center gap-1 text-[12px] text-neutral-400">{REC_ICON[r.kind]} {r.when}</div>
                <p className="mt-0.5 text-[13px]">{r.text}</p>
              </div>
            ))}
            {p.met && (
              <div>
                <div className="flex items-center gap-1 text-[12px] text-neutral-400"><CalendarClock size={12} /> {p.met}</div>
                {p.note && <p className="mt-0.5 text-[13px]">{p.note}</p>}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-[11px] text-neutral-400">요약만 남기고 대화 원문과 녹음은 지워요</p>
        {conn.gmail.status !== 'on' && app.mode === 'active' && (
          <div className="mt-3">
            <ConnectSuggest src="gmail" icon={<Mail size={18} />} text={`지메일을 연결하면 ${p.name}님과 주고받은 메일도 여기 모아요`} />
          </div>
        )}

        {member && (
          <>
            <SectionTitle tag="old">케미</SectionTitle>
            <Card onClick={() => app.openPanel({ k: 'kemi', p })}><div className="flex items-center gap-2 text-[13px]"><Sparkles size={15} /> 나와의 케미 리포트 <ChevronRight size={14} className="ml-auto text-neutral-300" /></div></Card>
          </>
        )}

        <SectionTitle tag="old">연락처</SectionTitle>
        <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
          {p.accounts.filter((a) => a.ch === 'phone' || a.ch === 'mail').map((a) => (
            <div key={a.handle} className="flex items-center gap-2 py-2.5 text-[13px]">
              {a.ch === 'phone' ? <Phone size={14} className="text-neutral-400" /> : <Mail size={14} className="text-neutral-400" />}
              <span className="flex-1">{a.handle}</span>
              <button onClick={() => app.toast('복사했어요')} className="text-[12px] text-neutral-500"><Copy size={13} /></button>
            </div>
          ))}
          <p className="py-2.5 text-[12px] text-neutral-500">{member ? '공개 프로필에 등록된 연락처는 본인이 최신으로 유지해요' : '메일 서명에서 가져온 것과 직접 입력한 전화번호, 이메일이 여기 모여요'}</p>
        </Card>

        {!member && (
          <Card className="mt-6 bg-neutral-50">
            <p className="text-[13px] font-semibold">{p.name}님은 아직 펠로어 회원이 아니에요</p>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">가입하면 이 카드에 {p.name}님이 직접 쓴 프로필이 붙고, 연락처도 본인이 최신으로 유지해요. 케미 리포트도 볼 수 있어요.</p>
            <button
              onClick={() => { setInvited(true); app.openShare({ title: `${p.name}님에게 내 프로필 링크 보내기`, url: `felore.io/${app.me.linkId}`, text: '상대가 이 링크로 가입하면 카드에 본인이 쓴 프로필이 붙어요. 다음 답장 초안에도 링크를 붙여 둘게요' }) }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white"
            >
              <Send size={14} />{invited ? '링크 다시 보내기' : '내 프로필 링크 보내기'}
            </button>
            <button onClick={() => { app.markJoined(p.id); app.toast(`${p.name}님이 가입한 모습이에요`) }} className="mt-2 w-full text-center text-[11px] text-neutral-400 underline">가입한 뒤 모습 보기 (목업)</button>
          </Card>
        )}
      </div>
      {merging && <MergeSheet cands={myCands} onAnswer={app.answerCand} onClose={() => setMerging(false)} />}
    </div>
  )
}

/* ───────── 마이페이지 ───────── */

function MeTab({ mode }: { mode: Mode }) {
  const { conn, openHub, openInsta, instaDone, openMeetLink, join } = useConnect()
  const app = useApp()
  if (mode === 'guest') {
    return (
      <div className="px-5 pb-28 pt-10 text-center">
        <User size={40} className="mx-auto text-neutral-300" />
        <p className="mt-4 text-[16px] font-bold">가입하면 내 프로필이 생겨요</p>
        <p className="mt-1 text-[13px] text-neutral-500">링크 하나로 나를 소개하고, 만난 사람은 펠로어가 정리해요</p>
        <div className="mx-auto mt-6 max-w-[260px]"><PrimaryButton onClick={() => join()}>로그인 / 회원가입</PrimaryButton></div>
        <div className="mt-8 text-left">
          <Row icon={<Settings size={18} />} label="언어" desc="한국어" href="/settings?from=v2" tag="old" />
        </div>
      </div>
    )
  }
  const me = app.me
  const prof = app.myProf
  const srcs = Object.keys(conn) as Src[]
  const onList = srcs.filter((s) => conn[s].status === 'on')
  const brokenCount = srcs.filter((s) => conn[s].status === 'broken').length
  return (
    <div className="px-5 pb-28">
      {/* 내 프로필: 한 장짜리 소개 카드의 축소판 */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-[var(--color-border-soft)]">
        <button onClick={() => app.openProfile('me')} className="flex w-full items-center gap-4 p-4 text-left">
          <Avatar name={me.name} size={64} img={me.img} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[18px] font-black">{me.name} <BadgeCheck size={16} className="text-[#25313D]" /></div>
            <div className="truncate text-[12px] text-neutral-500">{me.title}</div>
            <div className="mt-1 truncate text-[13px]">{prof.line}</div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-neutral-300" />
        </button>
        {instaDone ? (
          <div className="border-t border-[var(--color-border-soft)] px-4 py-3">
            {prof.word && <p className="text-[14px] font-bold">&ldquo;{prof.word}&rdquo;</p>}
            <div className="mt-2 flex flex-wrap gap-1">{prof.keywords.map((k) => <span key={k} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px]">{k}</span>)}</div>
          </div>
        ) : (
          <button onClick={openInsta} className="flex w-full items-center gap-2 border-t border-[var(--color-border-soft)] px-4 py-3 text-left text-[13px]">
            <ChannelBadge ch="ig" /><span className="flex-1">인스타를 보여주면 프로필을 채워 드려요</span><ChevronRight size={14} className="text-neutral-300" />
          </button>
        )}
        <div className="grid grid-cols-3 gap-2 border-t border-[var(--color-border-soft)] p-3">
          <button onClick={() => app.openPanel({ k: 'editProf' })} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2.5 text-[12px]"><PenLine size={13} />편집</button>
          <button onClick={() => app.openShare({ title: '내 프로필 링크 공유', url: `felore.io/${me.linkId}`, text: '받은 사람이 이 링크로 가입하면 서로 내 사람에 추가돼요' })} className="flex items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-2.5 text-[12px] font-semibold text-white"><Send size={13} />링크 공유</button>
          <button onClick={() => app.openPanel({ k: 'qr' })} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2.5 text-[12px]"><QrCode size={13} />QR</button>
        </div>
      </div>

      <SectionTitle>내 프로필</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row icon={<Eye size={18} />} label="공개범위" desc="구역마다 공개 또는 나만 보기" onClick={() => app.openPanel({ k: 'vis' })} />
        <Row icon={<ShieldCheck size={18} />} label="인증" desc="본인인증, 경력, 학력" onClick={() => app.openPanel({ k: 'verify' })} />
        <Row icon={<BarChart3 size={18} />} label="내 프로필 본 사람" desc="최근 7일 14명" onClick={() => app.openPanel({ k: 'viewers' })} />
      </Card>

      <SectionTitle tag="new">펠로어에게 맡긴 일</SectionTitle>
      <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
        <Row
          icon={<MessageCircle size={18} />}
          label="연결"
          desc={
            onList.length || brokenCount
              ? <>{srcs.length}곳 중 {onList.length}곳 연결됨{brokenCount > 0 && <span className="text-rose-500">, {brokenCount}곳 다시 연결 필요</span>}</>
              : '연락처, 인스타, 카톡, 리멤버, 메일 등'
          }
          onClick={openHub}
        />
        <Row icon={<Clock size={18} />} label="묶음 처리 시간" desc={`${app.batchTimes[0]}, ${app.batchTimes[1]}`} tag="review" onClick={() => app.openPanel({ k: 'batch' })} />
        <Row icon={<Link2 size={18} />} label="내 약속 링크" desc={`${app.meet.on ? '켜짐' : '꺼짐'}. ${meetSummary(app.meet)}`} tag="review" onClick={openMeetLink} />
      </Card>

      <SectionTitle>재화</SectionTitle>
      <Card className="!py-1">
        <Row icon={<Coins size={18} />} label="내 재화" desc={`${app.coins}개`} tag="review" onClick={() => app.openPanel({ k: 'coin' })} />
      </Card>
      <button onClick={app.logout} className="mt-5 w-full text-center text-[12px] text-neutral-400 underline">로그아웃</button>
    </div>
  )
}

/* ───────── 플로팅 버튼 메뉴 ───────── */

function FabMenu({ onPick, onClose }: { onPick: (a: FabAction) => void; onClose: () => void }) {
  const items: { a: FabAction; icon: ReactNode; t: string; d: string }[] = [
    { a: 'chat', icon: <MessageCircle size={18} />, t: '말하기', d: '합치기, 관계 고치기, 궁금한 것 묻기' },
    { a: 'memo', icon: <PenLine size={18} />, t: '메모', d: '누구와 있었는지 고르고 적기' },
    { a: 'record', icon: <Mic size={18} />, t: '녹음', d: '대화를 녹음하면 요약과 할 일이 생겨요' },
    { a: 'upload', icon: <Upload size={18} />, t: '올리기', d: '카톡 대화, 아이폰 통화 녹음, 대화 캡처' },
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 sm:px-4" onClick={onClose}>
      <div className="max-h-[86dvh] w-full max-w-[430px] overflow-y-auto rounded-t-2xl border-x border-t border-[var(--color-border-soft)] bg-white px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-3" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-neutral-200" />
        {children}
      </div>
    </div>
  )
}

function LoginNotice({ onClose }: { onClose: () => void }) {
  const { join } = useConnect()
  return (
    <Sheet onClose={onClose}>
      <div className="text-center">
        <Lock size={26} className="mx-auto text-neutral-400" />
        <p className="mt-3 text-[16px] font-bold">가입하면 쓸 수 있어요</p>
        <p className="mt-1 text-[13px] text-neutral-500">기록과 대화는 내 계정에 나만 볼 수 있게 저장돼요</p>
        <div className="mt-5"><PrimaryButton onClick={() => { onClose(); join() }}>로그인 / 회원가입</PrimaryButton></div>
        <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">둘러보기</button>
      </div>
    </Sheet>
  )
}

/**
 * 메모와 녹음은 "누구와"를 먼저 고른다. 끝나면 고른 사람들의 인물 카드에 요약과 할 일이 붙고,
 * 후속 연락 초안은 다음 묶음 때 오늘의 제안에 올라온다.
 * 고르는 대상은 네 갈래: 내 사람(펠로어에서 저장한 사람 포함), 가져온 사람과 펠로어 회원(고르면 내 사람에 추가),
 * 처음 보는 사람(이름만으로 새 카드).
 */
type PickKind = 'mine' | 'imported' | 'member' | 'new'
type Pick = { key: string; name: string; kind: PickKind; member: boolean }

const PICK_NOTE: Record<Exclude<PickKind, 'mine'>, { chip: string; after: (n: string) => string }> = {
  imported: { chip: '가져온 사람', after: (n) => `${n}님을 내 사람에 추가해요` },
  member: { chip: '펠로어 회원', after: (n) => `${n}님을 내 사람에 추가하고, 본인이 쓴 프로필이 카드에 붙어요` },
  new: { chip: '새 사람', after: (n) => `${n}님은 새 인물 카드를 만들어요. 나중에 연결한 곳에서 같은 사람이 보이면 합칠지 물어볼게요` },
}

function RecordSheet({ kind, onClose, presetId }: { kind: 'memo' | 'record'; onClose: () => void; presetId?: string }) {
  const { conn } = useConnect()
  const app = useApp()
  // 지금 약속(오늘 오후 3시 도민혁)이 있으면 그 상대를 미리 골라둔다. 인물 카드에서 열면 그 사람을 골라둔다
  const hasMeet = app.mode === 'active' && (conn.kakao.status === 'on' || conn.gcal.status === 'on')
  const meet = hasMeet ? app.getPerson('p2') : undefined
  const preset = presetId ? app.getPerson(presetId) : meet
  const [picked, setPicked] = useState<Pick[]>(preset ? [{ key: preset.id, name: preset.name, kind: 'mine', member: preset.member }] : [])
  const [query, setQuery] = useState('')
  const [text, setText] = useState('')
  const [sec, setSec] = useState(0)
  const [step, setStep] = useState<'pick' | 'memo' | 'recording' | 'working' | 'done'>('pick')

  useEffect(() => {
    if (step !== 'recording') return
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [step])
  const clock = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  const q = query.trim()
  const mine = q ? app.people.filter((p) => p.name.includes(q)) : app.people.slice(0, 4)
  const imported = q ? app.imported.filter((p) => p.name.includes(q)) : []
  // 목업: 검색어로 시작하는 회원 한 명이 있다고 가정
  const memberHit: Pick | null = q && !mine.some((p) => p.name === q) ? { key: `m-${q}`, name: `${q}수`, kind: 'member', member: true } : null
  const exact = [...app.people, ...app.imported].some((p) => p.name === q) || picked.some((x) => x.name === q)

  const pickedNames = picked.map((x) => x.name)
  const hasPick = picked.length > 0
  const isPicked = (key: string) => picked.some((x) => x.key === key)
  const toggle = (x: Pick) => setPicked((prev) => (prev.some((y) => y.key === x.key) ? prev.filter((y) => y.key !== x.key) : [...prev, x]))
  const notes = picked.filter((x) => x.kind !== 'mine').map((x) => PICK_NOTE[x.kind as Exclude<PickKind, 'mine'>].after(x.name))
  const summary = kind === 'memo' ? (text.trim() || '만나서 이야기 나눔') : '다음 주에 자료를 주고받기로 함. 연말 전에 한 번 더 만나기로 함'

  const save = () => {
    const ids = picked.map((x) => x.key)
    picked.forEach((x) => {
      if (x.kind === 'imported') app.promote(x.key)
      if (x.kind === 'member') app.addPerson({ id: x.key, name: x.name, title: '제품 디자이너', member: true, origin: 'felore', met: '', tags: [], accounts: [], self: ['스튜디오 하루 제품 디자이너'] })
      if (x.kind === 'new') app.addPerson({ id: x.key, name: x.name, title: '', member: false, met: '', tags: [], accounts: [], facts: [] })
    })
    app.addRec(ids, { kind, when: kind === 'memo' ? '방금 남긴 메모' : `방금 녹음 요약 (${clock})`, text: summary })
    const first = picked[0]
    const fp = app.getPerson(first.key)
    app.queueDraft({ ch: fp ? talkChannel(fp) : 'kakao', personId: first.key, kind: '감사 인사', original: '', origin: '만난 뒤 감사 인사', context: kind === 'memo' ? '방금 남긴 메모' : '방금 녹음한 대화', text: `${first.name}님, 오늘 시간 내주셔서 감사합니다. 나눈 이야기 정리해서 곧 다시 연락드릴게요.` })
    if (kind === 'record') app.addTodo({ personId: first.key, t: '약속한 자료 보내기', from: '녹음 요약에서' })
    setStep('done')
  }

  const option = (x: Pick, sub: ReactNode, img?: string) => (
    <button key={x.key} onClick={() => { toggle(x); if (x.kind !== 'mine') setQuery('') }} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left">
      <Avatar name={x.name} size={32} member={x.member} img={img} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{x.name}</div>
        <div className="truncate text-[11px] text-neutral-500">{sub}</div>
      </div>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isPicked(x.key) ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300'}`}>
        {isPicked(x.key) && <Check size={12} />}
      </span>
    </button>
  )

  return (
    <Sheet onClose={onClose}>
      {step === 'pick' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">누구와 이야기하나요?<Tag kind="new" /></h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <div className="mt-1"><PrivateBadge /></div>

          {meet && !presetId && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px] text-neutral-600">
              <CalendarClock size={14} /> {conn.gcal.status === 'on' ? '지금 일정' : '카톡에서 잡은 약속'}: 오후 3시 {meet.name}님과 미팅
            </div>
          )}

          {hasPick && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {picked.map((x) => (
                <span key={x.key} className="inline-flex items-center gap-1 rounded-full bg-[#25313D] px-3 py-1 text-[12px] text-white">
                  {x.name}
                  {x.kind !== 'mine' && <span className="opacity-60">{PICK_NOTE[x.kind].chip}</span>}
                  <button onClick={() => toggle(x)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
            <Search size={16} className="text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름으로 찾기. 없는 사람은 새로 만들어요" className="flex-1 bg-transparent text-[13px] outline-none" />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-neutral-400" /></button>}
          </div>

          <div className="mt-2">
            {mine.length > 0 && (
              <>
                <p className="px-1 pt-2 text-[11px] font-semibold text-neutral-400">내 사람</p>
                {mine.map((p) => option({ key: p.id, name: p.name, kind: 'mine', member: p.member }, p.origin === 'felore' ? `${p.title}, 펠로어에서 저장` : p.title || p.met, p.img))}
              </>
            )}
            {!q && app.people.length === 0 && <p className="px-1 py-3 text-[12px] text-neutral-400">아직 내 사람이 없어요. 이름을 입력해 새 사람으로 만들어요</p>}
            {imported.length > 0 && (
              <>
                <p className="px-1 pt-3 text-[11px] font-semibold text-neutral-400">가져온 사람</p>
                {imported.map((p) => option({ key: p.id, name: p.name, kind: 'imported', member: p.member }, `${p.why}. 고르면 내 사람에 추가해요`))}
              </>
            )}
            {memberHit && (
              <>
                <p className="px-1 pt-3 text-[11px] font-semibold text-neutral-400">펠로어 회원</p>
                {option(memberHit, '제품 디자이너. 고르면 내 사람에 추가해요')}
              </>
            )}
            {q && !exact && (
              <>
                <p className="px-1 pt-3 text-[11px] font-semibold text-neutral-400">처음 보는 사람</p>
                <button onClick={() => { toggle({ key: `n-${q}`, name: q, kind: 'new', member: false }); setQuery('') }} className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-[13px]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-neutral-300"><UserPlus size={14} /></span>
                  &lsquo;{q}&rsquo; 새 사람으로 만들기
                </button>
              </>
            )}
          </div>

          {notes.length > 0 ? (
            <div className="mt-3 space-y-1 rounded-xl bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-600">
              {notes.map((n) => <p key={n}>{n}</p>)}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-neutral-400">여러 명과 함께 있으면 모두 골라요. 기록이 각자의 인물 카드에 붙어요.</p>
          )}
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
          <div className="flex items-center gap-1">
            <button onClick={() => setStep('pick')} className="-ml-1"><ChevronLeft size={20} /></button>
            <h3 className="text-[17px] font-bold">{pickedNames.join(', ')}님과의 메모</h3>
          </div>
          <div className="mt-1"><PrivateBadge /></div>
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} className="mt-4 h-32 w-full rounded-2xl border border-neutral-200 p-3 text-[13px] outline-none focus:border-[#25313D]" placeholder="아무렇게나 적어도 AI가 정리하고 할 일을 뽑아요" />
          {!text && <button onClick={() => setText('성수 카페에서 만남. 내년 상반기 협업 얘기 나눔. 다음 주에 소개 자료 보내주기로 함')} className="mt-1 text-[12px] text-neutral-500 underline">예시 메모 넣기 (목업)</button>}
          <div className="mt-4"><PrimaryButton disabled={!text.trim()} onClick={() => setStep('working')}>저장</PrimaryButton></div>
        </>
      )}

      {step === 'recording' && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[13px] text-rose-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> 녹음 중 {clock}
          </div>
          <div className="mt-4 flex justify-center -space-x-2">
            {picked.map((x) => <div key={x.key} className="rounded-full ring-2 ring-white"><Avatar name={x.name} size={44} member={x.member} img={app.getPerson(x.key)?.img} /></div>)}
          </div>
          <p className="mt-2 text-[15px] font-bold">{pickedNames.join(', ')}님과 대화 중</p>
          <div className="mx-auto mt-4 flex h-12 max-w-[240px] items-end justify-center gap-1">
            {[6, 14, 22, 10, 30, 18, 8, 26, 12, 20, 9, 16].map((h, i) => (
              <span key={i} className="w-1.5 animate-pulse rounded-full bg-neutral-300" style={{ height: h, animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-amber-50 px-3 py-2 text-left text-[11px] leading-relaxed text-amber-700">
            대화에 참여한 사람만 녹음할 수 있어요. 상대에게 녹음 사실을 알려주세요.
          </div>
          <button onClick={() => setStep('working')} className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white" aria-label="녹음 끝내기">
            <Square size={22} fill="white" />
          </button>
          <p className="mt-2 text-[12px] text-neutral-500">끝내기</p>
          <button onClick={onClose} className="mt-3 text-[12px] text-neutral-400 underline">녹음 버리기</button>
        </div>
      )}

      {step === 'working' && (
        <div className="py-2">
          <p className="text-[16px] font-bold">{kind === 'memo' ? '메모를 정리하고 있어요' : '녹음을 정리하고 있어요'}</p>
          <div className="mt-5">
            <ProgressSteps
              steps={kind === 'memo' ? ['요약하기', '약속과 할 일 찾기', '인물 카드에 붙이기'] : ['받아쓰기', '요약하기', '약속과 할 일 찾기', '인물 카드에 붙이기', '녹음 지우기']}
              onDone={save}
            />
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">{pickedNames.join(', ')}님 카드에 붙였어요</p>
          <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-left text-[13px] leading-relaxed">{summary}</p>
          <p className="mt-2 text-left text-[12px] leading-relaxed text-neutral-500">
            감사 인사 초안은 다음 묶음에 올려둘게요.{kind === 'record' && ' 할 일에 ‘약속한 자료 보내기’를 넣었고, 녹음은 지웠어요.'}
          </p>
          {notes.length > 0 && (
            <div className="mt-3 space-y-1 rounded-xl bg-neutral-50 px-3 py-2 text-left text-[11px] leading-relaxed text-neutral-600">
              {notes.map((n) => <p key={n}>{n}</p>)}
            </div>
          )}
          <div className="mt-5"><PrimaryButton onClick={() => { onClose(); app.openPerson(picked[0].key) }}>카드에서 보기</PrimaryButton></div>
          <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">닫기</button>
        </div>
      )}
    </Sheet>
  )
}

function UploadSheet({ onClose, init }: { onClose: () => void; init?: 'kakao' }) {
  const { update } = useConnect()
  const app = useApp()
  const [view, setView] = useState<'menu' | 'kakao' | 'call' | 'capture' | 'working' | 'who' | 'done'>(init ?? 'menu')
  const [what, setWhat] = useState<'kakao' | 'call' | 'capture'>('kakao')
  const [shots, setShots] = useState<number[]>([])
  const [target, setTarget] = useState<Person | null>(null)
  const [newName, setNewName] = useState('')
  const room = app.getPerson('p1')

  const item = (icon: ReactNode, t: string, d: string, onClick: () => void) => (
    <Card onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className="text-neutral-500">{icon}</span>
        <div className="flex-1">
          <div className="text-[14px] font-semibold">{t}</div>
          <div className="text-[12px] text-neutral-500">{d}</div>
        </div>
        <ChevronRight size={16} className="text-neutral-300" />
      </div>
    </Card>
  )
  const back = <button onClick={() => setView('menu')} className="-ml-1"><ChevronLeft size={20} /></button>
  const run = (w: 'kakao' | 'call' | 'capture') => { setWhat(w); setView('working') }

  const afterWork = () => {
    if (what === 'kakao') {
      update('kakao', { status: 'on', last: '오늘' })
      if (room) {
        app.addRec([room.id], { kind: 'kakao', when: '카톡 대화 요약 (최근 2주)', text: 'IR 자료 일정을 조율함. 다음 달 헬스케어 데모데이에 초대받음' })
        if (!(room.pending ?? []).some((f) => f.t.includes('데모데이'))) app.updatePerson(room.id, { pending: [...(room.pending ?? []), { t: '다음 달 헬스케어 데모데이에 참석', src: '카톡 대화' }] })
        setTarget(room)
      }
      setView('done')
    } else {
      // 통화 녹음과 캡처는 번호가 없어 상대를 찾지 못하면 직접 고른다
      setView('who')
    }
  }
  const attach = (p: Person) => {
    setTarget(p)
    app.addRec([p.id], what === 'call'
      ? { kind: 'call', when: '방금 올린 통화 요약 (8분)', text: '다음 주 수요일에 점심 약속을 잡음. 장소는 정해서 알려주기로 함' }
      : { kind: 'kakao', when: '방금 올린 대화 캡처 요약', text: '주말 모임 장소를 정함. 참석 여부를 금요일까지 알려주기로 함' })
    if (what === 'call') app.addTodo({ personId: p.id, t: '점심 장소 정해서 알려주기', from: '통화 요약에서' })
    setView('done')
  }
  const attachNew = () => {
    const p: Person = { id: `n${Date.now()}`, name: newName.trim(), title: '', member: false, met: '', tags: [], accounts: [], facts: [] }
    app.addPerson(p)
    attach(p)
  }

  const STEPS = {
    kakao: ['새로 나눈 대화만 고르기', '대화 상대를 인물 카드에 잇기', '요약과 알게 된 정보 뽑기', '대화 지우기'],
    call: ['받아쓰기', '약속과 할 일 찾기', '통화 상대 찾기'],
    capture: ['글자 읽기', '누구와의 대화인지 찾기', '요약하기'],
  }

  return (
    <Sheet onClose={onClose}>
      {view === 'menu' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">무엇을 올릴까요?<Tag kind="new" /></h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <div className="mt-1"><PrivateBadge /></div>
          <div className="mt-4 space-y-2">
            {item(<FileText size={20} />, '카톡 대화', '대화방에서 내보내기를 펠로어로 공유', () => setView('kakao'))}
            {item(<Phone size={20} />, '아이폰 통화 녹음', '메모 앱의 통화 녹음을 펠로어로 공유', () => setView('call'))}
            {item(<ImageIcon size={20} />, '대화 캡처', '어느 앱이든 대화 화면 스크린샷', () => setView('capture'))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">올린 대화와 녹음은 요약을 만든 뒤 지워요</p>
        </>
      )}

      {view === 'kakao' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[17px] font-bold">{!init && back}<ChannelBadge ch="kakao" />카톡 대화 보내기</h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">카톡은 펠로어가 직접 들어갈 수 없어요. 대화방에서 내보내기를 누르면 파일을 저장하지 않고 바로 펠로어로 보낼 수 있어요.</p>
          <ShareSteps steps={['카톡 대화방 오른쪽 위 메뉴에서 설정 열기', '대화 내용 내보내기 > 텍스트만 보내기', '공유 창에서 펠로어 고르기']} />
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">같은 방을 다시 보내면 새로 나눈 대화만 읽어요. 오래 안 보낸 방은 오늘의 제안에서 알려드려요. 웹에서는 내보낸 파일을 올려요.</p>
          <div className="mt-5"><PrimaryButton onClick={() => run('kakao')}>보냈어요 (목업)</PrimaryButton></div>
        </>
      )}

      {view === 'call' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[17px] font-bold">{back}<ChannelBadge ch="call" />아이폰 통화 녹음 보내기</h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <ShareSteps steps={['메모 앱에서 통화 녹음 열기', '공유 버튼 누르기', '펠로어 고르기']} />
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">통화한 번호로 인물 카드를 찾아 요약을 붙이고, 녹음은 지워요. 갤럭시는 연결에서 통화 녹음을 허용하면 알아서 물어봐요.</p>
          <div className="mt-5"><PrimaryButton onClick={() => run('call')}>보냈어요 (목업)</PrimaryButton></div>
        </>
      )}

      {view === 'capture' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[17px] font-bold">{back}<ImageIcon size={18} />대화 캡처 올리기</h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <p className="mt-2 text-[13px] text-neutral-600">대화가 보이는 스크린샷을 골라 주세요. 여러 장을 한 번에 올릴 수 있어요.</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {FEED_TONES.slice(0, 6).map((c, i) => (
              <button key={c} onClick={() => setShots((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))} className="relative aspect-[3/4] rounded-lg" style={{ background: c }}>
                <span className="absolute inset-x-2 top-3 space-y-1"><span className="block h-1.5 w-2/3 rounded bg-white/70" /><span className="ml-auto block h-1.5 w-1/2 rounded bg-white/90" /><span className="block h-1.5 w-3/5 rounded bg-white/70" /></span>
                <span className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ${shots.includes(i) ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-white bg-white/60'}`}>{shots.includes(i) && <Check size={12} />}</span>
              </button>
            ))}
          </div>
          <div className="mt-5"><PrimaryButton disabled={shots.length === 0} onClick={() => run('capture')}>{shots.length ? `${shots.length}장 올리기` : '사진을 골라 주세요'}</PrimaryButton></div>
        </>
      )}

      {view === 'working' && (
        <div className="py-2">
          <p className="text-[16px] font-bold">{what === 'kakao' ? '대화를 읽고 있어요' : what === 'call' ? '통화 녹음을 정리하고 있어요' : '캡처를 읽고 있어요'}</p>
          <div className="mt-5"><ProgressSteps steps={STEPS[what]} onDone={afterWork} /></div>
        </div>
      )}

      {view === 'who' && (
        <>
          <h3 className="text-[17px] font-bold">{what === 'call' ? '누구와 통화했나요?' : '누구와 나눈 대화인가요?'}</h3>
          <p className="mt-1 text-[12px] text-neutral-500">{what === 'call' ? '통화 상대를 번호로 찾지 못했어요. 고르면 그 사람 카드에 요약을 붙여요.' : '캡처에서 상대를 알아보지 못했어요. 고르면 그 사람 카드에 요약을 붙여요.'}</p>
          <div className="mt-3 divide-y divide-[var(--color-border-soft)]">
            {app.people.slice(0, 5).map((p) => <PersonRow key={p.id} p={p} onClick={() => attach(p)} />)}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="목록에 없으면 이름 입력" className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2.5 text-[13px] outline-none focus:border-[#25313D]" />
            <button disabled={!newName.trim()} onClick={attachNew} className="shrink-0 rounded-xl bg-[#25313D] px-4 text-[13px] font-semibold text-white disabled:opacity-40">새 사람</button>
          </div>
        </>
      )}

      {view === 'done' && (
        <div className="text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">{target ? `${target.name}님 카드에 요약을 붙였어요` : '다 읽었어요'}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
            {what === 'kakao' ? '새로 나눈 대화만 읽었어요. 같은 사람 후보가 있으면 내 사람들 위에 알려드릴게요. 대화는 지우고 요약만 남겼어요.' : what === 'call' ? '약속과 할 일을 찾아 할 일에 넣었어요. 녹음과 받아쓴 글은 지웠어요.' : '요약만 남기고 캡처는 지웠어요.'}
          </p>
          {target && app.getPerson(target.id) && <div className="mt-5"><PrimaryButton onClick={() => { onClose(); app.openPerson(target.id) }}>카드에서 보기</PrimaryButton></div>}
          <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">닫기</button>
        </div>
      )}
    </Sheet>
  )
}

/* ───────── 인스타 연동 (마이페이지) ─────────
 * 망원동 이자카야 방식. 아이디를 넣으면 코드를 주고, 펠로어 공식 계정에 DM으로 보내면 본인 확인이 끝난다.
 * 공개 계정이면 피드를 한 번 분석해 앨범 사진, 키워드, 페르소나 초안을 채우고 한마디를 건넨다.
 * 비공개 계정은 본인 확인만 하고, 에이전트 대행을 연결한 뒤 분석한다.
 */

const FEED_TONES = ['#E9D8C4', '#C9D7E3', '#D8E3C9', '#E3C9D2', '#CFC9E3', '#E3DDC9', '#C9E3DF', '#E3CFC9', '#D4D4D4']

function InstaLinkSheet({ onClose }: { onClose: () => void }) {
  const { start, finishInsta } = useConnect()
  const app = useApp()
  const [step, setStep] = useState<'id' | 'code' | 'analyze' | 'result'>('id')
  const [handle, setHandle] = useState('minjun.k')
  const [isPrivate, setIsPrivate] = useState(false)
  const [picked, setPicked] = useState<number[]>([0, 1, 3, 4, 6, 7])
  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
  const word = '“평일엔 성수에서 일하고, 주말엔 한강을 달리는 민준님. 맞죠?”'
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold">
          {step === 'code' && <button onClick={() => setStep('id')} className="-ml-1"><ChevronLeft size={20} /></button>}
          <ChannelBadge ch="ig" />인스타 연동<Tag kind="new" />
        </h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      {step === 'id' && (
        <>
          <p className="mt-3 text-[20px] font-bold leading-snug">인스타로 내 프로필을<br />채워 볼까요?</p>
          <p className="mt-2 text-[13px] text-neutral-500">로그인은 필요 없어요. 내 계정인지만 DM으로 확인하고, 공개된 피드를 한 번 읽어요.</p>
          <div className="mt-4 flex items-center rounded-xl border border-neutral-200 px-3 focus-within:border-[#25313D]">
            <span className="text-[14px] text-neutral-400">@</span>
            <input value={handle} onChange={(e) => setHandle(e.target.value.replace(/[@\s]/g, ''))} placeholder="인스타 아이디" className="flex-1 bg-transparent px-1 py-3 text-[14px] outline-none" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-[12px] text-neutral-500">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> 비공개 계정으로 보기 (목업)
          </label>
          <div className="mt-5"><PrimaryButton disabled={!handle} onClick={() => setStep('code')}>다음</PrimaryButton></div>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="mt-3 text-[15px] font-bold">이 코드를 DM으로 보내 주세요</p>
          <div className="mt-3 rounded-2xl bg-[#25313D] px-4 py-5 text-center text-white">
            <p className="text-[12px] opacity-70">인증 코드</p>
            <p className="mt-1 text-[28px] font-bold tracking-[0.25em]">FL4821</p>
            <p className="mt-1 text-[11px] opacity-60">10분 동안 쓸 수 있어요</p>
          </div>
          <ShareSteps steps={['코드 복사하고 인스타 열기', '@felore.app 에 코드를 DM으로 보내기', '확인됐다는 답장이 오면 펠로어로 돌아오기']} />
          <div className="mt-5"><PrimaryButton onClick={() => { app.toast('코드를 복사했어요'); setStep('analyze') }}><span className="inline-flex items-center gap-1.5"><Copy size={14} />코드 복사하고 인스타 열기</span></PrimaryButton></div>
          <p className="mt-2 text-center text-[11px] text-neutral-400">목업에서는 누르면 확인된 것으로 넘어가요</p>
        </>
      )}

      {step === 'analyze' && (
        <div className="py-2">
          <p className="mt-2 text-[15px] font-bold">@{handle} 확인됐어요</p>
          <p className="mt-1 text-[13px] text-neutral-500">{isPrivate ? '비공개 계정이라 피드는 볼 수 없어요' : '피드를 읽고 있어요'}</p>
          <div className="mt-5">
            <ProgressSteps
              steps={isPrivate ? ['내 계정 확인'] : ['내 계정 확인', '사진 속 분위기', '관심사 키워드', '앨범에 넣을 사진 고르기', '페르소나 초안']}
              onDone={() => setStep('result')}
            />
          </div>
        </div>
      )}

      {step === 'result' && isPrivate && (
        <div className="py-2 text-center">
          <Check size={28} className="mx-auto text-emerald-600" />
          <p className="mt-3 text-[16px] font-bold">내 인스타로 확인했어요</p>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">프로필에 인스타가 연결됐어요. 비공개 계정은 피드를 볼 수 없어서, 인스타 에이전트를 연결하면 그때 분석해요.</p>
          <div className="mt-5"><PrimaryButton onClick={() => { onClose(); start('ig') }}>인스타 에이전트 연결</PrimaryButton></div>
          <button onClick={onClose} className="mt-3 w-full text-center text-[13px] text-neutral-500">나중에</button>
        </div>
      )}

      {step === 'result' && !isPrivate && (
        <>
          <div className="mt-3 rounded-2xl bg-neutral-50 px-4 py-4">
            <p className="text-[11px] text-neutral-400">펠로어의 한마디</p>
            <p className="mt-1 text-[16px] font-bold leading-snug">{word}</p>
          </div>
          <p className="mt-5 text-[13px] font-semibold">앨범에 넣을 사진</p>
          <p className="text-[11px] text-neutral-500">고른 사진만 앨범에 들어가요. 나머지는 저장하지 않아요</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {FEED_TONES.map((c, i) => (
              <button key={c} onClick={() => toggle(i)} className="relative aspect-square rounded-lg" style={{ background: c }}>
                <span className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ${picked.includes(i) ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-white bg-white/60'}`}>
                  {picked.includes(i) && <Check size={12} />}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-[13px] font-semibold">관심사 키워드</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['러닝', '성수', '스타트업', '커피', '전시'].map((k) => <span key={k} className="rounded-full bg-neutral-100 px-3 py-1 text-[12px]">{k}</span>)}
          </div>
          <p className="mt-5 text-[13px] font-semibold">페르소나 초안</p>
          <p className="mt-1 rounded-xl border border-neutral-200 p-3 text-[13px] leading-relaxed">사람을 만나며 일을 넓히는 실행형 프로덕트 오너. 주말 러닝으로 리듬을 지키고, 새로운 공간과 전시에서 영감을 얻어요.</p>
          <div className="mt-5"><PrimaryButton disabled={picked.length === 0} onClick={() => { finishInsta(picked.length); app.toast('프로필에 앨범과 페르소나 초안을 넣었어요'); onClose() }}>프로필에 넣기 (사진 {picked.length}장)</PrimaryButton></div>
          <button onClick={() => app.openShare({ title: '한마디 공유하기', url: `felore.io/${app.me.linkId}`, text: `${word} 펠로어가 내 인스타를 보고 건넨 한마디예요` })} className="mt-3 w-full text-center text-[13px] text-neutral-500">한마디 공유하기</button>
        </>
      )}
    </Sheet>
  )
}

/* ───────── 말하기 (채팅) ───────── */

const CHAT_HELLO: Msg[] = [
  { from: 'ai', text: '무엇을 정리할까요? 사람 합치기, 관계와 말투 고치기, 지난 대화 찾기, 연결하기를 말로 할 수 있어요.', tips: true },
]

const CHAT_TIPS = ['도민혁이랑 @minhyuk.d 같은 사람이야, 합쳐줘', '민혁이한테는 반말로 해. 대학 동기야', '지난번에 서윤님이랑 무슨 얘기 했지?', '링크드인 연결해 줘', '이번 주에 챙길 사람']

const SRC_WORDS: [RegExp, Src][] = [[/링크드인/, 'in'], [/인스타/, 'ig'], [/텔레그램/, 'tg'], [/지메일|메일/, 'gmail'], [/캘린더|일정/, 'gcal'], [/카톡|카카오/, 'kakao'], [/통화/, 'calls'], [/연락처/, 'contacts'], [/리멤버|명함/, 'remember']]

/** 채팅 안에 뜨는 로그인 카드. 처음이면 암호화 키부터 만든다 */
function ChatLoginCard({ src, stage, again, onKey, onLogin }: { src: Src; stage: 'key' | 'form' | 'saved'; again?: boolean; onKey: () => void; onLogin: () => void }) {
  // 인스타는 프로필에서 확인한 아이디를, 다시 연결할 때는 쓰던 아이디를 미리 채운다
  const known = src === 'ig' ? 'minjun.k' : again ? 'minjun@felore.io' : ''
  const [a, setA] = useState(stage === 'key' ? '' : known)
  const [b, setB] = useState('')
  const input = 'w-full rounded-xl bg-neutral-100 px-3 py-2.5 text-[13px] outline-none'
  if (stage === 'saved') {
    return <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-[13px]"><ChannelBadge ch={SRC[src].ch} /><span className="flex-1 font-semibold">{SRC[src].label} 로그인</span><Check size={14} className="text-emerald-600" /></div>
  }
  if (stage === 'key') {
    const ok = a.length >= 6 && a === b
    return (
      <div className="rounded-2xl bg-white p-3">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold"><KeyRound size={14} />암호화 키 만들기</p>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">로그인 정보는 이 키로 잠가 보관해요. 키는 나만 알고 펠로어도 열어볼 수 없어요.</p>
        <input type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="키 (6자 이상)" className={`mt-2 ${input}`} />
        <input type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="한 번 더" className={`mt-1.5 ${input}`} />
        <button disabled={!ok} onClick={() => { setA(known); setB(''); onKey() }} className="mt-2 w-full rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white disabled:opacity-40">키 만들기</button>
      </div>
    )
  }
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold"><ChannelBadge ch={SRC[src].ch} />{SRC[src].label} 로그인</p>
      <input value={a} onChange={(e) => setA(e.target.value)} placeholder="이메일 또는 아이디" className={`mt-2 ${input}`} />
      <input type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="비밀번호" className={`mt-1.5 ${input}`} />
      <button disabled={!a.trim() || !b} onClick={onLogin} className="mt-2 w-full rounded-full bg-[#0D0D0D] py-2.5 text-[13px] font-semibold text-white disabled:opacity-40">로그인</button>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400"><Lock size={10} />로그인 정보는 암호화로 보호됩니다</p>
    </div>
  )
}

function ChatScreen({ onClose }: { onClose: () => void }) {
  const { conn, start, update } = useConnect()
  const app = useApp()
  const msgs = app.chat
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [msgs.length, busy])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /** 펠로어의 말은 조금씩 뜸을 두고 하나씩 나온다 */
  const say = (list: Msg[]) => {
    setBusy(true)
    list.forEach((m, i) => {
      timers.current.push(setTimeout(() => {
        app.setChat((x) => [...x, m])
        if (i === list.length - 1) setBusy(false)
      }, 550 * (i + 1)))
    })
  }

  const who = (text: string) => app.people.find((p) => text.includes(p.name) || (p.name.length > 2 && !p.name.startsWith('@') && text.includes(p.name.slice(1))))
  const hasKey = (['ig', 'in', 'remember'] as Src[]).some((s) => conn[s].status !== 'off') || msgs.some((m) => m.login && m.login.stage !== 'key')
  const pending = [...msgs].reverse().find((m) => m.login?.stage === 'saved' && conn[m.login.src].status !== 'on')?.login?.src

  const finishLogin = (s: Src, level: Level) => {
    update(s, { status: 'on', level, last: '방금' })
    if (s === 'remember' && app.myProf.career.length === 0) app.setMyProf({ ...app.myProf, career: MY_PROF.career, edu: MY_PROF.edu })
    return s === 'remember'
      ? '리멤버 연결을 마쳤어요. 받은 명함으로 연결된 사람들을 채우고, 내 프로필의 명함에 경력을 넣었어요.'
      : `${SRC[s].label} 연결을 마쳤어요. ${LEVEL[level].d}. 대화 상대를 가져오는 중이라, 다 되면 내 사람들에 쌓여요.`
  }

  /** 목업: 정해진 몇 가지 말만 알아듣는다. 답은 요약과 알게 된 정보에서 찾는다 */
  const reply = (text: string): Msg[] => {
    const p = who(text)
    if (pending && /했어|했어요|완료|끝/.test(text)) {
      const s = pending
      if (conn[s].status === 'broken') { update(s, { status: 'on', last: '방금' }); return [{ from: 'ai', text: '확인해 볼게요!' }, { from: 'ai', text: `${SRC[s].label} 연결이 다시 이어졌어요. 그 사이 온 메시지는 다음 묶음에 올려 둘게요.` }] }
      if (SRC[s].levels.length === 1) return [{ from: 'ai', text: '확인해 볼게요!' }, { from: 'ai', text: finishLogin(s, SRC[s].levels[0]) }]
      return [{ from: 'ai', text: '확인해 볼게요!' }, { from: 'ai', text: `${SRC[s].label} 로그인이 끝났어요. 계정이 드물게 잠시 제한될 수 있어서, 사람처럼 천천히 하루 정해진 양만 읽고 보낼게요. 어디까지 맡길까요?`, levels: { src: s } }]
    }
    if (/같은 사람|합쳐|합치/.test(text)) {
      const handle = text.match(/@?[A-Za-z0-9_.]{3,}/)?.[0]
      if (p && handle) {
        const h = handle.startsWith('@') ? handle : `@${handle}`
        return [{ from: 'ai', text: '이렇게 합칠게요. 맞으면 눌러주세요.', merge: { personId: p.id, q: { a: { ch: 'ig', h }, b: { ch: p.accounts[0]?.ch ?? 'memo', h: p.name }, why: '말씀하신 두 계정이에요' } } }]
      }
      return [{ from: 'ai', text: '누구와 어떤 계정인지 알려주세요. 예: “도민혁이랑 @minhyuk.d 같은 사람이야”' }]
    }
    if (/반말|존댓말|영어|말투/.test(text)) {
      if (!p) return [{ from: 'ai', text: '누구에게 쓰는 말투인지 이름을 같이 말해 주세요.' }]
      const base = /반말/.test(text) ? '반말' : /영어/.test(text) ? '영어' : '존댓말'
      const rel = text.split(/[.。]/).slice(1).join(' ').replace(/(이야|야|예요|입니다|임)\s*$/, '').trim()
      return [{ from: 'ai', text: `${p.name}님의 관계와 말투를 이렇게 바꿀까요?`, tone: { personId: p.id, tone: rel ? `${base}, ${rel}` : base } }]
    }
    if (/연결|연동/.test(text)) {
      const hit = SRC_WORDS.find(([re]) => re.test(text))
      if (!hit) return [{ from: 'ai', text: '어디를 연결할까요? 인스타그램, 링크드인, 리멤버, 텔레그램, 카톡, 지메일, 구글 캘린더, 연락처, 통화 녹음을 연결할 수 있어요.' }]
      const s = hit[1]
      if (conn[s].status === 'on') return [{ from: 'ai', text: `${SRC[s].label} 연결은 이미 돼 있어요. 마이페이지 > 연결에서 맡길 범위를 바꿀 수 있어요.` }]
      if (SRC[s].how === 'web') {
        const again = conn[s].status === 'broken'
        return [
          { from: 'ai', text: `${SRC[s].label} 로그인 바로 준비해 드릴게요!` },
          { from: 'ai', text: '', login: { src: s, stage: hasKey || again ? 'form' : 'key' } },
          { from: 'ai', text: hasKey || again ? '위 카드에 아이디와 비밀번호를 넣어 주시면 내 암호화 키로 잠가 보관하고, 바로 로그인을 진행할게요.' : '처음이라 암호화 키부터 만들어요. 한 번 만들면 다른 곳을 연결할 때도 써요.' },
        ]
      }
      return [{ from: 'ai', text: `${SRC[s].label} 연결을 열게요.`, connect: s }]
    }
    if (/챙길|오래 연락|안부/.test(text)) {
      const list = CARE.filter((c) => !app.careOff.includes(c.personId)).map((c) => app.getPerson(c.personId)).filter((x): x is Person => !!x)
      return [{ from: 'ai', text: list.length ? `${list.map((x) => `${x.name}님`).join(', ')}을 챙겨 보세요. 오늘의 제안의 챙길 사람에서 안부 초안을 만들 수 있어요.` : '지금은 챙길 사람이 없어요.' }]
    }
    if (/메모|기록|적어/.test(text) && p) return [{ from: 'ai', text: `${p.name}님과의 메모를 열게요.`, record: p.id }]
    if (p) {
      const last = app.recs[p.id]?.[0]
      const bits = [p.met && `${p.met}에 만났어요`, p.note, last && `가장 최근 기록은 “${last.text}”`, p.tone && `말투는 ${p.tone}`].filter(Boolean)
      return [{ from: 'ai', text: `${p.name}님은 ${bits.join('. ')}. (요약과 알게 된 정보에서 찾았어요. 원문은 보관하지 않아요)` }]
    }
    return [{ from: 'ai', text: '아직 그 말은 알아듣지 못해요. 이렇게 말해 보세요.', tips: true }]
  }

  const send = (text: string) => {
    const t = text.trim()
    if (!t || busy) return
    const r = reply(t)
    app.setChat((m) => [...m, { from: 'me', text: t }])
    say(r)
    setInput('')
  }
  // 홈에서 한마디를 들고 들어온 경우 바로 건넨다
  useEffect(() => {
    if (app.ask) { const t = app.ask; app.askAgent(null); send(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patchMsg = (i: number, patch: Partial<Msg>) => app.setChat((m) => m.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const onMerge = (i: number, m: NonNullable<Msg['merge']>, a: MergeAnswer) => {
    patchMsg(i, { merge: { ...m, ans: a } })
    const p = m.personId ? app.getPerson(m.personId) : undefined
    if (a === 'same' && p && !p.accounts.some((x) => x.handle === m.q.a.h)) {
      app.updatePerson(p.id, { accounts: [...p.accounts, { ch: m.q.a.ch, handle: m.q.a.h, why: '내가 같은 사람이라고 했어요' }] })
      app.toast(`${p.name}님 카드에 합쳤어요`)
    }
  }
  const onTone = (i: number, t: NonNullable<Msg['tone']>, ok: boolean) => {
    patchMsg(i, { tone: { ...t, ans: ok } })
    if (ok) { app.updatePerson(t.personId, { tone: t.tone }); app.toast('다음 답장 초안부터 반영할게요') }
  }
  const onLogin = (i: number, s: Src) => {
    patchMsg(i, { login: { src: s, stage: 'saved' } })
    say([
      { from: 'ai', text: '', chip: '로그인 정보를 저장했어요' },
      { from: 'ai', text: '정보 확인했어요! 바로 로그인을 진행해 볼게요.' },
      { from: 'ai', text: `${SRC[s].label}에서 로그인 확인을 요청했어요. 휴대폰의 ${SRC[s].label} 앱이나 문자로 온 알림에서 승인하고 말씀해 주세요.`, quick: ['다 했어'] },
    ])
  }
  const onLevel = (i: number, s: Src, l: Level) => {
    patchMsg(i, { levels: { src: s, picked: l } })
    say([{ from: 'ai', text: finishLogin(s, l) }])
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={onClose} aria-label="닫기"><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25313D] text-white"><Sparkles size={13} /></span>
        <span className="text-[15px] font-black">펠로어</span>
        <Tag kind="new" />
        <span className="ml-auto"><PrivateBadge /></span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {msgs.map((m, i) => m.chip ? (
          <p key={i} className="mx-auto flex w-fit items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[11px] text-neutral-500"><Check size={11} className="text-emerald-600" />{m.chip}</p>
        ) : (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[86%] rounded-2xl text-[13px] leading-relaxed ${m.from === 'me' ? 'bg-[#25313D] px-3.5 py-2.5 text-white' : m.login && !m.text ? 'w-[86%] bg-neutral-100 p-1.5' : 'bg-neutral-100 px-3.5 py-2.5'}`}>
              {m.text}
              {m.login && <ChatLoginCard src={m.login.src} stage={m.login.stage} again={conn[m.login.src].status === 'broken'} onKey={() => { patchMsg(i, { login: { src: m.login!.src, stage: 'form' } }); say([{ from: 'ai', text: '', chip: '암호화 키를 만들었어요' }, { from: 'ai', text: '이제 위 카드에 아이디와 비밀번호를 넣어 주세요.' }]) }} onLogin={() => onLogin(i, m.login!.src)} />}
              {m.merge && (
                <div className="mt-2"><MergeAskCard q={m.merge.q} onAnswer={(a) => onMerge(i, m.merge!, a)} done={m.merge.ans} /></div>
              )}
              {m.tone && (
                <div className="mt-2 rounded-xl bg-white p-3">
                  <p className="text-[11px] text-neutral-400">관계와 말투</p>
                  <p className="mt-0.5 text-[14px] font-semibold">{m.tone.tone}</p>
                  {m.tone.ans === undefined ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => onTone(i, m.tone!, false)} className="rounded-full border border-neutral-200 py-2 text-[12px]">취소</button>
                      <button onClick={() => onTone(i, m.tone!, true)} className="rounded-full bg-[#25313D] py-2 text-[12px] font-semibold text-white">이렇게 저장</button>
                    </div>
                  ) : (
                    <p className="mt-2 text-[12px] font-medium text-emerald-600">{m.tone.ans ? '카드에 저장했어요. 다음 초안부터 반영해요' : '바꾸지 않았어요'}</p>
                  )}
                </div>
              )}
              {m.levels && (
                <div className="mt-2 space-y-1.5">
                  {SRC[m.levels.src].levels.map((l) => (
                    <button key={l} disabled={!!m.levels!.picked} onClick={() => onLevel(i, m.levels!.src, l)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left ${m.levels!.picked === l ? 'bg-[#25313D] text-white' : 'bg-white'} ${m.levels!.picked && m.levels!.picked !== l ? 'opacity-40' : ''}`}>
                      <span className="flex-1"><span className="block text-[13px] font-semibold">{LEVEL[l].t}</span><span className={`block text-[11px] ${m.levels!.picked === l ? 'opacity-70' : 'text-neutral-500'}`}>{LEVEL[l].d}</span></span>
                      {m.levels!.picked === l && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
              {m.connect && (
                <button onClick={() => start(m.connect!)} className="mt-2 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left">
                  <ChannelBadge ch={SRC[m.connect].ch} />
                  <span className="flex-1 text-[13px] font-semibold">{conn[m.connect].status === 'on' ? `${SRC[m.connect].label} 연결됨` : `${SRC[m.connect].label} 연결하기`}</span>
                  {conn[m.connect].status === 'on' ? <Check size={14} className="text-emerald-600" /> : <ChevronRight size={14} className="text-neutral-400" />}
                </button>
              )}
              {m.record && (
                <button onClick={() => app.openAction('memo', m.record)} className="mt-2 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-[13px] font-semibold"><PenLine size={14} />메모 쓰기</button>
              )}
              {m.tips && (
                <div className="mt-2 space-y-1.5">
                  {CHAT_TIPS.map((s) => <button key={s} onClick={() => send(s)} className="block w-full rounded-xl bg-white px-3 py-2 text-left text-[12px]">{s}</button>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="flex gap-1 rounded-2xl bg-neutral-100 px-4 py-3.5">{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: `${d * 120}ms` }} />)}</div></div>}
        {!busy && msgs[msgs.length - 1]?.quick && (
          <div className="flex justify-end gap-1.5">
            {msgs[msgs.length - 1].quick!.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-[#25313D] px-3.5 py-2 text-[13px] font-semibold text-[#25313D]">{s}</button>)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-4 pb-2">
        {CHAT_TIPS.slice(2).map((s) => (
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
        <button onClick={() => send(input)} disabled={!input.trim() || busy} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D0D0D] text-white disabled:opacity-40" aria-label="보내기"><ArrowUp size={16} /></button>
      </div>
    </div>
  )
}

/* ───────── 화면 ───────── */

/* ───────── 가입과 로그인 ─────────
 * 비회원이 가입 버튼을 누르거나 저장, 기록을 하려는 순간 열린다. 끝나면 온보딩으로 이어진다.
 * 휴대폰 인증 번호는 다른 사람의 연락처에 있는 나를 찾아 잇는 기준이 된다.
 */

type SignStep = 'start' | 'terms' | 'phone' | 'pw' | 'profile' | 'welcome' | 'login'

const TERMS: { id: string; t: string; must: boolean }[] = [
  { id: 'use', t: '서비스 이용약관', must: true },
  { id: 'privacy', t: '개인정보 수집 및 이용', must: true },
  { id: 'age', t: '만 14세 이상이에요', must: true },
  { id: 'mkt', t: '혜택과 소식 받기', must: false },
]

function SignupFlow({ viaLink, initLogin, onClose, onDone, onLogin }: {
  viaLink: boolean; initLogin?: boolean; onClose: () => void
  onDone: (info: { name: string; title: string; linkId: string }) => void; onLogin: () => void
}) {
  const [step, setStep] = useState<SignStep>(initLogin ? 'login' : 'start')
  const [method, setMethod] = useState<'google' | 'phone'>('phone')
  const [agreed, setAgreed] = useState<string[]>([])
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState(ME.name)
  const [linkId, setLinkId] = useState(ME.linkId)
  const [title, setTitle] = useState(ME.title)
  const input = 'w-full rounded-xl border border-neutral-200 px-3 py-3 text-[14px] outline-none focus:border-[#25313D]'

  const flow: SignStep[] = method === 'google' ? ['start', 'terms', 'phone', 'profile', 'welcome'] : ['start', 'terms', 'phone', 'pw', 'profile', 'welcome']
  const idx = flow.indexOf(step)
  const go = (d: 1 | -1) => setStep(flow[idx + d])
  const back = () => (step === 'login' ? (initLogin ? onClose() : setStep('start')) : idx <= 0 ? onClose() : go(-1))
  const mustOk = TERMS.filter((t) => t.must).every((t) => agreed.includes(t.id))
  const allOn = agreed.length === TERMS.length
  const phoneOk = phone.replace(/\D/g, '').length >= 10

  const GoogleMark = <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 text-[11px] font-bold text-[#4285F4]">G</span>

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 px-3">
        {step !== 'welcome' && <button onClick={back} aria-label="이전">{step === 'start' ? <X size={22} /> : <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />}</button>}
        {step !== 'login' && step !== 'start' && step !== 'welcome' && (
          <div className="ml-1 flex gap-1">
            {flow.slice(1, -1).map((s, j) => <span key={s} className={`h-1 rounded-full ${j === idx - 1 ? 'w-6 bg-[#25313D]' : j < idx - 1 ? 'w-1.5 bg-[#25313D]/40' : 'w-1.5 bg-neutral-200'}`} />)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8">
        {step === 'start' && (
          <>
            <p className="mt-8 text-[26px] font-bold leading-snug">흩어진 연락은 모으고,<br />답장은 펠로어가 써둘게요</p>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">1분이면 가입해요. 가입하면 내 프로필 링크가 생기고, 만난 사람을 나만 보는 카드로 정리할 수 있어요.</p>
            {viaLink && (
              <div className="mt-6 rounded-2xl border border-[var(--color-border-soft)] p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={JIMIN.name} size={40} img={JIMIN.img} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{JIMIN.name}님 프로필에서 왔어요</div>
                    <div className="text-[12px] text-neutral-500">가입하면 내 사람에 추가돼요</div>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-700"><Gift size={13} className="shrink-0" />24시간 안에 가입하면 보너스 재화 5개</p>
              </div>
            )}
            <div className="mt-auto space-y-2 pt-8">
              <button onClick={() => { setMethod('google'); setStep('terms') }} className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 py-3.5 text-[15px] font-semibold">{GoogleMark}구글로 시작하기</button>
              <PrimaryButton onClick={() => { setMethod('phone'); setStep('terms') }}>전화번호로 시작하기</PrimaryButton>
              <button onClick={() => setStep('login')} className="w-full pt-2 text-center text-[13px] text-neutral-500">이미 계정이 있어요. <span className="font-semibold text-[#0D0D0D] underline">로그인</span></button>
            </div>
          </>
        )}

        {step === 'terms' && (
          <>
            <p className="mt-6 text-[22px] font-bold leading-snug">약관에 동의해 주세요</p>
            <button onClick={() => setAgreed(allOn ? [] : TERMS.map((t) => t.id))} className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-4 text-left">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${allOn ? 'border-[#25313D] bg-[#25313D] text-white' : 'border-neutral-300 bg-white'}`}>{allOn && <Check size={14} />}</span>
              <span className="text-[15px] font-black">모두 동의해요</span>
            </button>
            <div className="mt-2 divide-y divide-[var(--color-border-soft)]">
              {TERMS.map((t) => {
                const on = agreed.includes(t.id)
                return (
                  <button key={t.id} onClick={() => setAgreed((a) => (on ? a.filter((x) => x !== t.id) : [...a, t.id]))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                    <Check size={16} className={on ? 'text-[#25313D]' : 'text-neutral-300'} />
                    <span className="flex-1 text-[14px]"><span className={t.must ? 'text-[#25313D]' : 'text-neutral-400'}>{t.must ? '필수' : '선택'}</span> {t.t}</span>
                    <ChevronRight size={14} className="text-neutral-300" />
                  </button>
                )
              })}
            </div>
            <div className="mt-auto pt-8"><PrimaryButton disabled={!mustOk} onClick={() => go(1)}>다음</PrimaryButton></div>
          </>
        )}

        {step === 'phone' && (
          <>
            <p className="mt-6 text-[22px] font-bold leading-snug">휴대폰 번호를<br />확인할게요</p>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">이 번호로 본인을 확인하고, 다른 사람의 연락처에 있는 나를 찾아 이어 줘요. 번호는 공개되지 않아요.</p>
            <div className="mt-6 flex gap-2">
              <input value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^0-9-]/g, '')); setSent(false); setCode('') }} inputMode="tel" placeholder="010-1234-5678" className={input} />
              <button disabled={!phoneOk} onClick={() => setSent(true)} className="shrink-0 rounded-xl bg-[#25313D] px-4 text-[13px] font-semibold text-white disabled:opacity-40">{sent ? '다시 받기' : '인증번호 받기'}</button>
            </div>
            {!phone && <button onClick={() => setPhone('010-2840-1192')} className="mt-2 self-start text-[12px] text-neutral-500 underline">예시 번호 넣기 (목업)</button>}
            {sent && (
              <>
                <input autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="인증번호 6자리" className={`mt-3 text-center tracking-[0.3em] placeholder:tracking-normal ${input}`} />
                <p className="mt-2 text-[12px] text-neutral-400">문자로 인증번호를 보냈어요. 목업에서는 아무 숫자 6자리를 넣으면 돼요</p>
              </>
            )}
            <div className="mt-auto pt-8"><PrimaryButton disabled={!sent || code.length < 6} onClick={() => go(1)}>확인</PrimaryButton></div>
          </>
        )}

        {step === 'pw' && (
          <>
            <p className="mt-6 text-[22px] font-bold leading-snug">비밀번호를<br />정해 주세요</p>
            <p className="mt-2 text-[13px] text-neutral-500">다음부터는 전화번호와 이 비밀번호로 로그인해요.</p>
            <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="8자 이상" className={`mt-6 ${input}`} />
            <p className={`mt-2 text-[12px] ${pw && pw.length < 8 ? 'text-rose-500' : 'text-neutral-400'}`}>{pw && pw.length < 8 ? `${8 - pw.length}자 더 넣어 주세요` : '영문, 숫자를 섞으면 더 안전해요'}</p>
            <div className="mt-auto pt-8"><PrimaryButton disabled={pw.length < 8} onClick={() => go(1)}>다음</PrimaryButton></div>
          </>
        )}

        {step === 'profile' && (
          <>
            <p className="mt-6 text-[22px] font-bold leading-snug">어떻게 소개할까요?</p>
            <p className="mt-2 text-[13px] text-neutral-500">프로필 링크에 보이는 이름이에요. 나머지는 가입한 뒤 인스타로 채울 수 있어요.</p>
            <label className="mt-6 text-[12px] font-semibold text-neutral-500">이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className={`mt-1.5 ${input}`} />
            <label className="mt-4 text-[12px] font-semibold text-neutral-500">프로필 주소</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-neutral-200 px-3 focus-within:border-[#25313D]">
              <span className="text-[14px] text-neutral-400">felore.io/</span>
              <input value={linkId} onChange={(e) => setLinkId(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className="min-w-0 flex-1 bg-transparent py-3 text-[14px] outline-none" />
            </div>
            <p className={`mt-1 text-[11px] ${linkId.length >= 3 ? 'text-emerald-600' : 'text-neutral-400'}`}>{linkId.length >= 3 ? '쓸 수 있는 주소예요' : '영문, 숫자 3자 이상'}</p>
            <label className="mt-4 text-[12px] font-semibold text-neutral-500">하는 일 <span className="font-normal text-neutral-400">(선택)</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 스타트업 마케터" className={`mt-1.5 ${input}`} />
            <div className="mt-auto pt-8"><PrimaryButton disabled={!name.trim() || linkId.length < 3} onClick={() => go(1)}>가입하기</PrimaryButton></div>
          </>
        )}

        {step === 'welcome' && (
          <div className="flex flex-1 flex-col">
            <div className="mt-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25313D] text-white"><Sparkles size={24} /></span>
              <p className="mt-5 text-[24px] font-bold leading-snug">{name.trim()}님,<br />환영해요</p>
              <p className="mt-2 text-[13px] text-neutral-500">내 프로필 링크가 생겼어요</p>
              <p className="mx-auto mt-3 w-fit rounded-full bg-neutral-100 px-4 py-1.5 text-[13px] font-medium">felore.io/{linkId}</p>
            </div>
            {viaLink && (
              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] p-3">
                  <Avatar name={JIMIN.name} size={36} img={JIMIN.img} />
                  <span className="flex-1 text-[13px]"><span className="font-semibold">{JIMIN.name}</span>님을 내 사람에 추가했어요</span>
                  <Check size={16} className="text-emerald-600" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 text-[13px] text-amber-700"><Gift size={18} className="ml-2 shrink-0" />24시간 안에 가입해서 보너스 재화 5개를 받았어요</div>
              </div>
            )}
            <div className="mt-auto pt-8"><PrimaryButton onClick={() => onDone({ name: name.trim(), title: title.trim(), linkId })}>시작하기</PrimaryButton></div>
          </div>
        )}

        {step === 'login' && (
          <>
            <p className="mt-6 text-[22px] font-bold leading-snug">다시 만나서 반가워요</p>
            <button onClick={onLogin} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 py-3.5 text-[15px] font-semibold">{GoogleMark}구글로 로그인</button>
            <div className="my-5 flex items-center gap-3 text-[12px] text-neutral-400"><span className="h-px flex-1 bg-neutral-200" />또는<span className="h-px flex-1 bg-neutral-200" /></div>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9-]/g, ''))} inputMode="tel" placeholder="전화번호" className={input} />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" className={`mt-2 ${input}`} />
            <p className="mt-2 text-[12px] text-neutral-400">목업에서는 아무 값이나 넣으면 로그인돼요</p>
            <div className="mt-auto pt-8">
              <PrimaryButton disabled={!phone || !pw} onClick={onLogin}>로그인</PrimaryButton>
              {!initLogin && <button onClick={() => setStep('start')} className="mt-3 w-full text-center text-[13px] text-neutral-500">처음이에요. 가입하기</button>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ───────── 작은 시트들 ───────── */

function ShareSheet({ spec, onClose }: { spec: ShareSpec; onClose: () => void }) {
  const app = useApp()
  const ways: [string, string][] = [['카톡', 'bg-yellow-50 text-yellow-700'], ['문자', 'bg-emerald-50 text-emerald-700'], ['인스타 DM', 'bg-pink-50 text-pink-600'], ['메일', 'bg-neutral-100 text-neutral-600']]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Share2 size={18} />{spec.title}</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      {spec.text && <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{spec.text}</p>}
      {spec.url && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-3">
          <Link2 size={15} className="shrink-0 text-neutral-400" />
          <span className="min-w-0 flex-1 break-all text-[13px] font-semibold">{spec.url}</span>
          <button onClick={() => app.toast('링크를 복사했어요')} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium shadow-sm">복사</button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {ways.map(([w, cls]) => (
          <button key={w} onClick={() => { app.toast(`${w} 공유 창을 열었어요 (목업)`); onClose() }} className="flex flex-col items-center gap-1.5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[13px] font-semibold ${cls}`}>{w[0]}</span>
            <span className="text-[11px] text-neutral-600">{w}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

/** 모양만 흉내 낸 QR. 실제로 읽히지는 않는다 */
function QrSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const N = 21
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    const ring = (r0: number, c0: number) => { const a = r - r0, b = c - c0; return a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4) }
    for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) if (inBox(r0, c0)) return ring(r0, c0)
    return null
  }
  const cells = Array.from({ length: N * N }, (_, i) => {
    const r = Math.floor(i / N), c = i % N
    const f = finder(r, c)
    return f ?? ((r * 7 + c * 13 + ((r * c) % 5) * 3) % 3 === 0)
  })
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><QrCode size={18} />내 프로필 QR<Tag kind="old" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <div className="mx-auto mt-5 w-[200px] rounded-2xl border border-neutral-200 p-4">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
          {cells.map((on, i) => <span key={i} className={`aspect-square ${on ? 'bg-[#0D0D0D]' : 'bg-white'}`} />)}
        </div>
      </div>
      <p className="mt-4 text-center text-[15px] font-bold">{app.me.name}</p>
      <p className="text-center text-[12px] text-neutral-500">felore.io/{app.me.linkId}</p>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-neutral-500">상대가 카메라로 찍으면 내 프로필이 열려요.<br />가입하면 서로 내 사람에 추가돼요.</p>
      <div className="mt-5"><PrimaryButton onClick={() => app.toast('QR 이미지를 저장했어요 (목업)')}>이미지로 저장</PrimaryButton></div>
    </Sheet>
  )
}

function VerifySheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const [working, setWorking] = useState<string | null>(null)
  const prof = app.myProf
  const rows = [...prof.career.map((j) => ({ j, kind: 'career' as const })), ...prof.edu.map((j) => ({ j, kind: 'edu' as const }))]
  const finish = (org: string) => {
    app.setMyProf({ ...prof, career: prof.career.map((j) => (j.org === org ? { ...j, ok: true } : j)), edu: prof.edu.map((j) => (j.org === org ? { ...j, ok: true } : j)) })
    setWorking(null)
    app.toast(`${org} 인증을 마쳤어요`)
  }
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><ShieldCheck size={18} />인증<Tag kind="old" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-2 text-[13px] text-neutral-500">인증한 항목은 명함에 뱃지로 보여요.</p>
      <div className="mt-4 divide-y divide-[var(--color-border-soft)] rounded-2xl border border-[var(--color-border-soft)] px-4">
        <div className="flex items-center gap-3 py-3">
          <BadgeCheck size={18} className="text-neutral-500" />
          <span className="flex-1"><span className="block text-[14px] font-semibold">본인인증</span><span className="block text-[12px] text-neutral-500">가입할 때 휴대폰으로 확인했어요</span></span>
          <span className="text-[12px] font-medium text-emerald-600">완료</span>
        </div>
        {rows.map(({ j, kind }) => (
          <div key={j.org} className="py-3">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-neutral-500" />
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{j.org}</span><span className="block text-[12px] text-neutral-500">{kind === 'career' ? '경력' : '학력'}, {j.role}</span></span>
              {j.ok
                ? <span className="text-[12px] font-medium text-emerald-600">완료</span>
                : working !== j.org && <button onClick={() => setWorking(j.org)} className="rounded-full bg-[#25313D] px-3 py-1.5 text-[12px] font-semibold text-white">인증하기</button>}
            </div>
            {working === j.org && (
              <div className="mt-3">
                <ProgressSteps steps={kind === 'career' ? ['간편인증으로 본인 확인', '건강보험 자격득실 불러오기', '재직 이력 맞춰 보기'] : ['학교 이메일로 확인 메일 보내기', '졸업 여부 확인']} onDone={() => finish(j.org)} />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-neutral-400">경력은 건강보험 자격득실로, 학력은 학교 이메일이나 졸업증명서로 확인해요</p>
    </Sheet>
  )
}

function ViewersSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const rows: { p?: Person; name: string; sub: string; when: string }[] = [
    { p: app.getPerson('p6'), name: '이지민', sub: '스타트업 마케터', when: '방금 전' },
    { p: app.getPerson('p1'), name: '한서윤', sub: '루프벤처스 심사역', when: '어제' },
    { name: '로그인하지 않은 방문자', sub: '링크로 들어옴', when: '2일 전' },
    { name: '로그인하지 않은 방문자', sub: 'QR로 들어옴', when: '4일 전' },
  ]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><BarChart3 size={18} />내 프로필 본 사람<Tag kind="old" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[['최근 7일', '14명'], ['링크', '9명'], ['QR', '5명']].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-neutral-50 py-3"><p className="text-[11px] text-neutral-500">{k}</p><p className="text-[17px] font-bold">{v}</p></div>
        ))}
      </div>
      <div className="mt-3 divide-y divide-[var(--color-border-soft)]">
        {rows.map((r, i) => (
          <button key={i} disabled={!r.p} onClick={() => { if (r.p) { onClose(); app.openPerson(r.p) } }} className="flex w-full items-center gap-3 py-3 text-left">
            <Avatar name={r.name} size={36} member={!!r.p} img={r.p?.img} />
            <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{r.name}</span><span className="block text-[12px] text-neutral-500">{r.sub}</span></span>
            <span className="text-[11px] text-neutral-400">{r.when}</span>
            {r.p && <ChevronRight size={14} className="text-neutral-300" />}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

function BatchTimeSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const [am, setAm] = useState(app.batchTimes[0])
  const [pm, setPm] = useState(app.batchTimes[1])
  const [urgent, setUrgent] = useState(false)
  const pick = (list: string[], v: string, set: (x: string) => void) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {list.map((t) => <button key={t} onClick={() => set(t)} className={`rounded-full px-3 py-1.5 text-[12px] ${v === t ? 'bg-[#25313D] font-semibold text-white' : 'bg-neutral-100 text-neutral-600'}`}>{t}</button>)}
    </div>
  )
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Clock size={18} />묶음 처리 시간<Tag kind="review" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">받은 메시지는 하나씩 묻지 않고 하루 두 번 모아서 초안과 함께 보여드려요.</p>
      <p className="mt-5 text-[13px] font-semibold">첫 번째 묶음</p>
      {pick(['오전 8시', '오전 9시', '오전 10시', '오전 11시'], am, setAm)}
      <p className="mt-5 text-[13px] font-semibold">두 번째 묶음</p>
      {pick(['오후 5시', '오후 6시', '오후 7시', '오후 9시'], pm, setPm)}
      <button onClick={() => setUrgent((v) => !v)} className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-left">
        <span className="flex-1"><span className="block text-[13px] font-semibold">급한 메시지는 바로 알리기</span><span className="block text-[12px] text-neutral-500">약속 시간 변경처럼 급해 보이는 메시지만 묶음을 기다리지 않아요</span></span>
        <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${urgent ? 'bg-[#25313D]' : 'bg-neutral-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${urgent ? 'left-[18px]' : 'left-0.5'}`} /></span>
      </button>
      <div className="mt-5"><PrimaryButton onClick={() => { app.setBatchTimes([am, pm]); app.toast(`${am}, ${pm}에 모아서 보여드릴게요`); onClose() }}>저장</PrimaryButton></div>
    </Sheet>
  )
}

function CoinSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Coins size={18} />내 재화<Tag kind="review" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <div className="mt-4 rounded-2xl bg-[#25313D] px-5 py-5 text-white">
        <p className="text-[12px] opacity-70">지금 가진 재화</p>
        <p className="mt-1 text-[28px] font-bold">{app.coins}개</p>
      </div>
      <p className="mt-5 text-[13px] font-semibold">충전하기</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[[10, '3,300원'], [30, '8,800원'], [100, '25,000원']].map(([n, price]) => (
          <button key={n} onClick={() => { app.addCoins(n as number); app.toast(`재화 ${n}개를 충전했어요 (목업)`) }} className="rounded-2xl border border-neutral-200 py-3 text-center">
            <span className="block text-[15px] font-bold">{n}개</span><span className="block text-[11px] text-neutral-500">{price}</span>
          </button>
        ))}
      </div>
      <p className="mt-5 text-[13px] font-semibold">받은 내역</p>
      <ul className="mt-1 divide-y divide-[var(--color-border-soft)] text-[13px]">
        <li className="flex justify-between py-2.5"><span>링크로 가입 보너스</span><span className="font-semibold text-emerald-600">+5</span></li>
        <li className="flex justify-between py-2.5"><span>가입 축하</span><span className="font-semibold text-emerald-600">+3</span></li>
      </ul>
      <p className="mt-3 rounded-2xl bg-neutral-50 px-4 py-3 text-[12px] leading-relaxed text-neutral-500">재화 이름, 가격, 비서 기능 중 무엇에 쓰는지는 아직 정하지 않았어요. 케미 리포트 같은 기존 사용처는 그대로예요.</p>
    </Sheet>
  )
}

function NotiSheet({ onClose, onGo }: { onClose: () => void; onGo: (n: Noti) => void }) {
  const icon: Record<Noti['kind'], ReactNode> = {
    draft: <Sparkles size={16} />, call: <Phone size={16} />, broken: <RefreshCw size={16} className="text-rose-500" />, join: <UserPlus size={16} />, feedback: <MessageCircle size={16} />,
  }
  const app = useApp()
  const list = app.mode === 'active' ? NOTIS : []
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Bell size={18} />알림</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-neutral-400">아직 알림이 없어요.<br />연결을 마치면 묶음 시간에 맞춰 알려드려요</p>
      ) : (
        <div className="mt-3 divide-y divide-[var(--color-border-soft)]">
          {list.map((n) => (
            <button key={n.id} onClick={() => onGo(n)} className="flex w-full items-center gap-3 py-3 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">{icon[n.kind]}</span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{n.t}</span><span className="block text-[12px] text-neutral-500">{n.d}</span></span>
              <ChevronRight size={14} className="shrink-0 text-neutral-300" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-[11px] text-neutral-400">묶음 시간과 다시 연결이 필요할 때만 알려요. 알림 설정은 설정 버튼에 있어요</p>
    </Sheet>
  )
}

function HiddenSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><EyeOff size={18} />숨긴 계정</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-2 text-[13px] text-neutral-500">광고나 스팸으로 보이는 계정은 알아서 숨겨요. 잘못 숨겼으면 풀어 주세요.</p>
      <div className="mt-3 divide-y divide-[var(--color-border-soft)]">
        {app.hidden.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-3">
            <Avatar name={p.name} size={36} member={false} />
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{p.name}</span><span className="block text-[12px] text-neutral-500">{p.why}</span></span>
            <button onClick={() => { app.unhide(p.id); app.toast('가져온 사람으로 돌려놨어요') }} className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-[12px]">숨김 풀기</button>
          </div>
        ))}
        {app.hidden.length === 0 && <p className="py-6 text-center text-[13px] text-neutral-400">직접 풀 수 있는 계정이 없어요</p>}
      </div>
      <p className="mt-3 text-center text-[11px] text-neutral-400">외 12개는 광고 계정이에요</p>
    </Sheet>
  )
}

/** 허구 인물의 공개 프로필. 목업에서는 이지민, 강민준만 실제 프로필 화면으로 이어진다 */
function Photo({ src, className }: { src: string; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src.startsWith('/') ? <img src={src} alt="" className={`object-cover ${className}`} /> : <div className={className} style={{ background: src }} />
}

function ProfBlock({ title, sub, hidden, children }: { title: string; sub?: ReactNode; hidden?: boolean; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 text-[16px] font-black text-[var(--color-text-strong)]">{title}{hidden && <span className="flex items-center gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500"><Lock size={9} />나만 보기</span>}</h2>
        {sub && <span className="text-[11px] text-neutral-400">{sub}</span>}
      </div>
      {children}
    </section>
  )
}

/**
 * 한 장짜리 프로필. 내 프로필(주인), 다른 사람 프로필(회원이 볼 때), 링크로 들어온 비회원이 볼 때 세 가지 모습.
 * 탭이 없고, 직접 채우는 건 한 줄 소개와 명함뿐이다. 나머지는 인스타 분석과 리멤버 연결, 받은 피드백이 채운다.
 */
function ProfileView({ target, onBack }: { target: Person | 'me'; onBack: () => void }) {
  const app = useApp()
  const { conn, start, join, openInsta, instaDone } = useConnect()
  const add = useAddFound()
  const owner = target === 'me'
  const guest = app.mode === 'guest'
  const p: Person | null = owner ? null : target
  const prof = owner ? app.myProf : profOf(p!)
  const name = owner ? app.me.name : p!.name
  const title = owner ? app.me.title : p!.title
  const img = owner ? app.me.img : p!.img
  const linkId = owner ? app.me.linkId : p!.linkId ?? p!.name.replace('@', '')
  const mine = !owner && !!app.getPerson(p!.id)
  const member = owner || p!.member
  const off = (s: ProfSec) => owner && !app.vis[s]
  const rememberOn = conn.remember.status === 'on'
  const photos = owner && !instaDone ? [] : prof.photos
  const netMax = Math.max(1, ...prof.net.groups.map(([, n]) => n))

  return (
    <div className="pb-36">
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] px-4">
        <button onClick={onBack} aria-label="뒤로"><ChevronLeft size={20} className="text-[var(--color-text-secondary)]" /></button>
        <span className="text-[15px] font-black">{owner ? '내 프로필' : '프로필'}</span>
        <Tag kind="new" />
        <span className="ml-auto flex items-center gap-3 text-[var(--color-text-secondary)]">
          {owner && <button onClick={() => app.openPanel({ k: 'vis' })} aria-label="공개범위"><Eye size={19} /></button>}
          <button onClick={() => app.openShare({ title: `${name}님 프로필 공유`, url: `felore.io/${linkId}`, text: owner ? '받은 사람이 이 링크로 가입하면 서로 내 사람에 추가돼요' : undefined })} aria-label="공유"><Share2 size={19} /></button>
        </span>
      </div>

      <div className="px-5 pt-4">
        {/* 커버: 사진, 이름, 한 줄 소개 */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#25313D]">
          {img && <Photo src={img} className="absolute inset-0 h-full w-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-1.5 text-[28px] font-black leading-tight">{name}{member && <BadgeCheck size={20} />}</div>
            <p className="mt-0.5 text-[13px] opacity-85">{title}</p>
            {prof.line && <p className="mt-2 text-[15px] font-semibold leading-snug">{prof.line}</p>}
            <p className="mt-2 text-[11px] opacity-60">felore.io/{linkId}</p>
          </div>
        </div>

        {guest && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[12px] text-amber-700"><Gift size={14} className="shrink-0" />24시간 안에 가입하면 보너스 재화 5개를 드려요</div>
        )}

        {/* 페르소나: 인스타에서 고른 사진과 키워드가 바이브를 대신한다 */}
        <ProfBlock title="페르소나" sub={owner && !instaDone ? undefined : <span className="flex items-center gap-1"><Sparkles size={11} />AI가 정리했어요</span>} hidden={off('persona')}>
          {prof.word && (owner ? instaDone : true) && <p className="mb-2 text-[19px] font-black leading-snug text-[var(--color-text-strong)]">&ldquo;{prof.word}&rdquo;</p>}
          {(!owner || instaDone) && (
            <>
              <p className="text-[14px] leading-relaxed text-neutral-700">{prof.persona}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{prof.keywords.map((k) => <span key={k} className="rounded-full bg-neutral-100 px-3 py-1 text-[12px]">{k}</span>)}</div>
            </>
          )}
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {photos.slice(0, 3).map((s) => <Photo key={s} src={s} className="aspect-square w-full rounded-xl" />)}
            </div>
          )}
          {owner && !instaDone && (
            <button onClick={openInsta} className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-left text-[13px]">
              <ChannelBadge ch="ig" /><span className="flex-1">인스타를 보여주면 사진과 키워드, 한마디를 채워 드려요</span><ChevronRight size={14} className="text-neutral-300" />
            </button>
          )}
          {photos.length > 0 && <p className="mt-2 text-[11px] text-neutral-400">인스타 피드에서 고른 사진이에요</p>}
        </ProfBlock>

        {/* 케미: 지금 모양을 유지한다. 보는 사람과의 궁합 */}
        {!owner && member && (
          <ProfBlock title={guest ? '나와의 케미' : `${app.me.name}님과의 케미`}>
            {guest ? (
              <button onClick={() => join(true)} className="relative w-full overflow-hidden rounded-2xl border border-[var(--color-border-soft)] p-4 text-left">
                <div className="space-y-2 blur-[5px]">{prof.kemi.rows.map(([k, v]) => <p key={k} className="text-[13px]"><b>{k}</b> {v}</p>)}</div>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold underline">가입하면 나와의 케미가 보여요</span>
              </button>
            ) : (
              <Card onClick={() => app.openPanel({ k: 'kemi', p })}>
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-[#25313D] text-white"><span className="text-[18px] font-black leading-none">{prof.kemi.score}</span><span className="text-[9px] opacity-70">케미</span></span>
                  <div className="min-w-0 flex-1 space-y-1">
                    {prof.kemi.rows.slice(0, 2).map(([k, v]) => <p key={k} className="text-[13px] leading-snug"><span className="font-semibold">{k}</span> <span className="text-neutral-600">{v}</span></p>)}
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-neutral-300" />
                </div>
              </Card>
            )}
          </ProfBlock>
        )}
        {owner && (
          <ProfBlock title="케미">
            <Card onClick={() => app.openPanel({ k: 'kemi', p: null })}>
              <div className="flex items-center gap-3 text-[13px]"><Sparkles size={16} className="shrink-0" /><span className="flex-1">내가 어떤 사람과 잘 맞는지 보기</span><ChevronRight size={16} className="text-neutral-300" /></div>
            </Card>
            <p className="mt-1.5 text-[11px] text-neutral-400">내 프로필을 본 사람에게는 그 사람과 나의 케미가 보여요</p>
          </ProfBlock>
        )}

        {/* 명함: 하는 일, 경력, 학력 */}
        <ProfBlock title="명함" sub={owner && rememberOn ? '리멤버에서 가져옴' : undefined} hidden={off('card')}>
          <Card className="!py-1 divide-y divide-[var(--color-border-soft)]">
            {[...prof.career.map((j) => ({ ...j, kind: '경력' })), ...prof.edu.map((j) => ({ ...j, kind: '학력' }))].map((j) => (
              <div key={j.org + j.role} className="flex items-center gap-3 py-3">
                <span className="w-8 shrink-0 text-[11px] text-neutral-400">{j.kind}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[14px] font-semibold">{j.org}{j.ok && <BadgeCheck size={14} className="text-[#25313D]" />}</div>
                  <div className="text-[12px] text-neutral-500">{j.role}, {j.when}</div>
                </div>
              </div>
            ))}
            {prof.career.length + prof.edu.length === 0 && <p className="py-3 text-[13px] text-neutral-400">{owner ? '아직 적은 경력이 없어요. 프로필 편집에서 적거나 리멤버를 연결해요' : '아직 적은 경력이 없어요'}</p>}
          </Card>
          {owner && !rememberOn && (
            <button onClick={() => start('remember')} className="mt-2 flex w-full items-center gap-2 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-left text-[13px]">
              <ChannelBadge ch="card" /><span className="flex-1">리멤버를 연결하면 경력과 연결된 사람들을 채워 드려요</span><ChevronRight size={14} className="text-neutral-300" />
            </button>
          )}
          {!owner && !guest && member && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([['전화', <Phone key="a" size={14} />], ['메시지', <MessageCircle key="b" size={14} />], ['메일', <Mail key="c" size={14} />]] as [string, ReactNode][]).map(([t, ic]) => (
                <button key={t} onClick={() => app.toast(`${t} 앱을 열었어요 (목업)`)} className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2.5 text-[13px]">{ic}{t}</button>
              ))}
            </div>
          )}
        </ProfBlock>

        {/* 연결된 사람들: 명함으로 이어진 사람들의 분포 */}
        <ProfBlock title="연결된 사람들" sub={owner && !rememberOn ? undefined : `${prof.net.from} ${prof.net.total}명`} hidden={off('net')}>
          {owner && !rememberOn ? (
            <button onClick={() => start('remember')} className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-left text-[13px]">
              <ChannelBadge ch="card" /><span className="flex-1">리멤버를 연결하면 어느 분야 사람을 많이 아는지 보여줘요</span><ChevronRight size={14} className="text-neutral-300" />
            </button>
          ) : (<>
          {!owner && prof.mutual.length > 0 && !guest && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
              <div className="flex -space-x-2">{prof.mutual.map((n) => <div key={n} className="rounded-full ring-2 ring-neutral-50"><Avatar name={n} size={28} /></div>)}</div>
              <p className="text-[13px]"><span className="font-semibold">{prof.mutual.join(', ')}</span>님을 함께 알아요</p>
            </div>
          )}
          <div className="space-y-2">
            {prof.net.groups.map(([g, n]) => (
              <div key={g} className="flex items-center gap-3 text-[12px]">
                <span className="w-14 shrink-0 text-neutral-600">{g}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"><span className="block h-full rounded-full bg-[#25313D]" style={{ width: `${(n / netMax) * 100}%` }} /></span>
                <span className="w-9 shrink-0 text-right text-neutral-400">{n}명</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">누구인지는 보여주지 않고, 어느 분야 사람을 많이 아는지만 보여줘요</p>
          </>)}
        </ProfBlock>

        {/* 평판: 받은 피드백 */}
        <ProfBlock title="평판" sub={`피드백 ${prof.rep.reduce((n, [, c]) => n + c, 0)}개`} hidden={off('rep')}>
          {prof.rep.length === 0 && <p className="rounded-2xl bg-neutral-50 px-4 py-3 text-[13px] text-neutral-400">아직 받은 피드백이 없어요</p>}
          <div className="flex flex-wrap gap-1.5">
            {prof.rep.map(([k, n]) => <span key={k} className="rounded-full border border-neutral-200 px-3 py-1.5 text-[12px]">{k} <b>{n}</b></span>)}
          </div>
          <div className="mt-3 space-y-2">
            {prof.quotes.map((q) => (
              <div key={q.from} className="rounded-2xl bg-neutral-50 px-4 py-3">
                <p className="text-[13px] leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                <p className="mt-1 text-[11px] text-neutral-400">{q.from}</p>
              </div>
            ))}
          </div>
          {owner
            ? <button onClick={() => app.openShare({ title: '피드백 요청 보내기', url: `felore.io/${linkId}`, text: '같이 일해 본 사람에게 보내면 한마디를 남길 수 있어요' })} className="mt-3 w-full rounded-full border border-neutral-200 py-2.5 text-[13px]">피드백 요청 보내기</button>
            : <button onClick={() => (guest ? join(true) : app.openPanel({ k: 'feedback', p: p! }))} className="mt-3 w-full rounded-full border border-neutral-200 py-2.5 text-[13px]">피드백 남기기</button>}
        </ProfBlock>

        {app.planTags && (owner || p!.linkId) && (
          <Link href={`/${owner ? ME.linkId : p!.linkId}?from=v2${owner ? '' : `&person=${p!.id}`}`} className="mt-8 block rounded-2xl bg-amber-50 px-4 py-3 text-center text-[12px] text-amber-700">[기획 확인] 탭 세 개짜리 기존 프로필 화면과 비교하기</Link>
        )}
      </div>

      {/* 아래에 붙는 버튼. 하단 탭 위에 뜬다 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[76px] z-30 px-5 pb-3">
        <div className="pointer-events-auto flex gap-2 rounded-full bg-white/95 p-1.5 pr-[76px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur">
          {owner ? (
            <button onClick={() => app.openPanel({ k: 'editProf' })} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-3 text-[14px] font-semibold text-white"><PenLine size={14} />프로필 편집</button>
          ) : guest ? (
            <button onClick={() => join(true)} className="flex-1 rounded-full bg-[#0D0D0D] py-3 text-[14px] font-semibold text-white">가입하고 내 사람에 추가</button>
          ) : mine ? (
            <button onClick={() => { onBack(); app.openPerson(p!.id) }} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-3 text-[14px] font-semibold text-white"><Lock size={13} />내 인물 카드 보기</button>
          ) : (
            <button onClick={() => add({ ...p!, kind: p!.member ? '펠로어 회원' : '공개 인물' })} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] py-3 text-[14px] font-semibold text-white"><UserPlus size={14} />내 사람에 추가</button>
          )}
        </div>
      </div>
    </div>
  )
}

/** 내 프로필 편집. 직접 적는 건 한 줄 소개와 명함뿐이고, 나머지는 펠로어에게 맡긴다 */
function EditProfSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const { conn, start, openInsta, instaDone } = useConnect()
  const [d, setD] = useState<Prof>(app.myProf)
  const [org, setOrg] = useState('')
  const [role, setRole] = useState('')
  const input = 'w-full rounded-xl border border-neutral-200 px-3 py-3 text-[14px] outline-none focus:border-[#25313D]'
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold">프로필 편집</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <label className="mt-4 block text-[12px] font-semibold text-neutral-500">한 줄 소개</label>
      <input value={d.line} onChange={(e) => setD({ ...d, line: e.target.value })} maxLength={30} className={`mt-1.5 ${input}`} />
      <p className="mt-1 text-right text-[11px] text-neutral-400">{d.line.length}/30</p>

      <label className="mt-2 block text-[12px] font-semibold text-neutral-500">명함</label>
      <div className="mt-1.5 divide-y divide-[var(--color-border-soft)] rounded-xl border border-neutral-200 px-3">
        {d.career.map((j, i) => (
          <div key={j.org + i} className="flex items-center gap-2 py-2.5 text-[13px]">
            <span className="min-w-0 flex-1 truncate"><b>{j.org}</b> {j.role}</span>
            {j.ok ? <span className="shrink-0 text-[11px] text-emerald-600">인증됨</span> : <button onClick={() => setD({ ...d, career: d.career.filter((_, k) => k !== i) })} aria-label="지우기"><X size={14} className="text-neutral-400" /></button>}
          </div>
        ))}
        <div className="flex gap-1.5 py-2.5">
          <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="회사" className="min-w-0 flex-1 rounded-lg bg-neutral-50 px-2.5 py-2 text-[13px] outline-none" />
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="하는 일" className="min-w-0 flex-1 rounded-lg bg-neutral-50 px-2.5 py-2 text-[13px] outline-none" />
          <button disabled={!org.trim()} onClick={() => { setD({ ...d, career: [{ org: org.trim(), role: role.trim() || '재직', when: '지금' }, ...d.career] }); setOrg(''); setRole('') }} className="shrink-0 rounded-lg bg-[#25313D] px-3 text-[12px] font-semibold text-white disabled:opacity-40">추가</button>
        </div>
      </div>

      <p className="mt-5 text-[12px] font-semibold text-neutral-500">펠로어에게 맡기기</p>
      <div className="mt-1.5 divide-y divide-[var(--color-border-soft)] rounded-xl border border-neutral-200 px-3">
        <button onClick={() => { onClose(); openInsta() }} className="flex w-full items-center gap-2 py-3 text-left text-[13px]"><ChannelBadge ch="ig" /><span className="flex-1">{instaDone ? '인스타로 사진과 페르소나 다시 채우기' : '인스타로 사진과 페르소나 채우기'}</span><ChevronRight size={14} className="text-neutral-300" /></button>
        <button onClick={() => { onClose(); if (conn.remember.status !== 'on') start('remember'); else app.toast('리멤버는 이미 연결돼 있어요') }} className="flex w-full items-center gap-2 py-3 text-left text-[13px]"><ChannelBadge ch="card" /><span className="flex-1">{conn.remember.status === 'on' ? '리멤버 연결됨. 경력과 연결된 사람들을 채웠어요' : '리멤버로 경력과 연결된 사람들 채우기'}</span>{conn.remember.status === 'on' ? <Check size={14} className="text-emerald-600" /> : <ChevronRight size={14} className="text-neutral-300" />}</button>
        <button onClick={() => { onClose(); app.openPanel({ k: 'verify' }) }} className="flex w-full items-center gap-2 py-3 text-left text-[13px]"><ShieldCheck size={16} className="text-neutral-500" /><span className="flex-1">경력과 학력 인증하기</span><ChevronRight size={14} className="text-neutral-300" /></button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">취향이나 일상을 따로 적지 않아도 돼요. 인스타에서 고른 사진과 키워드가 대신 보여줘요.</p>
      <div className="mt-5"><PrimaryButton disabled={!d.line.trim()} onClick={() => { app.setMyProf(d); app.toast('프로필을 고쳤어요'); onClose() }}>저장</PrimaryButton></div>
    </Sheet>
  )
}

function VisSheet({ onClose }: { onClose: () => void }) {
  const app = useApp()
  const rows: [ProfSec, string, string][] = [['persona', '페르소나', '한마디, 소개, 키워드, 사진'], ['card', '명함', '경력과 학력'], ['net', '연결된 사람들', '분야별 분포'], ['rep', '평판', '받은 피드백']]
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Eye size={18} />공개범위</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-2 text-[13px] text-neutral-500">구역마다 다른 사람에게 보일지 정해요. 이름과 한 줄 소개는 늘 보여요.</p>
      <div className="mt-3 divide-y divide-[var(--color-border-soft)]">
        {rows.map(([k, t, d]) => (
          <button key={k} onClick={() => app.setVis({ ...app.vis, [k]: !app.vis[k] })} className="flex w-full items-center gap-3 py-3.5 text-left">
            <span className="flex-1"><span className="block text-[14px] font-semibold">{t}</span><span className="block text-[12px] text-neutral-500">{d}</span></span>
            <span className="text-[12px] text-neutral-500">{app.vis[k] ? '공개' : '나만 보기'}</span>
            <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${app.vis[k] ? 'bg-[#25313D]' : 'bg-neutral-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${app.vis[k] ? 'left-[18px]' : 'left-0.5'}`} /></span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">내 인물 카드와 기록은 여기와 상관없이 늘 나만 봐요</p>
    </Sheet>
  )
}

const FB_WORDS = ['믿고 맡길 수 있어요', '말이 잘 통해요', '전문성이 느껴져요', '추진력이 좋아요', '끝까지 챙겨요', '대화하면 생각이 넓어져요']

function FeedbackSheet({ p, onClose }: { p: Person; onClose: () => void }) {
  const app = useApp()
  const [picked, setPicked] = useState<string[]>([])
  const [text, setText] = useState('')
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold">{p.name}님은 어떤 분인가요?</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <p className="mt-1 text-[13px] text-neutral-500">같이 일하거나 만나 본 느낌을 골라 주세요. {p.name}님 프로필의 평판에 더해져요.</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {FB_WORDS.map((w) => {
          const on = picked.includes(w)
          return <button key={w} onClick={() => setPicked((l) => (on ? l.filter((x) => x !== w) : l.length < 3 ? [...l, w] : l))} className={`rounded-full px-3 py-2 text-[13px] ${on ? 'bg-[#25313D] font-semibold text-white' : 'border border-neutral-200'}`}>{w}</button>
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-400">세 개까지 고를 수 있어요</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={80} placeholder="한마디 남기기 (선택)" className="mt-3 w-full rounded-xl border border-neutral-200 p-3 text-[13px] outline-none focus:border-[#25313D]" />
      <div className="mt-4"><PrimaryButton disabled={picked.length === 0} onClick={() => { app.toast(`${p.name}님에게 피드백을 남겼어요`); onClose() }}>남기기</PrimaryButton></div>
    </Sheet>
  )
}

function KemiSheet({ p, onClose }: { p: Person | null; onClose: () => void }) {
  const app = useApp()
  const k = p ? profOf(p).kemi : app.myProf.kemi
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[17px] font-bold"><Sparkles size={18} />{p ? `${p.name}님과의 케미` : '내 케미 리포트'}<Tag kind="old" /></h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      {p && (
        <div className="mt-4 flex items-center justify-center gap-4 rounded-3xl bg-[#25313D] px-5 py-6 text-white">
          <Avatar name={app.me.name} size={48} img={app.me.img} />
          <div className="text-center"><p className="text-[30px] font-black leading-none">{k.score}</p><p className="mt-1 text-[11px] opacity-70">잘 맞는 사이</p></div>
          <Avatar name={p.name} size={48} img={p.img} member={false} />
        </div>
      )}
      <div className="mt-3 space-y-2">
        {k.rows.map(([t, v]) => (
          <Card key={t}><p className="text-[12px] font-semibold text-[#25313D]">{t}</p><p className="mt-0.5 text-[13px] leading-relaxed">{v}</p></Card>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{p ? '두 사람의 페르소나, 명함, 평판으로 계산해요. 대화 내용은 쓰지 않아요.' : '내 페르소나, 명함, 평판으로 계산해요.'}</p>
      {p?.linkId && app.planTags && <Link href={`/${p.linkId}/kemi-report?from=v2&person=${p.id}`} className="mt-3 block rounded-2xl bg-amber-50 px-4 py-3 text-center text-[12px] text-amber-700">[기획 확인] 기존 케미 리포트 화면 보기</Link>}
      <div className="mt-4"><PrimaryButton onClick={onClose}>닫기</PrimaryButton></div>
    </Sheet>
  )
}

/** 할 일과 챙길 사람에서 만든 초안. 바로 보내지 않고 다음 묶음에 올린다 */
function ComposeSheet({ panel, onClose }: { panel: Extract<Panel, { k: 'compose' }>; onClose: () => void }) {
  const app = useApp()
  const p = app.getPerson(panel.personId) ?? personById(panel.personId)
  const [text, setText] = useState(panel.text)
  const ch = talkChannel(p)
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold">{panel.title} 초안</h3>
        <button onClick={onClose}><X size={20} /></button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Avatar name={p.name} size={28} member={p.member} img={p.img} />
        <span className="text-[13px] font-semibold">{p.name}</span>
        <ChannelBadge ch={ch} />
      </div>
      {p.tone && <p className="mt-2 text-[11px] text-neutral-400">말투: {p.tone}</p>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-[13px] leading-relaxed outline-none focus:border-[#25313D]" />
      <p className="mt-1 text-[11px] text-neutral-400">고친 내용은 {p.name}님 말투로 기억해요. 보내기 전에 묶음에서 한 번 더 볼 수 있어요</p>
      <div className="mt-4">
        <PrimaryButton disabled={!text.trim()} onClick={() => {
          app.queueDraft({ ch, personId: p.id, kind: panel.title, original: '', origin: `내가 만든 ${panel.title} 초안`, context: p.note ?? p.met ?? '', text: text.trim() })
          if (panel.todoId) app.doneTodo(panel.todoId, true)
          if (!panel.todoId) app.skipCare(p.id)
          app.toast('다음 묶음에 올려뒀어요')
          onClose()
        }}>다음 묶음에 올리기</PrimaryButton>
      </div>
    </Sheet>
  )
}

const MEET0: MeetSet = { on: false, days: ['월', '화', '수', '목', '금'], from: 10, to: 18, dur: 30 }
const VISIBLE_IMPORTED = IMPORTED.filter((x) => !x.spam)
const SPAM = IMPORTED.filter((x) => x.spam)

export default function V2IaPage() {
  const [tab, setTab] = useState<Tab>('today')
  const [mode, setMode] = useState<Mode>('active')
  const [fromLink, setFromLink] = useState(true)
  const [joinedViaLink, setJoinedViaLink] = useState(false)
  const [personId, setPersonId] = useState<string | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [action, setAction] = useState<FabAction | null>(null)
  const [recordFor, setRecordFor] = useState<string | undefined>()
  const [conn, setConn] = useState<ConnMap>(() => initConn('active'))
  const [hub, setHub] = useState(false)
  const [flow, setFlow] = useState<Src | null>(null)
  const [detail, setDetail] = useState<Src | null>(null)
  const [sort, setSort] = useState(false)
  const [searching, setSearching] = useState(false)
  const [insta, setInsta] = useState(false)
  const [instaDone, setInstaDone] = useState(true)
  const [instaPhotos, setInstaPhotos] = useState(6)
  const [meetLink, setMeetLink] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [uploadInit, setUploadInit] = useState<'kakao' | undefined>()
  const [signup, setSignup] = useState<null | { viaLink: boolean; login?: boolean }>(null)
  const [viewProf, setViewProf] = useState<Person | 'me' | null>(null)
  const [myProf, setMyProf] = useState<Prof>(MY_PROF)
  const [vis, setVis] = useState<Record<ProfSec, boolean>>({ persona: true, card: true, net: true, rep: true })
  const [planTags, setPlanTags] = useState(false)
  const [ask, setAsk] = useState<string | null>(null)

  // 화면끼리 이어지는 데이터
  const [me, setMe] = useState(ME)
  const [people, setPeople] = useState<Person[]>(PEOPLE)
  const [imported, setImported] = useState<ImportedPerson[]>(VISIBLE_IMPORTED)
  const [hidden, setHidden] = useState<ImportedPerson[]>(SPAM)
  const [recs, setRecs] = useState<Record<string, Rec[]>>({})
  const [drafts, setDrafts] = useState<Draft[]>(DRAFTS)
  const [batchTimes, setTimes] = useState<[string, string]>(['오전 10시', '오후 6시'])
  const [batchSt, setBatchSt] = useState<BatchSt>(() => freshBatch(DRAFTS, '오전 10시 묶음'))
  const [queue, setQueue] = useState<Draft[]>([])
  const [todos, setTodos] = useState<Todo[]>(TODOS)
  const [cands, setCands] = useState<MergeQ[]>(ASK.slice(2))
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [careOff, setCareOff] = useState<string[]>([])
  const [callImport, setCallImport] = useState<'ask' | 'working' | 'done' | 'skip'>('ask')
  const [coins, setCoins] = useState(12)
  const [meet, setMeet] = useState<MeetSet>(MEET0)
  const [chat, setChat] = useState<Msg[]>(CHAT_HELLO)
  const [notiSeen, setNotiSeen] = useState(false)
  const [share, setShare] = useState<ShareSpec | null>(null)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [toastMsg, setToastMsg] = useState<{ msg: string; n: number } | null>(null)
  const seq = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  const uid = () => `${Date.now().toString(36)}${++seq.current}`

  const toast = (msg: string) => setToastMsg({ msg, n: ++seq.current })
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2200)
    return () => clearTimeout(t)
  }, [toastMsg])

  /** 상태를 바꾸면 그 상태의 처음 모습으로 돌아간다 */
  const changeMode = (m: Mode) => {
    setMode(m); setPersonId(null); setViewProf(null); setMyProf(m === 'new' ? FRESH_PROF : MY_PROF); setAsk(null); setHub(false); setSort(false); setSearching(false); setFlow(null); setDetail(null); setInsta(false); setMeetLink(false)
    setAction(null); setFabOpen(false); setPanel(null); setShare(null); setSignup(null)
    setConn(initConn(m)); setInstaDone(m === 'active' || m === 'importing'); setOnboarding(m === 'new'); setJoinedViaLink(false)
    setPeople(m === 'new' ? [] : PEOPLE); setImported(m === 'new' || m === 'guest' ? [] : VISIBLE_IMPORTED); setHidden(m === 'new' || m === 'guest' ? [] : SPAM)
    setRecs({}); setDrafts(DRAFTS); setBatchSt(freshBatch(DRAFTS, `${batchTimes[0]} 묶음`)); setQueue([]); setTodos(m === 'active' ? TODOS : [])
    setCands(m === 'active' ? ASK.slice(2) : []); setJoinedIds([]); setCareOff([]); setCallImport('ask'); setCoins(m === 'active' ? 12 : m === 'importing' ? 3 : 0)
    setChat(CHAT_HELLO); setNotiSeen(false); setMeet(MEET0)
    try { sessionStorage.setItem(MODE_KEY, m) } catch {}
  }

  const storeLogin = () => { try { const s = useFeloreStore.getState(); if (!s.isLoggedIn) s.login() } catch {} }
  const finishSignup = (info: { name: string; title: string; linkId: string }, viaLink: boolean) => {
    changeMode('new')
    setMe({ ...ME, ...info })
    setMyProf({ ...FRESH_PROF, line: info.title })
    setJoinedViaLink(viaLink)
    // 가입 축하 3개, 링크로 24시간 안에 가입하면 5개 더
    setCoins(viaLink ? 8 : 3)
    if (viaLink) setPeople([JIMIN])
    setTab('today')
    storeLogin()
  }
  const finishLogin = () => { changeMode('active'); setTab('today'); storeLogin(); toast(`${me.name}님, 다시 만나서 반가워요`) }

  // [임시] 기존 프로필 화면에서 돌아올 때 보던 상태, 탭, 인물 카드를 다시 연다 (/v2?tab=people&person=p6, /v2?signup=1&via=1)
  const booted = useRef(false)
  useEffect(() => {
    // 개발 모드에서는 이 효과가 두 번 돈다. 주소의 값을 한 번 읽고 지우므로 처음 한 번만 처리한다
    if (booted.current) return
    booted.current = true
    clearV2Flow()
    const q = new URLSearchParams(window.location.search)
    let m: Mode = readV2Mode()
    if (q.get('signup')) m = 'guest'
    if (m !== 'active') { changeMode(m); setOnboarding(false) }
    const t = q.get('tab')
    if (t === 'today' || t === 'people' || t === 'me') setTab(t)
    const back = PEOPLE.find((x) => x.id === q.get('person'))
    if (back && m !== 'guest') { if (m === 'new') setPeople([back]); setPersonId(back.id) }
    if (q.get('signup')) setSignup({ viaLink: q.get('via') === '1' })
    if (q.get('open') === 'search') setSearching(true)
    if (q.get('open') === 'noti' && m !== 'guest') { setNotiSeen(true); setPanel({ k: 'noti' }) }
    if (q.get('fab')) setFabOpen(true)
    if (window.location.search) window.history.replaceState(null, '', '/v2')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSend = (d: Draft) => { const s = CH_SRC[d.ch]; return !!s && conn[s].status === 'on' && conn[s].level === 'send' }

  const connectCtx = {
    conn,
    start: (s: Src) => {
      if (mode === 'guest') { setSignup({ viaLink: false }); return }
      if (s === 'kakao') { setUploadInit('kakao'); setRecordFor(undefined); setAction('upload') } else setFlow(s)
    },
    update: (s: Src, patch: Partial<Conn>) => setConn((c) => ({ ...c, [s]: { ...c[s], ...patch } })),
    openHub: () => { setPersonId(null); setHub(true) },
    openSort: mode === 'new' || mode === 'importing' ? () => { setPersonId(null); setHub(false); setOnboarding(false); setSort(true) } : undefined,
    openInsta: () => setInsta(true),
    join: (viaLink?: boolean) => setSignup({ viaLink: !!viaLink }),
    joinedViaLink,
    instaDone,
    instaPhotos,
    finishInsta: (n: number) => { setInstaPhotos(n); setInstaDone(true) },
    openMeetLink: () => setMeetLink(true),
  }

  const addPerson = (p: Person) => {
    setPeople((list) => (list.some((x) => x.id === p.id) ? list : [p, ...list]))
    setImported((list) => list.filter((x) => x.id !== p.id))
  }
  const updatePerson = (id: string, patch: Partial<Person>) => {
    setPeople((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setImported((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  const app: App = {
    mode,
    me,
    people,
    imported,
    hidden,
    getPerson: (id) => people.find((x) => x.id === id),
    addPerson,
    updatePerson,
    promote: (id) => { const x = imported.find((y) => y.id === id); if (x) addPerson(x) },
    hide: (id) => {
      const x = people.find((y) => y.id === id) ?? imported.find((y) => y.id === id)
      if (!x) return
      setPeople((list) => list.filter((y) => y.id !== id))
      setImported((list) => list.filter((y) => y.id !== id))
      setHidden((list) => [{ ...x, why: '내가 숨김' }, ...list.filter((y) => y.id !== id)])
    },
    unhide: (id) => {
      const x = hidden.find((y) => y.id === id)
      if (!x) return
      setHidden((list) => list.filter((y) => y.id !== id))
      setImported((list) => [{ ...x, spam: false }, ...list])
    },
    recs,
    addRec: (ids, r) => setRecs((prev) => { const next = { ...prev }; ids.forEach((id) => { next[id] = [{ ...r, id: uid() }, ...(next[id] ?? [])] }); return next }),
    drafts,
    batchSt,
    setBatchSt: (f) => setBatchSt(f),
    queue,
    queueDraft: (d) => setQueue((q) => [...q, { ...d, id: `q${uid()}` }]),
    loadNextBatch: () => {
      const st = batchSt
      const who = (d: Draft) => (d.unknown ? st.who[d.id] : 'same')
      const handled = (d: Draft) => st.include[d.id] && !!who(d) && who(d) !== 'later' && (canSend(d) || st.copied[d.id])
      // 결정하지 않은 초안은 다음 묶음으로 넘어간다. 누구인지 확인을 마친 것은 다시 묻지 않는다
      const carried = drafts.filter((d) => !handled(d)).map((d) => (d.unknown && who(d) && who(d) !== 'later' ? { ...d, unknown: undefined, personId: who(d) === 'diff' ? `u-${d.id}` : d.personId } : d))
      const next = [...carried, ...queue]
      const label = st.label.startsWith(batchTimes[0]) ? `${batchTimes[1]} 묶음` : `내일 ${batchTimes[0]} 묶음`
      setDrafts(next); setQueue([]); setBatchSt(freshBatch(next, label))
    },
    todos,
    addTodo: (t) => setTodos((list) => [{ ...t, id: `t${uid()}` }, ...list]),
    doneTodo: (id, done) => setTodos((list) => list.map((t) => (t.id === id ? { ...t, done } : t))),
    cands,
    setCands,
    answerCand: (q, a) => {
      if (a === 'same') {
        const hit = people.find((p) => [q.a.h, q.b.h].some((h) => h.includes(p.name) || (p.name.length > 2 && !p.name.startsWith('@') && h.includes(p.name.slice(1)))))
        const accs = [q.a, q.b].filter((x) => x.ch !== 'memo').map((x) => ({ ch: x.ch, handle: x.h, why: '내가 같은 사람이라고 했어요' }))
        if (hit) updatePerson(hit.id, { accounts: [...hit.accounts, ...accs.filter((x) => !hit.accounts.some((y) => y.ch === x.ch))] })
        else addPerson({ id: `n${uid()}`, name: q.b.h, title: '', member: false, met: '', tags: [], accounts: accs, facts: [] })
        toast(`${hit?.name ?? q.b.h}님으로 합쳤어요`)
      }
      setCands((c) => (a === 'later' ? [...c.filter((x) => x !== q), q] : c.filter((x) => x !== q)))
    },
    joinedIds,
    markJoined: (id) => setJoinedIds((l) => (l.includes(id) ? l : [...l, id])),
    careOff,
    skipCare: (id) => setCareOff((l) => (l.includes(id) ? l : [...l, id])),
    notiSeen,
    callImport,
    setCallImport,
    coins,
    addCoins: (n) => setCoins((c) => c + n),
    meet,
    setMeet,
    logout: () => { changeMode('guest'); setTab('today'); toast('로그아웃했어요') },
    batchTimes,
    setBatchTimes: (t) => { setTimes(t); setBatchSt((s) => ({ ...s, label: s.label.startsWith('내일') ? `내일 ${t[0]} 묶음` : s.label.startsWith(batchTimes[1]) ? `${t[1]} 묶음` : `${t[0]} 묶음` })) },
    chat,
    setChat: (f) => setChat(f),
    toast,
    openPerson: (p) => {
      if (typeof p !== 'string' && !people.some((x) => x.id === p.id) && !imported.some((x) => x.id === p.id)) addPerson(p)
      setPanel(null)
      setPersonId(typeof p === 'string' ? p : p.id)
    },
    openAction: (a, pid) => { setFabOpen(false); setUploadInit(undefined); setRecordFor(pid); setAction(a) },
    openShare: (s) => setShare(s),
    openPanel: (p) => { if (p.k === 'noti') setNotiSeen(true); setPanel(p) },
    goTab: (t) => { setPersonId(null); setViewProf(null); setHub(false); setSort(false); setSearching(false); setTab(t) },
    onboarding: mode === 'new' && onboarding,
    openProfile: (t) => { setPanel(null); setViewProf(t) },
    myProf,
    setMyProf,
    vis,
    setVis,
    planTags,
    ask,
    askAgent: (text) => { setAsk(text); if (text !== null) { setFabOpen(false); setAction('chat') } },
  }

  const openPerson = (p: Person) => app.openPerson(p)
  const goTab = app.goTab
  const titles: Record<Tab, string> = { today: '오늘의 제안', people: '내 사람들', me: '마이페이지' }

  const pick = (a: FabAction) => app.openAction(a)
  const closeAction = () => setAction(null)
  const sub = !!personId || !!viewProf || hub || sort || searching
  // 온보딩은 한 화면에 한 가지만: 헤더, 탭, 플로팅 버튼을 잠깐 치운다
  const immersive = mode === 'new' && onboarding && tab === 'today' && !sub

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [tab, personId, viewProf, hub, sort, searching, mode, immersive])

  const onNoti = (n: Noti) => {
    setPanel(null)
    if (n.kind === 'draft' || n.kind === 'call') goTab('today')
    if (n.kind === 'broken') { goTab('today'); setFlow('in') }
    if (n.kind === 'join') { app.markJoined('p3'); setPersonId('p3') }
    if (n.kind === 'feedback') setViewProf('me')
  }

  return (
    <div className="h-dvh overflow-hidden bg-[var(--color-bg-page)]">
      {/* [임시] 기획 확인용. 맨 위에 붙어 상태를 바꾼다 */}
      <V2ModeBar mode={mode} onChange={(m) => { changeMode(m); setTab('today') }}>
        {mode === 'guest' && (
          <label className="ml-1 flex shrink-0 items-center gap-1 text-neutral-600">
            <input type="checkbox" checked={fromLink} onChange={(e) => setFromLink(e.target.checked)} /> 링크로 들어옴
          </label>
        )}
        <label className="ml-1 flex shrink-0 items-center gap-1 text-neutral-600">
          <input type="checkbox" checked={planTags} onChange={(e) => setPlanTags(e.target.checked)} /> 기획 태그
        </label>
      </V2ModeBar>

      <ConnectCtx.Provider value={connectCtx}>
      <AppCtx.Provider value={app}>
      <div className="relative mx-auto flex h-[calc(100dvh-37px)] w-full max-w-[430px] flex-col overflow-hidden bg-[var(--color-bg-page)]">
        <div ref={scroller} className="scrollbar-hide flex-1 overflow-y-auto">
          {viewProf ? (
            <ProfileView target={viewProf} onBack={() => setViewProf(null)} />
          ) : personId ? (
            <PersonDetail key={personId} id={personId} onBack={() => setPersonId(null)} />
          ) : searching ? (
            <FeloreSearch mode={mode} onBack={() => setSearching(false)} openPerson={openPerson} />
          ) : sort ? (
            <SortFlow
              onBack={() => setSort(false)}
              onDone={(later) => {
                // 정리를 마치면 사용 중 상태가 된다. 내가 직접 넣은 사람은 그대로 두고, 묶인 사람들을 더한다
                setSort(false); setMode('active'); setOnboarding(false)
                setPeople((list) => [...list.filter((x) => !PEOPLE.some((y) => y.id === x.id)), ...PEOPLE])
                setImported(VISIBLE_IMPORTED); setHidden(SPAM); setCands(later); setTodos(TODOS)
                try { sessionStorage.setItem(MODE_KEY, 'active') } catch {}
                setTab('people')
                toast('내 사람 58명으로 정리했어요')
              }}
            />
          ) : hub ? (
            <ConnectScreen onBack={() => setHub(false)} onDetail={setDetail} />
          ) : (
            <>
              {!immersive && <Header title={titles[tab]} onSearch={() => setSearching(true)} />}
              {tab === 'today' && <TodayTab mode={mode} openPerson={openPerson} onboarding={onboarding} onOnboardDone={() => setOnboarding(false)} />}
              {tab === 'people' && <PeopleTab mode={mode} openPerson={openPerson} fromLink={fromLink} />}
              {tab === 'me' && <MeTab mode={mode} />}
            </>
          )}
        </div>

        {/* 하단 탭과 어느 화면에서든 같은 자리에 떠 있는 버튼. 기존 프로필 화면에서도 같은 것이 보인다 */}
        {!immersive && <V2TabBar active={sub ? null : tab} onTab={goTab} onFab={() => setFabOpen((v) => !v)} fabOpen={fabOpen} />}

        {fabOpen && <FabMenu onPick={pick} onClose={() => setFabOpen(false)} />}
        {action && mode === 'guest' && <LoginNotice onClose={closeAction} />}
        {action && mode !== 'guest' && (
          <>
            {action === 'chat' && <ChatScreen onClose={closeAction} />}
            {(action === 'memo' || action === 'record') && <RecordSheet key={`${action}-${recordFor ?? ''}`} kind={action} presetId={recordFor} onClose={closeAction} />}
            {action === 'upload' && <UploadSheet key={uploadInit ?? 'menu'} init={uploadInit} onClose={closeAction} />}
          </>
        )}
        {flow && <ConnectFlowSheet key={flow} src={flow} onClose={() => setFlow(null)} />}
        {detail && <ConnectDetailSheet src={detail} onClose={() => setDetail(null)} />}
        {insta && <InstaLinkSheet onClose={() => setInsta(false)} />}
        {meetLink && <MeetLinkSheet onClose={() => setMeetLink(false)} />}
        {panel?.k === 'qr' && <QrSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'verify' && <VerifySheet onClose={() => setPanel(null)} />}
        {panel?.k === 'viewers' && <ViewersSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'batch' && <BatchTimeSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'coin' && <CoinSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'noti' && <NotiSheet onClose={() => setPanel(null)} onGo={onNoti} />}
        {panel?.k === 'hidden' && <HiddenSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'add' && (mode === 'guest' ? <LoginNotice onClose={() => setPanel(null)} /> : <AddPersonSheet onClose={() => setPanel(null)} />)}
        {panel?.k === 'editProf' && <EditProfSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'vis' && <VisSheet onClose={() => setPanel(null)} />}
        {panel?.k === 'feedback' && <FeedbackSheet p={panel.p} onClose={() => setPanel(null)} />}
        {panel?.k === 'kemi' && <KemiSheet p={panel.p} onClose={() => setPanel(null)} />}
        {panel?.k === 'compose' && <ComposeSheet panel={panel} onClose={() => setPanel(null)} />}
        {share && <ShareSheet spec={share} onClose={() => setShare(null)} />}
        {signup && (
          <SignupFlow
            viaLink={signup.viaLink}
            initLogin={signup.login}
            onClose={() => setSignup(null)}
            onDone={(info) => finishSignup(info, signup.viaLink)}
            onLogin={finishLogin}
          />
        )}
        {toastMsg && (
          <div key={toastMsg.n} className="pointer-events-none absolute inset-x-0 bottom-[104px] z-[90] flex justify-center px-6">
            <span className="rounded-full bg-[#25313D] px-4 py-2 text-center text-[12px] leading-snug text-white shadow-lg">{toastMsg.msg}</span>
          </div>
        )}
      </div>
      </AppCtx.Provider>
      </ConnectCtx.Provider>

    </div>
  )
}
