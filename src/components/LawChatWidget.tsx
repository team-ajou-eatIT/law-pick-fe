import { useState, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, FileText, Globe, Link2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { createThread, sendQuery, type Document } from "../api/assistant";

interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  documents?: Document[];
  used_web_search?: boolean;
  route?: string;
}

interface LawChatWidgetProps {
  lawId: string;
  lawTitle: string;
}

const getMetadataValue = <T,>(metadata: Record<string, unknown> | undefined, key: string): T | undefined => {
  if (!metadata) return undefined;
  const value = metadata[key];
  if (value === undefined || value === null) return undefined;
  return value as T;
};

const renderSourceLinks = (source?: string) => {
  if (!source) {
    return <span className="text-[10px] text-muted-foreground">출처 정보가 제공되지 않았습니다.</span>;
  }

  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const links: { label: string; url: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    links.push({ label: match[1], url: match[2] });
  }

  if (links.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700">
        <Link2 className="h-3 w-3" />
        {source}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {links.map((link, index) => (
        <a
          key={`${link.url}-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <Link2 className="h-3 w-3" />
          {link.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
};

export function LawChatWidget({ lawId, lawTitle }: LawChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        `안녕하세요! 이 페이지에서 보고 있는 법령에 대해 무엇이든 질문해 보세요. 🏛️\n\n` +
        `현재 법령: "${lawTitle}" (ID: ${lawId})\n\n` +
        `궁금한 점을 입력해 주시면 관련 조항과 공신력 있는 출처를 바탕으로 설명해 드립니다.`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const appendMessage = useCallback((message: Omit<Message, "id">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: prev.length + 1,
      },
    ]);
  }, []);

  const ensureThreadId = useCallback(async (): Promise<string | null> => {
    if (threadId) {
      return threadId;
    }
    const response = await createThread();
    if (response.data) {
      setThreadId(response.data.thread_id);
      return response.data.thread_id;
    }
    console.error("Failed to create thread:", response.error);
    return null;
  }, [threadId]);

  // 위젯이 처음 열릴 때 세션 생성
  useEffect(() => {
    if (!isOpen) return;
    void ensureThreadId();
  }, [isOpen, ensureThreadId]);

  const handleSendMessage = useCallback(
    async (content?: string) => {
      const messageContent = (content ?? inputValue).trim();
      if (!messageContent) return;

      let activeThreadId = threadId;
      if (!activeThreadId) {
        activeThreadId = await ensureThreadId();
      }

      if (!activeThreadId) {
        appendMessage({
          content: "죄송합니다. 대화 세션 생성 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.",
          sender: "bot",
          timestamp: new Date(),
        });
        return;
      }

      // 사용자 메시지 표시
      appendMessage({
        content: messageContent,
        sender: "user",
        timestamp: new Date(),
      });

      setInputValue("");
      setIsLoading(true);

      // 백엔드에 현재 법령 정보를 함께 전달
      const lawContextPrefix =
        `현재 보고 있는 법령(법령 ID: ${lawId}, 제목: "${lawTitle}")에 대한 질문입니다.\n\n` as const;
      const messageForApi = `${lawContextPrefix}${messageContent}`;

      try {
        const response = await sendQuery({
          message: messageForApi,
          thread_id: activeThreadId,
          debug: false,
        });

        if (response.data) {
          appendMessage({
            content: response.data.answer,
            sender: "bot",
            timestamp: new Date(),
            documents: response.data.documents,
            used_web_search: response.data.used_web_search,
            route: response.data.route,
          });
        } else {
          appendMessage({
            content: `죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.\n\n오류: ${response.error}\n\n다시 시도해 주세요.`,
            sender: "bot",
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Query error:", error);
        appendMessage({
          content: "죄송합니다. 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          sender: "bot",
          timestamp: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, ensureThreadId, inputValue, lawId, lawTitle, threadId],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <>
      {/* 플로팅 챗봇 버튼 (우측 하단 작은 아이콘 버튼) */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="법령 챗봇 열기"
            className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">법령 챗봇 열기</span>
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </button>
        )}
      </div>

      {/* 챗봇 패널 (우측 하단 작은 창) */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-xs sm:max-w-sm">
          <Card className="shadow-2xl border border-blue-100 flex flex-col max-h-[70vh] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-700" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-900">이 법령 전용 AI 상담</span>
                  <span className="text-[11px] text-blue-700 truncate max-w-[180px]">
                    {lawTitle} (ID: {lawId})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-blue-100"
                  onClick={() => setIsOpen(false)}
                  aria-label="법령 챗봇 닫기"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-0 flex flex-col flex-1 min-h-[260px]">
              {/* 메시지 영역 */}
              <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}

                      <div className={`max-w-[75%] ${message.sender === "user" ? "text-right" : ""}`}>
                        <div
                          className={`inline-block px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>

                        {/* 문서 출처 (봇 응답) */}
                        {message.sender === "bot" && message.documents && message.documents.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-medium text-gray-600 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              참조 문서 ({message.documents.length}개)
                            </p>
                            {message.documents.map((doc, idx) => (
                              <Card
                                key={idx}
                                className="bg-white/90 border border-blue-100 shadow-sm hover:shadow-md transition"
                              >
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        getMetadataValue<string>(doc.metadata, "law_id")
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-emerald-50 text-emerald-700"
                                      }`}
                                    >
                                      <FileText className="h-3 w-3" />
                                      {getMetadataValue<string>(doc.metadata, "law_id") ? "법령 출처" : "외부 출처"}
                                    </span>
                                    {getMetadataValue<string>(doc.metadata, "law_id") && (
                                      <span className="text-[10px] font-mono text-gray-400">
                                        #{getMetadataValue<string>(doc.metadata, "law_id")}
                                      </span>
                                    )}
                                  </div>
                                  {renderSourceLinks(doc.source)}
                                  <p className="text-[11px] leading-relaxed text-gray-600 border-l-2 border-blue-100 pl-2">
                                    {doc.preview}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* 웹 검색 사용 여부 */}
                        {message.sender === "bot" && message.used_web_search && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600">
                            <Globe className="h-3 w-3" />
                            <span>신뢰할 수 있는 웹 검색 출처 활용</span>
                          </div>
                        )}

                        <p
                          className={`text-[10px] text-muted-foreground mt-0.5 ${
                            message.sender === "user" ? "text-right" : "text-left"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {message.sender === "user" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 로딩 상태 말풍선 */}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="inline-block px-3 py-2 rounded-2xl rounded-bl-md bg-gray-100">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* 입력 영역 */}
              <div className="border-t px-3 py-2 bg-white rounded-b-lg">
                <div className="flex gap-2 items-center">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="이 법령에 대해 궁금한 점을 입력하세요..."
                    className="h-9 text-[13px]"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => void handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-9 w-9 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  Enter로 전송 • 답변은 참고용이며 구체적 사안은 전문가 상담을 권장합니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}