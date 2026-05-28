'use client'

// [임시] OCR 결과 프리뷰 시트 — /api/ocr 응답을 받아 하이라이트로 저장
// 실제 운영 시 저장 후 피드백 애니메이션, 중복 체크 등 추가 예정

import { useEffect, useState } from 'react'
import { Briefcase, BookOpen, CheckCircle, Circle } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import type { OcrCareer, OcrEducation, OcrResult } from '@/types'
import { useByroStore } from '@/store/useByroStore'

type CareerItem = { type: 'career'; data: OcrCareer; selected: boolean }
type EducationItem = { type: 'education'; data: OcrEducation; selected: boolean }
type PreviewItem = CareerItem | EducationItem

function careerLabel(c: OcrCareer) {
  const period = c.endYear ? `${c.startYear} - ${c.endYear}` : `${c.startYear} - 현재`
  return { title: c.company, sub: c.role, period }
}

function educationLabel(e: OcrEducation) {
  const degreeStr = e.degree ? ` · ${e.degree}` : ''
  const period = e.status === '재학' ? `${e.startYear} - 현재` : `${e.startYear} - ${e.endYear}`
  return { title: e.school, sub: `${e.major}${degreeStr}`, period }
}

export function OcrPreviewSheet({
  open,
  onClose,
  result,
}: {
  open: boolean
  onClose: () => void
  result: OcrResult | null
}) {
  const store = useByroStore()
  const [items, setItems] = useState<PreviewItem[]>([])

  useEffect(() => {
    if (!result) return
    setItems([
      ...result.careers.map((c): CareerItem => ({ type: 'career', data: c, selected: true })),
      ...result.educations.map((e): EducationItem => ({ type: 'education', data: e, selected: true })),
    ])
  }, [result])

  const toggle = (index: number) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item))
  }

  const handleSave = () => {
    const selectedItems = items.filter((item) => item.selected)
    if (selectedItems.length === 0) return

    selectedItems.forEach((item) => {
      if (item.type === 'career') {
        const c = item.data
        store.addHighlight({
          categoryId: 'career-role',
          icon: 'briefcase',
          title: c.company,
          subtitle: '경력 · OCR 자동 입력',
          description: '',
          year: c.endYear ? `${c.startYear} - ${c.endYear}` : `${c.startYear} - 현재`,
          metadata: {
            role: c.role,
            status: c.status,
            startYear: c.startYear,
            endYear: c.status === '종료' ? c.endYear : '',
          },
        })
      } else {
        const e = item.data
        store.addHighlight({
          categoryId: 'education-history',
          icon: 'book-open',
          title: e.school,
          subtitle: `학력 · ${e.schoolType}`,
          description: '',
          year: e.status === '재학' ? `${e.startYear} - 현재` : `${e.startYear} - ${e.endYear}`,
          metadata: {
            role: e.major,
            degree: e.degree,
            schoolType: e.schoolType,
            status: e.status,
            startYear: e.startYear,
            endYear: e.status === '재학' ? '' : e.endYear,
          },
        })
      }
    })

    showToast(`${selectedItems.length}개 하이라이트에 추가됐어요!`)
    onClose()
  }

  const isEmpty = !result || (result.careers.length === 0 && result.educations.length === 0)
  const selectedCount = items.filter((i) => i.selected).length

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            {result?.source === 'linkedin' ? 'LinkedIn' : result?.source === 'remember' ? 'Remember' : '스크린샷'} 분석 결과
          </p>
          <h3 className="mt-1.5 text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
            {isEmpty ? '추출된 정보가 없어요' : '하이라이트에 추가할 항목을 선택하세요'}
          </h3>
          {!isEmpty && (
            <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
              항목을 탭해서 선택/해제할 수 있어요
            </p>
          )}
        </div>

        {isEmpty ? (
          <div className="rounded-[20px] px-4 py-8 text-center" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
            <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
              링크드인이나 리멤버 프로필 화면 스크린샷을 올려주세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const label = item.type === 'career' ? careerLabel(item.data) : educationLabel(item.data)
              const Icon = item.type === 'career' ? Briefcase : BookOpen
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-start gap-3 rounded-[20px] px-4 py-4 text-left transition-opacity"
                  style={{
                    background: item.selected ? 'var(--color-accent-bg-subtle)' : 'var(--color-bg-soft)',
                    border: `1px solid ${item.selected ? 'var(--color-accent-border)' : 'var(--color-border-default)'}`,
                  }}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-bg-surface)' }}>
                    <Icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{label.title}</p>
                    {label.sub && <p className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{label.sub}</p>}
                    {label.period && <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{label.period}</p>}
                  </div>
                  {item.selected
                    ? <CheckCircle size={18} style={{ color: 'var(--color-accent-dark)', flexShrink: 0, marginTop: 2 }} />
                    : <Circle size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: 2 }} />}
                </button>
              )
            })}
          </div>
        )}

        {!isEmpty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedCount === 0}
            className="mt-5 w-full rounded-full py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
          >
            {selectedCount > 0 ? `${selectedCount}개 하이라이트에 추가` : '항목을 선택해주세요'}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
