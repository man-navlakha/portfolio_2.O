'use client';

import { useState, useEffect } from 'react';
import { usePortal } from '../PortalLayoutClient';
import ChatWindow from '@/components/portal/ChatWindow';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, supabase, isAdmin, profile } = usePortal();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrCreateConversation = async () => {
      if (!user) return;

      if (isAdmin) {
        // Admin should use /portal/admin/chat instead
        // But if they come here, show the first conversation
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false })
          .limit(1)
          .single();
        setConversation(data);
        setLoading(false);
        return;
      }

      // Client: find their conversation or create one
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .limit(1)
        .single();

      if (existing) {
        setConversation(existing);
      } else {
        // Call our API to bypass RLS and create the conversation
        try {
          const res = await fetch('/api/portal/chat/init', { method: 'POST' });
          if (res.ok) {
            const newConv = await res.json();
            setConversation(newConv);
          }
        } catch (error) {
          console.error("Failed to initialize conversation", error);
        }
      }
      setLoading(false);
    };

    getOrCreateConversation();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] md:h-screen">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#30af5b]/30 to-[#6366f1]/30 border border-white/[0.08] flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-[#30af5b]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            {isAdmin ? 'Support Chat' : 'Chat with Developer'}
          </h2>
          <p className="text-[11px] text-gray-500">
            Messages are delivered in real-time
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#30af5b] animate-pulse" />
          <span className="text-[11px] text-gray-500">Online</span>
        </div>
      </div>

      {/* Chat content */}
      {conversation ? (
        <ChatWindow
          conversationId={conversation.id}
          recipientName={isAdmin ? 'Client' : 'Man Navlakha'}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#30af5b]/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-[#30af5b]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Chat unavailable</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Unable to start a conversation. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}
