"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, RefreshCcw, Maximize2, Minimize2, Copy, CheckCheck,
  FileText, ChevronLeft, ChevronDown, Loader2, AlertCircle, Grid, Code2,
  Sparkles, Terminal, Square, Check, ArrowUp, Menu, PenLine
} from 'lucide-react';
import { useChat } from '@/app/context/ChatContext';

// ─── CSS Keyframes ────────────────────────────────────────────────────────────
const KEYFRAMES_CSS = `
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
@keyframes gentle-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes sparkle-float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}
.chatbot-glass-fix {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const THINKING_PHASES = [
  'Thinking',
  'Searching knowledge base',
  'Analyzing your question',
  'Crafting response',
];

const INITIAL_MESSAGE = {
  sender: 'bot',
  text: '',
  time: '',
  suggestions: [
    "What are your skills?",
    "Tell me about your projects",
    "What's your experience?",
    "Are you available to hire?",
  ],
  isInitial: true,
};

const SLASH_COMMANDS = [
  { cmd: '/projects', label: 'View Projects', desc: "Browse Man's selected work", icon: Grid },
  { cmd: '/resume', label: 'Get Resume', desc: "Download Man's latest CV", icon: FileText },
  { cmd: '/stack', label: 'Tech Stack', desc: 'Technologies Man specializes in', icon: Code2 },
  { cmd: '/hire', label: 'Hire Me', desc: 'Get in touch for collaborations', icon: Sparkles },
];

// Streaming reveal tuning
const REVEAL_CHARS_PER_TICK = 4;
const REVEAL_TICK_MS = 16;
const REVEAL_CATCHUP_THRESHOLD = 80;
const REVEAL_CATCHUP_CHARS = 8;

// ─── Blinking Cursor ──────────────────────────────────────────────────────────
const BlinkingCursor = () => (
  <span
    className="inline-block w-[2.5px] h-[1.1em] bg-brand align-middle ml-[2px] rounded-[1px]"
    style={{ animation: 'cursor-blink 1s steps(2) infinite' }}
  />
);

// ─── Thinking Loader ──────────────────────────────────────────────────────────
const ThinkingLoader = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => (p + 1) % THINKING_PHASES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 py-4 px-1">
      <div className="text-brand" style={{ animation: 'gentle-spin 3s linear infinite' }}>
        <Sparkles size={18} />
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={phase}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-slate-500 dark:text-gray-400"
        >
          {THINKING_PHASES[phase]}
          <span className="inline-flex ml-0.5">
            <span style={{ animation: 'dot-pulse 1.4s infinite', animationDelay: '0s', opacity: 0 }}>.</span>
            <span style={{ animation: 'dot-pulse 1.4s infinite', animationDelay: '0.2s', opacity: 0 }}>.</span>
            <span style={{ animation: 'dot-pulse 1.4s infinite', animationDelay: '0.4s', opacity: 0 }}>.</span>
          </span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// ─── Hire Form ────────────────────────────────────────────────────────────────
function HireForm({ onClose, onSuccess }) {
  const [details, setDetails] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => { onSuccess(); }, 1500);
      }
    } catch (err) {
      console.error('Hire form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-8"
      >
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="font-semibold text-slate-900 dark:text-white">Request Sent! 🎉</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 text-center">Man will get back to you shortly.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/25 dark:border-white/10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Inquiry</h4>
          <p className="text-[10px] text-slate-400">Man will respond within 24 hours</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text" placeholder="Your Name" required value={details.name}
          onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <input
          type="email" placeholder="Your Email" required value={details.email}
          onChange={e => setDetails(d => ({ ...d, email: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <input
          type="text" placeholder="Subject" required value={details.subject}
          onChange={e => setDetails(d => ({ ...d, subject: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <textarea
          placeholder="Tell Man about your project..." required rows={3}
          value={details.message}
          onChange={e => setDetails(d => ({ ...d, message: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Send Request ✉️'}
        </button>
      </form>
    </div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
export default function ChatBot() {
  const { isChatOpen: isOpen, setIsChatOpen: setIsOpen } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Messages & streaming
  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  // UI state
  const [input, setInput] = useState('');
  const [showHireForm, setShowHireForm] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Refs
  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  // Smooth streaming refs
  const streamBufferRef = useRef('');
  const revealedLenRef = useRef(0);
  const revealTimerRef = useRef(null);
  const cancelledRef = useRef(false);

  // ── Derived state ─────────────────────────────────────────────────────────
  const chatMessages = messages.filter(m => !m.isInitial);
  const isWelcomeState = chatMessages.length === 0 && !isStreaming && !isWaiting;
  const isLoading = isStreaming || isWaiting;

  // Get initial message suggestions for welcome screen
  const welcomeSuggestions = messages.find(m => m.isInitial)?.suggestions || INITIAL_MESSAGE.suggestions;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const timeNow = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    try {
      const saved = localStorage.getItem('chatHistory_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Make sure we have at least the initial message
        const hasInitial = parsed.some(m => m.isInitial);
        if (hasInitial) {
          setMessages(parsed);
        } else {
          setMessages([{ ...INITIAL_MESSAGE, time: timeNow }, ...parsed]);
        }
      } else {
        setMessages([{ ...INITIAL_MESSAGE, time: timeNow }]);
      }
    } catch {
      setMessages([{ ...INITIAL_MESSAGE, time: timeNow }]);
    }
  }, []);

  // ── Persist chat ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('chatHistory_v2', JSON.stringify(messages));
    }
  }, [messages]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isStreaming, isWaiting, isOpen]);

  // ── Reset textarea height when input is cleared ───────────────────────────
  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [input]);

  // ── Cleanup reveal timer on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  // ── Manage body scroll when chat is open ───────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Reveal timer helpers ──────────────────────────────────────────────────
  const startRevealTimer = useCallback(() => {
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);

    revealTimerRef.current = setInterval(() => {
      const buffer = streamBufferRef.current;
      const current = revealedLenRef.current;

      if (current < buffer.length) {
        const remaining = buffer.length - current;
        const chars = remaining > REVEAL_CATCHUP_THRESHOLD
          ? REVEAL_CATCHUP_CHARS
          : REVEAL_CHARS_PER_TICK;
        const next = Math.min(current + chars, buffer.length);
        revealedLenRef.current = next;
        setStreamingText(buffer.substring(0, next));
      }
    }, REVEAL_TICK_MS);
  }, []);

  const stopRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  // ── Copy handler ──────────────────────────────────────────────────────────
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // ── Parse final response ──────────────────────────────────────────────────
  const parseFinalResponse = (fullText) => {
    const SEP = '|||SUGGESTIONS|||';
    const HIRE_TRIGGER = '[SHOW_HIRE_FORM]';
    let text = fullText;
    let suggestions = [];
    let showHire = false;

    if (text.includes(HIRE_TRIGGER)) {
      text = text.replace(HIRE_TRIGGER, '').trim();
      showHire = true;
    }

    const sepIdx = text.indexOf(SEP);
    if (sepIdx !== -1) {
      const rawSugg = text.substring(sepIdx + SEP.length);
      text = text.substring(0, sepIdx).trim();
      try {
        const start = rawSugg.indexOf('[');
        const end = rawSugg.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          suggestions = JSON.parse(rawSugg.substring(start, end + 1));
        }
      } catch { /* ignore */ }
    }

    return { text: text.trim(), suggestions, showHire };
  };

  // ── Send message with buffered streaming ──────────────────────────────────
  const sendMessage = useCallback(async (messageText) => {
    const msg = (typeof messageText === 'string' ? messageText : input).trim();
    if (!msg || isStreaming || isWaiting) return;

    const timeNow = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const userMsg = { sender: 'user', text: msg, time: timeNow() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSlashCommands(false);
    setIsWaiting(true);
    setStreamingText('');

    // Reset buffer refs
    streamBufferRef.current = '';
    revealedLenRef.current = 0;
    cancelledRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const historySnapshot = [...messages, userMsg];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: msg,
          history: historySnapshot.slice(-10),
        }),
      });

      if (res.status === 429) {
        setIsWaiting(false);
        setMessages(prev => [...prev, {
          sender: 'bot', text: '🕒 Too many requests — please wait a moment.',
          time: timeNow(), suggestions: [], isError: true,
        }]);
        return;
      }

      if (!res.ok || !res.body) throw new Error('Failed to fetch');

      setIsWaiting(false);
      setIsStreaming(true);
      startRevealTimer();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        streamBufferRef.current = fullResponse;
      }

      // Stream from API is done — wait for reveal to finish
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (cancelledRef.current || revealedLenRef.current >= streamBufferRef.current.length) {
            clearInterval(check);
            stopRevealTimer();
            resolve();
          }
        }, 30);
      });

      // Commit final message
      setIsStreaming(false);
      setStreamingText('');

      const { text, suggestions, showHire } = parseFinalResponse(fullResponse);
      setMessages(prev => [...prev, {
        sender: 'bot', text, time: timeNow(), suggestions,
      }]);

      if (showHire) setTimeout(() => setShowHireForm(true), 400);

    } catch (err) {
      stopRevealTimer();
      setIsWaiting(false);
      setIsStreaming(false);

      if (err.name === 'AbortError') {
        const revealedSoFar = streamBufferRef.current.substring(0, revealedLenRef.current);
        if (revealedSoFar.trim()) {
          const { text, suggestions } = parseFinalResponse(revealedSoFar + '\n\n_Response stopped._');
          setMessages(prev => [...prev, { sender: 'bot', text, time: timeNow(), suggestions }]);
        } else {
          setMessages(prev => [...prev, { sender: 'bot', text: '_Response stopped._', time: timeNow(), suggestions: [] }]);
        }
        setStreamingText('');
        return;
      }

      console.error('Chat error:', err);
      setStreamingText('');
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '⚠️ Something went wrong. Please try again.',
        time: timeNow(),
        suggestions: ["What are your skills?", "Tell me about your projects", "How can I contact you?"],
        isError: true,
      }]);
    } finally {
      abortControllerRef.current = null;
    }
  }, [input, isStreaming, isWaiting, messages, startRevealTimer, stopRevealTimer]);

  // ── Stop generation ───────────────────────────────────────────────────────
  const stopResponse = () => {
    cancelledRef.current = true;
    abortControllerRef.current?.abort();
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClearChat = () => {
    localStorage.removeItem('chatHistory_v2');
    const timeNow = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    setMessages([{ ...INITIAL_MESSAGE, time: timeNow }]);
    setStreamingText('');
    setIsStreaming(false);
    setIsWaiting(false);
    setShowHireForm(false);
    stopRevealTimer();
  };

  // ── Slash commands ────────────────────────────────────────────────────────
  useEffect(() => {
    if (input === '/') {
      setShowSlashCommands(true);
      setSelectedCommandIndex(0);
    } else if (!input.startsWith('/')) {
      setShowSlashCommands(false);
    }
  }, [input]);

  const executeSlashCommand = (command) => {
    setInput('');
    setShowSlashCommands(false);
    if (command.cmd === '/hire') {
      setShowHireForm(true);
    } else if (command.cmd === '/projects') {
      sendMessage("Tell me about Man's best projects");
    } else if (command.cmd === '/resume') {
      sendMessage("Can I see Man's resume or download it?");
    } else if (command.cmd === '/stack') {
      sendMessage("What is Man's technical stack and skills?");
    }
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (showSlashCommands) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedCommandIndex(i => (i + 1) % SLASH_COMMANDS.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedCommandIndex(i => (i - 1 + SLASH_COMMANDS.length) % SLASH_COMMANDS.length); }
      else if (e.key === 'Enter') { e.preventDefault(); executeSlashCommand(SLASH_COMMANDS[selectedCommandIndex]); }
      else if (e.key === 'Escape') setShowSlashCommands(false);
    } else {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    }
  };

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  const markdownComponents = {
    a: ({ node, ...props }) => {
      const href = props.href || '';
      const text = props.children?.toString() || '';
      const isDocument = href.includes('drive.google.com/file') || href.endsWith('.pdf') || text.toLowerCase().includes('resume');
      
      if (isDocument) {
        return (
          <a {...props} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 mt-2 mb-1 bg-slate-100 dark:bg-[#202c33] rounded-xl hover:opacity-90 transition-opacity w-fit min-w-[240px] max-w-[95%] border border-slate-200 dark:border-white/5 no-underline">
            <div className="flex-shrink-0 w-[38px] h-[46px] bg-[#F40F02] rounded-[4px] flex items-center justify-center text-white font-bold text-[11px] relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-3 h-3 bg-white/20 rounded-bl-sm" />
              PDF
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[15px] font-medium text-slate-900 dark:text-[#e9edef] truncate block">
                {text || "Man_Navlakha_Resume.pdf"}
              </span>
              <span className="text-[13px] text-slate-500 dark:text-[#8696a0] mt-0.5">
                PDF • 2.4 MB
              </span>
            </div>
          </a>
        );
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand underline decoration-brand/30 hover:decoration-brand transition-colors" />
    },
    img: ({ src, alt }) => (
      <img
        src={src} alt={alt}
        className="mt-2 h-48 md:h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 dark:border-white/10"
        onClick={() => setLightboxImage(src)}
      />
    ),
    p: ({ node, ...props }) => <div {...props} className="mb-2.5 last:mb-0 leading-relaxed" />,
    ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-5 mb-2.5 space-y-1.5" />,
    ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-5 mb-2.5 space-y-1.5" />,
    li: ({ node, ...props }) => <li {...props} className="pl-1 leading-relaxed" />,
    h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold mb-3 mt-2" />,
    h2: ({ node, ...props }) => <h2 {...props} className="text-base font-bold mb-2.5 mt-2" />,
    h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-bold mb-2 mt-1.5" />,
    strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-slate-900 dark:text-white" />,
    code: ({ node, inline, className, children, ...props }) => inline ? (
      <code className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-gray-200" {...props}>{children}</code>
    ) : (
      <div className="bg-slate-800 dark:bg-[#1a1a1a] text-slate-100 p-3 rounded-xl my-2.5 overflow-x-auto text-xs font-mono border border-slate-700 dark:border-white/5">
        <code {...props}>{children}</code>
      </div>
    ),
  };

  // ── Get display text for streaming (strip markers) ────────────────────────
  const streamDisplayText = streamingText
    .split('|||SUGGESTIONS|||')[0]
    .replace('[SHOW_HIRE_FORM]', '')
    .trim();

  if (!mounted) return null;

  return (
    <>
      <style>{KEYFRAMES_CSS}</style>

      {/* ── Floating open/close button (desktop only) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border hidden md:flex
          ${isOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-700 dark:border-white/20 rotate-90'
            : 'bg-white text-slate-900 dark:bg-[#1a1a1a] dark:text-white border-slate-200 dark:border-white/10'
          }`}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {/* ── Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <div
        className={`fixed z-[100] chatbot-glass-fix bg-white/35 dark:bg-black/35 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}
          inset-0 md:inset-auto
          ${isExpanded
            ? 'md:bottom-6 md:right-6 md:w-[calc(100vw-3rem)] md:h-[calc(100vh-3rem)] lg:w-[32rem] lg:h-[42rem] md:rounded-2xl md:border md:border-slate-200 md:dark:border-white/8'
            : 'md:bottom-24 md:right-6 md:w-[92vw] md:h-[34rem] lg:w-[26rem] lg:h-[34rem] md:rounded-2xl md:border md:border-slate-200 md:dark:border-white/8'
          }`}
      >
        {/* ─── Header ─── */}
        <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray/20 dark:border-white/10 flex justify-between items-center bg-white dark:bg-black backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 w-1/3">
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} />

            </button>
          </div>

          <div className="flex items-center justify-center gap-1 w-1/3 cursor-pointer">
            <span className="font-semibold text-[17px] text-slate-900 dark:text-white">Ask</span>
            <span className="text-[17px] font-medium text-slate-500 dark:text-white/60">My AI</span>
            {/* <ChevronDown size={18} className="text-slate-500 dark:text-white/60 ml-0.5" /> */}
          </div>

          <div className="flex items-center justify-end w-1/3">
            <div className="flex items-center gap-1 px-1 py-1 rounded-full border border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-white/5 shadow-sm">
              <button
                onClick={handleClearChat}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="New chat"
              >
                <PenLine size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-full text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>


            </div>
          </div>
        </div>

        {/* ─── Chat Body ─── */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-black ${isWelcomeState ? 'flex items-center justify-center' : ''}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isWelcomeState ? (
            /* ── Welcome Screen ── */
            <div className="flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-5" style={{ animation: 'sparkle-float 3s ease-in-out infinite' }}>
                <div className="w-14 h-14 rounded-2xl bg-brand/10 dark:bg-brand/10 flex items-center justify-center">
                  <Sparkles size={28} className="text-brand" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                Hi, I&apos;m Man&apos;s AI
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-500 mb-8 max-w-[80%]">
                Ask me anything about his projects, skills, or experience
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-[90%]">
                {welcomeSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-xs border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-full text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="p-4 md:p-5 pb-36 md:pb-32">
              {chatMessages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                const isBot = msg.sender === 'bot';
                const globalIndex = messages.indexOf(msg);
                const isLast = globalIndex === messages.length - 1;
                const showSuggestions = isBot && isLast && !isLoading && msg.suggestions?.length > 0;
                const isError = msg.isError;

                if (isUser) {
                  return (
                    <motion.div
                      key={globalIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-end mb-5"
                    >
                      <div className="max-w-[85%]">
                        <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/25 dark:border-white/10 rounded-3xl px-4 py-3">
                          <p className="text-sm text-slate-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className="flex justify-end mt-1 px-2">
                          <span className="text-[10px] text-slate-400 dark:text-gray-600 flex items-center gap-1">
                            {msg.time}
                            <CheckCheck size={13} className="text-brand" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                // Bot message — no bubble, flowing text
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mb-6 group"
                  >
                    {isError && (
                      <div className="flex items-center gap-2 mb-2 text-red-500 dark:text-red-400">
                        <AlertCircle size={14} />
                        <span className="text-xs font-medium">Error</span>
                      </div>
                    )}
                    <div className={`text-sm leading-relaxed ${isError ? 'text-red-600 dark:text-red-300' : 'text-slate-700 dark:text-gray-300'}`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-2.5 prose-li:leading-relaxed">
                        <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isBot && !isError && (
                      <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleCopy(msg.text, globalIndex)}
                          className="p-1.5 text-slate-400 dark:text-gray-600 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedIndex === globalIndex
                            ? <CheckCheck size={14} className="text-brand" />
                            : <Copy size={14} />
                          }
                        </button>
                        <span className="text-[10px] text-slate-400 dark:text-gray-600 ml-1">{msg.time}</span>
                      </div>
                    )}

                    {/* Suggestions */}
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="flex flex-wrap gap-2 mt-4"
                      >
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(s)}
                            className="text-xs border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-full text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* ── Thinking loader ── */}
              {isWaiting && <ThinkingLoader />}

              {/* ── Live streaming text ── */}
              {isStreaming && !isWaiting && streamDisplayText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                  key="streaming-content"
                >
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-gray-300">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-2.5 prose-li:leading-relaxed">
                      <ReactMarkdown components={markdownComponents}>
                        {streamDisplayText}
                      </ReactMarkdown>
                      <BlinkingCursor />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pt-3 pb-6 md:px-4 md:pt-3 md:pb-4 bg-transparent border-t border-transparent">
          <AnimatePresence mode="wait">
            {showHireForm ? (
              <motion.div
                key="hire"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HireForm
                  onClose={() => setShowHireForm(false)}
                  onSuccess={() => {
                    setShowHireForm(false);
                    const timeNow = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                    setMessages(prev => [...prev, {
                      sender: 'bot',
                      text: '✅ Thank you! Your request has been sent. Man will get back to you shortly.',
                      time: timeNow,
                      suggestions: ["What are Man's skills?", "Tell me about Man's projects", "What is Man's tech stack?"],
                    }]);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative">
                  {/* Slash commands popup */}
                  <AnimatePresence>
                    {showSlashCommands && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-black backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-2.5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                          <Terminal size={13} className="text-brand" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">Commands</span>
                        </div>
                        <div className="p-1">
                          {SLASH_COMMANDS.map((command, idx) => {
                            const Icon = command.icon;
                            const isSelected = selectedCommandIndex === idx;
                            return (
                              <div
                                key={command.cmd}
                                onClick={() => executeSlashCommand(command)}
                                onMouseEnter={() => setSelectedCommandIndex(idx)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                                  ${isSelected ? 'bg-brand/10 text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                              >
                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                                  <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold">{command.cmd}</div>
                                  <div className="text-[10px] opacity-70 truncate">{command.desc}</div>
                                </div>
                                {isSelected && <div className="text-[10px] font-mono opacity-40">ENTER</div>}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input area */}
                  <div className="mx-auto flex w-full max-w-[90%] items-end gap-2 bg-white dark:bg-black/60 backdrop-blur-xl border border-white/25 dark:border-white/10 rounded-[2rem] pl-4 pr-4 py-3 transition-colors shadow-xl">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      rows={1}
                      placeholder={isLoading ? 'Generating...' : "Ask about Man?"}
                      className="flex-1 custom-scrollbar bg-transparent text-base text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-gray-400 resize-none outline-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed py-2"
                      style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        maxHeight: '150px',
                        minHeight: '24px',
                      }}
                    />
                    <div className="shrink-0 flex items-center">
                      {isLoading ? (
                        <button
                          onClick={stopResponse}
                          className="w-10 h-10 rounded-full bg-[#3c4043] flex items-center justify-center text-white hover:opacity-90 transition-colors"
                          title="Stop generating"
                        >
                          <Square size={16} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <button
                          onClick={() => sendMessage(input)}
                          disabled={!input.trim()}
                          className="w-10 h-10 rounded-full bg-[#1b2f6b] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                        >
                          <ArrowUp size={20} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Lightbox ── */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 left-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <img src={lightboxImage} alt="Full view" className="max-w-full max-h-full rounded-lg shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}