"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * VoiceOrb — Premium animated visualization for voice mode
 * Inspired by ChatGPT / Gemini voice orbs with fluid, multi-layered animations
 * 
 * Modes: 'listening' | 'thinking' | 'speaking' | 'idle'
 * Volume: 0-1 for audio-reactive effects
 */

const ORBS_CSS = `
@keyframes vo-spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes vo-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes vo-breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes vo-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.02); }
}
@keyframes vo-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes vo-ripple {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes vo-pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.12); opacity: 0.6; }
}
@keyframes vo-dash-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const MODE_THEMES = {
  idle: {
    core: ['#4b5563', '#6b7280'],
    rings: 'rgba(107, 114, 128, 0.15)',
    accent: 'rgba(107, 114, 128, 0.08)',
  },
  listening: {
    core: ['#6366f1', '#818cf8', '#a78bfa'],
    rings: 'rgba(99, 102, 241, 0.2)',
    accent: 'rgba(129, 140, 248, 0.12)',
  },
  thinking: {
    core: ['#a855f7', '#c084fc', '#e879f9'],
    rings: 'rgba(168, 85, 247, 0.18)',
    accent: 'rgba(192, 132, 252, 0.1)',
  },
  speaking: {
    core: ['#06b6d4', '#22d3ee', '#67e8f9'],
    rings: 'rgba(6, 182, 212, 0.2)',
    accent: 'rgba(34, 211, 238, 0.12)',
  },
};

export default function VoiceOrb({ mode = 'idle', volume = 0, size = 120 }) {
  const theme = MODE_THEMES[mode] || MODE_THEMES.idle;
  const isActive = mode !== 'idle';
  const coreSize = size * 0.55;
  const midSize = size * 0.75;

  // Audio-reactive scale
  const vol = Math.max(volume, 0.05);
  const coreScale = mode === 'listening' ? 1 + vol * 0.25 : mode === 'speaking' ? 1 + vol * 0.15 : 1;

  // Generate bar heights for the waveform visualizer
  const bars = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => ({
      delay: i * 0.07,
      baseHeight: 4 + Math.sin(i * 1.2) * 2,
    }));
  }, []);

  return (
    <>
      <style>{ORBS_CSS}</style>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size * 1.8, height: size * 1.8, animation: isActive ? 'vo-float 4s ease-in-out infinite' : undefined }}
      >
        {/* ── Soft glow halo ── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)`,
            opacity: isActive ? 0.8 : 0.3,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* ── Main orb core ── */}
        <motion.div
          animate={{ scale: coreScale }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="absolute"
          style={{
            width: coreSize,
            height: coreSize,
            top: '50%',
            left: '50%',
            marginTop: -coreSize / 2,
            marginLeft: -coreSize / 2,
          }}
        >
          <div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              boxShadow: isActive
                ? `0 0 ${30 + vol * 20}px ${theme.core[0]}40, 0 0 ${60 + vol * 30}px ${theme.core[0]}20`
                : 'none',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            {/* Gradient fill */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.core.join(', ')})`,
                backgroundSize: '200% 200%',
                animation: isActive ? 'vo-shimmer 4s ease infinite' : undefined,
              }}
            />

            {/* Glass highlight */}
            <div
              className="absolute rounded-full"
              style={{
                top: '6%',
                left: '10%',
                width: '55%',
                height: '35%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                filter: 'blur(1px)',
              }}
            />

            {/* Breathing overlay */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                  animation: 'vo-breathe 3s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </motion.div>

        {/* ── Center indicator ── */}
        <div className="absolute z-10 pointer-events-none flex items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {/* Listening — animated waveform bars */}
          {mode === 'listening' && (
            <div className="flex gap-[3px] items-center" style={{ height: 24 }}>
              {bars.map((bar, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [bar.baseHeight, bar.baseHeight + Math.max(vol, 0.35) * 18, bar.baseHeight],
                  }}
                  transition={{
                    duration: 0.35,
                    repeat: Infinity,
                    delay: bar.delay,
                    ease: 'easeInOut',
                  }}
                  className="rounded-full"
                  style={{
                    width: 3,
                    background: 'rgba(255,255,255,0.85)',
                    minHeight: 3,
                  }}
                />
              ))}
            </div>
          )}

          {/* Thinking — spinning arc */}
          {mode === 'thinking' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <path
                  d="M11 2a9 9 0 0 1 9 9"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}

          {/* Speaking — soft equalizer */}
          {mode === 'speaking' && (
            <div className="flex gap-[3px] items-center" style={{ height: 20 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [1, 1.6, 1],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 0.55,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                  className="rounded-full"
                  style={{
                    width: 3,
                    height: 14,
                    background: 'rgba(255,255,255,0.8)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
