// 사용량 관리(SCRUM-234) 목업 데이터 — 2026년 9월 기준 가상 수치.
// 단가·한도는 노션 "관리항목" 페이지 기준, 실서비스에선 SCRUM-233 관리자 API로 대체.

export type ChargeType = 'prepaid' | 'postpaid' | 'subscription' | 'free'

export const CHARGE_TYPE_LABEL: Record<ChargeType, string> = {
  prepaid: '선불 충전',
  postpaid: '후불 청구',
  subscription: '월 구독',
  free: '무료',
}

export interface UsageService {
  id: string
  name: string
  /** 사용처 요약 */
  usedFor: string
  chargeType: ChargeType
  calls: number
  /** AI만 해당 */
  tokens?: number
  /** 이번 달 예상 비용(원). null = 단가 미입력 */
  costKrw: number | null
  lastMonthCostKrw: number | null
  /** 관리자 테스트 호출분 (토글로 제외) */
  adminTestCalls?: number
  adminTestCostKrw?: number
  consoleUrl: string
  /** 충전·결제 페이지. 무료 서비스는 없음 */
  billingUrl?: string
  billingLabel?: string
}

export const USAGE_SERVICES: UsageService[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    usedFor: '페르소나, 자기소개, AI 검색, 케미, 추천 이유, 스크린샷과 증명서 인식',
    chargeType: 'prepaid',
    calls: 6_842,
    tokens: 9_412_000,
    costKrw: 7_420,
    lastMonthCostKrw: 5_910,
    adminTestCalls: 312,
    adminTestCostKrw: 640,
    consoleUrl: 'https://platform.openai.com/usage',
    billingUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    billingLabel: '크레딧 충전',
  },
  {
    id: 'tilko',
    name: '틸코',
    usedFor: '경력 인증 (간편인증 요청, 자격득실 조회)',
    chargeType: 'subscription',
    calls: 74,
    costKrw: 100_000,
    lastMonthCostKrw: 100_000,
    consoleUrl: 'https://tilko.net',
    billingUrl: 'https://tilko.net',
    billingLabel: '구독 관리',
  },
  {
    id: 'ncp_sens',
    name: 'NAVER Cloud SENS',
    usedFor: '회원가입, 비밀번호 찾기 인증번호 문자',
    chargeType: 'postpaid',
    calls: 132,
    costKrw: 738,
    lastMonthCostKrw: 414,
    consoleUrl: 'https://console.ncloud.com/sens/project',
    billingUrl: 'https://www.ncloud.com/mypage/billing/usage',
    billingLabel: '이용요금',
  },
  {
    id: 'ncp_mailer',
    name: 'NAVER Cloud Outbound Mailer',
    usedFor: '학력 이메일 인증, 문의 답변 메일',
    chargeType: 'postpaid',
    calls: 41,
    costKrw: null,
    lastMonthCostKrw: null,
    consoleUrl: 'https://console.ncloud.com/mailer/mail',
    billingUrl: 'https://www.ncloud.com/mypage/billing/usage',
    billingLabel: '이용요금',
  },
  {
    id: 'naver_search',
    name: 'NAVER API HUB 검색',
    usedFor: '맛집, 카페 장소 검색, 업체 사진 이미지 검색',
    chargeType: 'postpaid',
    calls: 18_406,
    costKrw: null,
    lastMonthCostKrw: null,
    consoleUrl: 'https://console.ncloud.com/naver-api-hub',
    billingUrl: 'https://www.ncloud.com/mypage/billing/usage',
    billingLabel: '이용요금',
  },
  {
    id: 'naver_maps',
    name: 'NAVER Maps',
    usedFor: '좌표 변환, 정적 지도',
    chargeType: 'postpaid',
    calls: 2_310,
    costKrw: null,
    lastMonthCostKrw: null,
    consoleUrl: 'https://console.ncloud.com/maps/application',
    billingUrl: 'https://www.ncloud.com/mypage/billing/usage',
    billingLabel: '이용요금',
  },
  {
    id: 'oci_docai',
    name: 'OCI Document AI',
    usedFor: '학력 증명서 PDF 글자 인식',
    chargeType: 'prepaid',
    calls: 9,
    costKrw: 190,
    lastMonthCostKrw: 120,
    consoleUrl: 'https://cloud.oracle.com/account-management/cost-analysis?region=ap-seoul-1',
    billingUrl: 'https://cloud.oracle.com/billing/subscriptions?region=ap-seoul-1',
    billingLabel: '크레딧',
  },
  {
    id: 'google_maps',
    name: 'Google Maps Platform',
    usedFor: '영어 버전 장소 검색, 지도, 업체 사진',
    chargeType: 'postpaid',
    calls: 796,
    costKrw: 0,
    lastMonthCostKrw: 0,
    consoleUrl: 'https://console.cloud.google.com/google/maps-apis/metrics',
    billingUrl: 'https://console.cloud.google.com/billing',
    billingLabel: '결제 계정',
  },
  {
    id: 'taste_free',
    name: 'TMDB, 알라딘, Spotify, Google Books',
    usedFor: '영화, 책, 음악 취향 검색',
    chargeType: 'free',
    calls: 11_260,
    costKrw: 0,
    lastMonthCostKrw: 0,
    consoleUrl: 'https://developer.spotify.com/dashboard',
  },
]

/** 호출 단위가 아닌 월 고정비 — 서버, 디스크 (Oracle 비용 분석 실제 청구) */
export const OCI_COST_ANALYSIS_URL = 'https://cloud.oracle.com/account-management/cost-analysis?region=ap-seoul-1'
export const OCI_CREDIT_URL = 'https://cloud.oracle.com/billing/subscriptions?region=ap-seoul-1'

export const FIXED_COSTS = [
  { id: 'oci_compute', name: 'Oracle 서버 (Compute)', costKrw: 46_350, note: 'VM 1대, 1 OCPU 16GB', consoleUrl: 'https://cloud.oracle.com/compute/instances?region=ap-seoul-1' },
  { id: 'oci_block', name: 'Oracle 디스크 (Block Storage)', costKrw: 55_350, note: '부트 47GB + 데이터 1TB', consoleUrl: 'https://cloud.oracle.com/block-storage/volumes?region=ap-seoul-1' },
  { id: 'oci_object', name: 'Oracle 이미지 저장 (Object Storage)', costKrw: 420, note: '프로필, 페르소나 이미지', consoleUrl: 'https://cloud.oracle.com/object-storage/buckets?region=ap-seoul-1' },
]

export type QuotaPeriod = 'day' | 'month'

export interface UsageQuota {
  id: string
  serviceId: string
  label: string
  used: number
  limit: number
  period: QuotaPeriod
  unit: string
  /** 초과 시 추가 과금 설명 */
  overageNote: string
  /** 초과분 1건당 원화 (추가 예상액 계산용) */
  overagePriceKrw?: number
}

export const USAGE_QUOTAS: UsageQuota[] = [
  { id: 'tilko', serviceId: 'tilko', label: '틸코 기본 제공', used: 74, limit: 1_000, period: 'month', unit: '건', overageNote: '초과분 건당 100원', overagePriceKrw: 100 },
  { id: 'sens', serviceId: 'ncp_sens', label: 'SENS 단문 무료', used: 132, limit: 50, period: 'month', unit: '건', overageNote: '초과분 건당 9원', overagePriceKrw: 9 },
  { id: 'naver_search', serviceId: 'naver_search', label: 'NAVER API HUB 검색 (오늘)', used: 612, limit: 25_000, period: 'day', unit: '건', overageNote: '한도 초과 시 호출 차단' },
  { id: 'places', serviceId: 'google_maps', label: 'Google Places 검색 무료', used: 214, limit: 5_000, period: 'month', unit: '건', overageNote: '초과분 1,000건당 32달러' },
  { id: 'place_photo', serviceId: 'google_maps', label: 'Google 업체 사진 무료', used: 96, limit: 1_000, period: 'month', unit: '건', overageNote: '초과분 1,000건당 7달러' },
  { id: 'static_maps', serviceId: 'google_maps', label: 'Google Static Maps 무료', used: 380, limit: 10_000, period: 'month', unit: '건', overageNote: '초과분 1,000건당 2달러' },
]

export interface PrepaidBalance {
  id: string
  name: string
  balanceKrw: number
  /** 월 평균 소진액 */
  monthlyBurnKrw: number
  expiresAt?: string
  billingUrl: string
  note: string
}

export const PREPAID_BALANCES: PrepaidBalance[] = [
  {
    id: 'oci_credit',
    name: 'Oracle 선불 크레딧',
    balanceKrw: 511_713,
    monthlyBurnKrw: 102_310,
    expiresAt: '2026-12-02',
    billingUrl: 'https://cloud.oracle.com/billing/subscriptions?region=ap-seoul-1',
    note: '약정 400만 원 중 잔액, 만료 시 소멸',
  },
  {
    id: 'openai_credit',
    name: 'OpenAI 크레딧',
    balanceKrw: 25_760,
    monthlyBurnKrw: 7_420,
    billingUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    note: '18.40달러, 자동 충전 꺼짐',
  },
]

export const FEATURE_COSTS = [
  { feature: '케미 리포트', service: 'OpenAI', calls: 1_840, costKrw: 2_610 },
  { feature: 'AI 페르소나 이미지', service: 'OpenAI', calls: 142, costKrw: 2_580 },
  { feature: '케미 글로우', service: 'OpenAI', calls: 1_216, costKrw: 1_310 },
  { feature: '오늘의 추천 이유', service: 'OpenAI', calls: 2_950, costKrw: 700 },
  { feature: '인증번호 문자', service: 'NAVER Cloud SENS', calls: 132, costKrw: 738 },
  { feature: '학력 증명서 인식', service: 'OpenAI, OCI Document AI', calls: 38, costKrw: 610 },
  { feature: '스크린샷으로 경력과 학력 채우기', service: 'OpenAI', calls: 61, costKrw: 510 },
  { feature: 'AI 검색', service: 'OpenAI', calls: 1_490, costKrw: 470 },
  { feature: 'AI 자기소개', service: 'OpenAI', calls: 208, costKrw: 70 },
  { feature: 'AI 페르소나 문구', service: 'OpenAI', calls: 284, costKrw: 40 },
]

/** 9월 일별 사용량 비용(원, 고정비 제외) */
export const DAILY_COSTS: number[] = [
  180, 210, 240, 190, 160, 120, 140, 260, 310, 280, 270, 230, 170, 150, 290, 340, 360, 330, 300, 210, 190, 380, 420, 400,
  390, 350, 260, 240, 430, 420,
]

export interface UnitPrice {
  id: string
  service: string
  operation: string
  price: number
  currency: 'USD' | 'KRW'
  unit: string
  since: string
}

export const UNIT_PRICES: UnitPrice[] = [
  { id: 'p1', service: 'OpenAI', operation: 'gpt-4o-mini 입력', price: 0.15, currency: 'USD', unit: '토큰 100만', since: '2026-04-15' },
  { id: 'p2', service: 'OpenAI', operation: 'gpt-4o-mini 출력', price: 0.6, currency: 'USD', unit: '토큰 100만', since: '2026-04-15' },
  { id: 'p3', service: 'OpenAI', operation: 'gpt-4o 입력', price: 2.5, currency: 'USD', unit: '토큰 100만', since: '2026-04-15' },
  { id: 'p4', service: 'OpenAI', operation: 'gpt-4o 출력', price: 10, currency: 'USD', unit: '토큰 100만', since: '2026-04-15' },
  { id: 'p5', service: 'OpenAI', operation: 'gpt-image-1.5 낮음 1536x1024', price: 0.013, currency: 'USD', unit: '이미지 1장', since: '2026-04-15' },
  { id: 'p6', service: '틸코', operation: '간편인증 요청, 자격득실 조회', price: 100, currency: 'KRW', unit: '1건 (1,000건 초과분)', since: '2026-07-01' },
  { id: 'p7', service: 'NAVER Cloud SENS', operation: '단문 문자', price: 9, currency: 'KRW', unit: '1건', since: '2026-04-15' },
  { id: 'p8', service: 'NAVER Cloud SENS', operation: '장문 문자', price: 30, currency: 'KRW', unit: '1건', since: '2026-04-15' },
  { id: 'p9', service: 'NAVER Cloud Outbound Mailer', operation: '메일 발송', price: 0, currency: 'KRW', unit: '1건', since: '' },
  { id: 'p13', service: 'NAVER API HUB', operation: '지역 검색, 이미지 검색', price: 0, currency: 'KRW', unit: '1건', since: '' },
  { id: 'p14', service: 'NAVER Maps', operation: '좌표 변환, 정적 지도', price: 0, currency: 'KRW', unit: '1건', since: '' },
  { id: 'p10', service: 'Google Maps Platform', operation: 'Places Text Search Pro', price: 32, currency: 'USD', unit: '1,000건', since: '2026-09-01' },
  { id: 'p11', service: 'Google Maps Platform', operation: 'Place Photo', price: 7, currency: 'USD', unit: '1,000건', since: '2026-09-30' },
  { id: 'p12', service: 'Google Maps Platform', operation: 'Static Maps', price: 2, currency: 'USD', unit: '1,000건', since: '2026-09-01' },
]

export const USAGE_SETTINGS_DEFAULT = {
  usdKrw: 1_400,
  warnPercent: 80,
  tilkoMonthlyFee: 100_000,
}
