import { useState } from "react";
import { ArrowLeft, Send, Bot, User, Scale, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotPageProps {
  onBack: () => void;
}

export function ChatBotPage({ onBack }: ChatBotPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "안녕하세요! LawPick AI 법률 챗봇입니다. 🏛️\n\n법률 관련 궁금한 점이 있으시면 언제든 질문해 주세요. 임대차, 근로, 가족관계, 계약 등 다양한 법률 문제에 대해 도움을 드릴 수 있습니다.\n\n아래 자주 묻는 질문을 참고하시거나 직접 질문해 주세요!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const frequentQuestions = [
    "임대차 보증금 반환 받는 방법이 궁금해요",
    "직장에서 부당해고 당했을 때 어떻게 해야 하나요?",
    "이혼 시 재산분할은 어떻게 진행되나요?",
    "계약서 작성 시 주의사항을 알려주세요",
    "상속받은 재산에 대한 세금은 얼마나 되나요?",
    "교통사고 발생 시 대처 방법을 알려주세요"
  ];

  const handleSendMessage = (content?: string) => {
    const messageContent = content || inputValue;
    if (!messageContent.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      let botResponse = "";
      const lowerContent = messageContent.toLowerCase();
      
      if (lowerContent.includes("임대차") || lowerContent.includes("보증금")) {
        botResponse = "임대차 보증금 반환에 대해 안내드리겠습니다.\n\n📋 **주요 포인트:**\n• 계약 만료 또는 해지 시 임차인은 보증금 반환을 요구할 수 있습니다\n• 집주인은 특별한 사유가 없는 한 보증금을 반환해야 합니다\n• 보증금에서 차감 가능한 항목: 미납임대료, 원상복구비용 등\n\n⚖️ **관련 법령:**\n주택임대차보호법 제4조, 민법 제654조\n\n🔍 **추가 질문이 있으시면 구체적인 상황을 말씀해 주세요!**";
      } else if (lowerContent.includes("해고") || lowerContent.includes("직장")) {
        botResponse = "부당해고에 대해 설명드리겠습니다.\n\n📋 **부당해고 판단 기준:**\n• 정당한 사유 없는 해고\n• 해고 절차를 위반한 경우\n• 임신, 출산, 노조활동 등을 이유로 한 해고\n\n⚖️ **대응 방법:**\n1. 해고 사유서 요구\n2. 노동청 진정 신청\n3. 노동위원회 구제신청\n4. 민사소송 제기\n\n🕐 **신청 기한:** 해고일로부터 3개월 이내\n\n더 자세한 상황을 말씀해 주시면 구체적인 조언을 드릴게요!";
      } else if (lowerContent.includes("이혼") || lowerContent.includes("재산분할")) {
        botResponse = "이혼 시 재산분할에 대해 안내드리겠습니다.\n\n📋 **재산분할 원칙:**\n• 혼인 중 형성된 공동재산이 대상\n• 기여도에 따라 분할 (통상 1:1)\n• 혼인 전 재산이나 상속재산은 제외\n\n💰 **분할 대상 재산:**\n• 부동산, 예금, 주식 등\n• 퇴직금, 국민연금 등\n• 사업체, 지적재산권 등\n\n⚖️ **관련 법령:**\n민법 제839조의2\n\n구체적인 재산 현황이나 특별한 사정이 있으시면 말씀해 주세요!";
      } else {
        botResponse = `"${messageContent}"에 대한 질문을 확인했습니다.\n\n관련 법률 정보를 찾아서 정확하고 이해하기 쉽게 설명해드리겠습니다. 법률 문제는 개별 상황에 따라 달라질 수 있으니, 구체적인 상황을 추가로 말씀해 주시면 더 정확한 답변을 드릴 수 있습니다.\n\n💡 **참고:** 본 상담은 일반적인 법률 정보 제공이며, 구체적인 법적 문제는 전문 변호사와 상담받으시기를 권장합니다.`;
      }

      const newBotMessage: Message = {
        id: messages.length + 2,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold">LawPick AI 법령 어시스턴트</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  온라인
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* 로딩 메시지 */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="max-w-2xl">
                  <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 자주 묻는 질문 (메시지가 1개일 때만 표시) */}
            {messages.length === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">자주 묻는 질문</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    아래 질문을 클릭하거나 직접 질문을 입력해보세요
                  </p>
                </div>
                
                <div className="grid gap-3 max-w-2xl mx-auto">
                  {frequentQuestions.map((question, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                      onClick={() => handleQuestionClick(question)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <p className="text-sm">{question}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 입력 영역 */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="법률 관련 질문을 입력하세요..."
                className="flex-1 h-12 text-base"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()}
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Enter로 전송 • 법률 상담은 참고용이며 구체적인 사안은 전문가와 상담하시기 바랍니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}