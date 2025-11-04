import { useState } from "react";
import { ArrowLeft, Users, Calendar, CheckCircle, Clock, ArrowRight, FileText, Target, User, Hash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface BillAnalysisPageProps {
  onBack: () => void;
}

interface Bill {
  id: number;
  title: string;
  description: string;
  category: string;
  proposer: string;
  date: string;
  status: 'passed' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  summary: string;
  changes: string[];
  targets: string[];
  implementation: {
    date: string;
    phase: string;
    details: string;
  };
}

export function BillAnalysisPage({ onBack }: BillAnalysisPageProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const youthBills: Bill[] = [
    {
      id: 1,
      title: "청년 기본법 개정안",
      description: "청년의 연령 기준을 현행 34세에서 39세로 확대하고, 청년정책 지원 대상을 넓히는 개정안",
      category: "취업",
      proposer: "국회 교육위원회",
      date: "2024.12.22",
      status: 'passed',
      priority: 'high',
      summary: "청년의 정의를 39세까지 확대하여 더 많은 청년들이 정책 혜택을 받을 수 있도록 하는 개정안입니다.",
      changes: [
        "청년 연령 기준: 34세 → 39세로 확대",
        "청년정책 대상자 약 200만명 추가 포함",
        "청년 일자리 지원사업 확대",
        "청년 주거지원 정책 대상 확대"
      ],
      targets: [
        "35세~39세 연령층",
        "구직 활동 중인 청년",
        "창업을 준비하는 청년",
        "주거 문제를 겪는 청년"
      ],
      implementation: {
        date: "2025.03.01",
        phase: "시행 예정",
        details: "2025년 3월 1일부터 확대된 연령 기준이 적용되며, 기존 청년정책 사업들이 순차적으로 대상을 확대할 예정입니다."
      }
    },
    {
      id: 2,
      title: "청년 주거지원 특별법",
      description: "청년 전세대출 한도 상향 및 지원 조건 완화를 통한 주거 안정성 강화 법안",
      category: "부동산",
      proposer: "국토교통위원회",
      date: "2024.12.20",
      status: 'passed',
      priority: 'high',
      summary: "청년층의 주거 부담을 줄이기 위해 전세대출 한도를 상향하고 지원 조건을 대폭 완화한 특별법입니다.",
      changes: [
        "청년 전세대출 한도: 2억원 → 3억원으로 상향",
        "소득 요건 완화: 연소득 5천만원 → 7천만원",
        "LTV 비율 확대: 70% → 80%",
        "대출 금리 우대: 기준금리 -1.5%p"
      ],
      targets: [
        "만 19세~39세 무주택 청년",
        "신혼부부 및 예비 신혼부부",
        "대학생 및 사회초년생",
        "지방에서 수도권으로 이주하는 청년"
      ],
      implementation: {
        date: "2025.01.15",
        phase: "시행 중",
        details: "2025년 1월 15일부터 시행되며, 기존 대출자도 조건 변경 신청이 가능합니다."
      }
    },
    {
      id: 3,
      title: "청년창업지원법 개정안",
      description: "창업 지원금 확대 및 세제 혜택 강화를 통한 청년 창업 생태계 활성화 방안",
      category: "금융",
      proposer: "중소벤처기업위원회",
      date: "2024.12.18",
      status: 'passed',
      priority: 'medium',
      summary: "청년 창업가들의 성공적인 사업 시작을 위해 자금 지원과 세제 혜택을 대폭 확대한 개정안입니다.",
      changes: [
        "창업 지원금 한도: 5천만원 → 1억원으로 확대",
        "법인세 면제 기간: 2년 → 3년으로 연장",
        "창업 준비금 소득공제 한도 상향",
        "창업 실패 시 재기 지원 프로그램 신설"
      ],
      targets: [
        "만 39세 이하 예비 창업자",
        "창업 3년 이내 청년 사업자",
        "기술창업을 준비하는 청년",
        "소셜벤처 창업 청년"
      ],
      implementation: {
        date: "2025.04.01",
        phase: "시행 예정",
        details: "2025년 4월 1일부터 시행되며, 기존 창업자들도 소급 적용하여 혜택을 받을 수 있습니다."
      }
    },
    {
      id: 4,
      title: "청년 고용촉진 특별법",
      description: "청년 일자리 창출과 고용 안정성 향상을 위한 기업 인센티브 및 지원 확대",
      category: "취업",
      proposer: "환경노동위원회",
      date: "2024.12.15",
      status: 'passed',
      priority: 'high',
      summary: "청년 실업률 해소와 양질의 일자리 창출을 위해 기업과 청년 모두에게 혜택을 주는 종합 지원법입니다.",
      changes: [
        "청년 채용 기업 세액공제 확대",
        "청년 인턴십 지원금 인상",
        "정규직 전환 인센티브 신설",
        "직업교육훈련 프로그램 확대"
      ],
      targets: [
        "구직 중인 15~34세 청년",
        "청년 채용 계획이 있는 기업",
        "직업 전환을 희망하는 청년",
        "장기간 구직 활동 중인 청년"
      ],
      implementation: {
        date: "2025.02.01",
        phase: "시행 예정",
        details: "2025년 2월 1일부터 시행되며, 관련 시스템 구축이 완료되는 대로 순차 적용됩니다."
      }
    },
    {
      id: 5,
      title: "청년 교육비 지원 확대법",
      description: "대학등록금 부담 경감 및 평생교육 기회 확대를 위한 지원 체계 구축",
      category: "교육",
      proposer: "교육위원회",
      date: "2024.12.10",
      status: 'pending',
      priority: 'medium',
      summary: "청년층의 교육비 부담을 줄이고 평생학습 기회를 확대하여 미래 경쟁력을 강화하는 법안입니다.",
      changes: [
        "국가장학금 지원 대상 확대",
        "학자금 대출 이자 추가 감면",
        "직업재교육 프로그램 무료 제공",
        "온라인 교육 플랫폼 구축"
      ],
      targets: [
        "대학생 및 대학원생",
        "평생교육을 희망하는 청년",
        "직업 재교육이 필요한 청년",
        "저소득층 청년 학습자"
      ],
      implementation: {
        date: "2025.09.01",
        phase: "심의 중",
        details: "현재 국회 심의 중이며, 통과 시 2025년 9월 1일부터 단계적으로 시행될 예정입니다."
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return '가결';
      case 'pending': return '심의중';
      case 'rejected': return '부결';
      default: return '미정';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '미정';
    }
  };

  const categories = ['all', '부동산', '금융', '취업', '교육'];
  const filteredBills = selectedCategory === 'all' 
    ? youthBills 
    : youthBills.filter(bill => bill.category === selectedCategory);

  if (selectedBill) {
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedBill(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold">{selectedBill.title}</h1>
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
                    <CardTitle className="text-xl mb-2">{selectedBill.title}</CardTitle>
                    <p className="text-muted-foreground">{selectedBill.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">발의기관:</span>
                    <p className="font-medium">{selectedBill.proposer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">통과일:</span>
                    <p className="font-medium">{selectedBill.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">분야:</span>
                    <p className="font-medium">{selectedBill.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 탭 */}
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  한줄요약
                </TabsTrigger>
                <TabsTrigger value="changes" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  주요 변경점
                </TabsTrigger>
                <TabsTrigger value="targets" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  주요 대상자
                </TabsTrigger>
                <TabsTrigger value="implementation" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  시행 시기
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-600" />
                      한줄요약
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <p className="text-lg leading-relaxed">{selectedBill.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="changes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                      주요 변경점
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedBill.changes.map((change, index) => (
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
              </TabsContent>

              <TabsContent value="targets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      주요 대상자
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {selectedBill.targets.map((target, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <p className="text-sm">{target}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4">
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
                          <p className="text-lg font-bold text-orange-900">{selectedBill.implementation.date}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">현재 상태</h4>
                          <p className="text-lg font-bold text-orange-900">{selectedBill.implementation.phase}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">시행 세부사항</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedBill.implementation.details}
                        </p>
                      </div>
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
                <h1 className="font-semibold">국회 가결안 분석 </h1>
                <p className="text-sm text-muted-foreground">청년 관련 법안 현황을 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">청년 관련 법안</h2>
            <Badge variant="secondary">{filteredBills.length}건</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? '전체' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* 법안 목록 */}
        <div className="grid gap-6">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{bill.title}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {bill.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {bill.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {bill.proposer}
                      </div>
                      <Badge variant="outline">{bill.category}</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedBill(bill)}
                    className="flex-shrink-0"
                  >
                    상세보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">해당 카테고리의 법안이 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 카테고리를 선택해보세요.</p>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              전체 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}