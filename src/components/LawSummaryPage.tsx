import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Search, Sparkles, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
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

export function LawSummaryPage({ onBack }: LawSummaryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL에서 초기값 가져오기
  const categoryFromUrl = searchParams.get("category");
  const lawIdFromUrl = searchParams.get("law_id");

  // /summary/all 경로인지 확인
  const isAllPath = location.pathname === '/summary/all' || location.pathname === '/summary';

  // 선택된 카테고리를 Set으로 관리 (토글 방식)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedLaw, setSelectedLaw] = useState<LawListItem | null>(null);
  const [selectedLawData, setSelectedLawData] = useState<LawSummaryResponse | null>(null);
  const [cardNewsData, setCardNewsData] = useState<LawCardsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
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
  }, [categoryFromUrl, isAllPath]);

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
      // 선택된 카테고리가 없으면 전체 조회 (category 파라미터 없이)
      // 선택된 카테고리가 있으면 첫 번째 카테고리로 조회 (API가 단일 카테고리만 지원하는 경우)
      // 여러 카테고리를 지원하려면 API 수정이 필요하지만, 일단 첫 번째 카테고리만 사용
      const category = selectedCategories.size === 0 
        ? undefined 
        : CATEGORY_MAP[Array.from(selectedCategories)[0]];
      
      const response = await getLawList({
        category,
        page: 1,
        size: 50
      });

      if (response.data) {
        // 선택된 카테고리가 있으면 필터링
        let filtered = response.data.items;
        if (selectedCategories.size > 0) {
          const categoryKoreans = Array.from(selectedCategories);
          filtered = filtered.filter(law => 
            categoryKoreans.includes(law.category)
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

  // 카테고리 토글 핸들러
  const handleCategoryToggle = (category: string) => {
    setSelectedLaw(null);
    setSelectedLawData(null);
    setCardNewsData(null);
    
    const newCategories = new Set(selectedCategories);
    
    if (newCategories.has(category)) {
      // 이미 선택된 경우 제거
      newCategories.delete(category);
    } else {
      // 선택되지 않은 경우 추가
      newCategories.add(category);
    }
    
    setSelectedCategories(newCategories);

    // URL 업데이트
    if (newCategories.size === 0) {
      // 선택된 카테고리가 없으면 category 파라미터 제거
      setSearchParams({}, { replace: true });
    } else {
      // 선택된 카테고리를 문자열로 변환하여 URL에 추가
      const categoryStrings = Array.from(newCategories).map(cat => CATEGORY_MAP[cat]);
      setSearchParams({ category: categoryStrings.join(',') }, { replace: true });
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

    // URL 업데이트 (category만 유지, law_id 제거)
    const categoryStrings = Array.from(selectedCategories).map(cat => CATEGORY_MAP[cat]);
    if (categoryStrings.length > 0) {
      setSearchParams({ category: categoryStrings.join(',') });
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
  const filteredLaws = laws.filter(law =>
    searchQuery === "" ||
    law.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    law.short_desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 법률 검색 및 선택 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* 카테고리 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedCategories.has("부동산") ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCategoryToggle("부동산")}
                  >
                    부동산
                  </Button>
                  <Button
                    variant={selectedCategories.has("금융") ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCategoryToggle("금융")}
                  >
                    금융
                  </Button>
                  <Button
                    variant={selectedCategories.has("취업") ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCategoryToggle("취업")}
                  >
                    취업
                  </Button>
                  <Button
                    variant={selectedCategories.has("교육") ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCategoryToggle("교육")}
                  >
                    교육
                  </Button>
                </div>

                {/* 검색창 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="법령 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 법령 목록 */}
                <div className="space-y-3">
                  <h4 className="font-medium">현행법령 ({filteredLaws.length})</h4>

                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      로딩 중...
                    </div>
                  ) : filteredLaws.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      법령이 없습니다
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3 pr-4">
                        {filteredLaws.map((law) => (
                          <Card
                            key={law.law_id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedLaw?.law_id === law.law_id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleLawSelect(law)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">{law.title}</h5>
                                {law.short_desc && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {law.short_desc}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{law.category}</span>
                                  <span>{law.start_date}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 법률 원문 및 분석 결과 */}
          <div className="lg:col-span-2">
            {!selectedLaw ? (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">법률을 선택해주세요</h3>
                  <p className="text-muted-foreground">
                    왼쪽에서 분석하고 싶은 법률을 선택하시면<br />
                    AI가 쉽게 요약해드립니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
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
                  <Tabs defaultValue="easy" className="w-full" onValueChange={(value) => {
                    if (value === "cardnews") loadCardNews();
                  }}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="easy">쉬운 말 설명</TabsTrigger>
                      <TabsTrigger value="cardnews">카드뉴스</TabsTrigger>
                    </TabsList>

                    <TabsContent value="easy" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            {selectedLawData.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                      src={`http://localhost:8000${imageUrl}`}
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
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      요약 정보를 불러오지 못했습니다
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
