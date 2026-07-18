'use client';

import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, trend, trendLabel, color = '#30af5b', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-[#0d0d14]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}08, transparent)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${
            trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            {trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
