/**
 * API 설정
 */

// API Base URL - 환경변수 또는 기본값 사용
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API 엔드포인트
export const API_ENDPOINTS = {
  // 청년 안건
  youthProposals: '/api/v1/youth-proposals',
  youthProposalDetail: (billNo: string) => `/api/v1/youth-proposals/${billNo}`,
  
  // 법안 정보
  bills: '/api/v1/bills',
  billDetail: (billId: string) => `/api/v1/bills/${billId}`,
  
  // 법률 정보 (law_easy)
  laws: '/api/v1/law/list',
  lawDetail: (lawId: string) => `/api/v1/law/${lawId}`,
  lawSummarize: '/api/v1/law/summarize',
} as const;

