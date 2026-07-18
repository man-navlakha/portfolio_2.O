'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePortal } from '../../PortalLayoutClient';
import DocumentCard from '@/components/portal/DocumentCard';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const statusConfig = {
  planning: { label: 'Planning', color: '#a78bfa' },
  in_progress: { label: 'In Progress', color: '#30af5b' },
  review: { label: 'In Review', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#3b82f6' },
  on_hold: { label: 'On Hold', color: '#6b7280' },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, supabase } = usePortal();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data: projectData } = await supabase
        .from('client_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectData) {
        setProject(projectData);

        const { data: docData } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        setDocuments(docData || []);
      }
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-semibold text-white">Project not found</h2>
        <Link href="/portal/projects" className="text-sm text-[#30af5b] mt-2 inline-block">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const status = statusConfig[project.status] || statusConfig.in_progress;
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Milestone stages
  const stages = [
    { key: 'planning', label: 'Planning' },
    { key: 'in_progress', label: 'Development' },
    { key: 'review', label: 'Review' },
    { key: 'completed', label: 'Completed' },
  ];
  const currentStageIndex = stages.findIndex((s) => s.key === project.status);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/portal/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Projects
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-primary tracking-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-gray-400 mt-2 text-sm max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${status.color}15`,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>
      </motion.div>

      {/* Progress timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-white mb-5">Project Timeline</h3>
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/[0.06]" />
          <div
            className="absolute top-3 left-0 h-0.5 transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${status.color}, ${status.color}80)`,
            }}
          />

          {stages.map((stage, i) => {
            const isPast = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            const isFuture = i > currentStageIndex;
            return (
              <div key={stage.key} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isPast
                      ? 'bg-[#30af5b]'
                      : isCurrent
                      ? `border-2`
                      : 'bg-[#1a1a24] border border-white/[0.1]'
                  }`}
                  style={isCurrent ? { borderColor: status.color, backgroundColor: `${status.color}20` } : {}}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Circle className="w-2 h-2" style={{ color: status.color, fill: status.color }} />
                  ) : (
                    <Circle className="w-2 h-2 text-gray-600" />
                  )}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium ${
                    isCurrent ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Info grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-5"
        >
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Progress</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}cc)` }}
            />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-5 space-y-3"
        >
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Details</h3>
          {project.start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">
                Started{' '}
                {new Date(project.start_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {project.deadline && (
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${daysLeft < 7 ? 'text-amber-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${daysLeft < 7 ? 'text-amber-400' : 'text-gray-400'}`}>
                {daysLeft > 0
                  ? `${daysLeft} days remaining`
                  : daysLeft === 0
                  ? 'Due today'
                  : `${Math.abs(daysLeft)} days overdue`}
              </span>
            </div>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#30af5b] hover:text-[#38c466] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Live Preview
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Repository
            </a>
          )}
        </motion.div>
      </div>

      {/* Tech stack */}
      {project.tech_stack?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-5 mb-6"
        >
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-gray-300 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="text-sm font-semibold text-white mb-4">
          Project Documents ({documents.length})
        </h3>
        {documents.length === 0 ? (
          <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-10 text-center">
            <p className="text-sm text-gray-500">No documents attached to this project yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <DocumentCard key={doc.id} document={doc} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
