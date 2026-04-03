'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SpotCard from './SpotCard';
import MoodCards from './MoodCards';
import { Message, Language } from '@/types';

function MessageBubble({ msg, conversationId }: { msg: Message; conversationId?: string }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex flex-col gap-3 animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🏮</span>
          <span className="text-harbor-500 text-xs">案内</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-kobe-gold text-harbor-950 rounded-tr-sm font-medium shadow-sm'
            : 'bg-white text-harbor-700 rounded-tl-sm border border-harbor-200 shadow-card'
        }`}
      >
        {msg.isLoading ? (
          <div className="flex items-center gap-2 py-0.5">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-kobe-gold rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-kobe-gold rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-kobe-gold rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            <span className="text-harbor-500 text-xs">考え中...</span>
          </div>
        ) : (
          msg.content
        )}
      </div>

      {msg.spots && msg.spots.length > 0 && (
        <div className="w-full max-w-sm space-y-3">
          {msg.spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} conversationId={conversationId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [language, setLanguage] = useState<Language>('ja');
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [showAllMoods, setShowAllMoods] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setShowQuickStart(false);
    setSelectedMood(undefined);
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), conversationId, history, language }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      if (data.language) setLanguage(data.language);
      if (data.conversationId) setConversationId(data.conversationId);

      const assistantMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: data.reply,
        spots: data.spots || [],
      };

      setMessages(prev => [...prev.filter(m => !m.isLoading), assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, conversationId, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-harbor-50">
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scroll-smooth">

        {messages.length === 0 && (
          <div className="animate-fade-in">
            {/* ウェルカムヒーロー */}
            <div className="text-center mb-6 pt-3">
              {/* ロゴ */}
              <div className="flex justify-center mb-3">
                <Image src="/logo.jpg" alt="神戸立ち飲みマップ" width={160} height={90} className="object-contain mix-blend-multiply" />
              </div>

              <h2 className="text-harbor-800 text-2xl font-bold mb-2 tracking-tight">
                今夜、どこ行く？
              </h2>
              <p className="text-harbor-800 text-sm font-semibold mb-1">
                広告なし。地元民だけが知ってる90軒。
              </p>
              <p className="text-harbor-400 text-xs">
                三宮・元町エリアの立ち飲み案内
              </p>

              {/* メインCTA */}
              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  onClick={() => sendMessage('今夜のおすすめを教えてください')}
                  className="w-full max-w-xs px-6 py-4 bg-kobe-gold text-harbor-950 font-bold text-base rounded-2xl shadow-md active:scale-95 hover:bg-kobe-amber transition-all duration-150"
                >
                  案内してもらう
                </button>
                <Link
                  href="/stores"
                  className="text-harbor-500 text-sm hover:text-harbor-700 transition-colors"
                >
                  自分で探す →
                </Link>
              </div>
            </div>

            {showQuickStart && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-harbor-200" />
                  <p className="text-harbor-400 text-[11px] tracking-widest uppercase">気分で選ぶ</p>
                  <div className="flex-1 h-px bg-harbor-200" />
                </div>

                <MoodCards
                  selected={selectedMood}
                  onSelect={(moodId, chatPrompt) => {
                    setSelectedMood(moodId);
                    sendMessage(chatPrompt);
                  }}
                  limit={4}
                  showAll={showAllMoods}
                />

                {!showAllMoods && (
                  <button
                    onClick={() => setShowAllMoods(true)}
                    className="w-full mt-3 flex items-center justify-center gap-1 text-harbor-400 text-xs py-2 hover:text-harbor-600 transition-colors"
                  >
                    もっと見る <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}

                <p className="text-harbor-400 text-[10px] text-center mt-5">
                  日本語 · English · 中文 · 한국어 OK
                </p>
              </div>
            )}
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} conversationId={conversationId} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t border-harbor-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-nav-top">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="今夜の気分を教えてください... / English OK"
              className="w-full bg-harbor-100 border border-harbor-200 text-harbor-800 placeholder-harbor-400 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-kobe-gold/60 focus:bg-white transition-all min-h-[48px] max-h-[120px] leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-kobe-gold hover:bg-kobe-amber disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-all duration-150 shadow-card"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-harbor-950 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-harbor-950" />
            )}
          </button>
        </form>
        <p className="text-harbor-400 text-[10px] text-center mt-2">
          広告・スポンサーなし · 中立な案内
        </p>
      </div>
    </div>
  );
}
