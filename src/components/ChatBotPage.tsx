import { useState, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Scale, MessageCircle, FileText, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { createThread, sendQuery, type Document } from "../api/assistant";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  documents?: Document[];
  used_web_search?: boolean;
  route?: string;
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
  const [threadId, setThreadId] = useState<string | null>(null);

  // 컴포넌트 마운트 시 대화 세션 생성
  useEffect(() => {
    const initThread = async () => {
      const response = await createThread();
      if (response.data) {
        setThreadId(response.data.thread_id);
        console.log('Thread created:', response.data.thread_id);
      } else {
        console.error('Failed to create thread:', response.error);
      }
    };
    initThread();
  }, []);

  const frequentQuestions = [
    "임대차 보증금 반환 받는 방법이 궁금해요",
    "직장에서 부당해고 당했을 때 어떻게 해야 하나요?",
    "근로계약서 작성 시 주의사항을 알려주세요",
    "교통사고 발생 시 대처 방법을 알려주세요"
  ];

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue;
    if (!messageContent.trim() || !threadId) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 실제 API 호출
      const response = await sendQuery({
        message: messageContent,
        thread_id: threadId,
        debug: false
      });

      if (response.data) {
        const newBotMessage: Message = {
          id: messages.length + 2,
          content: response.data.answer,
          sender: 'bot',
          timestamp: new Date(),
          documents: response.data.documents,
          used_web_search: response.data.used_web_search,
          route: response.data.route
        };

        setMessages(prev => [...prev, newBotMessage]);
      } else {
        // 에러 처리
        const errorMessage: Message = {
          id: messages.length + 2,
          content: `죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.\n\n오류: ${response.error}\n\n다시 시도해 주세요.`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        content: '죄송합니다. 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

                  {/* 문서 참조 정보 표시 (봇 응답에만) */}
                  {message.sender === 'bot' && message.documents && message.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        참조 문서 ({message.documents.length}개)
                      </p>
                      {message.documents.map((doc, idx) => (
                        <Card key={idx} className="bg-white">
                          <CardContent className="p-3">
                            <p className="text-xs font-medium text-blue-600 mb-1">{doc.source}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{doc.preview}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* 웹 검색 사용 표시 */}
                  {message.sender === 'bot' && message.used_web_search && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <Globe className="h-3 w-3" />
                      <span>웹 검색 활용됨</span>
                    </div>
                  )}

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