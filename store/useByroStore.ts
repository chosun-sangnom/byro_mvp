'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  OnboardingStep,
  Highlight,
  UserState,
  ContactChannel,
  PublicProfileLife,
  PublicProfileWhoIAm,
  TabVisibility,
  TabVisibilityLevel,
  ConnectionRequest,
  SavedProfile,
  Experience,
} from '@/types'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

function generateRandomLinkId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const STEP_ORDER: OnboardingStep[] = ['login', 'basicinfo', 'profile', 'complete']

interface ByroStore {
  // 인증
  isLoggedIn: boolean
  user: UserState | null

  // 온보딩
  step: OnboardingStep
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
  onboardingName: string
  onboardingNickname: string
  onboardingBirthDate: string
  onboardingShowAge: boolean
  isVerified: boolean
  onboardingTitle: string
  onboardingSchool: string
  linkId: string
  instagramConnected: boolean
  linkedinConnected: boolean
  onboardingContactChannels: ContactChannel[]
  highlights: Highlight[]
  bio: string
  bioMode: 'ai' | 'manual' | null
  selectedBioMethod: 'ai' | 'manual' | null  // Step7 선택 결과

  // 앱
  tabVisibility: TabVisibility
  hlOpenStates: Record<string, boolean>
  primaryHighlightOverrides: Record<string, string>
  snsOpenStates: Record<string, boolean>
  activeArchiveTab: 'connected' | 'recent' | 'requests'
  experienceKeywords: string[]
  experienceMessage: string
  expSubmittedAt: Record<string, number>
  deletedGuestbookIds: string[]

  // 연결
  sentRequestLinkIds: string[]
  connectionRequests: ConnectionRequest[]
  connectedProfiles: SavedProfile[]

  // 경험
  submittedExperiences: Record<string, Experience[]>
  highlightsInitialized: boolean

  // 케미
  kemiComputedProfiles: string[]

  // Actions
  nextStep(): void
  prevStep(): void
  goToStep(step: OnboardingStep): void
  setAgreedTerms(v: boolean): void
  setAgreedPrivacy(v: boolean): void
  setAgreedMarketing(v: boolean): void
  toggleAllAgreed(): void
  setOnboardingBasicInfo(info: { title?: string; school?: string }): void
  setOnboardingNameAndBirth(info: { name: string; nickname: string; birthDate: string; showAge: boolean }): void
  setVerified(v: boolean): void
  setLinkId(id: string): void
  setCustomLinkId(customId: string | null): void
  connectInstagram(): void
  disconnectInstagram(): void
  connectLinkedIn(): void
  disconnectLinkedIn(): void
  setOnboardingContactChannels(channels: ContactChannel[]): void
  addHighlight(h: Omit<Highlight, 'id'>): void
  updateHighlight(id: string, h: Omit<Highlight, 'id'>): void
  removeHighlight(id: string): void
  setHighlightPrimary(categoryId: string, id: string): void
  setBio(bio: string, mode: 'ai' | 'manual'): void
  setSelectedBioMethod(method: 'ai' | 'manual'): void
  completeOnboarding(): void
  login(): void
  logout(): void
  toggleHlOpen(id: string): void
  toggleSnsOpen(id: string): void
  setExperienceKeyword(kw: string): void
  setExperienceMessage(msg: string): void
  clearExperience(): void
  markExpSubmitted(profileId: string): void
  setActiveArchiveTab(tab: 'connected' | 'recent' | 'requests'): void
  updateUserInfo(info: Partial<UserState>): void
  updateUserContactChannels(channels: ContactChannel[]): void
  updateUserWhoIAm(whoIAm: PublicProfileWhoIAm): void
  updateUserLife(life: PublicProfileLife): void
  deleteGuestbookEntry(id: string): void
  updateTabVisibility(tab: keyof TabVisibility, level: TabVisibilityLevel): void
  sendConnectionRequest(linkId: string, name: string, title: string, message: string): void
  cancelConnectionRequest(linkId: string): void
  acceptConnectionRequest(id: string): void
  rejectConnectionRequest(id: string): void
  disconnectProfile(linkId: string): void
  submitExperience(profileLinkId: string, exp: Omit<Experience, 'id' | 'date'>): void
  markKemiComputed(linkId: string): void
  invalidateKemiCache(): void
  // [임시] 목업 데이터로 초기화 — CRUD 연동 전 디자인 검토용. 실제 API 연동 후 제거 예정.
  resetToMockDefaults(): void
  // [임시] 전체 초기화 — 로그인·인증·온보딩 포함 완전 리셋. 실제 API 연동 후 제거 예정.
  resetAll(): void
}

const normalizeSampleUser = (user: UserState | null): UserState | null => {
  if (!user) return null

  const isDefaultSampleUser = user.linkId === SAMPLE_PROFILE.linkId
    || user.name === '강명구'
    || user.name === '강민준'

  if (!isDefaultSampleUser) return user

  return {
    ...user,
    name: SAMPLE_PROFILE.name,
    linkId: SAMPLE_PROFILE.linkId,
    bio: user.bio === 'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강명구입니다. 파트너십을 통해 성장을 만들어가는 것을 즐깁니다.'
      ? SAMPLE_PROFILE.bio
      : user.bio,
    avatarImage: SAMPLE_PROFILE.avatarImage,
    profileImages: SAMPLE_PROFILE.profileImages,
    whoIAm: SAMPLE_PROFILE.whoIAm,
    life: SAMPLE_PROFILE.life,
  }
}

export const useByroStore = create<ByroStore>()(persist((set, get) => ({
  // 인증
  isLoggedIn: false,
  user: null,

  // 온보딩
  step: 'login',
  agreedTerms: false,
  agreedPrivacy: false,
  agreedMarketing: false,
  onboardingName: '',
  onboardingNickname: '',
  onboardingBirthDate: '',
  onboardingShowAge: true,
  isVerified: false,
  onboardingTitle: SAMPLE_PROFILE.title,
  onboardingSchool: SAMPLE_PROFILE.school,
  linkId: '',
  instagramConnected: false,
  linkedinConnected: false,
  onboardingContactChannels: SAMPLE_PROFILE.contactChannels,
  highlights: [],
  bio: '',
  bioMode: null,
  selectedBioMethod: null,

  // 앱
  tabVisibility: { who: 'public', life: 'public', reputation: 'public' } as TabVisibility,
  hlOpenStates: {},
  primaryHighlightOverrides: {},
  snsOpenStates: {},
  activeArchiveTab: 'connected',
  experienceKeywords: [],
  experienceMessage: '',
  expSubmittedAt: {},
  deletedGuestbookIds: [],

  // 연결
  sentRequestLinkIds: [],
  connectionRequests: SAMPLE_PROFILE.connectionRequests as ConnectionRequest[],
  connectedProfiles: SAMPLE_PROFILE.savedProfiles as SavedProfile[],

  // 경험
  submittedExperiences: {},
  highlightsInitialized: false,

  // 케미
  kemiComputedProfiles: [],

  // Actions
  nextStep() {
    const current = get().step
    const idx = STEP_ORDER.indexOf(current)
    if (idx < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[idx + 1] })
    }
  },

  prevStep() {
    const current = get().step
    const idx = STEP_ORDER.indexOf(current)
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1] })
    }
  },

  goToStep(step) {
    set({ step })
  },

  setAgreedTerms(v) {
    set({ agreedTerms: v })
  },

  setAgreedPrivacy(v) {
    set({ agreedPrivacy: v })
  },

  setAgreedMarketing(v) {
    set({ agreedMarketing: v })
  },

  toggleAllAgreed() {
    const { agreedTerms, agreedPrivacy, agreedMarketing } = get()
    const allChecked = agreedTerms && agreedPrivacy && agreedMarketing
    set({
      agreedTerms: !allChecked,
      agreedPrivacy: !allChecked,
      agreedMarketing: !allChecked,
    })
  },

  setOnboardingBasicInfo(info) {
    set((state) => ({
      onboardingTitle: info.title ?? state.onboardingTitle,
      onboardingSchool: info.school ?? state.onboardingSchool,
    }))
  },

  setOnboardingNameAndBirth({ name, nickname, birthDate, showAge }) {
    set({ onboardingName: name, onboardingNickname: nickname, onboardingBirthDate: birthDate, onboardingShowAge: showAge })
  },

  setVerified(v) {
    set({ isVerified: v })
  },

  setLinkId(id) {
    set({ linkId: id })
  },

  setCustomLinkId(customId) {
    const { user } = get()
    if (!user) return
    const randomLinkId = user.randomLinkId ?? user.linkId
    const resolvedLinkId = customId ?? randomLinkId
    set({
      user: { ...user, customLinkId: customId ?? undefined, linkId: resolvedLinkId },
    })
  },

  connectInstagram() {
    set({ instagramConnected: true })
  },

  disconnectInstagram() {
    set({ instagramConnected: false })
  },

  connectLinkedIn() {
    set({ linkedinConnected: true })
  },

  disconnectLinkedIn() {
    set({ linkedinConnected: false })
  },

  setOnboardingContactChannels(channels) {
    set({ onboardingContactChannels: channels })
  },

  addHighlight(h) {
    set((state) => ({
      highlights: [...state.highlights, { ...h, id: uuidv4() }],
    }))
  },

  updateHighlight(id, h) {
    set((state) => ({
      highlights: state.highlights.map((item) => (item.id === id ? { ...h, id } : item)),
    }))
  },

  removeHighlight(id) {
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    }))
  },

  setHighlightPrimary(categoryId, id) {
    set((state) => ({
      primaryHighlightOverrides: {
        ...state.primaryHighlightOverrides,
        [categoryId]: id,
      },
      highlights: state.highlights.map((item) => {
          if (item.categoryId !== categoryId) return item
          if (item.id === id) {
            return {
              ...item,
              metadata: {
                ...item.metadata,
                isPrimary: true,
              },
            }
          }
          return {
            ...item,
            metadata: {
              ...item.metadata,
              isPrimary: false,
            },
          }
        }),
    }))
  },

  setBio(bio, mode) {
    set({ bio, bioMode: mode })
  },

  setSelectedBioMethod(method) {
    set({ selectedBioMethod: method })
  },

  completeOnboarding() {
    const {
      linkId, bio, instagramConnected, linkedinConnected,
      onboardingContactChannels, highlights, onboardingTitle, onboardingSchool,
      highlightsInitialized, onboardingName, onboardingNickname, onboardingBirthDate, onboardingShowAge, isVerified,
    } = get()
    set({
      isLoggedIn: true,
      user: {
        name: onboardingNickname || onboardingName || SAMPLE_PROFILE.name,
        realName: onboardingName || SAMPLE_PROFILE.name,
        activityName: onboardingNickname || undefined,
        activityNameChangedAt: onboardingNickname ? new Date().toISOString() : undefined,
        randomLinkId: generateRandomLinkId(),
        customLinkId: linkId || SAMPLE_PROFILE.linkId,
        isPaidUser: true,
        linkId: linkId || SAMPLE_PROFILE.linkId,
        title: onboardingTitle.trim() || SAMPLE_PROFILE.title,
        headline: SAMPLE_PROFILE.headline,
        school: onboardingSchool.trim() || SAMPLE_PROFILE.school,
        bio: bio || SAMPLE_PROFILE.bio,
        avatarColor: SAMPLE_PROFILE.avatarColor,
        avatarImage: SAMPLE_PROFILE.avatarImage,
        profileImages: SAMPLE_PROFILE.profileImages,
        whoIAm: SAMPLE_PROFILE.whoIAm,
        life: SAMPLE_PROFILE.life,
        birthDate: onboardingBirthDate || SAMPLE_PROFILE.birthDate,
        birthTime: SAMPLE_PROFILE.birthTime,
        calendarType: SAMPLE_PROFILE.calendarType,
        showAge: onboardingBirthDate ? onboardingShowAge : SAMPLE_PROFILE.showAge,
        isVerified,
        contactChannels: onboardingContactChannels,
      },
      highlights: highlightsInitialized ? highlights : SAMPLE_PROFILE.manualHighlights as Highlight[],
      highlightsInitialized: true,
      step: 'login',
    })
    void instagramConnected
    void linkedinConnected
  },

  login() {
    const alreadyInitialized = get().highlightsInitialized
    set({
      isLoggedIn: true,
      user: {
        name: SAMPLE_PROFILE.name,
        linkId: SAMPLE_PROFILE.linkId,
        title: SAMPLE_PROFILE.title,
        headline: SAMPLE_PROFILE.headline,
        school: SAMPLE_PROFILE.school,
        bio: SAMPLE_PROFILE.bio,
        avatarColor: SAMPLE_PROFILE.avatarColor,
        avatarImage: SAMPLE_PROFILE.avatarImage,
        profileImages: SAMPLE_PROFILE.profileImages,
        whoIAm: SAMPLE_PROFILE.whoIAm,
        life: SAMPLE_PROFILE.life,
        birthDate: SAMPLE_PROFILE.birthDate,
        birthTime: SAMPLE_PROFILE.birthTime,
        calendarType: SAMPLE_PROFILE.calendarType,
        showAge: SAMPLE_PROFILE.showAge,
        contactChannels: SAMPLE_PROFILE.contactChannels,
      },
      highlights: alreadyInitialized ? get().highlights : SAMPLE_PROFILE.manualHighlights as Highlight[],
      highlightsInitialized: true,
    })
  },

  logout() {
    set({
      isLoggedIn: false,
      user: null,
      step: 'login',
      agreedTerms: false,
      agreedPrivacy: false,
      agreedMarketing: false,
      onboardingTitle: SAMPLE_PROFILE.title,
      onboardingSchool: SAMPLE_PROFILE.school,
      linkId: '',
      instagramConnected: false,
      linkedinConnected: false,
      onboardingContactChannels: SAMPLE_PROFILE.contactChannels,
      highlights: [],
      primaryHighlightOverrides: {},
      bio: '',
      bioMode: null,
      expSubmittedAt: {},
      sentRequestLinkIds: [],
      connectionRequests: SAMPLE_PROFILE.connectionRequests as ConnectionRequest[],
      connectedProfiles: SAMPLE_PROFILE.savedProfiles as SavedProfile[],
      submittedExperiences: {},
    })
  },

  toggleHlOpen(id) {
    set((state) => ({
      hlOpenStates: { ...state.hlOpenStates, [id]: !state.hlOpenStates[id] },
    }))
  },

  toggleSnsOpen(id) {
    set((state) => ({
      snsOpenStates: { ...state.snsOpenStates, [id]: !state.snsOpenStates[id] },
    }))
  },

  setExperienceKeyword(kw) {
    set((state) => {
      const current = state.experienceKeywords
      if (current.includes(kw)) {
        return { experienceKeywords: current.filter((k) => k !== kw) }
      }
      if (current.length >= 3) return {}
      return { experienceKeywords: [...current, kw] }
    })
  },

  setExperienceMessage(msg) {
    set({ experienceMessage: msg })
  },

  clearExperience() {
    set({ experienceKeywords: [], experienceMessage: '' })
  },

  markExpSubmitted(profileId) {
    set((state) => ({
      expSubmittedAt: { ...state.expSubmittedAt, [profileId]: Date.now() },
    }))
  },

  setActiveArchiveTab(tab) {
    set({ activeArchiveTab: tab })
  },

  updateUserInfo(info) {
    set((state) => ({
      user: state.user ? { ...state.user, ...info } : null,
    }))
  },

  updateUserContactChannels(channels) {
    set((state) => ({
      user: state.user ? { ...state.user, contactChannels: channels } : null,
    }))
  },

  updateUserWhoIAm(whoIAm) {
    set((state) => ({
      user: state.user ? { ...state.user, whoIAm } : null,
      kemiComputedProfiles: [],
    }))
  },

  updateUserLife(life) {
    set((state) => ({
      user: state.user ? { ...state.user, life } : null,
      kemiComputedProfiles: [],
    }))
  },

  deleteGuestbookEntry(id) {
    set((state) => ({
      deletedGuestbookIds: [...state.deletedGuestbookIds, id],
    }))
  },

  updateTabVisibility(tab, level) {
    set((state) => ({
      tabVisibility: { ...state.tabVisibility, [tab]: level },
    }))
  },

  sendConnectionRequest(linkId, _name, _title, _message) {
    set((state) => ({
      sentRequestLinkIds: state.sentRequestLinkIds.includes(linkId)
        ? state.sentRequestLinkIds
        : [...state.sentRequestLinkIds, linkId],
    }))
  },

  cancelConnectionRequest(linkId) {
    set((state) => ({
      sentRequestLinkIds: state.sentRequestLinkIds.filter((id) => id !== linkId),
    }))
  },

  acceptConnectionRequest(id) {
    const request = get().connectionRequests.find((r) => r.id === id)
    if (!request) return
    set((state) => ({
      connectionRequests: state.connectionRequests.filter((r) => r.id !== id),
      connectedProfiles: [
        ...state.connectedProfiles,
        { id: request.id, linkId: request.linkId, name: request.name, title: request.title, memo: '', savedAt: '방금' },
      ],
    }))
  },

  rejectConnectionRequest(id) {
    set((state) => ({
      connectionRequests: state.connectionRequests.filter((r) => r.id !== id),
    }))
  },

  disconnectProfile(linkId) {
    set((state) => ({
      connectedProfiles: state.connectedProfiles.filter((p) => p.linkId !== linkId),
    }))
  },

  markKemiComputed(linkId) {
    set((state) => ({
      kemiComputedProfiles: state.kemiComputedProfiles.includes(linkId)
        ? state.kemiComputedProfiles
        : [...state.kemiComputedProfiles, linkId],
    }))
  },

  invalidateKemiCache() {
    set({ kemiComputedProfiles: [] })
  },

  // [임시] 목업 데이터로 초기화 — CRUD 연동 전 디자인 검토용. 실제 API 연동 후 제거 예정.
  resetToMockDefaults() {
    set({
      // 하이라이트
      highlights: SAMPLE_PROFILE.manualHighlights as Highlight[],
      highlightsInitialized: true,
      primaryHighlightOverrides: {},
      // 연결
      connectionRequests: SAMPLE_PROFILE.connectionRequests as ConnectionRequest[],
      connectedProfiles: SAMPLE_PROFILE.savedProfiles as SavedProfile[],
      sentRequestLinkIds: [],
      // 경험/피드백
      submittedExperiences: {},
      expSubmittedAt: {},
      deletedGuestbookIds: [],
      // 케미
      kemiComputedProfiles: [],
      // UI 상태
      hlOpenStates: {},
      snsOpenStates: {},
      activeArchiveTab: 'connected' as const,
      experienceKeywords: [],
      experienceMessage: '',
      // 탭 공개 설정
      tabVisibility: { who: 'public', life: 'public', reputation: 'public' } as TabVisibility,
    })
  },

  // [임시] 전체 초기화 — 로그인·인증·온보딩 포함 완전 리셋. 실제 API 연동 후 제거 예정.
  resetAll() {
    set({
      isLoggedIn: false,
      user: null,
      step: 'login',
      agreedTerms: false,
      agreedPrivacy: false,
      agreedMarketing: false,
      onboardingName: '',
      onboardingNickname: '',
      onboardingBirthDate: '',
      onboardingShowAge: true,
      isVerified: false,
      onboardingTitle: SAMPLE_PROFILE.title,
      onboardingSchool: SAMPLE_PROFILE.school,
      linkId: '',
      instagramConnected: false,
      linkedinConnected: false,
      onboardingContactChannels: SAMPLE_PROFILE.contactChannels,
      highlights: [],
      highlightsInitialized: false,
      primaryHighlightOverrides: {},
      bio: '',
      bioMode: null,
      selectedBioMethod: null,
      expSubmittedAt: {},
      deletedGuestbookIds: [],
      sentRequestLinkIds: [],
      connectionRequests: SAMPLE_PROFILE.connectionRequests as ConnectionRequest[],
      connectedProfiles: SAMPLE_PROFILE.savedProfiles as SavedProfile[],
      submittedExperiences: {},
      kemiComputedProfiles: [],
      hlOpenStates: {},
      snsOpenStates: {},
      activeArchiveTab: 'connected' as const,
      experienceKeywords: [],
      experienceMessage: '',
      tabVisibility: { who: 'public', life: 'public', reputation: 'public' } as TabVisibility,
    })
  },

  submitExperience(profileLinkId, exp) {
    const newExp: Experience = {
      ...exp,
      id: uuidv4(),
      date: '방금',
    }
    set((state) => ({
      submittedExperiences: {
        ...state.submittedExperiences,
        [profileLinkId]: [newExp, ...(state.submittedExperiences[profileLinkId] ?? [])],
      },
    }))
  },
}), {
  name: 'byro-store',
  version: 15,
  migrate: (persistedState: unknown) => {
    const state = persistedState as ByroStore | undefined
    if (!state) return persistedState
    const persistedStep = state.step as string
    const validSteps: OnboardingStep[] = ['login', 'basicinfo', 'profile', 'complete']
    const migratedStep: OnboardingStep = validSteps.includes(persistedStep as OnboardingStep)
      ? (persistedStep as OnboardingStep)
      : 'login'
    return {
      ...state,
      user: normalizeSampleUser(state.user),
      step: migratedStep,
      onboardingName: (state as ByroStore & { onboardingName?: string }).onboardingName ?? '',
      onboardingNickname: (state as ByroStore & { onboardingNickname?: string }).onboardingNickname ?? '',
      onboardingBirthDate: (state as ByroStore & { onboardingBirthDate?: string }).onboardingBirthDate ?? '',
      onboardingShowAge: (state as ByroStore & { onboardingShowAge?: boolean }).onboardingShowAge ?? true,
      isVerified: (state as ByroStore & { isVerified?: boolean }).isVerified ?? false,
    }
  },
  partialize: (state) => ({
    isLoggedIn: state.isLoggedIn,
    user: normalizeSampleUser(state.user),
    step: state.step,
    agreedTerms: state.agreedTerms,
    agreedPrivacy: state.agreedPrivacy,
    agreedMarketing: state.agreedMarketing,
    onboardingName: state.onboardingName,
    onboardingNickname: state.onboardingNickname,
    onboardingBirthDate: state.onboardingBirthDate,
    onboardingShowAge: state.onboardingShowAge,
    isVerified: state.isVerified,
    onboardingTitle: state.onboardingTitle,
    onboardingSchool: state.onboardingSchool,
    linkId: state.linkId,
    instagramConnected: state.instagramConnected,
    linkedinConnected: state.linkedinConnected,
    onboardingContactChannels: state.onboardingContactChannels,
    highlights: state.highlights,
    bio: state.bio,
    bioMode: state.bioMode,
    selectedBioMethod: state.selectedBioMethod,
    hlOpenStates: state.hlOpenStates,
    primaryHighlightOverrides: state.primaryHighlightOverrides,
    snsOpenStates: state.snsOpenStates,
    activeArchiveTab: state.activeArchiveTab,
    experienceKeywords: state.experienceKeywords,
    experienceMessage: state.experienceMessage,
    expSubmittedAt: state.expSubmittedAt,
    deletedGuestbookIds: state.deletedGuestbookIds,
    tabVisibility: state.tabVisibility,
    sentRequestLinkIds: state.sentRequestLinkIds,
    connectionRequests: state.connectionRequests,
    connectedProfiles: state.connectedProfiles,
    submittedExperiences: state.submittedExperiences,
    highlightsInitialized: state.highlightsInitialized,
    kemiComputedProfiles: state.kemiComputedProfiles,
  }),
}))
