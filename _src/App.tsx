import { useState } from "react";
import { MessageCircle, FileText, Users, Scale, ArrowRight, ChevronDown, ChevronUp, Search, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { ChatBot } from "./components/ChatBot";
import { SearchResults } from "./components/SearchResults";
import { ChatBotPage } from "./components/ChatBotPage";
import { LawSummaryPage } from "./components/LawSummaryPage";
import { BillAnalysisPage } from "./components/BillAnalysisPage";

type PageType = 'main' | 'search' | 'chatbot' | 'summary' | 'analysis';

export default function App() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<PageType>('main');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentPage('search');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  const handleNewSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
  };

  const navigateToPage = (page: PageType) => {
    setCurrentPage(page);
  };

  const cardNews = [
    {
      id: 1,
      title: "청년 내일채움공제 개정안 통과",
      description: "청년 취업지원을 위한 새로운 정책이 국회를 통과했습니다.",
      date: "2024.12.20",
      category: "청년정책"
    },
    {
      id: 2,
      title: "임대차보호법 개정",
      description: "전월세 보증금 보호를 위한 법안이 개정되었습니다.",
      date: "2024.12.18",
      category: "부동산"
    },
    {
      id: 3,
      title: "근로기준법 시행령 개정",
      description: "유연근무제 확대를 위한 시행령 개정안입니다.",
      date: "2024.12.15",
      category: "노동법"
    }
  ];

  const youthLaws = [
    {
      id: 1,
      title: "청년 기본법 개정안",
      description: "청년 연령 기준을 34세에서 39세로 확대",
      date: "2024.12.22",
      status: "가결"
    },
    {
      id: 2,
      title: "청년 주거지원 특별법",
      description: "청년 전세대출 한도 상향 및 지원 조건 완화",
      date: "2024.12.20",
      status: "가결"
    },
    {
      id: 3,
      title: "청년창업지원법 개정안",
      description: "창업 지원금 확대 및 세제 혜택 강화",
      date: "2024.12.18",
      status: "가결"
    }
  ];

  const features = [
    {
      icon: FileText,
      title: "AI 법률 요약 & 쉬운 말",
      description: "어려운 법률 문서나 판례를 AI가 핵심 내용만 쉽게 요약해드립니다. 시간을 절약하고 핵심을 파악하세요.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Users,
      title: "최신 가결안 분석",
      description: "우리 지역 국회의원의 의정활동, 법안 발의 현황, 투표 기록 등을 한눈에 확인할 수 있습니다.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // 페이지 라우팅
  switch (currentPage) {
    case 'search':
      return (
        <SearchResults
          searchQuery={searchQuery}
          onBack={handleBackToMain}
          onNewSearch={handleNewSearch}
        />
      );
    case 'chatbot':
      return <ChatBotPage onBack={handleBackToMain} />;
    case 'summary':
      return <LawSummaryPage onBack={handleBackToMain} />;
    case 'analysis':
      return <BillAnalysisPage onBack={handleBackToMain} />;
    default:
      break;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">LawPick</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                기능
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                소개
              </a>
              <Button variant="outline">로그인</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            일상 속 법률,
            <br />
            <span className="text-primary">쉽게 이해하세요</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            복잡한 법률 용어와 절차를 AI가 쉽게 설명해드립니다. 
            챗봇 상담부터 법률 문서 요약, 국회의원 분석까지 한 곳에서 해결하세요.
          </p>
          
          {/* 법률/정책 통합 검색창 */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="법률, 정책, 판례 등을 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-14 pl-6 pr-20 text-lg rounded-full border-2 border-primary/20 focus:border-primary"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-2 h-10 w-10 rounded-full"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              예시: "임대차보호법", "청년창업지원", "근로기준법 휴가"
            </p>
          </div>
        </div>
      </section>

      {/* 카드뉴스 및 청년 법안 섹션 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* 오늘의 카드뉴스 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">오늘의 카드뉴스</h3>
              </div>
              
              <div className="space-y-4">
                {cardNews.map((news) => (
                  <Card key={news.id} className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1504465039710-0f49c0a47eb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwY2FyZHMlMjBpbmZvZ3JhcGhpY3xlbnwxfHx8fDE3NTg3MjMxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                          alt="카드뉴스"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {news.category}
                            </span>
                            <span className="text-xs text-muted-foreground">{news.date}</span>
                          </div>
                          <h4 className="font-semibold mb-1">{news.title}</h4>
                          <p className="text-sm text-muted-foreground">{news.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                카드뉴스 더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* 최근 통과된 청년 관련 법안 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h3 className="text-2xl font-bold">최근 통과된 청년 관련 법안</h3>
              </div>
              
              <div className="space-y-4">
                {youthLaws.map((law) => (
                  <Card key={law.id} className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1712837899101-c92056b7d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwZG9jdW1lbnRzJTIwbGF3fGVufDF8fHx8MTc1ODcyMzE4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                          alt="법안 문서"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {law.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{law.date}</span>
                          </div>
                          <h4 className="font-semibold mb-1">{law.title}</h4>
                          <p className="text-sm text-muted-foreground">{law.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                청년 법안 더보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">주요 기능</h3>
            <p className="text-lg text-muted-foreground">
              법률을 더 쉽고 친근하게 만나보세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* 법률 챗봇 - 접기/펼치기 가능한 채팅 인터페이스 */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl"> AI 법률 챗봇</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      궁금한 법률 문제를 바로 질문해보세요. 실시간으로 답변을 받을 수 있습니다.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className="shrink-0 h-8 w-8 text-blue-600 hover:bg-blue-50"
                  >
                    {isChatExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isChatExpanded ? (
                  <div className="h-[400px] max-h-[400px] overflow-y-auto border rounded-lg">
                    <ChatBot />
                  </div>
                ) : (
                  <Button 
                    onClick={() => navigateToPage('chatbot')}
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    채팅 시작하기
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 나머지 기능들 */}
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const pageMap: { [key: string]: PageType } = {
                "AI 법률 요약 & 쉬운 말": "summary",
                "최신 가결안 분석": "analysis"
              };
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigateToPage(pageMap[feature.title])}
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      시작하기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-muted-foreground">해결된 법률 질문</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <p className="text-muted-foreground">요약된 법률 문서</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">300</div>
              <p className="text-muted-foreground">분석된 국회의원</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-3xl font-bold mb-4">
            지금 바로 시작해보세요
          </h3>
          <p className="text-lg mb-8 opacity-90">
            복잡한 법률 문제도 이제 쉽게 해결할 수 있습니다. 
            무료로 시작해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
            >
              무료 체험하기
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">LawPick</span>
              </div>
              <p className="text-muted-foreground">
                일상생활의 법률 문제를 AI로 쉽게 해결하세요.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">법률 챗봇</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AI 요약</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">국회의원 분석</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">도움말</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">자주 묻는 질문</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">소개</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 LawPick. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}