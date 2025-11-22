/**
 * 안건 분석 리포트 API 서비스
 */
import { get } from './client';
import { API_ENDPOINTS } from './config';
import type {
  BillReportSearchResponse,
  BillReportListItem,
} from '../types/bill-report';

/**
 * 안건 분석 리포트 검색
 */
export async function searchBillReports(
  query: string,
  limit: number = 50,
  offset: number = 0
) {
  return get<BillReportSearchResponse>(API_ENDPOINTS.billReportSearch, {
    q: query,
    limit,
    offset,
  });
}

/**
 * 안건 분석 리포트 상세 조회
 */
export async function getBillReportDetail(billNo: string) {
  return get<BillReportListItem>(API_ENDPOINTS.billReportDetail(billNo));
}

