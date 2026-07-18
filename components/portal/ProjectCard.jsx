'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ExternalLink, GitBranch, Clock } from 'lucide-react';

const statusConfig = {
  planning: { label: 'Planning', color: '#a78bfa', bg: 'bg-purple-500/10' },
  in_progress: { label: 'In Progress', color: '#30af5b', bg: 'bg-emerald-500/10' },
  review: { label: 'In Review', color: '#f59e0b', bg: 'bg-amber-500/10' },
  completed: { label: 'Completed', color: '#3b82f6', bg: 'bg-blue-500/10' },
  on_hold: { label: 'On Hold', color: '#6b7280', bg: 'bg-gray-500/10' },
};

export default function ProjectCard({ project, index = 0 }) {
  const status = statusConfig[project.status] || statusConfig.in_progress;

  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/portal/projects/${project.id}`}
        className="group block relative bg-[#0d0d14]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300"
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-[#30af5b] transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
          </div>
          <span
            className={`shrink-0 ml-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg}`}
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500">Progress</span>
            <span className="text-[11px] font-medium text-gray-400">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${status.color}cc, ${status.color})`,
              }}
            />
          </div>
        </div>

        {/* Tech stack */}
        {project.tech_stack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[10px] text-gray-400 font-medium"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] text-gray-600">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
          {project.start_date && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          {daysLeft !== null && (
            <div className={`flex items-center gap-1.5 text-[11px] ${daysLeft < 7 ? 'text-amber-400' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)}d overdue`}
            </div>
          )}
          {project.live_url && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 ml-auto">
              <ExternalLink className="w-3 h-3" />
              Live
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
