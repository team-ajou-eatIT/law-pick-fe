import { useState } from "react";
import {
  Search,
  ArrowLeft,
  FileText,
  BookOpen,
  Newspaper,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SearchResultsProps {
  searchQuery: string;
  onBack: () => void;
  onNewSearch: (query: string) => void;
}

export function SearchResults({
  searchQuery,
  onBack,
  onNewSearch,
}: SearchResultsProps) {
  const [currentQuery, setCurrentQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = () => {
    if (currentQuery.trim()) {
      onNewSearch(currentQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 모의 검색 결과 데이터
  const lawResults = [
    {
      id: 1,
      title: "임대차보호법",
      type: "법령",
      description:
        "주택임대차보호법은 주택의 임대차에 관하여 민법의 특례를 규정함으로써 국민의 주거생활의 안정을 보장함을 목적으로 합니다.",
      lastUpdate: "2024.12.15",
      relevance: 95,
    },
    {
      id: 2,
      title: "민법 제618조 (임대차계약)",
      type: "법령",
      description:
        "임대차는 당사자 일방이 상대방에게 목적물을 사용, 수익하게 할 것을 약정하고 상대방이 이에 대하여 차임을 지급할 것을 약정함으로써 그 효력이 생긴다.",
      lastUpdate: "2024.11.20",
      relevance: 88,
    },
    {
      id: 3,
      title: "상가건물 임대차보호법",
      type: "법령",
      description:
        "상가건물의 임대차에 관하여 민법의 특례를 규정함으로써 상가건물 임대차의 안정을 보장하고 상가건물 임차인의 권익을 보호함을 목적으로 합니다.",
      lastUpdate: "2024.10.30",
      relevance: 82,
    },
  ];

  const cardNewsResults = [
    {
      id: 1,
      title: "임대차보호법 개정, 달라진 점은?",
      type: "카드뉴스",
      description:
        "2024년 개정된 임대차보호법의 주요 변경사항을 카드뉴스로 쉽게 설명합니다.",
      date: "2024.12.18",
      views: 1250,
      relevance: 92,
    },
    {
      id: 2,
      title: "전월세 보증금 보호 완벽 가이드",
      type: "카드뉴스",
      description:
        "전월세 계약 시 보증금을 안전하게 보호받는 방법을 단계별로 안내합니다.",
      date: "2024.12.10",
      views: 2100,
      relevance: 89,
    },
  ];

  const billAnalysisResults = [
    {
      id: 1,
      title: "임대차보호법 일부개정법률안",
      type: "법안 분석",
      description:
        "임차인 보호 강화를 위한 개정안 분석 및 예상효과를 상세히 설명합니다.",
      proposer: "국토교통위원회",
      status: "가결",
      date: "2024.12.22",
      relevance: 94,
    },
    {
      id: 3,
      title: "전월세상한제 개선방안",
      type: "법안 분석",
      description:
        "전월세상한제의 현황과 개선방안에 대한 전문가 분석 보고서입니다.",
      proposer: "정책연구소",
      status: "연구중",
      date: "2024.12.15",
      relevance: 87,
    },
  ];

  const allResults = [
    ...lawResults.map((item) => ({ ...item, category: "law" })),
    ...cardNewsResults.map((item) => ({ ...item, category: "news" })),
    ...billAnalysisResults.map((item) => ({ ...item, category: "analysis" })),
  ].sort((a, b) => b.relevance - a.relevance);

  const filteredResults =
    selectedCategory === "all"
      ? allResults
      : allResults.filter((item) => item.category === selectedCategory);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "법령":
        return <FileText className="h-4 w-4" />;
      case "카드뉴스":
        return <Newspaper className="h-4 w-4" />;
      case "법안 분석":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "법령":
        return "bg-blue-100 text-blue-700";
      case "카드뉴스":
        return "bg-green-100 text-green-700";
      case "법안 분석":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 검색 헤더 */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="법률, 정책, 판례 등을 검색해보세요..."
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-12 pl-4 pr-16 rounded-full border-2 border-primary/20 focus:border-primary"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-2 h-8 w-8 rounded-full"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 필터 및 결과 요약 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                "
                <span className="font-semibold text-foreground">
                  {searchQuery}
                </span>
                " 검색 결과 {filteredResults.length}건
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="law">법령</SelectItem>
                  <SelectItem value="news">카드뉴스</SelectItem>
                  <SelectItem value="analysis">법안 분석</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <Card
              key={`${result.category}-${result.id}`}
              className="hover:shadow-lg transition-all cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {result.type === "카드뉴스" ? (
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1504465039710-0f49c0a47eb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwY2FyZHMlMjBpbmZvZ3JhcGhpY3xlbnwxfHx8fDE3NTg3MjMxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="카드뉴스"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center ${getCategoryColor(
                          result.type
                        )}`}
                      >
                        {getCategoryIcon(result.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={getCategoryColor(result.type)}
                      >
                        {result.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        관련도 {result.relevance}%
                      </span>
                      {"status" in result && (
                        <Badge
                          variant={result.status === "가결" ? "default" : "outline"}
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {result.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {result.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {"lastUpdate" in result && (
                        <span>최종 수정: {result.lastUpdate}</span>
                      )}
                      {"date" in result && <span>발행일: {result.date}</span>}
                      {"views" in result && (
                        <span>조회수: {result.views.toLocaleString()}</span>
                      )}
                      {"proposer" in result && (
                        <span>발의: {result.proposer}</span>
                      )}
                    </div>
                  </div>

                  <ChevronDown className="h-5 w-5 text-muted-foreground transform rotate-[-90deg]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 결과가 없는 경우 */}
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              다른 검색어로 시도해보시거나 필터를 변경해보세요.
            </p>
            <Button variant="outline" onClick={() => setSelectedCategory("all")}>
              전체 카테고리로 보기
            </Button>
          </div>
        )}

        {/* 더보기 버튼 */}
        {filteredResults.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              더 많은 결과 보기
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

