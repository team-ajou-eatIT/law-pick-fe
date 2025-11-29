/**
 * 안건 분석 리포트 API 서비스
 */
import { get } from './client';
import { API_ENDPOINTS } from './config';
import type {
  BillReportSearchResponse,
  BillReportListItem,
  BillReportAllResponse,
} from '../types/bill-report';

/**
 * 안건 분석 리포트 전체 조회 (페이지네이션)
 */
export async function getAllBillReports(
  page: number = 1,
  pageSize: number = 10,
  category?: number,
  search?: string,
  searchType?: string,
  orderBy?: string
) {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (category !== undefined) {
    params.category = category;
  }

  if (search !== undefined && search.trim()) {
    params.search = search.trim();
  }

  if (searchType !== undefined && searchType !== 'all') {
    params.search_type = searchType;
  }

  if (orderBy !== undefined) {
    params.order_by = orderBy;
  }

  return get<BillReportAllResponse>(API_ENDPOINTS.billReportAll, params);
}

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

