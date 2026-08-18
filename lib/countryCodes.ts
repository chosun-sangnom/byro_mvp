export interface CountryCode {
  code: string
  name: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+82', name: '대한민국' },
  { code: '+1', name: '미국/캐나다' },
  { code: '+81', name: '일본' },
  { code: '+86', name: '중국' },
  { code: '+852', name: '홍콩' },
  { code: '+65', name: '싱가포르' },
  { code: '+84', name: '베트남' },
  { code: '+66', name: '태국' },
  { code: '+63', name: '필리핀' },
  { code: '+44', name: '영국' },
  { code: '+61', name: '호주' },
  { code: '+49', name: '독일' },
  { code: '+33', name: '프랑스' },
]

export const DEFAULT_COUNTRY_CODE = '+82'
