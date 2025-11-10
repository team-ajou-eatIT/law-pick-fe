import { useState, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { createThread, sendQuery } from "../api/assistant";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "안녕하세요! 법률 관련 질문이 있으시면 언제든 물어보세요. 🏛️",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 대화 세션 생성
  useEffect(() => {
    const initThread = async () => {
      const response = await createThread();
      if (response.data) {
        setThreadId(response.data.thread_id);
      }
    };
    initThread();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !threadId) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendQuery({
        message: messageToSend,
        thread_id: threadId,
        debug: false
      });

      if (response.data) {
        const botResponse: Message = {
          id: messages.length + 2,
          content: response.data.answer,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const errorMessage: Message = {
          id: messages.length + 2,
          content: `죄송합니다. 오류가 발생했습니다: ${response.error}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Query error:', error);
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

  return (
    <div className="flex flex-col h-64 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-blue-50">
        <Bot className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-blue-900">법률 챗봇</span>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg whitespace-pre-wrap ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="법률 관련 질문을 입력하세요..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter로 전송 • 법률 상담은 참고용이며 전문가 상담을 권장합니다
        </p>
      </div>
    </div>
  );
}