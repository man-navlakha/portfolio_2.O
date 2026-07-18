'use client';

import { useState, useEffect } from 'react';
import { usePortal } from '../../PortalLayoutClient';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/portal/ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Loader2 } from 'lucide-react';

export default function AdminChatPage() {
  const { user, profile, supabase, isAdmin } = usePortal();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !isAdmin) {
      router.push('/portal');
      return;
    }

    if (isAdmin) fetchConversations();
  }, [isAdmin, profile]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*, client:profiles!conversations_client_id_fkey(id, full_name, company, avatar_url)')
      .order('last_message_at', { ascending: false });

    setConversations(data || []);

    // Auto-select the first conversation
    if (data?.length > 0 && !selectedConv) {
      setSelectedConv(data[0]);
    }
    setLoading(false);
  };

  // Subscribe to conversation updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex">
      {/* Conversations sidebar */}
      <div className="w-72 lg:w-80 border-r border-white/[0.06] flex flex-col bg-[#08080c]">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#30af5b]" />
            Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No conversations yet</p>
              <p className="text-[11px] text-gray-600 mt-1">
                Clients will appear here when they start chatting.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    selectedConv?.id === conv.id
                      ? 'bg-[#30af5b]/10 border border-[#30af5b]/20'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#818cf8]/20 to-[#6366f1]/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {conv.client?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {conv.client?.full_name || 'Client'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {conv.client?.company || 'No company'}
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-600 shrink-0">
                    {new Date(conv.last_message_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#818cf8]/20 to-[#6366f1]/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white">
                {selectedConv.client?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {selectedConv.client?.full_name || 'Client'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {selectedConv.client?.company || 'Direct message'}
                </p>
              </div>
            </div>

            <ChatWindow
              conversationId={selectedConv.id}
              recipientName={selectedConv.client?.full_name || 'Client'}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Select a conversation</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Choose a client from the sidebar to view their messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
