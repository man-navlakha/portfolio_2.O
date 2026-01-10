"use client";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import ShinyText from './ShinyText';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, RefreshCcw, Maximize2, Minimize2, Copy, CheckCheck, FileText, ChevronLeft, Loader2, AlertCircle, Grid, User, Code2, Sparkles, Terminal } from 'lucide-react';
import { useChat } from '@/app/context/ChatContext';
export default function ChatBot() {
    // --- UI State ---
    const { isChatOpen: isOpen, setIsChatOpen: setIsOpen } = useChat();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);

    // --- Logic State ---
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMounted(true);
        const timeNow = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        const initialMsg = {
            sender: 'bot',
            text: "👋 Hi! I’m Man's assistant. Ask me anything about Man",
            time: timeNow,
            suggestions: ["What are your skills?", "Tell me about your projects", "Walk me through your resume"]
        };

        const savedSession = localStorage.getItem('chat_session_id');
        if (savedSession) {
            setSessionId(savedSession);
        }

        try {
            const savedMessages = localStorage.getItem('chatHistory');
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            } else {
                setMessages([initialMsg]);
            }
        } catch (error) {
            console.error("Failed to parse chat history:", error);
            setMessages([initialMsg]);
        }
    }, []);

    const initialMessage = {
        sender: 'bot',
        text: "👋 Hi! I’m Man's assistant. Ask me anything about Man",
        time: "", // Fallback
        suggestions: ["What are your skills?", "Tell me about your projects", "Walk me through your resume"]
    };

    const [sessionId, setSessionId] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showHireForm, setShowHireForm] = useState(false);
    const [hireDetails, setHireDetails] = useState({ name: '', email: '', message: '' });
    const [showSlashCommands, setShowSlashCommands] = useState(false);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

    const SLASH_COMMANDS = [
        {
            cmd: '/projects',
            label: 'View Projects',
            desc: 'Browse through my selected work',
            icon: Grid,
            action: () => sendMessage("Tell me about your best projects")
        },
        {
            cmd: '/resume',
            label: 'Get Resume',
            desc: 'Download my latest professional CV',
            icon: FileText,
            action: () => sendMessage("Can I see your resume?")
        },
        {
            cmd: '/stack',
            label: 'Tech Stack',
            desc: 'Check the technologies I specialize in',
            icon: Code2,
            action: () => sendMessage("What is your technical stack?")
        },
        {
            cmd: '/hire',
            label: 'Hire Me',
            desc: 'Get in touch for collaborations',
            icon: Sparkles,
            action: () => setShowHireForm(true)
        }
    ];
    const chatboxEndRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        if (messages.length > 1) {
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        chatboxEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, isOpen]);

    // --- Helper Components ---
    const ImageRenderer = ({ src, alt }) => (
        <img
            src={src}
            alt={alt}
            className="mt-2 h-48 md:h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 dark:border-white/10"
            onClick={() => setLightboxImage(src)}
        />
    );

    const DocumentBubble = ({ data }) => {
        const { fileName, fileUrl, fileSize, fileType, time } = data;
        return (
            <motion.div className="bg-slate-100 dark:bg-[#1a1a1a] p-3 rounded-xl max-w-[95%] border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-white/5">
                        <FileText className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-medium text-sm text-slate-900 dark:text-white break-all">{fileName}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{fileSize}, {fileType}</p>
                    </div>
                </div>
                <a
                    href={fileUrl}
                    download={fileName}
                    className="mt-3 block text-center py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    Download
                </a>
                <p className="text-[10px] text-slate-400 text-right mt-1">{time}</p>
            </motion.div>
        );
    };


    const TypingIndicator = () => (
        <ShinyText
            text="Typing..."
            disabled={false}
            speed={1.6}
            className='custom-class'
        />
    );

    // --- Logic Functions ---
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
    };

    const displayFinalResponse = async (finalResponseString) => {
        const suggestionSeparator = '|||SUGGESTIONS|||';
        const suggestionIndex = finalResponseString.indexOf(suggestionSeparator);
        let textPart = finalResponseString;
        let suggestionsJson = '[]';

        if (suggestionIndex !== -1) {
            textPart = finalResponseString.substring(0, suggestionIndex);
            let rawSuggestions = finalResponseString.substring(suggestionIndex + suggestionSeparator.length);
            const jsonStart = rawSuggestions.indexOf('[');
            const jsonEnd = rawSuggestions.lastIndexOf(']');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                suggestionsJson = rawSuggestions.substring(jsonStart, jsonEnd + 1);
            }
        }

        try {
            const messageBubbles = textPart.split('|||MSG|||').map(t => t.trim()).filter(Boolean);
            const parsedSuggestions = JSON.parse(suggestionsJson);

            setMessages(prev => {
                const updated = [...prev.slice(0, -1)];
                const firstMessage = {
                    sender: 'bot',
                    text: messageBubbles[0] || "Sorry, I had trouble generating a response.",
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                    suggestions: messageBubbles.length === 1 ? parsedSuggestions : [],
                };
                return [...updated, firstMessage];
            });

            for (let i = 1; i < messageBubbles.length; i++) {
                await new Promise(res => setTimeout(res, 600));
                const isLastBubble = i === messageBubbles.length - 1;
                const nextMessage = {
                    sender: 'bot',
                    text: messageBubbles[i],
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                    suggestions: isLastBubble ? parsedSuggestions : [],
                };
                setMessages(prev => [...prev, nextMessage]);
            }
        } catch (error) {
            console.error("Failed to parse suggestions JSON:", error);
            setMessages(prev => {
                const updated = [...prev.slice(0, -1)];
                return [...updated, {
                    sender: 'bot',
                    text: textPart,
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                    suggestions: [],
                }];
            });
        }
    };

    const sendMessage = async (messageText) => {
        if (!messageText.trim()) return;
        const userMessage = { sender: 'user', text: messageText, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) };
        const botPlaceholder = { sender: 'bot', text: '...', time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }), suggestions: [] };

        setMessages(prev => [...prev, userMessage, botPlaceholder]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: [userMessage],
                    session_id: sessionId
                }),
            });

            if (response.status === 429) {
                throw new Error("RATE_LIMIT_EXCEEDED");
            }

            if (!response.ok) throw new Error("Failed to fetch response");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                fullResponse += decoder.decode(value, { stream: true });
            }

            // Handle Session ID extraction
            if (fullResponse.includes("|||SESSION_ID|||")) {
                const parts = fullResponse.split("|||SESSION_ID|||");
                const newSessionId = parts[1].trim();
                fullResponse = parts[0];
                setSessionId(newSessionId);
                localStorage.setItem('chat_session_id', newSessionId);
            }

            if (fullResponse.includes('[TOOL_CALL:GENERATE_STICKER:')) {
                setMessages(prev => { const updated = [...prev]; updated[updated.length - 1].text = "Creating a little something for you..."; return updated; });
                const jsonString = fullResponse.substring(fullResponse.indexOf('{'), fullResponse.lastIndexOf('}') + 1);
                const { prompt } = JSON.parse(jsonString);
                const imageGenResponse = await axios.post(`${BACKEND_URL}/api/v1/generate-sticker/`, { prompt });
                const imageUrl = imageGenResponse.data.imageUrl;

                const followUpMessage = {
                    sender: 'user',
                    text: `Here is the sticker you requested: ${imageUrl}. Please present this sticker to the user in Markdown format (![sticker](${imageUrl})) along with your original friendly message. **Remember to follow all original formatting rules, including providing suggestions.**`,
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                };

                const followUpResponse = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: [followUpMessage],
                        session_id: sessionId
                    }),
                });

                if (followUpResponse.status === 429) {
                    throw new Error("RATE_LIMIT_EXCEEDED");
                }

                const followUpReader = followUpResponse.body.getReader();
                let finalFullResponse = '';
                while (true) {
                    const { value, done } = await followUpReader.read();
                    if (done) break;
                    finalFullResponse += decoder.decode(value, { stream: true });
                }

                // Handle Session ID extraction in follow-up
                if (finalFullResponse.includes("|||SESSION_ID|||")) {
                    const parts = finalFullResponse.split("|||SESSION_ID|||");
                    const newSessionId = parts[1].trim();
                    finalFullResponse = parts[0];
                    setSessionId(newSessionId);
                    localStorage.setItem('chat_session_id', newSessionId);
                }

                fullResponse = finalFullResponse;
            }

            await displayFinalResponse(fullResponse);
            if (fullResponse.includes("please provide your name, email")) { setShowHireForm(true); }

        } catch (error) {
            console.error("API Error:", error);
            let errorMessage = "⚠️ Oops! Something went wrong. Please check your connection.";

            if (error.message === "RATE_LIMIT_EXCEEDED") {
                errorMessage = "🕒 You're chatting a bit too fast! Please wait a moment before your next message.";
            }

            setMessages(prev => {
                const updated = [...prev.slice(0, -1)];
                return [...updated, {
                    sender: 'bot',
                    text: errorMessage,
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                    suggestions: [],
                    isError: true
                }];
            });
        } finally {
            setLoading(false);
        }
    };

    const handleHireSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/api/v1/hire/`, hireDetails);
            setShowHireForm(false);
            setMessages(prev => [...prev, { sender: 'bot', text: "Thank you! Your request has been sent. Mann will get back to you shortly.", time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) }]);
        } catch (error) {
            console.error("Hiring Form Error:", error);
        } finally {
            setLoading(false);
            setHireDetails({ name: '', email: '', message: '' });
        }
    };

    const handleClearChat = () => {
        localStorage.removeItem('chatHistory');
        setMessages([initialMessage]);
    };

    const handleKeyDown = (e) => {
        if (showSlashCommands) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCommandIndex(prev => (prev + 1) % SLASH_COMMANDS.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCommandIndex(prev => (prev - 1 + SLASH_COMMANDS.length) % SLASH_COMMANDS.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const command = SLASH_COMMANDS[selectedCommandIndex];
                executeSlashCommand(command);
            } else if (e.key === 'Escape') {
                setShowSlashCommands(false);
            }
        } else {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
            }
        }
    };

    const executeSlashCommand = (command) => {
        setInput('');
        setShowSlashCommands(false);
        command.action();
    };

    useEffect(() => {
        if (input === '/') {
            setShowSlashCommands(true);
            setSelectedCommandIndex(0);
        } else if (!input.startsWith('/')) {
            setShowSlashCommands(false);
        }
    }, [input]);

    if (!mounted) return null;

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border border-slate-200 dark:border-white/10 hidden md:flex ${isOpen
                    ? 'bg-slate-900 text-white rotate-90 dark:bg-white dark:text-black'
                    : 'bg-white text-slate-900 dark:bg-[#1a1a1a] dark:text-white'
                    }`}
                style={{ boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed z-[100] bg-white dark:bg-[#111] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-slate-200 dark:border-white/10 
                    ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
                    } 
                    inset-0 md:inset-auto 
                    ${isExpanded
                        ? 'md:bottom-6 md:right-6 md:w-[calc(100vw-3rem)] md:h-[calc(100vh-3rem)] lg:w-[30rem] lg:h-[40rem] rounded-none md:rounded-2xl'
                        : 'md:bottom-24 md:right-6 md:w-[90vw] md:h-[32rem] lg:w-[24rem] lg:h-[32rem] rounded-none md:rounded-2xl md:border'
                    }`}
            >

                {/* Header */}
                <div className="p-4 md:p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#111]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-slate-200 dark:border-white/10">
                            <Bot size={20} className="text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">AI Assistant</h3>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400">Built by Man Navlakha</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <button onClick={handleClearChat} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors hover:text-slate-900 dark:hover:text-white" title="Clear Chat"><RefreshCcw size={18} /></button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors hover:text-slate-900 dark:hover:text-white">
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                    </div>
                </div>

                {/* Chat Body */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0a] relative">
                    <AnimatePresence>
                        {messages.map((msg, index) => {
                            const isUser = msg.sender === 'user';
                            const isBot = msg.sender === 'bot';
                            const showSuggestions = isBot && index === messages.length - 1 && msg.suggestions?.length > 0;
                            const text = typeof msg.text === "string" ? msg.text : "";
                            let isDocument = text.startsWith('[DOCUMENT:');

                            let docData = null;
                            if (isDocument) {
                                try {
                                    docData = JSON.parse(text.slice(10, -1));
                                } catch (e) {
                                    isDocument = false;
                                }
                            }

                            if (isBot && msg.text === '...' && !loading) return null;

                            const prev = messages[index - 1];
                            const next = messages[index + 1];
                            const isFirst = !prev || prev.sender !== msg.sender;
                            const isLast = !next || next.sender !== msg.sender;

                            // Dynamic Border Radius Logic
                            const cornerStyles = isUser
                                ? `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-sm'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-sm'} rounded-l-2xl`
                                : `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-sm'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-sm'} rounded-r-2xl`;

                            const isError = msg.isError;
                            const bubbleStyle = isError
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                                : isUser
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                                    : 'bg-white text-slate-800 dark:bg-[#1a1a1a] dark:text-gray-200 border border-slate-200 dark:border-white/5';

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? 'mb-4' : 'mb-1'}`}
                                >
                                    {isDocument ? (
                                        <DocumentBubble data={{ ...docData, time: msg.time }} />
                                    ) : (
                                        <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`relative px-4 py-3 shadow-sm text-sm ${cornerStyles} ${bubbleStyle}`}>
                                                {isError && (
                                                    <div className="flex items-center gap-2 mb-1 text-red-600 dark:text-red-400 font-medium">
                                                        <AlertCircle size={16} />
                                                        <span>Error</span>
                                                    </div>
                                                )}
                                                {loading && isBot && msg.text === '...' ? (
                                                    <TypingIndicator />
                                                ) : (

                                                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                                                        <ReactMarkdown components={{
                                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand underline hover:text-[#8ad45f]" />,
                                                            img: ImageRenderer,
                                                            p: ({ node, ...props }) => <div {...props} className="mb-2 last:mb-0" />,
                                                            ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2 space-y-1" />,
                                                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-2 space-y-1" />,
                                                            li: ({ node, ...props }) => <li {...props} className="pl-1" />,
                                                            h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold mb-2 mt-1" />,
                                                            h2: ({ node, ...props }) => <h2 {...props} className="text-base font-bold mb-2 mt-1" />,
                                                            h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-bold mb-1 mt-1" />,
                                                            code: ({ node, inline, className, children, ...props }) => {
                                                                return inline ? (
                                                                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <div className="bg-slate-800 text-slate-100 p-2 rounded-lg my-2 overflow-x-auto text-xs font-mono">
                                                                        <code {...props}>{children}</code>
                                                                    </div>
                                                                );
                                                            }
                                                        }}>
                                                            {msg.text}
                                                        </ReactMarkdown>

                                                    </div>
                                                )}

                                                {/* Copy Button (Hover) */}
                                                {!isUser && msg.text !== '...' && (
                                                    <button
                                                        onClick={() => handleCopy(msg.text)}
                                                        className="absolute -right-8 top-2 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {msg.text && msg.text !== '...' && isLast && (
                                                <div className="flex items-center gap-1 mt-1 px-1">
                                                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                                                    {isUser && <CheckCheck size={15} className="text-brand" />}
                                                </div>
                                            )}

                                            {/* Suggestions */}
                                            {showSuggestions && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {msg.suggestions.map((suggestion, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => sendMessage(suggestion)}
                                                            className="text-xs bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#222] hover:border-brand transition-colors"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={chatboxEndRef} />
                </div>

                {/* Footer Input */}
                <div className="p-4 pb-8 md:p-4 bg-white dark:bg-[#111] border-t border-slate-100 dark:border-white/5">
                    {!showHireForm ? (
                        <>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type '/' for commands..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand dark:focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 transition-colors"
                                />

                                {/* Slash Commands Menu */}
                                <AnimatePresence>
                                    {showSlashCommands && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-2">
                                                <Terminal size={14} className="text-brand" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Commands</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto p-1">
                                                {SLASH_COMMANDS.map((command, idx) => {
                                                    const Icon = command.icon;
                                                    const isSelected = selectedCommandIndex === idx;
                                                    return (
                                                        <div
                                                            key={command.cmd}
                                                            onClick={() => executeSlashCommand(command)}
                                                            onMouseEnter={() => setSelectedCommandIndex(idx)}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-brand/10 text-brand' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                                                        >
                                                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                                                                <Icon size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-bold">{command.cmd}</div>
                                                                <div className="text-[10px] opacity-70 truncate">{command.desc}</div>
                                                            </div>
                                                            {isSelected && <div className="text-[10px] font-mono opacity-50">ENTER</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 ml-1">
                                🌍 I speak English, Hindi, and Gujarati!
                            </p>
                        </>
                    ) : (
                        <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Inquiry</h4>
                                <button onClick={() => setShowHireForm(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleHireSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    value={hireDetails.name}
                                    onChange={e => setHireDetails({ ...hireDetails, name: e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand"
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    required
                                    value={hireDetails.email}
                                    onChange={e => setHireDetails({ ...hireDetails, email: e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand"
                                />
                                <textarea
                                    placeholder="Project Details..."
                                    required
                                    rows={3}
                                    value={hireDetails.message}
                                    onChange={e => setHireDetails({ ...hireDetails, message: e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Lightbox Overlay */}
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
                                className="absolute top-4 left-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
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
