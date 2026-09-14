'use client'

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera, ImagePlus, Plus } from 'lucide-react'
import { BottomSheet, Button, NavBar, showToast, TextArea } from '@/components/ui'
import { VibeImage, VibeKindBadge, VibeKindIcon } from '@/components/screens/profile/vibeCardParts'
import { readImageFileAsDataUrl } from '@/lib/imageFile'
import {
  addVibeItem,
  EMPTY_LIFE,
  flattenVibe,
  hasMediaLabel,
  removeVibeEntry,
  updateVibeCaption,
  VIBE_CAPTION_MAX,
  VIBE_GROUPS,
  VIBE_KIND_META,
  type MediaKind,
  type NewVibeItem,
  type VibeEntry,
  type VibeGroup,
  type VibeKind,
} from '@/lib/vibeItems'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { LifeMediaItem, PublicProfileLife } from '@/types'
import { ExercisePicker, resolveExerciseImage } from './ExercisePicker'
import { MediaSearchPicker } from './MediaSearchPicker'
import { MusicSearchPicker } from './MusicSearchPicker'
import { PlacePicker } from './PlacePicker'

const PET_OPTIONS = ['강아지', '고양이', '기타']

const GROUP_ICON_KIND: Record<VibeGroup, VibeKind> = {
  content: 'movie',
  place: 'restaurant',
  exercise: 'exercise',
  pet: 'pet',
  photo: 'photo',
}

function Shell({
  onBack,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  onBack: () => void
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onClose} />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-5 pt-2">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">{title}</h1>
          {subtitle && <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#475058]">{subtitle}</p>}
        </div>
        {children}
      </div>
      {footer && <div className="px-5 pb-6 pt-3">{footer}</div>}
    </div>
  )
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="rounded-full px-4 py-2 text-[14px] font-semibold transition-colors"
            style={{
              backgroundColor: active ? 'var(--color-accent-dark)' : '#F5F6F7',
              color: active ? '#fff' : '#6C7786',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── 추가 플로우: 무엇을 → 고르기 → 설명 ─────────────────────────────────────

type AddStep = 'group' | 'pick' | 'caption'

const CONTENT_KINDS: Array<{ id: MediaKind; label: string }> = [
  { id: 'movie', label: '영화' },
  { id: 'music', label: '음악' },
  { id: 'book', label: '책' },
  { id: 'play', label: '공연' },
]

const PLACE_KINDS: Array<{ id: MediaKind; label: string }> = [
  { id: 'restaurant', label: '맛집' },
  { id: 'cafe', label: '카페' },
]

function previewOf(draft: NewVibeItem): Pick<VibeEntry, 'kind' | 'imageUrl' | 'label' | 'sublabel'> {
  if (draft.kind === 'pet') {
    return { kind: 'pet', imageUrl: draft.pet.image, label: draft.pet.name ?? draft.pet.type, sublabel: draft.pet.name ? draft.pet.type : undefined }
  }
  if (draft.kind === 'photo') return { kind: 'photo', imageUrl: draft.photo.url }
  return { kind: draft.kind, imageUrl: draft.item.posterUrl, label: draft.item.label, sublabel: draft.item.sublabel }
}

function VibeAddFlow({
  life,
  onCancel,
  onAdd,
}: {
  life: PublicProfileLife
  onCancel: () => void
  onAdd: (draft: NewVibeItem) => void
}) {
  const [step, setStep] = useState<AddStep>('group')
  const [group, setGroup] = useState<VibeGroup>('content')
  const [contentKind, setContentKind] = useState<MediaKind>('movie')
  const [placeKind, setPlaceKind] = useState<MediaKind>('restaurant')
  const [draft, setDraft] = useState<NewVibeItem | null>(null)
  const [caption, setCaption] = useState('')
  const [petType, setPetType] = useState(PET_OPTIONS[0])
  const [petName, setPetName] = useState('')
  const [petImage, setPetImage] = useState<string>()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const petInputRef = useRef<HTMLInputElement>(null)
  const exerciseInputRef = useRef<HTMLInputElement>(null)

  const goBack = () => {
    if (step === 'caption') setStep(group === 'photo' ? 'group' : 'pick')
    else if (step === 'pick') setStep('group')
    else onCancel()
  }

  const readImage = async (e: ChangeEvent<HTMLInputElement>): Promise<string | undefined> => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return undefined
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요', 'error')
      return undefined
    }
    try {
      return await readImageFileAsDataUrl(file)
    } catch {
      showToast('사진을 불러오지 못했어요', 'error')
      return undefined
    }
  }

  const pickGroup = (next: VibeGroup) => {
    setGroup(next)
    setCaption('')
    if (next === 'photo') {
      photoInputRef.current?.click()
      return
    }
    setStep('pick')
  }

  const pickMedia = (kind: MediaKind, items: LifeMediaItem[]) => {
    const picked = items[items.length - 1]
    if (!picked) return
    if (hasMediaLabel(life, kind, picked.label)) {
      showToast('이미 추가한 항목이에요', 'error')
      return
    }
    const item = kind === 'exercise' ? { ...picked, posterUrl: picked.posterUrl ?? resolveExerciseImage(picked.label) } : picked
    setDraft({ kind, item })
    setStep('caption')
  }

  const photoInput = (
    <input
      ref={photoInputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      onChange={async (e) => {
        const url = await readImage(e)
        if (!url) return
        setDraft({ kind: 'photo', photo: { url } })
        setStep('caption')
      }}
    />
  )

  if (step === 'group') {
    return (
      <Shell title="무엇을 올릴까요?" subtitle="카드 한 장에 하나씩 올려요." onBack={goBack} onClose={onCancel}>
        {photoInput}
        <div className="grid grid-cols-2 gap-2.5 px-5 pb-8 pt-6">
          {VIBE_GROUPS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickGroup(item.id)}
              className={[
                'flex flex-col items-start gap-3 rounded-[20px] border border-[#DEE4EC] bg-white p-4 text-left transition-colors active:bg-[#F5F6F7]',
                i === VIBE_GROUPS.length - 1 && VIBE_GROUPS.length % 2 === 1 ? 'col-span-2' : '',
              ].join(' ')}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: `${VIBE_KIND_META[GROUP_ICON_KIND[item.id]].color}1F` }}
              >
                <VibeKindIcon kind={GROUP_ICON_KIND[item.id]} size={22} />
              </span>
              <span>
                <span className="block text-[16px] font-bold text-[#0D0D0D]">{item.label}</span>
                <span className="mt-0.5 block text-[12px] font-medium text-[#6C7786]">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Shell>
    )
  }

  if (step === 'pick') {
    if (group === 'pet') {
      return (
        <Shell
          title="반려동물을 소개해주세요"
          onBack={goBack}
          onClose={onCancel}
          footer={
            <Button
              onClick={() => {
                setDraft({ kind: 'pet', pet: { id: `pet-${Date.now()}`, type: petType, name: petName.trim() || undefined, image: petImage } })
                setStep('caption')
              }}
            >
              다음
            </Button>
          }
        >
          <div className="space-y-6 px-5 pb-8 pt-6">
            <div>
              <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">종류</p>
              <Chips options={PET_OPTIONS.map((o) => ({ id: o, label: o }))} value={petType} onChange={setPetType} />
            </div>
            <div>
              <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">이름 (선택)</p>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="예: 보리"
                maxLength={20}
                className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
              />
            </div>
            <div>
              <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">사진 (선택)</p>
              <input
                ref={petInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const url = await readImage(e)
                  if (url) setPetImage(url)
                }}
              />
              <button
                type="button"
                onClick={() => petInputRef.current?.click()}
                className="relative flex h-[140px] w-[140px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-[#F5F6F7]"
              >
                {petImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={petImage} alt="반려동물" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <ImagePlus size={28} className="text-[#A8B1BD]" />
                    <span className="text-[13px] font-semibold text-[#25313D]">눌러서 등록</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Shell>
      )
    }

    const title = group === 'content' ? '어떤 콘텐츠인가요?' : group === 'place' ? '어떤 장소인가요?' : '어떤 운동을 즐기나요?'
    return (
      <Shell title={title} onBack={goBack} onClose={onCancel}>
        <div className="space-y-5 px-5 pb-10 pt-6">
          {group === 'content' && <Chips options={CONTENT_KINDS} value={contentKind} onChange={setContentKind} />}
          {group === 'place' && <Chips options={PLACE_KINDS} value={placeKind} onChange={setPlaceKind} />}

          {group === 'content' && contentKind === 'music' && (
            <MusicSearchPicker key="music" selected={[]} onChange={(items) => pickMedia('music', items)} />
          )}
          {group === 'content' && contentKind !== 'music' && (
            <MediaSearchPicker
              key={contentKind}
              type={contentKind as 'movie' | 'book' | 'play'}
              selected={[]}
              onChange={(items) => pickMedia(contentKind, items)}
            />
          )}
          {group === 'place' && (
            <PlacePicker
              key={placeKind}
              type={placeKind as 'restaurant' | 'cafe'}
              selected={[]}
              onChange={(items) => pickMedia(placeKind, items)}
            />
          )}
          {group === 'exercise' && <ExercisePicker selected={[]} onChange={(items) => pickMedia('exercise', items)} />}
        </div>
      </Shell>
    )
  }

  if (!draft) return null
  const preview = previewOf(draft)
  const meta = VIBE_KIND_META[preview.kind]

  return (
    <Shell
      title="한 줄 설명을 남겨보세요"
      subtitle="선택이에요. 나중에 추가해도 돼요."
      onBack={goBack}
      onClose={onCancel}
      footer={<Button onClick={() => onAdd(withCaption(draft, caption))}>추가하기</Button>}
    >
      {photoInput}
      <div className="space-y-5 px-5 pb-8 pt-6">
        <div className="flex items-center gap-3 rounded-[20px] border border-[#DEE4EC] p-3">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px]">
            <VibeImage entry={preview} />
          </div>
          <div className="min-w-0 flex-1">
            <VibeKindBadge kind={preview.kind} />
            {preview.label && <p className="mt-1.5 truncate text-[15px] font-bold text-[#0D0D0D]">{preview.label}</p>}
            {preview.sublabel && <p className="truncate text-[12px] text-[#6C7786]">{preview.sublabel}</p>}
          </div>
          {draft.kind === 'exercise' && (
            <>
              <input
                ref={exerciseInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const url = await readImage(e)
                  if (url) setDraft({ kind: 'exercise', item: { ...draft.item, posterUrl: url } })
                }}
              />
              <button
                type="button"
                onClick={() => exerciseInputRef.current?.click()}
                className="flex shrink-0 items-center gap-1 rounded-full bg-[#F5F6F7] px-3 py-1.5 text-[12px] font-semibold text-[#25313D]"
              >
                <Camera size={12} />
                내 사진
              </button>
            </>
          )}
        </div>
        <TextArea
          value={caption}
          onChange={setCaption}
          placeholder={meta.captionPlaceholder}
          maxLength={VIBE_CAPTION_MAX}
          rows={5}
        />
      </div>
    </Shell>
  )
}

function withCaption(draft: NewVibeItem, caption: string): NewVibeItem {
  const value = caption.trim() || undefined
  if (draft.kind === 'pet') return { kind: 'pet', pet: { ...draft.pet, caption: value } }
  if (draft.kind === 'photo') return { kind: 'photo', photo: { ...draft.photo, caption: value } }
  return { kind: draft.kind, item: { ...draft.item, caption: value } }
}

// ─── 허브: 내 바이브 카드 그리드 ─────────────────────────────────────────────

function ManageCard({ entry, onClick }: { entry: VibeEntry; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col text-left">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[14px]">
        <VibeImage entry={entry} />
        <div className="absolute left-1.5 top-1.5">
          <VibeKindBadge kind={entry.kind} />
        </div>
      </div>
      {entry.label && <p className="mt-1.5 truncate text-[12px] font-semibold text-[#0D0D0D]">{entry.label}</p>}
      {entry.caption ? (
        <p className="truncate text-[11px] text-[#6C7786]">{entry.caption}</p>
      ) : (
        <p className="text-[11px] font-semibold text-[var(--color-accent-dark)]">+ 설명 추가</p>
      )}
    </button>
  )
}

function EditEntrySheet({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: VibeEntry | null
  onClose: () => void
  onSave: (entry: VibeEntry, caption: string) => void
  onDelete: (entry: VibeEntry) => void
}) {
  const [caption, setCaption] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)

  if (entry && loadedKey !== entry.key) {
    setLoadedKey(entry.key)
    setCaption(entry.caption ?? '')
    setConfirmDelete(false)
  }

  return (
    <BottomSheet open={entry !== null} onClose={onClose}>
      {entry && (
        <div className="flex flex-col gap-5 px-5 pb-6">
          {entry.kind === 'photo' ? (
            <div className="overflow-hidden rounded-[16px] bg-[#F5F6F7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.imageUrl} alt="" className="max-h-[36vh] w-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px]">
                <VibeImage entry={entry} iconSize={20} />
              </div>
              <div className="min-w-0 flex-1">
                <VibeKindBadge kind={entry.kind} />
                <p className="mt-1 truncate text-[15px] font-bold text-[#0D0D0D]">{entry.label}</p>
                {entry.sublabel && <p className="truncate text-[12px] text-[#6C7786]">{entry.sublabel}</p>}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">설명</p>
            <TextArea
              value={caption}
              onChange={setCaption}
              placeholder={VIBE_KIND_META[entry.kind].captionPlaceholder}
              maxLength={VIBE_CAPTION_MAX}
              rows={4}
            />
          </div>
          <Button onClick={() => onSave(entry, caption)}>저장</Button>
          <button
            type="button"
            onClick={() => (confirmDelete ? onDelete(entry) : setConfirmDelete(true))}
            className="text-[14px] font-semibold text-[#FF4242]"
          >
            {confirmDelete ? '한 번 더 누르면 삭제돼요' : '카드 삭제'}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

export function LifeManageScreen({ onBack }: { onBack: () => void }) {
  const store = useFeloreStore()
  const life = store.user?.life ?? EMPTY_LIFE
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<VibeEntry | null>(null)
  const entries = flattenVibe(life)

  if (adding) {
    return (
      <VibeAddFlow
        life={life}
        onCancel={() => setAdding(false)}
        onAdd={(draft) => {
          store.updateUserLife(addVibeItem(life, draft))
          setAdding(false)
          showToast('바이브에 추가됐어요')
        }}
      />
    )
  }

  return (
    <Shell
      title="바이브 편집"
      subtitle="좋아하는 것을 카드로 올리고, 왜 좋은지 한 줄씩 남겨보세요."
      onBack={onBack}
      onClose={onBack}
    >
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 px-5 pb-10 pt-6">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#CBD3DE] bg-white transition-colors active:bg-[#F5F6F7]"
        >
          <Plus size={22} className="text-[#6C7786]" />
          <span className="text-[12px] font-semibold text-[#6C7786]">카드 추가</span>
        </button>
        {entries.map((entry) => (
          <ManageCard key={entry.key} entry={entry} onClick={() => setEditing(entry)} />
        ))}
      </div>
      {entries.length === 0 && (
        <p className="px-5 text-center text-[13px] leading-[1.6] text-[#A8B1BD]">
          영화 한 편, 단골 카페 하나, 반려동물 사진 한 장부터 시작해보세요.
        </p>
      )}

      <EditEntrySheet
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(entry, caption) => {
          store.updateUserLife(updateVibeCaption(life, entry, caption))
          setEditing(null)
          showToast('설명이 저장됐어요')
        }}
        onDelete={(entry) => {
          store.updateUserLife(removeVibeEntry(life, entry))
          setEditing(null)
          showToast('카드를 삭제했어요')
        }}
      />
    </Shell>
  )
}
