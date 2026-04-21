'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { OnboardingStep, Highlight, UserState, ContactChannel } from '@/types'
import { SAMPLE_PROFILE } from '@/lib/mockData'

const STEP_ORDER: OnboardingStep[] = [
  'login', 'verify', 'linkid', 'keywords', 'sns', 'highlight', 'bio-select', 'bio-ai', 'complete',
]

interface ByroStore {
  // 인증
  isLoggedIn: boolean
  user: UserState | null

  // 온보딩
  step: OnboardingStep
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
  linkId: string
  selectedKeywords: string[]      // max 10
  instagramConnected: boolean
  linkedinConnected: boolean
  highlights: Highlight[]
  bio: string
  bioMode: 'ai' | 'manual' | null
  selectedBioMethod: 'ai' | 'manual' | null  // Step7 선택 결과

  // 앱
  bookmarkedProfiles: string[]
  hlOpenStates: Record<string, boolean>
  snsOpenStates: Record<string, boolean>
  activeArchiveTab: 'saved' | 'recent' | 'requests'
  experienceKeywords: string[]
  experienceMessage: string
  expSubmittedProfiles: string[]

  // Actions
  nextStep(): void
  prevStep(): void
  goToStep(step: OnboardingStep): void
  setAgreedTerms(v: boolean): void
  setAgreedPrivacy(v: boolean): void
  setAgreedMarketing(v: boolean): void
  toggleAllAgreed(): void
  setLinkId(id: string): void
  toggleKeyword(kw: string): void
  connectInstagram(): void
  disconnectInstagram(): void
  connectLinkedIn(): void
  disconnectLinkedIn(): void
  addHighlight(h: Omit<Highlight, 'id'>): void
  updateHighlight(id: string, h: Omit<Highlight, 'id'>): void
  removeHighlight(id: string): void
  setBio(bio: string, mode: 'ai' | 'manual'): void
  setSelectedBioMethod(method: 'ai' | 'manual'): void
  completeOnboarding(): void
  login(): void
  logout(): void
  toggleBookmark(id: string): void
  toggleHlOpen(id: string): void
  toggleSnsOpen(id: string): void
  setExperienceKeyword(kw: string): void
  setExperienceMessage(msg: string): void
  clearExperience(): void
  markExpSubmitted(profileId: string): void
  setActiveArchiveTab(tab: 'saved' | 'recent' | 'requests'): void
  updateUserInfo(info: Partial<UserState>): void
  updateUserKeywords(keywords: string[]): void
  updateUserContactChannels(channels: ContactChannel[]): void
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
  linkId: '',
  selectedKeywords: [],
  instagramConnected: false,
  linkedinConnected: false,
  highlights: [],
  bio: '',
  bioMode: null,
  selectedBioMethod: null,

  // 앱
  bookmarkedProfiles: [],
  hlOpenStates: {},
  snsOpenStates: {},
  activeArchiveTab: 'saved',
  experienceKeywords: [],
  experienceMessage: '',
  expSubmittedProfiles: [],

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

  setLinkId(id) {
    set({ linkId: id })
  },

  toggleKeyword(kw) {
    const { selectedKeywords } = get()
    if (selectedKeywords.includes(kw)) {
      set({ selectedKeywords: selectedKeywords.filter((k) => k !== kw) })
    } else {
      if (selectedKeywords.length >= 10) {
        return // caller handles toast
      }
      set({ selectedKeywords: [...selectedKeywords, kw] })
    }
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

  setBio(bio, mode) {
    set({ bio, bioMode: mode })
  },

  setSelectedBioMethod(method) {
    set({ selectedBioMethod: method })
  },

  completeOnboarding() {
    const { linkId, bio, selectedKeywords, instagramConnected, linkedinConnected, highlights } = get()
    set({
      isLoggedIn: true,
      user: {
        name: SAMPLE_PROFILE.name,
        linkId: linkId || SAMPLE_PROFILE.linkId,
        title: SAMPLE_PROFILE.title,
        school: SAMPLE_PROFILE.school,
        bio: bio || SAMPLE_PROFILE.bio,
        selectedKeywords: selectedKeywords.length > 0 ? selectedKeywords : SAMPLE_PROFILE.selectedKeywords,
        avatarColor: SAMPLE_PROFILE.avatarColor,
        avatarImage: SAMPLE_PROFILE.avatarImage,
        contactChannels: SAMPLE_PROFILE.contactChannels,
      },
      step: 'login',
    })
    void instagramConnected
    void linkedinConnected
    void highlights
  },

  login() {
    set({
      isLoggedIn: true,
      user: {
        name: SAMPLE_PROFILE.name,
        linkId: SAMPLE_PROFILE.linkId,
        title: SAMPLE_PROFILE.title,
        school: SAMPLE_PROFILE.school,
        bio: SAMPLE_PROFILE.bio,
        selectedKeywords: SAMPLE_PROFILE.selectedKeywords,
        avatarColor: SAMPLE_PROFILE.avatarColor,
        avatarImage: SAMPLE_PROFILE.avatarImage,
        contactChannels: SAMPLE_PROFILE.contactChannels,
      },
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
      linkId: '',
      selectedKeywords: [],
      instagramConnected: false,
      linkedinConnected: false,
      highlights: [],
      bio: '',
      bioMode: null,
      expSubmittedProfiles: [],
    })
  },

  toggleBookmark(id) {
    set((state) => ({
      bookmarkedProfiles: state.bookmarkedProfiles.includes(id)
        ? state.bookmarkedProfiles.filter((b) => b !== id)
        : [...state.bookmarkedProfiles, id],
    }))
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
      if (current.length >= 5) return {}
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
      expSubmittedProfiles: [...state.expSubmittedProfiles, profileId],
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

  updateUserKeywords(keywords) {
    set((state) => ({
      user: state.user ? { ...state.user, selectedKeywords: keywords } : null,
    }))
  },

  updateUserContactChannels(channels) {
    set((state) => ({
      user: state.user ? { ...state.user, contactChannels: channels } : null,
    }))
  },
}), {
  name: 'byro-store',
  partialize: (state) => ({
    isLoggedIn: state.isLoggedIn,
    user: state.user,
    step: state.step,
    agreedTerms: state.agreedTerms,
    agreedPrivacy: state.agreedPrivacy,
    agreedMarketing: state.agreedMarketing,
    linkId: state.linkId,
    selectedKeywords: state.selectedKeywords,
    instagramConnected: state.instagramConnected,
    linkedinConnected: state.linkedinConnected,
    highlights: state.highlights,
    bio: state.bio,
    bioMode: state.bioMode,
    selectedBioMethod: state.selectedBioMethod,
    bookmarkedProfiles: state.bookmarkedProfiles,
    hlOpenStates: state.hlOpenStates,
    snsOpenStates: state.snsOpenStates,
    activeArchiveTab: state.activeArchiveTab,
    experienceKeywords: state.experienceKeywords,
    experienceMessage: state.experienceMessage,
    expSubmittedProfiles: state.expSubmittedProfiles,
  }),
}))
