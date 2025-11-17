import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const now = Date.now();
    return [
      {
        id: 1,
        content: "안녕하세요! 법률 관련 질문이 있으시면 언제든 물어보세요. 🏛️",
        sender: 'bot',
        timestamp: new Date(now - 60000)
      },
      {
        id: 2,
        content: "임대차 보증금 반환 관련해서 궁금한 점이 있어요",
        sender: 'user',
        timestamp: new Date(now - 30000)
      },
      {
        id: 3,
        content: "임대차 보증금 반환과 관련해서 도움을 드릴게요! 구체적으로 어떤 상황인지 말씀해 주시면 더 정확한 답변을 드릴 수 있습니다. 예를 들어:\n\n• 계약 기간이 만료되었나요?\n• 집주인이 보증금 반환을 거부하고 있나요?\n• 임대차보호법 관련 정보가 필요하신가요?",
        sender: 'bot',
        timestamp: new Date(now - 10000)
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        content: "질문을 확인했습니다. 관련 법률 정보를 찾아서 쉽게 설명해드릴게요. 잠시만 기다려주세요! ⚖️",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
            onKeyDown={handleKeyDown}
            placeholder="법률 관련 질문을 입력하세요..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="icon"
            disabled={!inputValue.trim()}
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

