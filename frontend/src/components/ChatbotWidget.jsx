import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  SendHorizontal,
  Sparkles,
  X,
  Minimize2,
  MessageSquareText,
} from 'lucide-react';
import api from '../services/api';

const starterMessages = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      'Hi, I am your Blooms AI guide. Ask me about trending posts, the latest blogs, or any author in the system.',
  },
];

const quickPrompts = [
  'Show me the latest blogs',
  'Which blogs are most popular?',
  'Find blogs by a specific author',
];

const createMessage = (role, content) => ({
  id:
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role,
  content,
});

const TypingIndicator = () => (
  <div className="flex max-w-[85%] items-end gap-2 self-start">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl rounded-bl-md border border-white/60 bg-white/70 text-sky-700 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <Bot size={18} />
    </div>
    <div className="rounded-[22px] rounded-bl-md border border-white/60 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-0.2s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.1s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400" />
      </div>
    </div>
  </div>
);

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const resetComposerHeight = () => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = 'auto';
  };

  const resizeComposer = () => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 132)}px`;
  };

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim();
    if (!message || isTyping) {
      return;
    }

    const userMessage = createMessage('user', message);
    setMessages((current) => [...current, userMessage]);
    setInputValue('');
    setIsTyping(true);
    resetComposerHeight();

    try {
      const response = await api.post('/chat', { message });
      const reply =
        response?.data?.reply?.trim() ||
        'I could not find a strong answer for that just yet. Please try asking in a more specific way.';

      setMessages((current) => [...current, createMessage('assistant', reply)]);
    } catch (error) {
      const fallbackMessage =
        error?.response?.data?.message ||
        'The AI assistant is unavailable right now. Please try again in a moment.';

      setMessages((current) => [...current, createMessage('assistant', fallbackMessage)]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(inputValue);
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage(inputValue);
    }
  };

  const handlePromptClick = async (prompt) => {
    setIsOpen(true);
    await sendMessage(prompt);
  };

  const clearConversation = () => {
    setMessages(starterMessages);
    setInputValue('');
    setIsTyping(false);
    resetComposerHeight();
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-1rem)] flex-col items-end gap-4 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="chat-window"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto relative h-[min(72vh,640px)] w-[min(calc(100vw-1rem),24rem)] overflow-hidden rounded-[30px] border border-white/55 bg-white/18 shadow-[0_30px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:w-[24rem]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.68),_rgba(240,249,255,0.56))]" />

            <div className="relative flex h-full flex-col">
              <div className="border-b border-white/45 px-5 pb-4 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-[0_16px_32px_rgba(14,165,233,0.35)]">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">Blooms AI</h3>
                        <span className="rounded-full border border-emerald-200/80 bg-emerald-100/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                          Live
                        </span>
                      </div>
                      <p className="mt-1 max-w-[15rem] text-sm leading-5 text-slate-600">
                        Smart blog discovery with context pulled from your MongoDB content.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={clearConversation}
                      className="rounded-full border border-white/60 bg-white/70 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      aria-label="Reset chat"
                    >
                      <MessageSquareText size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full border border-white/60 bg-white/70 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      aria-label="Minimize chatbot"
                    >
                      <Minimize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                  {messages.length === starterMessages.length && !isTyping && (
                    <div className="grid grid-cols-1 gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handlePromptClick(prompt)}
                          className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl rounded-bl-md border border-white/60 bg-white/70 text-sky-700 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                            <Bot size={18} />
                          </div>
                        )}

                        <div
                          className={[
                            'max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]',
                            isUser
                              ? 'rounded-br-md bg-gradient-to-br from-sky-600 via-cyan-500 to-emerald-400 text-white'
                              : 'rounded-bl-md border border-white/60 bg-white/78 text-slate-700 backdrop-blur-xl',
                          ].join(' ')}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-white/45 bg-white/35 px-4 pb-4 pt-3 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="rounded-[24px] border border-white/70 bg-white/80 px-3 py-2 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(event) => {
                        setInputValue(event.target.value);
                        resizeComposer();
                      }}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Ask about authors, latest posts, or trending blogs..."
                      className="max-h-32 min-h-[24px] w-full resize-none border-0 bg-transparent px-1 py-1.5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-slate-500">
                      Powered by your blog data and OpenRouter AI.
                    </p>
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <span>Send</span>
                      <SendHorizontal size={15} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen((current) => !current)}
        className="pointer-events-auto group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-[0_24px_48px_rgba(14,165,233,0.38)]"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.42),_transparent_55%)] opacity-80" />
        <span className="absolute inset-[1px] rounded-full border border-white/30" />
        {isOpen ? <X size={24} className="relative z-10" /> : <Sparkles size={24} className="relative z-10" />}
      </motion.button>
    </div>
  );
}

export default ChatbotWidget;
