import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Users, Calendar, ArrowRight, FileText, Target, BookOpen, ExternalLink, FileSignature, Clock, CheckCircle, Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { getYouthProposals, getYouthProposalDetail, transformYouthProposalForUI } from "../api/youth-proposal";
import { getAllBillReports, searchBillReports, getBillReportDetail } from "../api/bill-report";
import type { YouthProposalListItem, YouthProposalDetailUI, YouthProposalCategory } from "../types/youth-proposal";
import type { BillReportListItem } from "../types/bill-report";
import { CATEGORY_NAMES } from "../types/youth-proposal";

interface BillAnalysisPageProps {
  onBack: () => void;
}

// 카테고리 문자열 매핑
const CATEGORY_STRING_MAP: Record<string, YouthProposalCategory> = {
  'real_estate': 1,
  'employment': 2,
  'finance': 3,
  'education': 4,
};

// 역방향 매핑 (숫자 → 문자열)
const CATEGORY_TO_STRING: Record<YouthProposalCategory, string> = {
  1: 'real_estate',
  2: 'employment',
  3: 'finance',
  4: 'education',
};

// 카테고리 한글 이름 매핑
const CATEGORY_KOREAN_NAMES: Record<YouthProposalCategory, string> = {
  1: '부동산',
  2: '취업',
  3: '금융',
  4: '교육',
};

const YOUTH_LIST_CACHE_KEY = 'law-pick-youth-proposals-cache-v1';
const YOUTH_LIST_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6시간

type YouthProposalsCache = {
  updatedAt: string;
  proposals: YouthProposalListItem[];
};

type ErrorState = {
  message: string;
  detail?: string;
  kind: 'network' | 'cache' | 'general';
};

const formatCacheTimestamp = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

/**
 * 검색어를 하이라이트 처리하는 함수
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이트된 JSX 요소
 */
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return <strong key={index} className="font-bold text-primary">{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const extractLawIdFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('law_id') || parsed.searchParams.get('lsiSeq');
  } catch {
    const match = url.match(/(?:law_id|lsiSeq)=([\w-]+)/i);
    return match ? match[1] : null;
  }
};

// 검색 타입 정의
const SEARCH_TYPE_VALUES = ['all', 'bill', 'law', 'ministry', 'prom_no'] as const;
type SearchType = (typeof SEARCH_TYPE_VALUES)[number];
const isValidSearchType = (value: string | null): value is SearchType =>
  value !== null && SEARCH_TYPE_VALUES.includes(value as SearchType);

// 정렬 기준 정의
const ORDER_BY_VALUES = ['enforcement_date', 'prom_dt', 'rgs_rsln_dt', 'bill_nm'] as const;
type OrderBy = (typeof ORDER_BY_VALUES)[number];
const isValidOrderBy = (value: string | null): value is OrderBy =>
  value !== null && ORDER_BY_VALUES.includes(value as OrderBy);

const ORDER_BY_LABELS: Record<OrderBy, string> = {
  enforcement_date: '시행일',
  prom_dt: '공포일',
  rgs_rsln_dt: '본회의 의결일',
  bill_nm: '법안명',
};

export function BillAnalysisPage({ onBack }: BillAnalysisPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL에서 초기값 가져오기
  const categoryFromUrl = searchParams.get("category");
  const searchQueryFromUrl = searchParams.get("search") || "";
  const searchTypeFromUrl = searchParams.get("search_type") || "all";
  const orderByFromUrl = searchParams.get("order_by") || "enforcement_date";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  // /analysis/all 경로인지 확인
  const isAllPath = location.pathname === '/analysis/all' || location.pathname === '/analysis';

  // 선택된 카테고리를 Set으로 관리 (토글 방식)
  const [selectedCategories, setSelectedCategories] = useState<Set<YouthProposalCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl);
  const [searchType, setSearchType] = useState<SearchType>(
    isValidSearchType(searchTypeFromUrl) ? searchTypeFromUrl : 'all',
  );
  const [orderBy, setOrderBy] = useState<OrderBy>(
    isValidOrderBy(orderByFromUrl) ? orderByFromUrl : 'enforcement_date',
  );
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedBill, setSelectedBill] = useState<YouthProposalDetailUI | null>(null);
  const [youthBills, setYouthBills] = useState<YouthProposalListItem[]>([]);
  const [billReportResults, setBillReportResults] = useState<BillReportListItem[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cacheNotice, setCacheNotice] = useState<string | null>(null);
  const fetchLawIdIfNeeded = useCallback(async (billNo: string) => {
    try {
      const response = await getBillReportDetail(billNo);
      if (response.data?.law_id) {
        setSelectedBill(prev =>
          prev && prev.bill_no === billNo && prev.law_id !== response.data!.law_id
            ? { ...prev, law_id: response.data!.law_id }
            : prev
        );
      }
    } catch (err) {
      console.warn('Failed to load law_id for bill:', billNo, err);
    }
  }, []);

  const ITEMS_PER_PAGE = 10;

  const persistListCache = useCallback((proposals: YouthProposalListItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      const payload: YouthProposalsCache = {
        updatedAt: new Date().toISOString(),
        proposals,
      };
      window.localStorage.setItem(YOUTH_LIST_CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to cache youth proposals:', err);
    }
  }, []);

  const readListCache = useCallback((): YouthProposalsCache | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedRaw = window.localStorage.getItem(YOUTH_LIST_CACHE_KEY);
      if (!cachedRaw) return null;
      const payload = JSON.parse(cachedRaw) as YouthProposalsCache;
      if (!payload?.updatedAt || !Array.isArray(payload.proposals)) {
        return null;
      }
      const timestamp = new Date(payload.updatedAt).getTime();
      if (Number.isNaN(timestamp)) {
        return null;
      }
      if (Date.now() - timestamp > YOUTH_LIST_CACHE_TTL_MS) {
        window.localStorage.removeItem(YOUTH_LIST_CACHE_KEY);
        return null;
      }
      return payload;
    } catch (err) {
      console.warn('Failed to read youth proposals cache:', err);
      return null;
    }
  }, []);

  const filterBySelection = useCallback(
    (proposals: YouthProposalListItem[]) => {
      if (selectedCategories.size === 0) {
        return proposals;
      }
      return proposals.filter((bill) => selectedCategories.has(bill.is_youth_proposal));
    },
    [selectedCategories]
  );

  const attemptCacheFallback = useCallback(
    (reason?: string) => {
      const cached = readListCache();
      if (!cached) {
        return false;
      }
      const filtered = filterBySelection(cached.proposals);
      setYouthBills(filtered);
      setCacheNotice(cached.updatedAt);
      setError({
        kind: 'cache',
        message: '실시간 데이터를 불러오지 못해 최근 저장된 데이터를 표시합니다.',
        detail: reason && reason !== 'Failed to fetch' ? reason : undefined,
      });
      return true;
    },
    [filterBySelection, readListCache]
  );

  // bill_report 검색
  const searchBillReportsData = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setIsSearchMode(true);

    try {
      const response = await searchBillReports(query.trim(), 50, 0);

      if (response.error) {
        setError({
          kind: response.error === 'Failed to fetch' ? 'network' : 'general',
          message:
            response.error === 'Failed to fetch'
              ? '데이터 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'
              : response.error,
          detail: response.error === 'Failed to fetch' ? undefined : response.error,
        });
        setBillReportResults([]);
        setSearchTotalCount(0);
        return;
      }

      if (response.data) {
        setBillReportResults(response.data.reports);
        setSearchTotalCount(response.data.total_count);
        setCacheNotice(null);
      }
    } catch (err) {
      console.error('Failed to search bill reports:', err);
      setError({
        kind: 'general',
        message: '안건 분석 리포트 검색에 실패했습니다.',
        detail: err instanceof Error ? err.message : undefined,
      });
      setBillReportResults([]);
      setSearchTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // /analysis/all 경로를 위한 전체 리포트 조회 (페이지네이션)
  const loadAllBillReports = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    setIsSearchMode(false);

    try {
      // 선택된 카테고리가 하나면 해당 카테고리만 조회, 아니면 전체 조회
      const category = selectedCategories.size === 1 ? Array.from(selectedCategories)[0] : undefined;

      // 검색 파라미터 구성
      const activeSearchType = isValidSearchType(searchTypeFromUrl) ? searchTypeFromUrl : searchType;
      const activeOrderBy = isValidOrderBy(orderByFromUrl) ? orderByFromUrl : orderBy;
      const searchParam = searchQueryFromUrl.trim() || undefined;
      const searchMode = activeSearchType !== 'all' ? activeSearchType : undefined;

      const response = await getAllBillReports(
        page,
        ITEMS_PER_PAGE,
        category,
        searchParam,
        searchMode,
        activeOrderBy
      );

      if (response.error) {
        setError({
          kind: response.error === 'Failed to fetch' ? 'network' : 'general',
          message:
            response.error === 'Failed to fetch'
              ? '데이터 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'
              : response.error,
          detail: response.error === 'Failed to fetch' ? undefined : response.error,
        });
        return;
      }

      if (response.data) {
        // bill_report 데이터를 YouthProposalListItem 형식으로 변환
        const mappedBills: YouthProposalListItem[] = response.data.reports.map(report => ({
          bill_no: report.bill_no,
          bill_nm: report.bill_nm || '',
          bill_summary: report.bill_summary || null,
          rgs_rsln_dt: report.rgs_rsln_dt || null,
          jrcmit_nm: report.jrcmit_nm || null,
          is_youth_proposal: category || 1, // 선택된 카테고리 또는 기본값
        }));

        setYouthBills(mappedBills);
        setTotalPages(response.data.total_pages);
        setTotalCount(response.data.total_count);
        setCacheNotice(null);
      }
    } catch (err) {
      console.error('Failed to load all bill reports:', err);
      setError({
        kind: 'general',
        message: '안건 분석 리포트 목록을 불러오는데 실패했습니다.',
        detail: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [ITEMS_PER_PAGE, selectedCategories, searchQueryFromUrl, searchTypeFromUrl, orderByFromUrl]);

  const loadYouthBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsSearchMode(false);

    try {
      const category =
        selectedCategories.size === 1 ? Array.from(selectedCategories)[0] : undefined;

      const response = await getYouthProposals(category, 100);

      if (response.error) {
        if (!attemptCacheFallback(response.error)) {
          setError({
            kind: response.error === 'Failed to fetch' ? 'network' : 'general',
            message:
              response.error === 'Failed to fetch'
                ? '데이터 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'
                : response.error,
            detail: response.error === 'Failed to fetch' ? undefined : response.error,
          });
          setCacheNotice(null);
        }
        return;
      }

      if (response.data) {
        const filtered = filterBySelection(response.data.proposals);
        setYouthBills(filtered);
        setTotalCount(filtered.length);
        setTotalPages(1); // 청년 안건은 페이지네이션 없음
        setCacheNotice(null);

        if (selectedCategories.size === 0) {
          persistListCache(response.data.proposals);
        }
      }
    } catch (err) {
      console.error('Failed to load youth proposals:', err);
      if (!attemptCacheFallback(err instanceof Error ? err.message : '요청 실패')) {
        setError({
          kind: 'general',
          message: '청년 안건 목록을 불러오는데 실패했습니다.',
          detail: err instanceof Error ? err.message : undefined,
        });
        setCacheNotice(null);
      }
    } finally {
      setLoading(false);
    }
  }, [attemptCacheFallback, filterBySelection, persistListCache, selectedCategories, ITEMS_PER_PAGE]);

  // URL 파라미터에서 초기 카테고리 및 검색어 설정
  useEffect(() => {
    if (categoryFromUrl) {
      // URL에 category 파라미터가 있으면 파싱
      const categories = categoryFromUrl.split(',').map(cat => {
        // 숫자 형식인 경우 (기존 호환성)
        if (!isNaN(Number(cat))) {
          return Number(cat) as YouthProposalCategory;
        }
        // 문자열 형식인 경우
        return CATEGORY_STRING_MAP[cat];
      }).filter((cat): cat is YouthProposalCategory => cat !== undefined);

      if (categories.length > 0) {
        setSelectedCategories(new Set(categories));
      } else {
        setSelectedCategories(new Set());
      }
    } else {
      // category 파라미터가 없으면 빈 Set (전체 보기)
      setSelectedCategories(new Set());
    }

    // 검색어 설정
    if (searchQueryFromUrl) {
      setSearchQuery(searchQueryFromUrl);
    }

    // 검색 타입 설정
    if (isValidSearchType(searchTypeFromUrl)) {
      setSearchType(searchTypeFromUrl);
    }

    // 정렬 기준 설정
    if (isValidOrderBy(orderByFromUrl)) {
      setOrderBy(orderByFromUrl);
    }

    // 페이지 설정
    if (pageFromUrl >= 1) {
      setCurrentPage(pageFromUrl);
    }
  }, [categoryFromUrl, searchQueryFromUrl, searchTypeFromUrl, orderByFromUrl, pageFromUrl]);

  // URL에 bill_no가 있으면 해당 법안 자동 로드
  useEffect(() => {
    const billNoFromUrl = searchParams.get("bill_no");
    if (billNoFromUrl) {
      // URL에 bill_no가 있으면 상세 정보를 로드 (히스토리 추가 없이 데이터만 로드)
      if (!selectedBill || selectedBill.bill_no !== billNoFromUrl) {
        loadBillDetail(billNoFromUrl);
      }
    } else if (!billNoFromUrl && selectedBill) {
      // 브라우저 뒤로가기 등으로 bill_no가 사라진 경우: 상세 상태 초기화
      setSelectedBill(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedBill]);
  useEffect(() => {
    if (selectedBill && !selectedBill.law_id) {
      fetchLawIdIfNeeded(selectedBill.bill_no);
    }
  }, [selectedBill, fetchLawIdIfNeeded]);

  // URL에서 검색어가 있을 때만 초기 검색 실행
  useEffect(() => {
    if (searchQueryFromUrl && searchQueryFromUrl.trim()) {
      if (isAllPath) {
        // /analysis/all 경로에서는 loadAllBillReports 사용
        loadAllBillReports(currentPage);
      } else {
        searchBillReportsData(searchQueryFromUrl.trim());
      }
    } else if (isAllPath) {
      // /analysis/all 경로에서는 페이지네이션된 전체 리포트 로드
      loadAllBillReports(currentPage);
    } else {
      // 청년 안건 목록 로드
      loadYouthBills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQueryFromUrl, searchTypeFromUrl, orderByFromUrl, isAllPath, currentPage, selectedCategories]);

  // 청년 안건 상세 정보 로드
  const loadBillDetail = async (billNo: string) => {
    setDetailLoading(true);
    setError(null);
    
    try {
      const response = await getYouthProposalDetail(billNo);
      
      if (response.error) {
        setError({
          kind: response.error === 'Failed to fetch' ? 'network' : 'general',
          message:
            response.error === 'Failed to fetch'
              ? '법안 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
              : response.error,
          detail: response.error === 'Failed to fetch' ? undefined : response.error,
        });
      } else if (response.data) {
        const transformedDetail = transformYouthProposalForUI(response.data);
        setSelectedBill(transformedDetail);
      }
    } catch (err) {
      setError({
        kind: 'general',
        message: '청년 안건 상세 정보를 불러오는데 실패했습니다.',
        detail: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // 카테고리 토글 핸들러 (단일 선택만 가능)
  const handleCategoryToggle = (category: YouthProposalCategory) => {
    setSelectedBill(null);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 리셋

    const newCategories = new Set<YouthProposalCategory>();

    if (selectedCategories.has(category)) {
      // 이미 선택된 경우 제거 (전체 보기)
      // newCategories는 빈 Set
    } else {
      // 선택되지 않은 경우 해당 카테고리만 추가 (기존 선택 무시)
      newCategories.add(category);
    }

    setSelectedCategories(newCategories);

    // URL 업데이트 (검색어 및 검색 타입 유지)
    const params: Record<string, string> = {};
    if (newCategories.size > 0) {
      const categoryStrings = Array.from(newCategories).map(cat => CATEGORY_TO_STRING[cat]);
      params.category = categoryStrings.join(',');
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (searchType !== 'all') {
      params.search_type = searchType;
    }
    if (orderBy !== 'enforcement_date') {
      params.order_by = orderBy;
    }
    params.page = '1'; // 첫 페이지로 리셋
    setSearchParams(params, { replace: true });
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // 검색 실행 핸들러
  const handleSearchSubmit = () => {
    setSelectedBill(null);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_TO_STRING[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
      if (searchType !== 'all') {
        params.search_type = searchType;
      }
      if (orderBy !== 'enforcement_date') {
        params.order_by = orderBy;
      }
      // 검색어가 있으면 bill_report 검색 실행
      if (isAllPath) {
        // /analysis/all 경로에서는 loadAllBillReports 사용
        setSearchParams(params, { replace: true });
      } else {
        searchBillReportsData(searchQuery.trim());
        setSearchParams(params, { replace: true });
      }
    } else {
      // 검색어가 없으면 청년 안건 목록 로드
      if (orderBy !== 'enforcement_date') {
        params.order_by = orderBy;
      }
      if (isAllPath) {
        setSearchParams(params, { replace: true });
      } else {
        loadYouthBills();
        setSearchParams(params, { replace: true });
      }
    }
  };

  // 검색어 초기화 핸들러
  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchType('all');
    setSelectedBill(null);
    setBillReportResults([]);
    setIsSearchMode(false);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_TO_STRING[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    params.page = '1';
    setSearchParams(params, { replace: true });
    // /analysis/all 경로에서는 페이지네이션된 리포트 로드, 아니면 청년 안건 로드
    if (isAllPath) {
      loadAllBillReports(1);
    } else {
      loadYouthBills();
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_TO_STRING[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (searchType !== 'all') {
      params.search_type = searchType;
    }
    if (orderBy !== 'enforcement_date') {
      params.order_by = orderBy;
    }
    params.page = newPage.toString();
    setSearchParams(params, { replace: true });

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enter 키 핸들러
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // 법안 선택 핸들러 (청년 안건)
  const handleBillSelect = (bill: YouthProposalListItem) => {
    loadBillDetail(bill.bill_no);

    // URL 업데이트 (bill_no만 포함, category 제거)
    const params: Record<string, string> = { bill_no: bill.bill_no };
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    setSearchParams(params);
  };

  // bill_report 검색 결과 선택 핸들러
  const handleBillReportSelect = async (report: BillReportListItem) => {
    setDetailLoading(true);
    setError(null);
    
    try {
      // bill_report 상세 정보를 가져오기 위해 youth-proposal API 사용
      // (bill_no가 동일하고, youth-proposal이 있으면 상세 정보를 가져올 수 있음)
      const response = await getYouthProposalDetail(report.bill_no);
      
      if (response.error) {
        // youth-proposal이 없을 수 있으므로, bill_report 정보만으로도 표시 가능하도록 처리
        // 일단 에러를 표시하지 않고 bill_report 정보를 직접 사용
        console.warn('Youth proposal detail not found, using bill report data:', response.error);
      }
      
      if (response.data) {
        const transformedDetail = transformYouthProposalForUI(response.data);
        setSelectedBill(transformedDetail);
      } else {
        // youth-proposal이 없는 경우 bill_report 정보만으로 기본 정보 표시
        // (이 경우 상세 정보는 제한적일 수 있음)
        setError({
          kind: 'general',
          message: '청년 안건으로 분류되지 않은 법안입니다. 상세 정보는 제한적으로 표시됩니다.',
        });
      }
    } catch (err) {
      setError({
        kind: 'general',
        message: '법안 상세 정보를 불러오는데 실패했습니다.',
        detail: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDetailLoading(false);
    }

    // URL 업데이트 (bill_no만 포함, category 제거)
    const params: Record<string, string> = { bill_no: report.bill_no };
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    setSearchParams(params);
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    // 현재 URL에서 bill_no만 제거하여 목록으로 복귀
    // 이렇게 하면 크롬 뒤로가기와 동일하게 URL이 명확히 변경됨
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('bill_no');
    setSearchParams(newParams);
  };

  const categories: YouthProposalCategory[] = [1, 2, 3, 4];
  const filteredBills = youthBills;

  if (selectedBill) {
    const resolvedLawId = selectedBill.law_id || extractLawIdFromUrl(selectedBill.law_text_url);
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToList}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold">{selectedBill.bill_nm || '법안 상세 분석'}</h1>
                  <p className="text-sm text-muted-foreground">법안 상세 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 법안 상세 정보 */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedBill.bill_nm || '의안명 없음'}</CardTitle>
                    {selectedBill.bill_summary && (
                      <p className="text-muted-foreground">{selectedBill.bill_summary}</p>
                    )}
                  </div>
                  <Badge>{selectedBill.categoryName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">발의기관:</span>
                    <p className="font-medium">{selectedBill.jrcmit_nm || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">통과일:</span>
                    <p className="font-medium">{selectedBill.rgs_rsln_dt || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">분야:</span>
                    <p className="font-medium">{selectedBill.categoryName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 탭 */}
            <Tabs defaultValue="report" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="report" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  안건 분석 리포트
                </TabsTrigger>
                <TabsTrigger value="core" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  핵심 내용
                </TabsTrigger>
                <TabsTrigger value="lawtext" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  법률 원문
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  출처 및 원문
                </TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      안건 분석 리포트
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 제안이유 */}
                    {selectedBill.proposal_reason && (
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-semibold text-blue-800 mb-2">제안이유</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {selectedBill.proposal_reason}
                        </p>
                      </div>
                    )}

                    {/* 핵심내용 */}
                    {selectedBill.core_content_changes && (
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <h4 className="font-semibold text-green-800 mb-2">핵심내용</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {selectedBill.core_content_changes}
                        </p>
                      </div>
                    )}

                    {/* 위원회 논거 및 주요 쟁점 */}
                    {selectedBill.committee_arguments && (
                      <div className="border-l-4 border-purple-500 pl-4 py-2">
                        <h4 className="font-semibold text-purple-800 mb-2">위원회 논거 및 주요 쟁점</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {selectedBill.committee_arguments}
                        </p>
                      </div>
                    )}

                    {/* 예상효과 */}
                    {selectedBill.expected_effects && (
                      <div className="border-l-4 border-amber-500 pl-4 py-2">
                        <h4 className="font-semibold text-amber-800 mb-2">예상효과</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {selectedBill.expected_effects}
                        </p>
                      </div>
                    )}

                    {/* 리스크 */}
                    {selectedBill.risks && (
                      <div className="border-l-4 border-red-500 pl-4 py-2">
                        <h4 className="font-semibold text-red-800 mb-2">리스크</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {selectedBill.risks}
                        </p>
                      </div>
                    )}

                    {!selectedBill.proposal_reason && !selectedBill.core_content_changes && 
                     !selectedBill.committee_arguments && !selectedBill.expected_effects && 
                     !selectedBill.risks && (
                      <Alert>
                        <AlertDescription>
                          안건 분석 리포트가 아직 생성되지 않았습니다.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="core" className="space-y-4">
                {/* 시행 시기 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      시행 시기
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">시행일</h4>
                          <p className="text-lg font-bold text-orange-900">
                            {selectedBill.enforcement_date || '-'}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">현재 상태</h4>
                          <p className="text-lg font-bold text-orange-900">
                            {selectedBill.enforcement_status || '-'}
                          </p>
                        </div>
                      </div>
                      {selectedBill.enforcement_details && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">시행 세부사항</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {selectedBill.enforcement_details}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 공포 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-blue-600" />
                      공포 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedBill.gvrn_trsf_dt && (
                        <div className="border-l-4 border-blue-500 pl-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">정부이송일</p>
                          <p className="font-semibold">{selectedBill.gvrn_trsf_dt}</p>
                        </div>
                      )}
                      {selectedBill.prom_dt && (
                        <div className="border-l-4 border-blue-500 pl-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">공포일자</p>
                          <p className="font-semibold">{selectedBill.prom_dt}</p>
                        </div>
                      )}
                      {selectedBill.prom_law_nm && (
                        <div className="border-l-4 border-blue-500 pl-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">공포법률명</p>
                          <p className="font-semibold">{selectedBill.prom_law_nm}</p>
                        </div>
                      )}
                      {selectedBill.promNoFormatted && (
                        <div className="border-l-4 border-blue-500 pl-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">공포번호</p>
                          <p className="font-semibold">{selectedBill.promNoFormatted}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 주요 변경점 */}
                {selectedBill.majorChangesList.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-green-600" />
                        주요 변경점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedBill.majorChangesList.map((change, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{change}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 주요 대상자 */}
                {selectedBill.targetAudienceList.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        주요 대상자
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {selectedBill.targetAudienceList.map((target, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            <p className="text-sm">{target}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="lawtext" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row flex-wrap items-center gap-3 justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      법률 원문
                    </CardTitle>
                    {resolvedLawId && selectedBill.has_law === 'Y' && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="sm:w-auto"
                      >
                        <a
                          href={`https://law-pick.me/summary/all?law_id=${resolvedLawId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          법률 쉽게 살펴보기
                        </a>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedBill.law_text ? (
                      <ScrollArea className="h-[600px] w-full rounded-md border p-6">
                        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                          {selectedBill.law_text}
                        </div>
                      </ScrollArea>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          법률 원문이 아직 등록되지 않았습니다.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-cyan-600" />
                      출처 및 원문
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        본 법안에 대한 자세한 내용은 아래 출처를 통해 확인하실 수 있습니다.
                      </p>
                      {selectedBill.sources.length > 0 ? (
                        <>
                          {selectedBill.sources.map((source, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <ExternalLink className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{source.title}</h4>
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-cyan-600 hover:underline break-all"
                                >
                                  {source.url}
                                </a>
                              </div>
                            </div>
                          ))}
                          {/* <div className="bg-blue-50 p-4 rounded-lg mt-6">
                            <p className="text-sm text-blue-900">
                              <strong>주의:</strong> 위 링크는 참고용이며, 실제 법령 적용 시에는 반드시 최신 법령을 확인하시기 바랍니다.
                            </p>
                          </div> */}
                        </>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            출처 정보가 아직 등록되지 않았습니다.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="font-semibold">국회 가결안 분석</h1>
                <p className="text-sm text-muted-foreground">청년 관련 법안 현황을 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 에러 메시지 */}
        {error && (
          <Alert
            className="mb-6"
            variant={error.kind === 'cache' ? 'default' : 'destructive'}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <AlertDescription className="flex-1">
                {error.message}
                {error.detail && error.detail !== error.message && (
                  <span className="mt-1 block text-xs text-muted-foreground break-words">
                    상세: {error.detail}
                  </span>
                )}
              </AlertDescription>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={loadYouthBills} disabled={loading}>
                  다시 시도
                </Button>
                {error.kind === 'network' && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href="https://api.law-pick.me/healthz"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      상태 확인
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        )}
        {cacheNotice && (
          <Alert className="mb-6" variant="default">
            <AlertDescription>
              최근 {formatCacheTimestamp(cacheNotice)} 기준 저장된 데이터를 표시하고 있습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 카테고리 필터 및 검색 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">
              {isSearchMode ? '안건 분석 리포트 검색 결과' : isAllPath ? '모든 안건 분석 리포트' : '청년 관련 법안'}
            </h2>
            <Badge variant="secondary">
              {isSearchMode ? searchTotalCount : totalCount}건
            </Badge>
            {isAllPath && totalPages > 1 && (
              <span className="text-sm text-muted-foreground">
                ({currentPage}/{totalPages} 페이지)
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* 카테고리 필터 (검색 모드가 아닐 때만 표시) */}
              {!isSearchMode && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategories.has(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category)}
                      disabled={loading}
                    >
                      {CATEGORY_KOREAN_NAMES[category]}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* 검색 입력 */}
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[300px] max-w-[700px]">
                {/* 검색 타입 선택 */}
                <Select
                  value={searchType}
                  onValueChange={(value) => setSearchType(value as SearchType)}
                  disabled={loading}
                >
                  <SelectTrigger 
                    size="sm"
                    className="w-[120px] min-w-[120px] shrink-0"
                    style={{ width: '120px', minWidth: '120px', flexShrink: 0 }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 검색</SelectItem>
                    <SelectItem value="bill">법안명</SelectItem>
                    <SelectItem value="law">법률명</SelectItem>
                    <SelectItem value="ministry">소관 부처</SelectItem>
                    <SelectItem value="prom_no">공포번호</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={
                      searchType === 'all' ? '법안명, 법률명, 소관 부처, 공포번호 검색...' :
                      searchType === 'bill' ? '법안명을 입력하세요...' :
                      searchType === 'law' ? '법률명을 입력하세요...' :
                      searchType === 'ministry' ? '소관 부처를 입력하세요...' :
                      searchType === 'prom_no' ? '공포번호를 입력하세요...' :
                      '검색어를 입력하세요...'
                    }
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 pr-3 h-9"
                    disabled={loading}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSearchSubmit}
                  disabled={loading}
                  className="h-9 shrink-0"
                >
                  검색
                </Button>
              </div>
            </div>
            
            {/* 정렬 기준 선택 (검색 버튼 하단) */}
            {isAllPath && (
              <div className="flex items-center justify-end">
                <Select
                  value={orderBy}
                  onValueChange={(value) => {
                    const newOrderBy = value as OrderBy;
                    setOrderBy(newOrderBy);
                    setCurrentPage(1);
                    const params: Record<string, string> = {};
                    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_TO_STRING[cat]);
                    if (categoryStrings.length > 0) {
                      params.category = categoryStrings.join(',');
                    }
                    if (searchQuery.trim()) {
                      params.search = searchQuery.trim();
                    }
                    if (searchType !== 'all') {
                      params.search_type = searchType;
                    }
                    params.order_by = newOrderBy;
                    params.page = '1';
                    setSearchParams(params, { replace: true });
                  }}
                  disabled={loading}
                >
                <SelectTrigger 
                  size="sm"
                  className="w-[160px] min-w-[160px] shrink-0 bg-white"
                  style={{ width: '160px', minWidth: '160px', flexShrink: 0 }}
                >
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enforcement_date">시행일</SelectItem>
                    <SelectItem value="prom_dt">공포일</SelectItem>
                    <SelectItem value="rgs_rsln_dt">본회의 의결일</SelectItem>
                    <SelectItem value="bill_nm">법안명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* 법안 목록 */}
        {!loading && !isSearchMode && (
          <div className="grid gap-6">
            {filteredBills.map((bill) => (
              <Card 
                key={bill.bill_no} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleBillSelect(bill)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{bill.bill_nm || '의안명 없음'}</h3>
                        <Badge>{CATEGORY_NAMES[bill.is_youth_proposal]}</Badge>
                      </div>
                      
                      {bill.bill_summary && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {bill.bill_summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {bill.rgs_rsln_dt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {bill.rgs_rsln_dt}
                          </div>
                        )}
                        {bill.jrcmit_nm && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {bill.jrcmit_nm}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* bill_report 검색 결과 */}
        {!loading && isSearchMode && (
          <div className="grid gap-6">
            {billReportResults.map((report) => (
              <Card 
                key={report.bill_no} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleBillReportSelect(report)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {report.bill_nm ? highlightText(report.bill_nm, searchQuery) : '의안명 없음'}
                        </h3>
                      </div>
                      
                      {report.bill_summary && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {highlightText(report.bill_summary, searchQuery)}
                        </p>
                      )}

                      {/* 검색어가 포함된 컬럼 하이라이트 */}
                      <div className="space-y-2 mb-4 text-sm">
                        {report.proposal_reason && report.proposal_reason.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 font-semibold mb-1">제안이유</p>
                            <p className="text-muted-foreground line-clamp-2">
                              {highlightText(report.proposal_reason, searchQuery)}
                            </p>
                          </div>
                        )}
                        {report.expected_effects && report.expected_effects.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <p className="text-xs text-amber-600 font-semibold mb-1">예상효과</p>
                            <p className="text-muted-foreground line-clamp-2">
                              {highlightText(report.expected_effects, searchQuery)}
                            </p>
                          </div>
                        )}
                        {report.major_changes && report.major_changes.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold mb-1">주요 변경점</p>
                            <p className="text-muted-foreground line-clamp-2">
                              {highlightText(report.major_changes, searchQuery)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {report.rgs_rsln_dt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {report.rgs_rsln_dt}
                          </div>
                        )}
                        {report.jrcmit_nm && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.jrcmit_nm}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && !isSearchMode && filteredBills.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">해당 카테고리의 법안이 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 카테고리를 선택해보세요.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCategories(new Set());
                setSearchQuery("");
                setSearchParams({}, { replace: true });
              }}
            >
              전체 보기
            </Button>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!loading && isSearchMode && billReportResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 검색어로 시도해보세요.</p>
            <Button
              variant="outline"
              onClick={handleSearchClear}
            >
              검색 초기화
            </Button>
          </div>
        )}

        {/* 페이지네이션 - /analysis/all 경로에서만 표시 */}
        {!loading && isAllPath && !isSearchMode && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {/* 페이지 번호 표시 (최대 5개) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
