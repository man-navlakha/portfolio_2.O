'use client';

import { useState, useEffect } from 'react';
import { usePortal } from '../PortalLayoutClient';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/portal/StatsCard';
import { motion } from 'framer-motion';
import {
  Users,
  FolderKanban,
  MessageCircle,
  FileText,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, profile, supabase, isAdmin } = usePortal();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalDocs: 0,
    unreadChats: 0,
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !isAdmin) {
      router.push('/portal');
      return;
    }

    const fetchStats = async () => {
      // Count clients
      const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      // Count projects
      const { count: projectCount } = await supabase
        .from('client_projects')
        .select('*', { count: 'exact', head: true });

      // Count documents
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      // Count unread messages
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);

      setStats({
        totalClients: clientCount || 0,
        totalProjects: projectCount || 0,
        totalDocs: docCount || 0,
        unreadChats: unreadCount || 0,
      });

      // Recent clients
      const { data: clients } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentClients(clients || []);
      setLoading(false);
    };

    if (isAdmin) fetchStats();
  }, [isAdmin, profile]);

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-6 h-6 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#818cf8]" />
          <span className="text-sm text-[#818cf8] font-medium">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-primary tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Overview of all clients, projects, and communications.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Users} label="Total Clients" value={stats.totalClients} color="#818cf8" delay={0} />
        <StatsCard icon={FolderKanban} label="Total Projects" value={stats.totalProjects} color="#30af5b" delay={0.1} />
        <StatsCard icon={FileText} label="Total Documents" value={stats.totalDocs} color="#3b82f6" delay={0.2} />
        <StatsCard icon={MessageCircle} label="Unread Messages" value={stats.unreadChats} color="#f59e0b" delay={0.3} />
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/portal/admin/clients"
          className="group bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-5 hover:border-[#818cf8]/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#818cf8]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Manage Clients</h3>
                <p className="text-xs text-gray-500">Create and manage client accounts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#818cf8] transition-colors" />
          </div>
        </Link>

        <Link
          href="/portal/admin/chat"
          className="group bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-5 hover:border-[#30af5b]/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#30af5b]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#30af5b]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">All Conversations</h3>
                <p className="text-xs text-gray-500">View and respond to client chats</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#30af5b] transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent clients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
          <Link
            href="/portal/admin/clients"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#818cf8] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-12 text-center">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No clients yet</p>
            <Link href="/portal/admin/clients" className="text-sm text-[#818cf8] mt-2 inline-block">
              Create your first client →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentClients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-[#0d0d14]/80 border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#818cf8]/20 to-[#6366f1]/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white">
                  {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {client.full_name || 'Unnamed'}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate">
                    {client.company && `${client.company} · `}
                    Joined {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
