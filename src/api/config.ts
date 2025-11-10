/**
 * API 설정
 */

/**
 * API Base URL 결정 로직
 * 1. 환경변수 VITE_API_BASE_URL이 있으면 사용
 * 2. 프로덕션 빌드인 경우 상대 경로 사용 (동일 도메인에 백엔드가 있을 때)
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
    // 프로덕션: 현재 페이지와 같은 오리진 사용 (백엔드가 같은 도메인에 있을 때)
    // 또는 절대 경로로 백엔드 URL 반환
    // return ''; // 상대 경로 사용 (같은 도메인)
    
    // 백엔드가 다른 도메인에 있다면 여기에 URL 설정
    // return 'https://api.yourdomain.com';
    
    // 기본값: 현재 오리진 사용
    return window.location.origin;
  }
  
  // 개발 환경: localhost 사용
  return 'http://localhost:8000';
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

  // 어시스턴스

} as const;
