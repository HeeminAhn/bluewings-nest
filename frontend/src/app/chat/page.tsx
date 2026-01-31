'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout';
import { GradeBadge } from '@/components/member';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { ChatMessage, ChatBroadcastMessage } from '@/lib/types';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, member, _hasHydrated } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedMessageIds = useRef<Set<number>>(new Set());
  const isComposingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getChatHistory();
    if (response.success && response.data) {
      response.data.messages.forEach((msg) => {
        processedMessageIds.current.add(msg.id);
      });
      setMessages(response.data.messages);
      setHasMore(response.data.hasMore);
      setTimeout(scrollToBottom, 100);
    }
    setIsLoading(false);
  }, [scrollToBottom]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestId = messages[0].id;
    const response = await api.getChatHistory(oldestId, 50);

    if (response.success && response.data) {
      response.data.messages.forEach((msg) => {
        processedMessageIds.current.add(msg.id);
      });
      setMessages((prev) => [...response.data!.messages, ...prev]);
      setHasMore(response.data.hasMore);
    }
    setIsLoadingMore(false);
  };

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const port = window.location.port;
    const wsUrl = (!port || port === '80' || port === '443')
      ? `${wsProtocol}//api.${wsHost}/ws/chat?token=${token}`
      : `${wsProtocol}//${wsHost}:8080/ws/chat?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: ChatBroadcastMessage = JSON.parse(event.data);

      if (data.type === 'MESSAGE' && data.message) {
        const msgId = data.message.id;
        if (processedMessageIds.current.has(msgId)) {
          return;
        }
        processedMessageIds.current.add(msgId);
        setMessages((prev) => [...prev, data.message!]);
        setTimeout(scrollToBottom, 100);
      } else if (data.type === 'JOIN' || data.type === 'LEAVE') {
        if (data.onlineCount !== undefined) {
          setOnlineCount(data.onlineCount);
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [scrollToBottom]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    processedMessageIds.current.clear();
    loadHistory();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [_hasHydrated, isAuthenticated, router, loadHistory, connectWebSocket]);

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({ content: inputValue.trim() }));
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const shouldShowDateDivider = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header
        title="실시간 채팅"
        showBack
        rightAction={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`} />
            {onlineCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {onlineCount}
              </span>
            )}
          </div>
        }
      />

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="max-w-lg mx-auto space-y-3">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          )}

          {messages.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="py-16 text-center text-slate-500">
                <p>아직 메시지가 없습니다.</p>
                <p className="text-sm mt-1">첫 메시지를 남겨보세요!</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const isMyMessage = msg.memberId === member?.id;
              const showDateDivider = shouldShowDateDivider(msg, prevMsg);

              return (
                <div key={msg.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                        {formatDate(msg.createdAt)}
                      </Badge>
                    </div>
                  )}

                  <div className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                    {!isMyMessage && (
                      <Avatar className="w-9 h-9">
                        {msg.profileImageUrl ? (
                          <AvatarImage src={api.getImageUrl(msg.profileImageUrl)} />
                        ) : null}
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                          {msg.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex flex-col ${isMyMessage ? 'items-end' : ''} max-w-[75%]`}>
                      {!isMyMessage && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-xs font-medium text-slate-700">{msg.nickname}</span>
                          <GradeBadge grade={msg.grade} showName={false} size="sm" />
                        </div>
                      )}

                      <div className="flex items-end gap-1.5">
                        {isMyMessage && (
                          <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
                        )}
                        <div
                          className={`px-3 py-2 rounded-2xl break-words ${
                            isMyMessage
                              ? 'bg-blue-700 text-white rounded-br-md'
                              : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {!isMyMessage && (
                          <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 flex-shrink-0 pb-safe">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={() => { isComposingRef.current = false; }}
              placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
              disabled={!isConnected}
              maxLength={1000}
              className="flex-1 rounded-full bg-slate-100 border-0"
            />
            <Button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim()}
              size="icon"
              className="rounded-full bg-blue-700 hover:bg-blue-800"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
