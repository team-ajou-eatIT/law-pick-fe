import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Search, Sparkles, BookOpen, MessageCircle, Copy, ExternalLink, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { API_BASE_URL } from "../api/config";
import { getLawList, getLawDetail, getLawCards, type LawListItem, type LawSummaryResponse, type LawCardsResponse } from "../api/law-easy";

interface LawSummaryPageProps {
  onBack: () => void;
}

// markdown 파싱 결과 타입
interface ParsedMarkdown {
  lawInfo: string; // 법령정보 (# 제목, > 법령 ID)
  easyExplanation: string; // 쉬운 말 설명 및 요약 (## 1., ## 2. 등)
  compare: { before: string; after: string } | null; // 개정 전후 비교
  termDictionary: Array<{ term: string; definition: string }>; // 쉬운 말 사전
}

// markdown 데이터 파싱 함수
const parseMarkdown = (markdown: string): ParsedMarkdown => {
  const lines = markdown.split('\n');
  const result: ParsedMarkdown = {
    lawInfo: '',
    easyExplanation: '',
    compare: null,
    termDictionary: []
  };

  let currentSection: 'lawInfo' | 'easyExplanation' | 'compare' | 'dictionary' | null = null;
  let lawInfoLines: string[] = [];
  let easyExplanationLines: string[] = [];
  let compareSection: { before: string[]; after: string[] } | null = null;
  let dictionaryEntries: Array<{ term: string; definition: string }> = [];
  let currentCompareSection: 'before' | 'after' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 법령정보 섹션 (제목과 법령 ID)
    if (line.startsWith('# ') && !line.match(/^##\s+[0-9]+\./)) {
      currentSection = 'lawInfo';
      lawInfoLines.push(line);
      continue;
    }
    
    if (line.startsWith('> ')) {
      if (currentSection === null || currentSection === 'lawInfo') {
        currentSection = 'lawInfo';
        lawInfoLines.push(line);
      }
      continue;
    }
    
    // 쉬운 말 설명 섹션 (## 1., ## 2. 등)
    if (line.match(/^##\s+[0-9]+\./)) {
      currentSection = 'easyExplanation';
      easyExplanationLines.push(line);
      continue;
    }
    
    // 주요 용어 설명 섹션
    if (line.includes('주요 용어 설명') || line.includes('📚')) {
      currentSection = 'dictionary';
      continue;
    }
    
    // 개정 전후 비교 섹션
    if (line.includes('개정 전후 비교') || line.includes('🔄')) {
      currentSection = 'compare';
      compareSection = { before: [], after: [] };
      continue;
    }
    
    // 개정 전/후 서브섹션
    if (line.match(/^###\s+개정\s+전/)) {
      currentCompareSection = 'before';
      continue;
    }
    
    if (line.match(/^###\s+개정\s+후/)) {
      currentCompareSection = 'after';
      continue;
    }
    
    // 현재 섹션에 따라 내용 추가
    if (currentSection === 'lawInfo' && !line.match(/^##/)) {
      if (line.trim()) {
        lawInfoLines.push(line);
      }
    } else if (currentSection === 'easyExplanation') {
      // 용어 사전이나 비교 섹션이 시작되면 쉬운 말 설명 섹션 종료
      if (line.includes('주요 용어 설명') || line.includes('📚')) {
        // 용어 사전 섹션 시작
        currentSection = 'dictionary';
        continue;
      } else if (line.includes('개정 전후 비교') || line.includes('🔄')) {
        // 개정 전후 비교 섹션 시작
        currentSection = 'compare';
        compareSection = { before: [], after: [] };
        continue;
      }
      easyExplanationLines.push(line);
    } else if (currentSection === 'dictionary') {
      // 용어 사전 파싱 (## 개정 전후 비교나 다른 섹션이 나오면 중단)
      if (line.includes('개정 전후 비교') || line.includes('🔄')) {
        currentSection = 'compare';
        compareSection = { before: [], after: [] };
        continue;
      }
      
      // - **용어**: 정의 형식 파싱
      const termMatch = line.match(/^-\s+\*\*([^*]+)\*\*:\s*(.+)$/);
      if (termMatch) {
        dictionaryEntries.push({
          term: termMatch[1].trim(),
          definition: termMatch[2].trim()
        });
      }
    } else if (currentSection === 'compare' && compareSection) {
      if (currentCompareSection === 'before' && line.trim() && !line.match(/^###/)) {
        compareSection.before.push(line);
      } else if (currentCompareSection === 'after' && line.trim() && !line.match(/^###/)) {
        compareSection.after.push(line);
      }
    }
  }

  result.lawInfo = lawInfoLines.join('\n').trim();
  
  // 쉬운 말 설명에서 괄호 안의 쉬운 설명 부분 제거
  // 예: "임대차(임대인이 임차인에게...)" → "임대차"
  const removeParenthesesExplanations = (text: string): string => {
    if (!text) return text;
    
    // 각 줄을 개별적으로 처리하여 마크다운 구조 보존
    return text
      .split('\n')
      .map(line => {
        // 빈 줄이나 마크다운 헤더는 그대로 유지
        if (!line.trim() || line.match(/^#+\s/)) {
          return line;
        }
        
        // 마크다운 링크나 이미지의 괄호는 보호하기 위해 임시 치환
        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const placeholders: Array<{ placeholder: string; original: string }> = [];
        let placeholderIndex = 0;
        
        let processedLine = line;
        
        // 링크와 이미지 임시 치환
        processedLine = processedLine.replace(linkPattern, (match) => {
          const placeholder = `__MD_LINK_${placeholderIndex}__`;
          placeholders.push({ placeholder, original: match });
          placeholderIndex++;
          return placeholder;
        });
        
        processedLine = processedLine.replace(imagePattern, (match) => {
          const placeholder = `__MD_IMG_${placeholderIndex}__`;
          placeholders.push({ placeholder, original: match });
          placeholderIndex++;
          return placeholder;
        });
        
        // 괄호 안의 내용 제거 (한글 괄호와 영문 괄호 모두 처리)
        processedLine = processedLine
          .replace(/（[^）]*）/g, '') // 한글 괄호
          .replace(/\([^)]*\)/g, ''); // 영문 괄호
        
        // 링크와 이미지 복원
        placeholders.forEach(({ placeholder, original }) => {
          processedLine = processedLine.replace(placeholder, original);
        });
        
        // 연속된 공백 정리 (줄바꿈은 유지)
        return processedLine.replace(/\s+/g, ' ').trim();
      })
      .join('\n');
  };
  
  result.easyExplanation = removeParenthesesExplanations(easyExplanationLines.join('\n').trim());
  result.termDictionary = dictionaryEntries;
  
  if (compareSection && (compareSection.before.length > 0 || compareSection.after.length > 0)) {
    result.compare = {
      before: compareSection.before.join('\n').trim(),
      after: compareSection.after.join('\n').trim()
    };
  }

  return result;
};


// 카테고리 매핑 (한글 → 영어)
const CATEGORY_MAP: Record<string, string> = {
  "부동산": "real_estate",
  "금융": "finance",
  "취업": "employment",
  "교육": "education",
};

// 역방향 매핑 (영어 → 한글)
const CATEGORY_REVERSE_MAP: Record<string, string> = {
  "real_estate": "부동산",
  "finance": "금융",
  "employment": "취업",
  "education": "교육",
};

const getCategoryLabel = (value?: string | null) => {
  if (!value) return "기타";
  return CATEGORY_REVERSE_MAP[value] || value;
};

const categories = ["부동산", "금융", "취업", "교육"];
const SEARCH_TYPE_VALUES = ['all', 'title', 'ministry', 'content', 'date'] as const;
type SearchType = (typeof SEARCH_TYPE_VALUES)[number];
const isValidSearchType = (value: string | null): value is SearchType =>
  value !== null && SEARCH_TYPE_VALUES.includes(value as SearchType);

export function LawSummaryPage({ onBack }: LawSummaryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL에서 초기값 가져오기
  const categoryFromUrl = searchParams.get("category");
  const searchQueryFromUrl = searchParams.get("search") || "";
  const searchTypeFromUrl = searchParams.get("search_type") || "all";
  const dateStartFromUrl = searchParams.get("date_start") || "";
  const dateEndFromUrl = searchParams.get("date_end") || "";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  // /summary/all 경로인지 확인
  const isAllPath = location.pathname === '/summary/all' || location.pathname === '/summary';

  // 선택된 카테고리를 Set으로 관리 (토글 방식)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl);
  const [searchType, setSearchType] = useState<SearchType>(
    isValidSearchType(searchTypeFromUrl) ? searchTypeFromUrl : 'all',
  );
  const [dateStart, setDateStart] = useState<string>(dateStartFromUrl);
  const [dateEnd, setDateEnd] = useState<string>(dateEndFromUrl);
  const [selectedLaw, setSelectedLaw] = useState<LawListItem | null>(null);
  const [selectedLawData, setSelectedLawData] = useState<LawSummaryResponse | null>(null);
  const [cardNewsData, setCardNewsData] = useState<LawCardsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [laws, setLaws] = useState<LawListItem[]>([]);
  const [allLaws, setAllLaws] = useState<LawListItem[]>([]); // 필터링 전 전체 데이터
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const termDictionaryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const termListContainerRef = useRef<HTMLDivElement | null>(null);
  
  const ITEMS_PER_PAGE = 20;
  
  // markdown 파싱 결과
  const parsedMarkdown = selectedLawData?.markdown ? parseMarkdown(selectedLawData.markdown) : null;

  // 호버된 용어에 따라 쉬운말 사전 자동 스크롤
  useEffect(() => {
    if (!hoveredTerm) return;
    const container = termListContainerRef.current;
    const termElement = termDictionaryRefs.current[hoveredTerm];
    if (!container || !termElement) return;

    // DOM 업데이트 이후 스크롤 실행
    const timer = window.setTimeout(() => {
      const containerRect = container.getBoundingClientRect();
      const elementRect = termElement.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top;
      const scrollPosition =
        container.scrollTop + offset - container.clientHeight / 2 + termElement.offsetHeight / 2;

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [hoveredTerm]);

  // URL 파라미터에서 초기 카테고리 설정
  useEffect(() => {
    if (isAllPath && !categoryFromUrl) {
      // /summary/all 경로이고 category 파라미터가 없으면 빈 Set으로 시작
      setSelectedCategories(new Set());
      return;
    }

    if (categoryFromUrl) {
      // URL에 category 파라미터가 있으면 파싱
      const categories = categoryFromUrl.split(',').map(cat => {
        return CATEGORY_REVERSE_MAP[cat];
      }).filter((cat): cat is string => cat !== undefined);

      if (categories.length > 0) {
        setSelectedCategories(new Set(categories));
      } else {
        setSelectedCategories(new Set());
      }
    } else {
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

    // 페이지 설정
    if (pageFromUrl >= 1) {
      setCurrentPage(pageFromUrl);
    }
    // 날짜 범위 설정
    if (dateStartFromUrl) {
      setDateStart(dateStartFromUrl);
    } else {
      setDateStart("");
    }
    if (dateEndFromUrl) {
      setDateEnd(dateEndFromUrl);
    } else {
      setDateEnd("");
    }
  }, [categoryFromUrl, searchQueryFromUrl, searchTypeFromUrl, dateStartFromUrl, dateEndFromUrl, pageFromUrl, isAllPath]);

  // URL에 law_id가 있으면 해당 법령 자동 로드
  useEffect(() => {
    const lawIdFromUrl = searchParams.get("law_id");
    if (lawIdFromUrl && laws.length > 0) {
      const law = laws.find(l => l.law_id === lawIdFromUrl);
      if (law && law.law_id !== selectedLaw?.law_id) {
        handleLawSelect(law);
      }
    } else if (!lawIdFromUrl && selectedLaw) {
      // 브라우저 뒤로가기 등으로 law_id가 사라진 경우: 상세 상태 초기화
      setSelectedLaw(null);
      setSelectedLawData(null);
      setCardNewsData(null);
    }
  }, [searchParams, laws, selectedLaw]);

  // 법령 목록 가져오기
  useEffect(() => {
    loadLaws();
  }, [selectedCategories, searchQueryFromUrl, searchTypeFromUrl, dateStartFromUrl, dateEndFromUrl]);

  // 필터링 및 페이징 적용
  useEffect(() => {
    applyFilteringAndPaging();
  }, [allLaws, selectedCategories, searchQueryFromUrl, searchType, currentPage]);

  const loadLaws = async () => {
    setLoading(true);
    
    try {
      // 선택된 카테고리가 없거나 여러 개면 전체 조회 (category 파라미터 없이)
      // 선택된 카테고리가 하나면 해당 카테고리만 조회
      const category = selectedCategories.size === 1 
        ? CATEGORY_MAP[Array.from(selectedCategories)[0]]
        : undefined;
      
      // 백엔드가 search_type을 지원하는 경우를 대비해 파라미터 구성
      // 현재는 search만 전달하지만, 백엔드가 search_type을 지원하면 추가 가능
      // 페이징을 위해 충분한 데이터를 받아옴 (필터링 후에도 페이징 가능하도록)
      const activeSearchType = isValidSearchType(searchTypeFromUrl) ? searchTypeFromUrl : searchType;
      const dateStartParam = dateStartFromUrl ? dateStartFromUrl : undefined;
      const dateEndParam = dateEndFromUrl ? dateEndFromUrl : undefined;
      const searchParam = activeSearchType !== 'date' ? (searchQueryFromUrl.trim() || undefined) : undefined;
      const searchMode = activeSearchType !== 'all' ? activeSearchType : undefined;

      const response = await getLawList({
        category,
        page: 1,
        size: 1000, // 충분한 데이터를 받아와서 클라이언트 사이드 필터링 및 페이징
        search: searchParam,
        search_type: searchMode,
        date_start: activeSearchType === 'date' ? dateStartParam : undefined,
        date_end: activeSearchType === 'date' ? dateEndParam : undefined,
      });

      if (response.data) {
        // 백엔드에서 받은 전체 데이터를 저장 (필터링 전)
        setAllLaws(response.data.items);
      } else {
        console.error("법령 목록 로드 실패:", response.error);
      }
    } catch (err) {
      console.error("법령 목록 로드 중 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  // 필터링 및 페이징 적용 함수
  const applyFilteringAndPaging = () => {
    if (allLaws.length === 0) {
      setLaws([]);
      return;
    }

    // 백엔드에서 이미 필터링된 결과를 받으므로, 
    // 추가 필터링이 필요한 경우(카테고리가 선택되지 않았을 때)만 처리
    let filtered = [...allLaws];
    
    // 선택된 카테고리가 여러 개일 때만 클라이언트 사이드 필터링
    // (백엔드는 단일 카테고리만 지원하므로)
    if (selectedCategories.size > 1) {
      // 선택된 한글 카테고리를 영어 키로 변환
      const categoryKeys = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
      filtered = filtered.filter(law => 
        categoryKeys.includes(law.category)
      );
    }
    
    // 검색 타입별 필터링 (백엔드가 search_type을 지원하지 않는 경우 클라이언트 사이드 필터링)
    // 백엔드가 search_type을 지원하면 이 부분은 불필요하지만, 이중 필터링으로 안전장치 역할
    if (searchQueryFromUrl && searchType !== 'all') {
      const searchLower = searchQueryFromUrl.toLowerCase();
      filtered = filtered.filter(law => {
        switch (searchType) {
          case 'title':
            return law.title?.toLowerCase().includes(searchLower) ?? false;
          case 'ministry':
            return law.responsible_ministry?.toLowerCase().includes(searchLower) ?? false;
          case 'content':
            return (
              (law.short_desc?.toLowerCase().includes(searchLower) ?? false) ||
              (law.one_line_summary?.toLowerCase().includes(searchLower) ?? false)
            );
          case 'date':
            // 통과일 필터링 (YYYY-MM-DD 형식으로 검색)
            if (law.start_date) {
              return law.start_date.includes(searchLower);
            }
            return false;
          default:
            return true;
        }
      });
    }
    
    // 소관부처 기준 가나다 순 정렬
    filtered.sort((a, b) => {
      const ministryA = a.responsible_ministry || '';
      const ministryB = b.responsible_ministry || '';
      // 한국어 가나다 순 정렬
      return ministryA.localeCompare(ministryB, 'ko');
    });
    
    // 페이징 적용
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    
    // 페이지가 유효 범위를 벗어나면 첫 페이지로 리셋
    if (currentPage !== validPage && totalPages > 0) {
      setCurrentPage(1);
      const startIndex = 0;
      const endIndex = ITEMS_PER_PAGE;
      setLaws(filtered.slice(startIndex, endIndex));
      return;
    }
    
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setLaws(filtered.slice(startIndex, endIndex));
  };

  // 카테고리 토글 핸들러 (단일 선택만 가능)
  const handleCategoryToggle = (category: string) => {
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);
    
    const newCategories = new Set<string>();
    
    if (selectedCategories.has(category)) {
      // 이미 선택된 경우 제거 (전체 보기)
      // newCategories는 빈 Set
    } else {
      // 선택되지 않은 경우 해당 카테고리만 추가 (기존 선택 무시)
      newCategories.add(category);
    }
    
    setSelectedCategories(newCategories);

    // URL 업데이트
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 리셋
    const params: Record<string, string> = {};
    if (newCategories.size > 0) {
      const categoryStrings = Array.from(newCategories).map(cat => CATEGORY_MAP[cat]);
      params.category = categoryStrings.join(',');
    }
    if (searchType === 'date') {
      if (dateStart) {
        params.date_start = dateStart;
      }
      if (dateEnd) {
        params.date_end = dateEnd;
      }
      params.search_type = 'date';
    } else {
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (searchType !== 'all') {
        params.search_type = searchType;
      }
    }
    params.page = '1';
    setSearchParams(params, { replace: true });
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // 검색 실행 핸들러
  const handleSearchSubmit = () => {
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchType === 'date') {
      if (dateStart) {
        params.date_start = dateStart;
      }
      if (dateEnd) {
        params.date_end = dateEnd;
      }
      params.search_type = 'date';
    } else {
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (searchType !== 'all') {
        params.search_type = searchType;
      }
    }
    params.page = '1'; // 검색 시 첫 페이지
    setSearchParams(params, { replace: true });
  };

  // 검색어 초기화 핸들러
  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchType('all');
    setDateStart("");
    setDateEnd("");
    setCurrentPage(1); // 초기화 시 첫 페이지로 리셋
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    params.page = '1';
    setSearchParams(params, { replace: true });
  };

  // Enter 키 핸들러
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // 법령 상세 가져오기
  const handleLawSelect = async (law: LawListItem) => {
    setSelectedLaw(law);
    setIsAnalyzing(true);
    setCardNewsData(null); // 이전 카드뉴스 초기화

    // URL 업데이트 (category와 law_id 모두 포함)
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    const params: Record<string, string> = { law_id: law.law_id };
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchType === 'date') {
      if (dateStart) {
        params.date_start = dateStart;
      }
      if (dateEnd) {
        params.date_end = dateEnd;
      }
      params.search_type = 'date';
    } else {
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (searchType !== 'all') {
        params.search_type = searchType;
      }
    }
    setSearchParams(params);

    const response = await getLawDetail(law.law_id);

    if (response.data) {
      setSelectedLawData(response.data);
    } else {
      console.error("법령 상세 로드 실패:", response.error);
    }

    setIsAnalyzing(false);
  };

  // 법령 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);

    const nextParams = new URLSearchParams();
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      nextParams.set('category', categoryStrings.join(','));
    }

    if (searchType === 'date') {
      if (dateStart) {
        nextParams.set('date_start', dateStart);
      }
      if (dateEnd) {
        nextParams.set('date_end', dateEnd);
      }
      nextParams.set('search_type', 'date');
    } else {
      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        nextParams.set('search', trimmedSearch);
      }
      if (searchType !== 'all') {
        nextParams.set('search_type', searchType);
      }
    }

    if (currentPage > 1) {
      nextParams.set('page', currentPage.toString());
    }

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카드뉴스 탭 클릭 시 로드
  const loadCardNews = async () => {
    if (!selectedLaw || cardNewsData) return; // 이미 로드된 경우 스킵

    setLoadingCards(true);
    const response = await getLawCards(selectedLaw.law_id);

    if (response.data) {
      setCardNewsData(response.data);
      setCurrentCardIndex(0); // 카드뉴스 로드 시 첫 번째 카드로 초기화
    } else {
      console.error("카드뉴스 로드 실패:", response.error);
    }

    setLoadingCards(false);
  };

  // 카드뉴스 이전/다음 핸들러
  const handlePreviousCard = () => {
    if (cardNewsData && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (cardNewsData && currentCardIndex < cardNewsData.images.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 법령 원문을 보기 좋게 포맷팅하는 함수
  const formatOriginalContent = (content: string): string => {
    if (!content) return content;
    
    // 조항 번호나 항 번호를 기준으로 줄바꿈 추가
    let formatted = content
      // 조항 번호 (제1조, 제2조 등) - 앞에 줄바꿈 추가
      .replace(/([^\n])(제\d+조)/g, '$1\n\n$2')
      // 항 번호 (①, ②, ③ 등) - 앞에 줄바꿈 추가
      .replace(/([^\n])([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])/g, '$1\n\n$2')
      // 숫자 항 번호 (1., 2., 3. 등) - 앞에 줄바꿈 추가
      .replace(/([^\n])(\d+\.\s)/g, '$1\n\n$2')
      // 호 번호 (가., 나., 다. 등) - 줄 중간이 아닌 경우에만 줄바꿈 추가
      .replace(/(^|\n)([가나다라마바사아자차카타파하]\.\s)/g, (_match, prefix: string, item: string) => {
        return prefix ? `${prefix}\n${item}` : item;
      })
      // 괄호 항목 (1), 2), 3) 등) - 앞에 줄바꿈 추가
      .replace(/([^\n])(\d+\)\s)/g, '$1\n\n$2')
      // 연속된 공백 정리 (줄바꿈은 유지)
      .replace(/[ \t]+/g, ' ')
      // 연속된 줄바꿈 정리 (최대 2개)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return formatted;
  };

  // 현재 페이지에 표시할 법령 목록
  const filteredLaws = laws;

  // 필터링된 전체 개수 계산 (페이징 전)
  const getFilteredTotal = () => {
    if (allLaws.length === 0) return 0;
    
    let filtered = [...allLaws];
    
    // 카테고리 필터링
    if (selectedCategories.size > 1) {
      const categoryKeys = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
      filtered = filtered.filter(law => categoryKeys.includes(law.category));
    }
    
    // 검색 타입별 필터링
    if (searchQueryFromUrl && searchType !== 'all') {
      const searchLower = searchQueryFromUrl.toLowerCase();
      filtered = filtered.filter(law => {
        switch (searchType) {
          case 'title':
            return law.title?.toLowerCase().includes(searchLower) ?? false;
          case 'ministry':
            return law.responsible_ministry?.toLowerCase().includes(searchLower) ?? false;
          case 'content':
            return (
              (law.short_desc?.toLowerCase().includes(searchLower) ?? false) ||
              (law.one_line_summary?.toLowerCase().includes(searchLower) ?? false)
            );
          case 'date':
            // 통과일 필터링 (YYYY-MM-DD 형식으로 검색)
            if (law.start_date) {
              return law.start_date.includes(searchLower);
            }
            return false;
          default:
            return true;
        }
      });
    }
    
    return filtered.length;
  };

  const totalFiltered = getFilteredTotal();
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchType === 'date') {
      if (dateStart) {
        params.date_start = dateStart;
      }
      if (dateEnd) {
        params.date_end = dateEnd;
      }
      params.search_type = 'date';
    } else {
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (searchType !== 'all') {
        params.search_type = searchType;
      }
    }
    params.page = newPage.toString();
    setSearchParams(params, { replace: true });
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 법령 상세보기 화면
  if (selectedLaw) {
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="font-semibold">{selectedLawData?.title || selectedLaw.title || '법령 상세 분석'}</h1>
                  <p className="text-sm text-muted-foreground">법령 상세 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 법령 상세 정보 */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {isAnalyzing ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI가 분석 중입니다...</h3>
                  <p className="text-muted-foreground">
                    법률 조문을 분석하여 핵심 내용을 요약하고 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : selectedLawData ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {selectedLawData.title || selectedLaw.title || '법령명 없음'}
                    </CardTitle>
                    {(selectedLawData.one_line_summary || selectedLaw.one_line_summary) && (
                      <p className="text-muted-foreground">
                        {selectedLawData.one_line_summary || selectedLaw.one_line_summary}
                      </p>
                    )}
                  </div>
                  <Badge>{getCategoryLabel(selectedLaw?.category)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">발의기관:</span>
                    <p className="font-medium">
                      {selectedLawData.responsible_ministry || selectedLaw.responsible_ministry || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">통과일:</span>
                    <p className="font-medium">
                      {selectedLawData.start_date || selectedLaw.start_date || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">분야:</span>
                    <p className="font-medium">
                      {getCategoryLabel(selectedLaw?.category)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 탭 */}
            <Tabs 
              defaultValue="easy" 
              className="w-full"
              onValueChange={(value) => {
                if (value === "cardnews") loadCardNews();
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="easy" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  쉬운 말 설명
                </TabsTrigger>
                <TabsTrigger value="original" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  법령 원문
                </TabsTrigger>
                <TabsTrigger value="cardnews" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  카드뉴스
                </TabsTrigger>
              </TabsList>

              <TabsContent value="easy" className="space-y-4">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* 왼쪽: 쉬운 말 설명 */}
                  <div className="lg:col-span-2 space-y-4">
                    {parsedMarkdown ? (
                      <>
                        {/* 법령정보 */}
                        {parsedMarkdown.lawInfo && (
                          <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <h4 className="font-semibold text-blue-800 mb-2">법령정보</h4>
                            <div className="text-sm leading-relaxed text-muted-foreground">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="markdown-body space-y-2"
                              >
                                {parsedMarkdown.lawInfo}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* 쉬운 말 설명 및 요약 */}
                        {parsedMarkdown.easyExplanation && (
                          <div className="border-l-4 border-green-500 pl-4 py-2">
                            <h4 className="font-semibold text-green-800 mb-2">쉬운 말 설명 및 요약</h4>
                            <div className="text-sm leading-relaxed text-muted-foreground">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="markdown-body space-y-4"
                                components={{
                                  strong: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
                                    const termText = typeof children === 'string' ? children : 
                                      Array.isArray(children) ? children.filter(c => typeof c === 'string').join('') : '';
                                      
                                    if (parsedMarkdown && parsedMarkdown.termDictionary.length > 0 && termText) {
                                      const termDef = parsedMarkdown.termDictionary.find(t => t.term === termText);
                                      
                                      if (termDef) {
                                        return (
                                          <strong
                                            {...props}
                                            style={{ 
                                              backgroundColor: '#fbceb1', 
                                              color: '#000000',
                                              fontWeight: 'bold',
                                              cursor: 'pointer', 
                                              padding: '0 2px',
                                              textDecoration: 'underline',
                                              textDecorationStyle: 'dotted'
                                            }}
                                            onMouseEnter={() => setHoveredTerm(termDef.term)}
                                            onMouseLeave={() => setHoveredTerm(null)}
                                          >
                                            {children}
                                          </strong>
                                        );
                                      }
                                    }
                                    return <strong {...props}>{children}</strong>;
                                  }
                                }}
                              >
                                {parsedMarkdown.easyExplanation}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* 개정 전후 비교 */}
                        {parsedMarkdown.compare && (
                          <div className="border-l-4 border-purple-500 pl-4 py-2">
                            <h4 className="font-semibold text-purple-800 mb-2">개정 전후 비교</h4>
                            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                              {parsedMarkdown.compare.before && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1 text-purple-700">개정 전</h5>
                                  <div className="whitespace-pre-wrap">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      className="markdown-body"
                                    >
                                      {parsedMarkdown.compare.before}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {parsedMarkdown.compare.after && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1 text-purple-700">개정 후</h5>
                                  <div className="whitespace-pre-wrap">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      className="markdown-body"
                                    >
                                      {parsedMarkdown.compare.after}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedLawData.summary.map((card) => (
                          <div key={card.card_id} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              {card.card_id}. {card.title}
                            </h4>
                            <p className="text-sm leading-relaxed mb-4">
                              {card.content}
                            </p>

                            {card.simple_terms.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <h5 className="text-sm font-medium mb-2">주요 용어</h5>
                                <div className="space-y-2">
                                  {card.simple_terms.map((term, idx) => (
                                    <div key={idx} className="flex gap-2 text-sm">
                                      <span className="font-medium text-primary">{term.term}:</span>
                                      <span className="text-muted-foreground">{term.easy}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedLawData.compare && (
                          <Card className="bg-purple-50">
                            <CardHeader>
                              <CardTitle className="text-base">개정 전후 비교</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium mb-1">개정 전</h5>
                                <p className="text-sm text-muted-foreground">
                                  {selectedLawData.compare.before}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-1">개정 후</h5>
                                <p className="text-sm text-muted-foreground">
                                  {selectedLawData.compare.after}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>

                  {/* 오른쪽: 쉬운 말 사전 */}
                  <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-amber-600" />
                          쉬운 말 사전
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          ref={termListContainerRef}
                          className="h-[600px] overflow-y-auto pr-2"
                        >
                          {parsedMarkdown && parsedMarkdown.termDictionary.length > 0 ? (
                            <div className="space-y-4 pr-2">
                              {parsedMarkdown.termDictionary.map((term, idx) => (
                                <div
                                  key={idx}
                                  ref={(el) => {
                                    termDictionaryRefs.current[term.term] = el;
                                  }}
                                  className={`p-3 rounded-lg border transition-colors ${
                                    hoveredTerm === term.term
                                      ? 'bg-green-50 border-green-500'
                                      : 'bg-muted/30 border-transparent'
                                  }`}
                                >
                                  <div className="font-semibold text-sm mb-1">
                                    {term.term}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {term.definition}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                              용어 사전이 없습니다
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="original" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      법령 원문
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {selectedLawData.original_link && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm"
                          asChild
                        >
                          <a href={selectedLawData.original_link} target="_blank" rel="noopener noreferrer">
                            원문 링크 열기
                            <ExternalLink className="inline h-4 w-4 ml-1" />
                          </a>
                        </Button>
                      )}
                      {selectedLawData.original_content && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedLawData.original_content ?? "")}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          복사하기
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedLawData.original_content ? (
                      <ScrollArea className="h-[600px]">
                        <div className="pr-4 text-sm leading-relaxed">
                          <div className="space-y-3 font-mono text-[13px] whitespace-pre-wrap break-words">
                            {formatOriginalContent(selectedLawData.original_content)
                              .split('\n\n')
                              .map((paragraph, idx) => {
                                if (!paragraph.trim()) return null;
                                
                                // 항 번호가 있는 경우 스타일 적용
                                const isItem = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/.test(paragraph.trim());
                                const isNumbered = /^\d+\.\s/.test(paragraph.trim());
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`${
                                      isItem || isNumbered
                                        ? 'font-semibold text-gray-800 pl-4'
                                        : 'text-gray-700 pl-6 leading-7'
                                    }`}
                                  >
                                    {paragraph.split('\n').map((line, lineIdx) => (
                                      <React.Fragment key={lineIdx}>
                                        {line.trim()}
                                        {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        원문을 불러오지 못했습니다.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cardnews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      카드뉴스 ({cardNewsData?.total_cards || 0}장)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingCards ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <p className="text-muted-foreground">카드뉴스를 불러오는 중...</p>
                      </div>
                    ) : cardNewsData && cardNewsData.images.length > 0 ? (
                      <div className="relative">
                        <div className="border rounded-lg overflow-hidden bg-muted/30">
                          <img
                            src={`${API_BASE_URL}${cardNewsData.images[currentCardIndex]}`}
                            alt={`카드 ${currentCardIndex + 1}`}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                        
                        {/* 이전 버튼 (좌측 중간) */}
                        {currentCardIndex > 0 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg z-20"
                            onClick={handlePreviousCard}
                            aria-label="이전 카드"
                            type="button"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                        )}
                        
                        {/* 다음 버튼 (우측 중간) */}
                        {currentCardIndex < cardNewsData.images.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg z-20"
                            onClick={handleNextCard}
                            aria-label="다음 카드"
                            type="button"
                            style={{ right: '1rem', left: 'auto' }}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        )}
                        
                        {/* 카드 인디케이터 및 진행바 */}
                        <div className="mt-6 space-y-3">
                          {/* 진행바 */}
                          <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${((currentCardIndex + 1) / cardNewsData.images.length) * 100}%`
                              }}
                            />
                          </div>
                          
                          {/* 카드 인디케이터 점 */}
                          <div className="flex justify-center items-center gap-2">
                            {cardNewsData.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentCardIndex(idx)}
                                className={`rounded-full transition-all duration-200 ${
                                  currentCardIndex === idx
                                    ? 'w-3 h-3 bg-primary ring-2 ring-primary ring-offset-2'
                                    : 'w-2.5 h-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                                }`}
                                aria-label={`카드 ${idx + 1}로 이동`}
                              />
                            ))}
                          </div>
                          
                          {/* 카드 번호 표시 */}
                          <div className="text-center text-sm text-muted-foreground font-medium">
                            {currentCardIndex + 1} / {cardNewsData.images.length}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        카드뉴스가 생성되지 않았습니다
                      </div>
                    )}
                  </CardContent>
                </Card>

              </TabsContent>
            </Tabs>
          </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                요약 정보를 불러오지 못했습니다
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // 법령 목록 화면
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="font-semibold">AI 법률 요약 & 쉬운 말</h1>
                <p className="text-sm text-muted-foreground">복잡한 법률 문서를 쉽게 이해하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 카테고리 필터 및 검색 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">현행법령</h2>
            <Badge variant="secondary">
              {totalFiltered}건
            </Badge>
            {totalPages > 1 && (
              <span className="text-sm text-muted-foreground">
                ({currentPage}/{totalPages} 페이지)
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategories.has(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                  disabled={loading}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* 검색 입력 */}
            <div className="flex flex-col gap-2 flex-1 min-w-[300px] max-w-[600px] md:flex-row md:items-center">
              {/* 검색 타입 선택 */}
              <Select
                value={searchType}
                onValueChange={(value) => setSearchType(value as SearchType)}
                disabled={loading}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 검색</SelectItem>
                  <SelectItem value="title">법령명</SelectItem>
                  <SelectItem value="ministry">소관 부처</SelectItem>
                  <SelectItem value="content">내용</SelectItem>
                  <SelectItem value="date">통과일</SelectItem>
                </SelectContent>
              </Select>

              {searchType === 'date' ? (
                <div className="flex flex-col gap-2 flex-1 md:flex-row">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="h-9"
                      disabled={loading}
                      aria-label="통과일 시작"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="h-9"
                      disabled={loading}
                      aria-label="통과일 종료"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={
                      searchType === 'all' ? '법령명, 내용, 소관 부처 검색...' :
                      searchType === 'title' ? '법령명을 입력하세요...' :
                      searchType === 'ministry' ? '소관 부처를 입력하세요...' :
                      '내용을 입력하세요...'
                    }
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 pr-3 h-9"
                    disabled={loading}
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={handleSearchSubmit}
                disabled={loading}
                className="h-9"
              >
                검색
              </Button>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* 법령 목록 */}
        {!loading && (
          <div className="grid gap-6">
            {filteredLaws.map((law) => (
              <Card 
                key={law.law_id} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleLawSelect(law)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {law.title || '법령명 없음'}
                        </h3>
                        <Badge>{getCategoryLabel(law.category)}</Badge>
                      </div>
                      
                      {law.one_line_summary && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {law.one_line_summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {law.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {law.start_date}
                          </div>
                        )}
                        {law.responsible_ministry && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {law.responsible_ministry}
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
        {!loading && filteredLaws.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">법령이 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '검색 결과가 없습니다. 다른 검색어로 시도해보세요.' : '다른 카테고리를 선택해보세요.'}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={handleSearchClear}
              >
                검색 초기화
              </Button>
            )}
          </div>
        )}

        {/* 페이징 */}
        {!loading && totalPages > 1 && (
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
