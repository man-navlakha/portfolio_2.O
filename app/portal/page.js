'use client';

import { useState, useEffect } from 'react';
import { usePortal } from './PortalLayoutClient';
import StatsCard from '@/components/portal/StatsCard';
import ProjectCard from '@/components/portal/ProjectCard';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  MessageCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboard() {
  const { user, profile, supabase, isAdmin, unreadMessages } = usePortal();
  const [projects, setProjects] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalDocs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;

      // Fetch projects
      let projectQuery = supabase
        .from('client_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!isAdmin) {
        projectQuery = projectQuery.eq('client_id', user.id);
      }

      const { data: projectData } = await projectQuery;
      setProjects(projectData || []);

      // Fetch recent documents
      let docQuery = supabase
        .from('documents')
        .select('*, project:client_projects(title)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin) {
        docQuery = docQuery.eq('client_id', user.id);
      }

      const { data: docData } = await docQuery;
      setRecentDocs(docData || []);

      // Stats
      const activeCount = (projectData || []).filter(
        (p) => p.status === 'in_progress' || p.status === 'review'
      ).length;

      setStats({
        totalProjects: projectData?.length || 0,
        activeProjects: activeCount,
        totalDocs: docData?.length || 0,
      });

      setLoading(false);
    };

    fetchDashboard();
  }, [user, isAdmin]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        {/* Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/[0.03] rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#30af5b]" />
          <span className="text-sm text-gray-500">{greeting()}</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-primary tracking-tight">
          {profile?.full_name || 'Welcome back'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here&apos;s an overview of your projects and activity.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats.totalProjects}
          color="#30af5b"
          delay={0}
        />
        <StatsCard
          icon={Clock}
          label="Active Projects"
          value={stats.activeProjects}
          color="#f59e0b"
          delay={0.1}
        />
        <StatsCard
          icon={FileText}
          label="Documents"
          value={stats.totalDocs}
          color="#3b82f6"
          delay={0.2}
        />
        <StatsCard
          icon={MessageCircle}
          label="Unread Messages"
          value={unreadMessages}
          color="#8b5cf6"
          delay={0.3}
        />
      </div>

      {/* Active Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
          <Link
            href="/portal/projects"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#30af5b] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-12 text-center">
            <FolderKanban className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No projects yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Your projects will appear here once they&apos;re set up.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
          <Link
            href="/portal/documents"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#30af5b] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-12 text-center">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Shared files and documents will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-[#0d0d14]/80 border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.name}</p>
                  <p className="text-[11px] text-gray-600">
                    {doc.project?.title && `${doc.project.title} · `}
                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-[#30af5b] transition-colors"
                  >
                    Open →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
