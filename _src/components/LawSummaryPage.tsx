import { useState } from "react";
import { ArrowLeft, FileText, Search, Download, Copy, Sparkles, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface LawSummaryPageProps {
  onBack: () => void;
}

interface Law {
  id: number;
  title: string;
  category: string;
  lastUpdate: string;
  summary: string;
  difficulty: string;
}

export function LawSummaryPage({ onBack }: LawSummaryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lawDatabase = [
    {
      id: 1,
      title: "주택임대차보호법",
      category: "부동산",
      lastUpdate: "2024.12.15",
      summary: "주택의 임대차에 관하여 민법의 특례를 규정함으로써 국민의 주거생활의 안정을 보장",
      difficulty: "중급"
    },
    {
      id: 2,
      title: "근로기준법",
      category: "노동법",
      lastUpdate: "2024.11.20",
      summary: "근로조건의 기준을 정함으로써 근로자의 기본적 생활을 보장하고 향상시키는 것을 목적",
      difficulty: "고급"
    },
    {
      id: 3,
      title: "소비자기본법",
      category: "소비자보호",
      lastUpdate: "2024.10.30",
      summary: "소비자의 권익증진과 소비생활의 향상을 도모하고 국민경제의 발전에 이바지",
      difficulty: "초급"
    },
    {
      id: 4,
      title: "개인정보보호법",
      category: "정보통신",
      lastUpdate: "2024.12.01",
      summary: "개인정보의 수집·이용·제공 등 처리에 있어서 개인의 자유와 권리를 보호",
      difficulty: "중급"
    }
  ];

  const selectedLawDetail = {
    id: 1,
    title: "주택임대차보호법",
    originalText: `제1조(목적) 이 법은 주택의 임대차에 관하여 민법의 특례를 규정함으로써 국민의 주거생활의 안정을 보장함을 목적으로 한다.

제2조(적용범위) 주거용 건물의 전부 또는 일부의 임대차에 관하여는 이 법이 정하는 바에 따른다. 다만, 일시사용을 위한 것으로 인정되는 경우에는 그러하지 아니하다.

제3조(임대차의 대항력) ① 임대차는 그 등기가 없는 경우에도 임차인이 주택의 인도와 주민등록을 마친 때에는 그 다음 날부터 제3자에 대하여 효력이 생긴다.
② 임차인은 임대차가 끝난 후 보증금을 돌려받을 때까지는 임차주택을 계속 점유할 수 있다.

제4조(임차권의 승계) 임대차 기간 중 임차주택의 소유권이 제3자에게 이전된 경우에는 임대차는 그 제3자에 대하여도 그 효력이 있다.

제5조(임차보증금의 반환) ① 임대차가 끝나면 임대인은 임차인에게 보증금을 돌려주어야 한다. 다만, 임차료 등의 채무가 있는 경우에는 이를 공제할 수 있다.
② 임대인이 보증금을 돌려주지 아니하면 임차인은 지연이자를 청구할 수 있다.

제6조(차임 등의 증액 제한) ① 임대인은 임차인에 대하여 최초 차임의 100분의 5를 초과하는 범위에서 차임과 보증금을 증액하도록 요구할 수 없다.
② 증액은 임대차계약 또는 약정한 차임 등의 증액이 있은 후 1년 이내에는 하지 못한다.`,
    summary: {
      mainPoints: [
        "주택 임대차 계약에서 임차인의 권리를 보호하는 특별법",
        "주거용 건물의 임대차에 적용되며, 일시사용은 제외",
        "등기 없이도 주택 인도와 주민등록으로 대항력 발생",
        "보증금 반환까지 임차주택 점유 가능",
        "연간 임대료 인상률 5% 제한"
      ],
      keyTerms: [
        { term: "대항력", definition: "제3자에게 임차권을 주장할 수 있는 법적 효력" },
        { term: "임차보증금", definition: "임대차 계약 체결 시 임차인이 임대인에게 지급하는 보증금" },
        { term: "차임 증액 제한", definition: "임대료 인상을 연 5% 이내로 제한하는 규정" }
      ]
    },
    easyExplanation: {
      overview: "집을 빌려 살 때 세입자를 보호하기 위한 법률입니다. 복잡한 부동산 거래에서 상대적으로 약한 위치에 있는 세입자의 권리를 지켜주는 역할을 합니다.",
      situations: [
        {
          title: "🏠 집을 빌릴 때",
          content: "전세나 월세 계약을 할 때 이 법이 적용됩니다. 계약서에 서명하고 집에 들어가서 주민등록을 이전하면, 나중에 집주인이 바뀌어도 계약은 그대로 유지됩니다."
        },
        {
          title: "💰 전세금 돌려받을 때",
          content: "계약이 끝나면 집주인은 반드시 전세금을 돌려줘야 합니다. 만약 밀린 관리비나 수리비가 있다면 그만큼만 빼고 나머지는 모두 돌려받을 수 있습니다."
        },
        {
          title: "📈 임대료 인상 제한",
          content: "집주인이 마음대로 임대료를 올릴 수 없습니다. 1년에 최대 5%까지만 올릴 수 있고, 한 번 올린 후에는 1년 동안 다시 올릴 수 없습니다."
        }
      ],
      realLifeExamples: [
        "전세 계약 만료 후 집주인이 전세금 반환을 거부하는 경우",
        "월세를 갑자기 20% 인상하겠다고 통보받은 경우",  
        "집주인이 바뀌었는데 기존 계약을 인정하지 않으려는 경우"
      ]
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const found = lawDatabase.find(law => 
        law.title.includes(searchQuery) || law.category.includes(searchQuery)
      );
      if (found) {
        setSelectedLaw(found);
        analyzeSelectedLaw();
      }
    }
  };

  const handleLawSelect = (law: Law) => {
    setSelectedLaw(law);
    analyzeSelectedLaw();
  };

  const analyzeSelectedLaw = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-100 text-green-700';
      case '중급': return 'bg-yellow-100 text-yellow-700';
      case '고급': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  법률 검색
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="법률명 또는 분야 입력..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">주요 법률</h4>
                  {lawDatabase.map((law) => (
                    <Card 
                      key={law.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedLaw?.id === law.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleLawSelect(law)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">{law.title}</h5>
                            <Badge className={getDifficultyColor(law.difficulty)}>
                              {law.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{law.summary}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{law.category}</span>
                            <span>{law.lastUpdate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                {/* 선택된 법률 정보 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {selectedLawDetail.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          다운로드
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(selectedLawDetail.originalText)}>
                          <Copy className="h-4 w-4 mr-2" />
                          복사
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

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
                ) : (
                  <Tabs defaultValue="original" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="original">법령 원문</TabsTrigger>
                      <TabsTrigger value="summary">AI 요약</TabsTrigger>
                      <TabsTrigger value="easy">쉬운 말 설명</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="original" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>법령 원문</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-96">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {selectedLawDetail.originalText}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="summary" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI 핵심 요약
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-3">주요 내용</h4>
                            <ul className="space-y-2">
                              {selectedLawDetail.summary.mainPoints.map((point, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-primary font-semibold">•</span>
                                  <span className="text-sm">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">핵심 용어 설명</h4>
                            <div className="space-y-3">
                              {selectedLawDetail.summary.keyTerms.map((term, index) => (
                                <div key={index} className="border-l-4 border-primary/20 pl-4">
                                  <h5 className="font-medium text-primary">{term.term}</h5>
                                  <p className="text-sm text-muted-foreground">{term.definition}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="easy" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            쉬운 말로 설명
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-3">이 법은 무엇인가요?</h4>
                            <p className="text-sm leading-relaxed bg-blue-50 p-4 rounded-lg">
                              {selectedLawDetail.easyExplanation.overview}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">어떤 상황에 적용되나요?</h4>
                            <div className="space-y-4">
                              {selectedLawDetail.easyExplanation.situations.map((situation, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <h5 className="font-medium mb-2">{situation.title}</h5>
                                  <p className="text-sm text-muted-foreground">{situation.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">실생활 사례</h4>
                            <ul className="space-y-2">
                              {selectedLawDetail.easyExplanation.realLifeExamples.map((example, index) => (
                                <li key={index} className="flex gap-2">
                                  <span className="text-green-600 font-semibold">✓</span>
                                  <span className="text-sm">{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}