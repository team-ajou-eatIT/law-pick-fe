/**
 * 청년 안건 API 서비스
 */
import { get } from './client';
import { API_ENDPOINTS } from './config';
import type {
  YouthProposalListResponse,
  YouthProposalDetail,
  YouthProposalDetailUI,
  YouthProposalCategory,
  Source,
} from '../types/youth-proposal';

/**
 * 청년 안건 목록 조회
 */
export async function getYouthProposals(
  category?: YouthProposalCategory,
  limit: number = 100,
  search?: string
) {
  return get<YouthProposalListResponse>(API_ENDPOINTS.youthProposals, {
    category,
    limit,
    search,
  });
}

/**
 * 청년 안건 상세 정보 조회
 */
export async function getYouthProposalDetail(billNo: string) {
  return get<YouthProposalDetail>(API_ENDPOINTS.youthProposalDetail(billNo));
}

/**
 * 공포번호를 '제00000호' 형식으로 포맷
 */
function formatPromNo(promNo: string | null): string | null {
  if (!promNo) return null;
  
  // 이미 '제'로 시작하면 그대로 반환
  if (promNo.startsWith('제')) return promNo;
  
  // 숫자만 추출하고 5자리로 패딩
  const number = promNo.replace(/\D/g, '');
  if (!number) return promNo;
  
  return `제${number.padStart(5, '0')}호`;
}

/**
 * 세미콜론으로 구분된 문자열을 배열로 변환
 */
function splitBySemicolon(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(';')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * 청년 안건 상세 정보를 UI용으로 변환
 */
export function transformYouthProposalForUI(
  detail: YouthProposalDetail
): YouthProposalDetailUI {
  const categoryNames: Record<YouthProposalCategory, string> = {
    1: '부동산',
    2: '취업',
    3: '금융',
    4: '교육',
  };

  // 출처 및 원문 링크 생성
  const sources: Source[] = [];

  // 1. 국가법령정보센터
  if (detail.prom_law_nm) {
    sources.push({
      title: `국가법령정보센터 - ${detail.prom_law_nm}`,
      url: detail.law_text_url || 'https://www.law.go.kr/',
    });
  }

  // 2. 국회 의안정보시스템
  if (detail.bill_nm && detail.link_url) {
    sources.push({
      title: `국회 의안정보시스템 - ${detail.bill_nm}`,
      url: detail.link_url,
    });
  }

  // 3. 국회 본회의 회의록
  if (detail.plenary_session_url) {
    sources.push({
      title: '국회 본회의 회의록',
      url: detail.plenary_session_url,
    });
  }

  // 4. 소관위 회의록
  if (detail.committee_urls && detail.committee_urls.length > 0) {
    detail.committee_urls.forEach((url, index) => {
      sources.push({
        title: `소관위 회의록 ${detail.committee_urls!.length > 1 ? `(${index + 1})` : ''}`,
        url: url,
      });
    });
  }

  // 5. 법사위 회의록
  if (detail.legal_committee_url) {
    sources.push({
      title: '법사위 회의록',
      url: detail.legal_committee_url,
    });
  }

  return {
    ...detail,
    categoryName: categoryNames[detail.is_youth_proposal] || '알 수 없음',
    majorChangesList: splitBySemicolon(detail.major_changes),
    targetAudienceList: splitBySemicolon(detail.target_audience),
    promNoFormatted: formatPromNo(detail.prom_no),
    sources,
  };
}


