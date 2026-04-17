'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SpotCard from './SpotCard';
import MoodCards from './MoodCards';
import { Message, Language } from '@/types';
import { useUILang } from '@/hooks/useUILang';
import { useT } from '@/lib/i18n';

const INK = '#262220';
const PAPER = '#F3ECDD';
const PAPER_LIGHT = '#FAF4E6';
const RULE = '#D5CBBE';
const MUTE = '#857E78';

function MessageBubble({ msg, conversationId, userRole, aiRole }: { msg: Message; conversationId?: string; userRole: string; aiRole: string }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex flex-col gap-2 animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: MUTE, fontWeight: 700 }}
        >
          {isUser ? userRole : aiRole}
        </span>
        <span className="h-px w-6" style={{ background: RULE }} />
      </div>

      {isUser ? (
        <div
          className="max-w-[85%] text-[13.5px] leading-[1.8] whitespace-pre-wrap text-right"
          style={{ color: INK }}
        >
          {msg.content}
        </div>
      ) : (
        <div
          className="max-w-[85%] px-4 py-3 text-[13.5px] leading-[1.8] whitespace-pre-wrap"
          style={{
            background: PAPER_LIGHT,
            color: INK,
            border: `1px solid ${INK}`,
          }}
        >
          {msg.isLoading ? (
            <div className="flex items-center gap-2 py-0.5">
              <span
                className="inline-block h-px w-10 animate-pulse"
                style={{ background: INK }}
              />
              <span className="text-[11px] tracking-[0.1em]" style={{ color: MUTE }}>
                {aiRole}…
              </span>
            </div>
          ) : (
            msg.content
          )}
        </div>
      )}

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
  const uiLang = useUILang();
  const tr = useT(uiLang);

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
          content: tr.chat.errorMsg,
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
    <div className="flex flex-col h-full" style={{ background: PAPER }}>
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
                {tr.chat.hero}
              </h2>
              <p className="text-harbor-800 text-sm font-semibold mb-1">
                {tr.chat.heroSub}
              </p>
              <p className="text-harbor-400 text-xs">
                {tr.chat.heroArea}
              </p>

              {/* メインCTA */}
              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  onClick={() => sendMessage(uiLang === 'ja' ? '今夜のおすすめを教えてください' : "What are your top recommendations for tonight?")}
                  className="w-full max-w-xs px-6 py-4 font-bold text-[15px] tracking-[0.06em] active:scale-[0.98] transition-all duration-150"
                  style={{ background: INK, color: PAPER }}
                >
                  {tr.chat.ctaBtn}
                </button>
                <Link
                  href="/stores"
                  className="text-sm tracking-[0.02em]"
                  style={{ color: MUTE }}
                >
                  {tr.chat.ctaSelf}
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
                  🇯🇵 🇺🇸 🇹🇼 🇨🇳 🇰🇷 OK
                </p>
              </div>
            )}
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} conversationId={conversationId} userRole={tr.chat.userRole} aiRole={tr.chat.aiRole} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div
        className="px-4 py-3"
        style={{ background: PAPER, borderTop: `1px solid ${INK}` }}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tr.chat.placeholder}
              className="w-full px-4 py-3 text-[14px] resize-none focus:outline-none transition-colors min-h-[48px] max-h-[120px] leading-relaxed"
              style={{
                background: PAPER_LIGHT,
                border: `1px solid ${INK}`,
                color: INK,
              }}
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-150"
            style={{ background: INK, color: PAPER }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p
          className="text-[10px] text-center mt-2 tracking-[0.08em]"
          style={{ color: MUTE }}
        >
          {tr.chat.neutralNote}
        </p>
      </div>
    </div>
  );
}
