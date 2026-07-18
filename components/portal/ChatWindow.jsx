'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Image as ImageIcon, X, Loader2, Check, CheckCheck } from 'lucide-react';
import { usePortal } from '@/app/portal/PortalLayoutClient';

export default function ChatWindow({ conversationId, recipientName = 'Admin' }) {
  const { user, profile, supabase, setUnreadMessages } = usePortal();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch existing messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles(full_name, avatar_url, role)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setLoading(false);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (setUnreadMessages) {
        // Fetch fresh unread count across all conversations to guarantee accuracy
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id);
        setUnreadMessages(count || 0);
      }
    };

    fetchMessages();
  }, [conversationId, user?.id]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(full_name, avatar_url, role)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });

            // Mark as read if from the other person
            if (data.sender_id !== user.id) {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', data.id);
                
              if (setUnreadMessages) {
                setUnreadMessages((prev) => Math.max(0, prev - 1));
              }
            }
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content && !file) return;
    if (!conversationId) return;

    setSending(true);

    let fileUrl = null;
    let fileType = null;

    // Upload file if attached
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName);
        fileUrl = publicUrl;
        fileType = file.type.startsWith('image/') ? 'image' : 'file';
      }
    }

    const messageContent = fileUrl
      ? `${content ? content + '\n' : ''}[${fileType === 'image' ? '📷' : '📎'} ${file?.name}](${fileUrl})`
      : content;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
    });

    if (!error) {
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    setNewMessage('');
    setFile(null);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#30af5b]/10 flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-[#30af5b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Start the conversation</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Send a message to get started. Your messages are delivered in real-time.
            </p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-gray-600 font-medium">{date}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {msgs.map((msg, i) => {
                const isOwn = msg.sender_id === user?.id;
                const showAvatar = i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for received messages */}
                    {!isOwn && (
                      <div className={`w-7 h-7 rounded-full shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white">
                          {msg.sender?.full_name?.charAt(0) || '?'}
                        </div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-[#30af5b] text-white rounded-br-md'
                          : 'bg-white/[0.06] text-gray-200 rounded-bl-md'
                      }`}
                    >
                      {/* Sender name for group-style display */}
                      {!isOwn && showAvatar && (
                        <p className="text-[11px] font-semibold text-[#818cf8] mb-1">
                          {msg.sender?.full_name || 'Admin'}
                        </p>
                      )}

                      {/* Message content - handle links/attachments */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content.split('\n').map((line, li) => {
                          // Check for file attachment markdown
                          const linkMatch = line.match(/\[(.+?)\]\((.+?)\)/);
                          if (linkMatch) {
                            const isImage = linkMatch[1].startsWith('📷');
                            if (isImage) {
                              return (
                                <a
                                  key={li}
                                  href={linkMatch[2]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mt-1"
                                >
                                  <img
                                    src={linkMatch[2]}
                                    alt="attachment"
                                    className="max-w-full max-h-48 rounded-lg"
                                  />
                                </a>
                              );
                            }
                            return (
                              <a
                                key={li}
                                href={linkMatch[2]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 mt-1 text-xs ${
                                  isOwn ? 'text-white/80 hover:text-white' : 'text-[#30af5b] hover:text-[#38c466]'
                                } transition-colors`}
                              >
                                <Paperclip className="w-3 h-3" />
                                {linkMatch[1].replace('📎 ', '')}
                              </a>
                            );
                          }
                          return <span key={li}>{line}{li < msg.content.split('\n').length - 1 && <br />}</span>;
                        })}
                      </div>

                      {/* Time & read status */}
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                          {formatTime(msg.created_at)}
                        </span>
                        {isOwn && (
                          msg.is_read
                            ? <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1]" />
                            : <Check className="w-3.5 h-3.5 text-white/60" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white">
                M
              </div>
              <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-500"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* File preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="flex items-center gap-2 p-2 bg-white/[0.04] border border-white/[0.08] rounded-lg">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <span className="text-xs text-gray-400 truncate flex-1">{file.name}</span>
              <span className="text-[10px] text-gray-600 shrink-0">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={() => setFile(null)}
                className="p-1 rounded text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4 border-t border-white/[0.06]">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-[#30af5b]/40 focus:ring-1 focus:ring-[#30af5b]/20 transition-all"
            />
          </div>

          {/* File attach */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Send */}
          <motion.button
            type="submit"
            disabled={sending || (!newMessage.trim() && !file)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-[#30af5b] hover:bg-[#38c466] text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
