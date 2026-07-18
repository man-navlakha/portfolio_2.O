'use client';

import { useState, useEffect } from 'react';
import { usePortal } from '../PortalLayoutClient';
import ProjectCard from '@/components/portal/ProjectCard';
import { motion } from 'framer-motion';
import { FolderKanban, Search, Filter } from 'lucide-react';

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'planning', label: 'Planning' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'completed', label: 'Completed' },
];

export default function ProjectsPage() {
  const { user, supabase, isAdmin } = usePortal();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      let query = supabase
        .from('client_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('client_id', user.id);
      }

      const { data } = await query;
      setProjects(data || []);
      setLoading(false);
    };

    fetchProjects();
  }, [user, isAdmin]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white font-primary tracking-tight">Projects</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all your project progress and milestones.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#30af5b]/40 transition-all"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === filter.key
                  ? 'bg-[#30af5b]/15 text-[#30af5b] border border-[#30af5b]/20'
                  : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-16 text-center">
          <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">
            {search || statusFilter !== 'all' ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Your projects will appear here once they are set up by your developer.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
