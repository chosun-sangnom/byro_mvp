'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export function formatBirthDigits(digits: string) {
  const y = digits.slice(0, 4)
  const m = digits.slice(4, 6)
  const d = digits.slice(6, 8)
  let out = y
  if (digits.length > 4) out += `. ${m}`
  if (digits.length > 6) out += `. ${d}`
  if (digits.length >= 8) out += '.'
  return out
}

export function isoFromBirthDigits(digits: string) {
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

export function digitsFromIso(iso: string) {
  return iso.replace(/\D/g, '').slice(0, 8)
}

export function isValidBirthDigits(digits: string) {
  if (digits.length !== 8) return false
  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false
  return date.getTime() <= Date.now()
}

export const BIRTH_TIME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '모름' },
  { value: '23:00', label: '23:00 ~ 01:00' },
  { value: '01:00', label: '01:00 ~ 03:00' },
  { value: '03:00', label: '03:00 ~ 05:00' },
  { value: '05:00', label: '05:00 ~ 07:00' },
  { value: '07:00', label: '07:00 ~ 09:00' },
  { value: '09:00', label: '09:00 ~ 11:00' },
  { value: '11:00', label: '11:00 ~ 13:00' },
  { value: '13:00', label: '13:00 ~ 15:00' },
  { value: '15:00', label: '15:00 ~ 17:00' },
  { value: '17:00', label: '17:00 ~ 19:00' },
  { value: '19:00', label: '19:00 ~ 21:00' },
  { value: '21:00', label: '21:00 ~ 23:00' },
]

const CALENDAR_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const CALENDAR_MIN_YEAR = new Date().getFullYear() - 99

export function BirthDateCalendar({
  digits,
  time,
  onSelect,
  onSelectTime,
  onClose,
}: {
  digits: string
  time: string
  onSelect: (digits: string) => void
  onSelectTime: (time: string) => void
  onClose: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewDate, setViewDate] = useState(() =>
    digits.length === 8
      ? new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, 1)
      : new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const selectedDay =
    digits.length === 8 && Number(digits.slice(0, 4)) === year && Number(digits.slice(4, 6)) === month + 1
      ? Number(digits.slice(6, 8))
      : null

  const cells: Array<number | null> = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const yearOptions = Array.from(
    { length: today.getFullYear() - CALENDAR_MIN_YEAR + 1 },
    (_, i) => today.getFullYear() - i
  )

  const handlePick = (day: number) => {
    const picked = new Date(year, month, day)
    if (picked.getTime() > today.getTime()) return
    onSelect(`${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`)
    onClose()
  }

  const handlePickYear = (y: number) => {
    setViewDate(new Date(y, month, 1))
    setViewMode('days')
  }

  return (
    <div
      ref={containerRef}
      className="glass-card absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMode((prev) => (prev === 'days' ? 'years' : 'days'))}
          className="flex items-center gap-1 text-[15px] font-bold text-[#0D0D0D]"
        >
          {viewMode === 'days' ? `${year}년 ${month + 1}월` : '연도 선택'}
          <ChevronDown size={14} className={viewMode === 'years' ? 'rotate-180' : ''} />
        </button>
        {viewMode === 'days' && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="text-[#0D0D0D]">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="text-[#0D0D0D]">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'years' ? (
        <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handlePickYear(y)}
              className="flex h-9 items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: y === year ? '#25313D' : 'transparent', color: y === year ? '#FFFFFF' : '#0D0D0D' }}
            >
              {y}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-1 grid grid-cols-7">
            {CALENDAR_WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center text-[11px] font-medium text-[#A8B1BD]">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />
              const isFuture = new Date(year, month, day).getTime() > today.getTime()
              const isSelected = selectedDay === day
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
              return (
                <button key={idx} type="button" disabled={isFuture} onClick={() => handlePick(day)} className="flex h-9 items-center justify-center">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                    style={{
                      backgroundColor: isSelected ? '#25313D' : 'transparent',
                      color: isFuture ? '#DEE4EC' : isSelected ? '#FFFFFF' : '#0D0D0D',
                      fontWeight: isToday && !isSelected ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#DEE4EC] pt-3">
            <span className="text-sm font-medium text-[#25313D]">시간</span>
            <select
              value={time}
              onChange={(e) => onSelectTime(e.target.value)}
              className="appearance-none rounded-full bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-sm text-[#0D0D0D] outline-none"
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}
