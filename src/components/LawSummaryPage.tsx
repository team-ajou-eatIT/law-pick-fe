import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Search, Sparkles, BookOpen, MessageCircle, Copy, ExternalLink, Calendar, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { API_BASE_URL } from "../api/config";
import { getLawList, getLawDetail, getLawCards, type LawListItem, type LawSummaryResponse, type LawCardsResponse } from "../api/law-easy";

interface LawSummaryPageProps {
  onBack: () => void;
}

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

export function LawSummaryPage({ onBack }: LawSummaryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL에서 초기값 가져오기
  const categoryFromUrl = searchParams.get("category");
  const searchQueryFromUrl = searchParams.get("search") || "";

  // /summary/all 경로인지 확인
  const isAllPath = location.pathname === '/summary/all' || location.pathname === '/summary';

  // 선택된 카테고리를 Set으로 관리 (토글 방식)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(searchQueryFromUrl);
  const [selectedLaw, setSelectedLaw] = useState<LawListItem | null>(null);
  const [selectedLawData, setSelectedLawData] = useState<LawSummaryResponse | null>(null);
  const [cardNewsData, setCardNewsData] = useState<LawCardsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [laws, setLaws] = useState<LawListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

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
  }, [categoryFromUrl, searchQueryFromUrl, isAllPath]);

  // URL에 law_id가 있으면 해당 법령 자동 로드
  useEffect(() => {
    const lawIdFromUrl = searchParams.get("law_id");
    if (lawIdFromUrl && laws.length > 0) {
      const law = laws.find(l => l.law_id === lawIdFromUrl);
      if (law && law.law_id !== selectedLaw?.law_id) {
        handleLawSelect(law);
      }
    }
  }, [searchParams, laws]);

  // 법령 목록 가져오기
  useEffect(() => {
    loadLaws();
  }, [selectedCategories]);

  const loadLaws = async () => {
    setLoading(true);
    
    try {
      // 선택된 카테고리가 없거나 여러 개면 전체 조회 (category 파라미터 없이)
      // 선택된 카테고리가 하나면 해당 카테고리만 조회
      const category = selectedCategories.size === 1 
        ? CATEGORY_MAP[Array.from(selectedCategories)[0]]
        : undefined;
      
      const response = await getLawList({
        category,
        page: 1,
        size: 100
      });

      if (response.data) {
        // 백엔드에서 이미 필터링된 결과를 받으므로, 
        // 추가 필터링이 필요한 경우(카테고리가 선택되지 않았을 때)만 처리
        let filtered = response.data.items;
        
        // 선택된 카테고리가 여러 개일 때만 클라이언트 사이드 필터링
        // (백엔드는 단일 카테고리만 지원하므로)
        if (selectedCategories.size > 1) {
          // 선택된 한글 카테고리를 영어 키로 변환
          const categoryKeys = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
          filtered = filtered.filter(law => 
            categoryKeys.includes(law.category)
          );
        }
        
        setLaws(filtered);
      } else {
        console.error("법령 목록 로드 실패:", response.error);
      }
    } catch (err) {
      console.error("법령 목록 로드 중 오류:", err);
    } finally {
      setLoading(false);
    }
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
    const params: Record<string, string> = {};
    if (newCategories.size > 0) {
      const categoryStrings = Array.from(newCategories).map(cat => CATEGORY_MAP[cat]);
      params.category = categoryStrings.join(',');
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
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
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    setSearchParams(params, { replace: true });
  };

  // 검색어 초기화 핸들러
  const handleSearchClear = () => {
    setSearchQuery("");
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
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
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
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

    // URL 업데이트 (category, search 유지, law_id 제거)
    const params: Record<string, string> = {};
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      params.category = categoryStrings.join(',');
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (Object.keys(params).length > 0) {
      setSearchParams(params);
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // 카드뉴스 탭 클릭 시 로드
  const loadCardNews = async () => {
    if (!selectedLaw || cardNewsData) return; // 이미 로드된 경우 스킵

    setLoadingCards(true);
    const response = await getLawCards(selectedLaw.law_id);

    if (response.data) {
      setCardNewsData(response.data);
    } else {
      console.error("카드뉴스 로드 실패:", response.error);
    }

    setLoadingCards(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 검색 필터링
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLaws = laws.filter((law) => {
    if (normalizedQuery === "") return true;
    const targets = [
      law.title,
      law.short_desc,
      law.one_line_summary,
      law.responsible_ministry
    ].filter(Boolean);
    return targets.some((value) => value?.toLowerCase().includes(normalizedQuery));
  });

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
                  <Badge>{getCategoryLabel(selectedLaw?.category || selectedLawData.category)}</Badge>
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
                      {getCategoryLabel(selectedLaw?.category || selectedLawData.category)}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      쉬운 말 설명
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedLawData.markdown ? (
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="markdown-body space-y-4 text-sm leading-relaxed"
                        >
                          {selectedLawData.markdown}
                        </ReactMarkdown>
                      </div>
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
                          <Card className="bg-blue-50">
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
                  </CardContent>
                </Card>
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
                        <div className="space-y-4 pr-4 text-sm leading-relaxed whitespace-pre-line">
                          {selectedLawData.original_content}
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
                    ) : cardNewsData ? (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-4 pr-4">
                          {cardNewsData.images.map((imageUrl, idx) => (
                            <div key={idx} className="border rounded-lg overflow-hidden">
                              <img
                                src={`${API_BASE_URL}${imageUrl}`}
                                alt={`카드 ${idx + 1}`}
                                className="w-full h-auto"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
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
              {filteredLaws.length}건
            </Badge>
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
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[400px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="법령명, 내용 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9 pr-9 h-9"
                  disabled={loading}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={handleSearchClear}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
      </div>
    </div>
  );
}
