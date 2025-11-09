/**
 * 청년 안건 관련 타입 정의
 */

/**
 * 청년 안건 카테고리
 * 1: 부동산, 2: 취업, 3: 금융, 4: 교육
 */
export type YouthProposalCategory = 1 | 2 | 3 | 4;

/**
 * 카테고리 이름 맵핑
 */
export const CATEGORY_NAMES: Record<YouthProposalCategory | 'all', string> = {
  all: '전체',
  1: '부동산',
  2: '취업',
  3: '금융',
  4: '교육',
};

/**
 * 청년 안건 목록 아이템
 */
export interface YouthProposalListItem {
  bill_no: string;                    // 법안 번호
  bill_nm: string | null;             // 의안명
  bill_summary: string | null;        // 의안요약 1줄
  rgs_rsln_dt: string | null;         // 통과일 (본회의 의결일)
  jrcmit_nm: string | null;           // 발의기관 (소관위원회명)
  is_youth_proposal: YouthProposalCategory;  // 분야
}

/**
 * 청년 안건 목록 응답
 */
export interface YouthProposalListResponse {
  success: boolean;
  category: YouthProposalCategory | null;
  category_name: string;
  count: number;
  proposals: YouthProposalListItem[];
}

/**
 * 청년 안건 상세 정보
 */
export interface YouthProposalDetail {
  // 기본 정보
  bill_no: string;
  is_youth_proposal: YouthProposalCategory;
  
  // bill_detail 정보
  bill_nm: string | null;
  rgs_rsln_dt: string | null;         // 통과일
  jrcmit_nm: string | null;           // 발의기관
  gvrn_trsf_dt: string | null;        // 정부이송일
  prom_law_nm: string | null;         // 공포법률명
  prom_dt: string | null;             // 공포일자
  prom_no: string | null;             // 공포번호
  link_url: string | null;            // 의안정보시스템 링크
  
  // bill_report 정보
  bill_summary: string | null;        // 의안요약 1줄
  major_changes: string | null;       // 주요 변경점 (세미콜론 구분)
  target_audience: string | null;     // 주요 대상자 (세미콜론 구분)
  proposal_reason: string | null;     // 제안이유
  core_content_changes: string | null; // 핵심내용
  committee_arguments: string | null; // 위원회 논거 및 주요 쟁점
  expected_effects: string | null;    // 예상효과
  risks: string | null;               // 리스크
  enforcement_date: string | null;    // 시행일
  enforcement_status: string | null;  // 현재 상태
  enforcement_details: string | null; // 시행 세부사항
  law_text: string | null;            // 법률 원문
  law_text_url: string | null;        // 법률 원문 URL
  
  // bill_doc 정보
  plenary_session_url: string | null;   // 본회의 회의록 URL
  committee_urls: string[] | null;      // 소관위 회의록 URL 목록
  legal_committee_url: string | null;   // 법사위 회의록 URL
}

/**
 * 출처 정보
 */
export interface Source {
  title: string;
  url: string;
}

/**
 * 프론트엔드에서 사용할 변환된 청년 안건 상세 정보
 */
export interface YouthProposalDetailUI extends YouthProposalDetail {
  // 추가 UI용 필드
  categoryName: string;
  majorChangesList: string[];         // 세미콜론으로 분리된 주요 변경점 배열
  targetAudienceList: string[];       // 세미콜론으로 분리된 주요 대상자 배열
  promNoFormatted: string | null;     // '제00000호' 형식으로 포맷된 공포번호
  sources: Source[];                  // 출처 및 원문 링크 목록
}

