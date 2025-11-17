import { useState } from "react";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageCircle,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { SearchResults } from "./components/SearchResults";
import { ChatBotPage } from "./components/ChatBotPage";
import { LawSummaryPage } from "./components/LawSummaryPage";
import { BillAnalysisPage } from "./components/BillAnalysisPage";
import svgPaths from "./imports/svg-azm55u9hex";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/chatbot" element={<ChatBotPageWrapper />} />
      <Route path="/summary" element={<LawSummaryPageWrapper />} />
      <Route path="/summary/all" element={<LawSummaryPageWrapper />} />
      <Route path="/analysis" element={<BillAnalysisPageWrapper />} />
      <Route path="/analysis/all" element={<BillAnalysisPageWrapper />} />
    </Routes>
  );
}

// 각 페이지 래퍼 컴포넌트
function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <SearchResults
      searchQuery={query}
      onBack={() => navigate('/')}
      onNewSearch={(newQuery) => navigate(`/search?q=${encodeURIComponent(newQuery)}`)}
    />
  );
}

function ChatBotPageWrapper() {
  const navigate = useNavigate();
  return <ChatBotPage onBack={() => navigate('/')} />;
}

function LawSummaryPageWrapper() {
  const navigate = useNavigate();
  return <LawSummaryPage onBack={() => navigate('/')} />;
}

function BillAnalysisPageWrapper() {
  const navigate = useNavigate();
  return <BillAnalysisPage onBack={() => navigate('/')} />;
}

function MainPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const navigateToPage = (page: string) => {
    navigate(`/${page}`);
  };

  const features = [
    {
      icon: FileText,
      title: "AI 법률 요약 & 쉬운말 해설",
      description:
        "복잡하고 어려운 법령, 더 이상 고민하지 마세요. AI가 핵심 내용만 뽑아 누구나 이해할 수 있도록 쉬운 말로 요약해드립니다.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "국회 가결안 청년 맞춤 분석",
      description:
        "국회에서 새로 통과된 가결안 중, 청년과 관련된 법안만 골라 한눈에 보여드립니다.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Gradient Effects - Top Right */}
      <div className="absolute right-[-200px] top-[-300px] w-[685px] h-[559px] pointer-events-none opacity-50">
        <div className="absolute inset-0 rotate-[47.669deg]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1085 959"
          >
            <g opacity="0.32">
              <g filter="url(#filter0_f_140_84)">
                <ellipse
                  cx="542.5"
                  cy="444.339"
                  fill="url(#paint0_linear_140_84)"
                  rx="342.5"
                  ry="244.339"
                />
              </g>
              <g filter="url(#filter1_f_140_84)">
                <rect
                  fill="url(#paint1_linear_140_84)"
                  fillOpacity="0.69"
                  height="333.135"
                  width="329.134"
                  x="377.933"
                  y="425.865"
                />
              </g>
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="888.678"
                id="filter0_f_140_84"
                width="1085"
                x="0"
                y="0"
              >
                <feFlood
                  floodOpacity="0"
                  result="BackgroundImageFix"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_140_84"
                  stdDeviation="100"
                />
              </filter>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="733.135"
                id="filter1_f_140_84"
                width="729.134"
                x="177.933"
                y="225.865"
              >
                <feFlood
                  floodOpacity="0"
                  result="BackgroundImageFix"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_140_84"
                  stdDeviation="100"
                />
              </filter>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_140_84"
                x1="542.5"
                x2="542.5"
                y1="200"
                y2="688.678"
              >
                <stop stopColor="#090909" stopOpacity="0" />
                <stop offset="1" stopColor="#2B00FF" />
              </linearGradient>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint1_linear_140_84"
                x1="542.5"
                x2="542.5"
                y1="425.865"
                y2="759"
              >
                <stop stopColor="#184BFF" stopOpacity="0" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Background Gradient Effects - Bottom Left */}
      <div className="absolute left-[100px] bottom-[50px] w-[685px] h-[559px] pointer-events-none opacity-40">
        <div className="absolute inset-0 rotate-[18.504deg]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1085 959"
          >
            <g opacity="0.52">
              <g filter="url(#filter0_f_140_80)">
                <ellipse
                  cx="542.5"
                  cy="444.339"
                  fill="url(#paint0_linear_140_80)"
                  rx="342.5"
                  ry="244.339"
                />
              </g>
              <g filter="url(#filter1_f_140_80)">
                <rect
                  fill="url(#paint1_linear_140_80)"
                  fillOpacity="0.69"
                  height="333.135"
                  width="329.134"
                  x="377.933"
                  y="425.865"
                />
              </g>
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="888.678"
                id="filter0_f_140_80"
                width="1085"
                x="0"
                y="0"
              >
                <feFlood
                  floodOpacity="0"
                  result="BackgroundImageFix"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_140_80"
                  stdDeviation="100"
                />
              </filter>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="733.135"
                id="filter1_f_140_80"
                width="729.134"
                x="177.933"
                y="225.865"
              >
                <feFlood
                  floodOpacity="0"
                  result="BackgroundImageFix"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_140_80"
                  stdDeviation="100"
                />
              </filter>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_140_80"
                x1="542.5"
                x2="542.5"
                y1="200"
                y2="688.678"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="0.942308" stopColor="#2B00FF" />
              </linearGradient>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint1_linear_140_80"
                x1="542.5"
                x2="542.5"
                y1="425.865"
                y2="759"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            <h1 className="mb-4">
              <span
                className="inline-block bg-gradient-to-r from-black to-[#2B00FF] bg-clip-text"
                style={{
                  WebkitTextFillColor: "transparent",
                  fontSize: "96px",
                  fontWeight: 500,
                  letterSpacing: "-3.36px",
                }}
              >
                Law Pick
              </span>
            </h1>
            <p
              className="mb-16"
              style={{
                fontSize: "36px",
                fontWeight: 500,
                letterSpacing: "-3.36px",
                color: "black",
              }}
            >
              청년의 권리 : 쉽게, 바로 이해하다
            </p>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 max-w-6xl mx-auto">
              {/* 부동산 정책 Pick */}
              <div className="relative">
                <div className="backdrop-blur-[5.1px] bg-white/80 rounded-[15px] border border-[#e6e6e6] p-4 h-[149px] flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer">
                  <div>
                    <h3
                      className="text-[#666666] mb-1"
                      style={{
                        fontSize: "24px",
                        fontWeight: 500,
                        letterSpacing: "-1.68px",
                      }}
                    >
                      부동산
                      <br />
                      Pick
                    </h3>
                  </div>
                  <div className="flex items-start justify-between">
                    <p
                      className="text-[#666666] flex-1"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "-0.7px",
                      }}
                    >
                      전세사기를 당하지 않으려면
                      <br />뭘 확인해야 하나요 ?
                    </p>
                    <div className="flex-shrink-0 w-[27px] h-[27px]">
                      <svg
                        className="block size-full"
                        fill="none"
                        viewBox="0 0 27 27"
                      >
                        <path
                          d={svgPaths.p12b57640}
                          stroke="#666666"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="13.5"
                          cy="13.5"
                          r="13"
                          stroke="#666666"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 금융 Pick */}
              <div className="relative">
                <div className="backdrop-blur-[5.1px] bg-white/80 rounded-[15px] border border-[#e6e6e6] p-4 h-[149px] flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer">
                  <div>
                    <h3
                      className="text-[#666666] mb-1"
                      style={{
                        fontSize: "24px",
                        fontWeight: 500,
                        letterSpacing: "-1.68px",
                      }}
                    >
                      금융
                      <br />
                      Pick
                    </h3>
                  </div>
                  <div className="flex items-start justify-between">
                    <p
                      className="text-[#666666] flex-1"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "-0.7px",
                      }}
                    >
                      청년도약계좌를
                      <br />
                      소개해주세요 !
                    </p>
                    <div className="flex-shrink-0 w-[27px] h-[27px]">
                      <svg
                        className="block size-full"
                        fill="none"
                        viewBox="0 0 27 27"
                      >
                        <path
                          d={svgPaths.p12b57640}
                          stroke="#666666"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="13.5"
                          cy="13.5"
                          r="13"
                          stroke="#666666"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 취업 Pick */}
              <div className="relative">
                <div className="backdrop-blur-[5.1px] bg-white/80 rounded-[15px] border border-[#e6e6e6] p-4 h-[149px] flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer">
                  <div>
                    <h3
                      className="text-[#666666] mb-1"
                      style={{
                        fontSize: "24px",
                        fontWeight: 500,
                        letterSpacing: "-1.68px",
                      }}
                    >
                      취업
                      <br />
                      Pick
                    </h3>
                  </div>
                  <div className="flex items-start justify-between">
                    <p
                      className="text-[#666666] flex-1"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "-0.7px",
                      }}
                    >
                      근로계약서에 꼭 들어가야 하는
                      <br />
                      내용은 무엇인가요 ?
                    </p>
                    <div className="flex-shrink-0 w-[27px] h-[27px]">
                      <svg
                        className="block size-full"
                        fill="none"
                        viewBox="0 0 27 27"
                      >
                        <path
                          d={svgPaths.p12b57640}
                          stroke="#666666"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="13.5"
                          cy="13.5"
                          r="13"
                          stroke="#666666"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 교육 Pick */}
              <div className="relative">
                <div className="backdrop-blur-[5.1px] bg-white/80 rounded-[15px] border border-[#e6e6e6] p-4 h-[149px] flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer">
                  <div>
                    <h3
                      className="text-[#666666] mb-1"
                      style={{
                        fontSize: "24px",
                        fontWeight: 500,
                        letterSpacing: "-1.68px",
                      }}
                    >
                      교육
                      <br />
                      Pick
                    </h3>
                  </div>
                  <div className="flex items-start justify-between">
                    <p
                      className="text-[#666666] flex-1"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "-0.7px",
                      }}
                    >
                      졸업했는데도
                      <br />
                      학자금 대출 상환을 유예할 수 있나요?
                    </p>
                    <div className="flex-shrink-0 w-[27px] h-[27px]">
                      <svg
                        className="block size-full"
                        fill="none"
                        viewBox="0 0 27 27"
                      >
                        <path
                          d={svgPaths.p12b57640}
                          stroke="#666666"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="13.5"
                          cy="13.5"
                          r="13"
                          stroke="#666666"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative backdrop-blur-[0px] bg-[rgba(140,140,140,0.09)] rounded-[39px] border border-[rgba(140,140,140,0.1)] h-[78px] flex items-center px-4">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="예시) 새로 이사한 곳에서 주민등록 전입신고는 어떻게 하나요?"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-[#424242] placeholder:text-[#424242]"
                  style={{
                    fontSize: "20px",
                    letterSpacing: "-1.4px",
                  }}
                />

                {/* Microphone Icon */}
                

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="flex-shrink-0 w-[64px] h-[64px] bg-[#2B00FF] rounded-[32px] flex items-center justify-center hover:bg-[#2500DD] transition-colors"
                >
                  <div className="rotate-[270deg] scale-y-[-1]">
                    <svg
                      width="23"
                      height="27"
                      fill="none"
                      viewBox="0 0 23 27"
                    >
                      <path
                        d={svgPaths.p17036680}
                        fill="white"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 px-4 bg-muted/50"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold mb-4">
                주요 서비스
              </h3>
              <p className="text-lg text-muted-foreground">
                20대 맞춤형 법령 정보를 빠르고 친근하게 만나보세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 법률 챗봇 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">
                    {" "}
                    AI 법령 어시스턴트
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    궁금한 법률 문제, 지금 바로 질문해보세요.
                    AI가 실시간으로 관련 법령 정보를 찾아 쉽고 빠르게 답변해드립니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigateToPage("chatbot")}
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    채팅 시작하기
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* 나머지 기능들 */}
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const pageMap: { [key: string]: string } = {
                  "AI 법률 요약 & 쉬운말 해설": "summary/all",
                  "국회 가결안 청년 맞춤 분석": "analysis/all",
                };
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                  >
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                      >
                        <Icon
                          className={`h-6 w-6 ${feature.color}`}
                        />
                      </div>
                      <CardTitle className="text-xl">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() =>
                          navigateToPage(pageMap[feature.title])
                        }
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




      </div>
    </div>
  );
}