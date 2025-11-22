/**
 * API 설정
 */

/**
 * API Base URL 결정 로직
 * 1. 환경변수 VITE_API_BASE_URL이 있으면 사용 (최우선)
 * 2. 프로덕션 빌드인 경우 api.law-pick.me 사용
 * 3. 개발 환경에서는 localhost 사용
 */
function getApiBaseUrl(): string {
  // 환경변수가 설정되어 있으면 최우선으로 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 프로덕션 환경 감지
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // 프로덕션: API는 별도 도메인(api.law-pick.me)에 있음
    // window.location.origin을 사용하면 /analysis 같은 서브 경로에서 문제 발생
    return 'https://api.law-pick.me';
  }
  
  // 개발 환경: localhost 사용
  return 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();

// 디버깅용 로그 (프로덕션에서는 제거 가능)
if (import.meta.env.DEV) {
  console.log('[API Config] API_BASE_URL:', API_BASE_URL);
  console.log('[API Config] Environment:', import.meta.env.MODE);
}

// API 엔드포인트
export const API_ENDPOINTS = {
  // 청년 안건
  youthProposals: '/api/v1/youth-proposals',
  youthProposalDetail: (billNo: string) => `/api/v1/youth-proposals/${billNo}`,
  
  // 법안 정보
  bills: '/api/v1/bills',
  billDetail: (billId: string) => `/api/v1/bills/${billId}`,
  
  // 법령 쉬운말 재가공
  laws: '/api/v1/law/list',
  lawDetail: (lawId: string) => `/api/v1/law/${lawId}`,
  lawSummarize: '/api/v1/law/summarize',
  lawCache: (lawId: string) => `/api/v1/law/cache/${lawId}`,
  lawOriginal: (lawId: string) => `/api/v1/law/${lawId}/original`,
  lawMarkdown: (lawId: string) => `/api/v1/law/${lawId}/markdown`,
  lawCards: (lawId: string) => `/api/v1/law/${lawId}/cards`,

  // AI 법령 어시스턴트
  assistantThread: '/api/v1/law/chatbot/threads',
  assistantQuery: '/api/v1/law/chatbot/query',

  // 안건 분석 리포트
  billReportSearch: '/api/v1/bill-report/search',
  billReportDetail: (billNo: string) => `/api/v1/bill-report/${billNo}`,

} as const;
