/**
 * 안건 분석 리포트 관련 타입 정의
 */

/**
 * 안건 분석 리포트 목록 아이템
 */
export interface BillReportListItem {
  id: number;
  bill_no: string;
  bill_summary: string | null;
  major_changes: string | null;
  proposal_reason: string | null;
  expected_effects: string | null;
  processing_status: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  bill_nm: string | null;
  rgs_rsln_dt: string | null;
  jrcmit_nm: string | null;
}

/**
 * 안건 분석 리포트 검색 응답
 */
export interface BillReportSearchResponse {
  success: boolean;
  query: string;
  total_count: number;
  limit: number;
  offset: number;
  reports: BillReportListItem[];
}

