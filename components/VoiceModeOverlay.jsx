"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MicOff, Mic, Phone } from 'lucide-react';
import VoiceOrb from './VoiceOrb';

const OVERLAY_CSS = `
.voice-overlay-glass {
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
}
.voice-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.voice-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.voice-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
}
`;

// ─── Strip markdown for clean display ─────────────────────────────────────
function stripMarkdown(text) {
  if (!text) return '';
  return text
    // Remove suggestion markers and hire form triggers
    .replace(/\|{3}SUGGESTIONS\|{3}.*/s, '')
    .replace(/\[SHOW_HIRE_FORM\]/g, '')
    // Remove markdown formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')     // images
    .replace(/```[\s\S]*?```/g, '')              // code blocks
    .replace(/`([^`]+)`/g, '$1')                 // inline code
    .replace(/#{1,6}\s+/g, '')                   // headers
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')       // bold italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')           // bold
    .replace(/\*([^*]+)\*/g, '$1')               // italic
    .replace(/__([^_]+)__/g, '$1')               // bold underscore
    .replace(/_([^_]+)_/g, '$1')                 // italic underscore
    .replace(/~~([^~]+)~~/g, '$1')               // strikethrough
    .replace(/^[-*+]\s+/gm, '• ')               // bullet lists
    .replace(/^\d+\.\s+/gm, '')                  // numbered lists
    .replace(/^>\s+/gm, '')                       // blockquotes
    .replace(/---+/g, '')                          // horizontal rules
    .replace(/\n{3,}/g, '\n\n')                   // excessive newlines
    .trim();
}

export default function VoiceModeOverlay({
  isOpen,
  onClose,
  voiceHook,
  onSendMessage,
  isProcessing,
  streamingText,
}) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    volume,
    error,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    resetTranscript,
  } = voiceHook;

  // ─── State ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('idle');
  const [displayText, setDisplayText] = useState('');
  const [statusText, setStatusText] = useState('Tap the mic to start');
  const hasAutoStarted = useRef(false);
  const lastTranscriptRef = useRef('');
  const isProcessingRef = useRef(false);
  // Captures the last non-empty streaming text — survives the parent clearing it
  const lastStreamingTextRef = useRef('');
  const hasSpokeRef = useRef(false);

  // ─── Auto-start listening when overlay opens ────────────────────────────
  useEffect(() => {
    if (isOpen && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setTimeout(() => {
        startListening();
        setPhase('listening');
        setStatusText('Listening...');
        setDisplayText('');
      }, 500);
    }

    if (!isOpen) {
      hasAutoStarted.current = false;
      setPhase('idle');
      setDisplayText('');
      setStatusText('Tap the mic to start');
      lastStreamingTextRef.current = '';
      hasSpokeRef.current = false;
    }
  }, [isOpen, startListening]);

  // ─── Track transcript changes ──────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');
      if (fullTranscript.trim()) {
        setDisplayText(fullTranscript.trim());
        setStatusText('Listening...');
      }
    }
  }, [transcript, interimTranscript, isListening]);

  // ─── Handle when listening stops (silence detected / manual stop) ──────
  useEffect(() => {
    if (!isListening && transcript.trim() && phase === 'listening' && !isProcessingRef.current) {
      isProcessingRef.current = true;
      hasSpokeRef.current = false;
      lastStreamingTextRef.current = '';
      setPhase('thinking');
      setStatusText('Thinking...');

      const userText = transcript.trim();
      lastTranscriptRef.current = userText;
      resetTranscript();
      onSendMessage(userText);
    }
  }, [isListening, transcript, phase, resetTranscript, onSendMessage]);

  // ─── Track processing state from parent ────────────────────────────────
  useEffect(() => {
    if (isProcessing && phase !== 'speaking') {
      setPhase('thinking');
      setStatusText('Thinking...');
    }
  }, [isProcessing, phase]);

  // ─── Capture streaming text in ref before parent clears it ─────────────
  useEffect(() => {
    if (streamingText && isProcessingRef.current) {
      // Save non-empty streaming text so we have it even after it's cleared
      lastStreamingTextRef.current = streamingText;

      // Update display with clean text
      const clean = stripMarkdown(streamingText);
      if (clean) {
        setPhase('speaking');
        setStatusText('Speaking...');
        setDisplayText(clean);
      }
    }
  }, [streamingText]);

  // ─── When processing finishes, speak the full response ─────────────────
  useEffect(() => {
    if (!isProcessing && isProcessingRef.current && lastTranscriptRef.current && !hasSpokeRef.current) {
      // Use the ref — streamingText may already be cleared by parent
      const savedText = lastStreamingTextRef.current;
      if (!savedText) {
        isProcessingRef.current = false;
        lastTranscriptRef.current = '';
        return;
      }

      const cleanText = stripMarkdown(savedText);
      if (!cleanText) {
        isProcessingRef.current = false;
        lastTranscriptRef.current = '';
        return;
      }

      hasSpokeRef.current = true;
      setPhase('speaking');
      setStatusText('Speaking...');
      setDisplayText(cleanText);

      speakText(cleanText, () => {
        // After speaking completes — auto-listen for next turn
        isProcessingRef.current = false;
        lastTranscriptRef.current = '';
        lastStreamingTextRef.current = '';
        hasSpokeRef.current = false;
        setDisplayText('');
        setPhase('listening');
        setStatusText('Listening...');
        resetTranscript();
        startListening();
      });
    }
  }, [isProcessing, speakText, resetTranscript, startListening]);

  // ─── Handle close ──────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    resetTranscript();
    isProcessingRef.current = false;
    lastTranscriptRef.current = '';
    lastStreamingTextRef.current = '';
    hasSpokeRef.current = false;
    setPhase('idle');
    onClose();
  }, [stopListening, stopSpeaking, resetTranscript, onClose]);

  // ─── Handle mic toggle ────────────────────────────────────────────────
  const handleMicToggle = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      isProcessingRef.current = false;
      lastTranscriptRef.current = '';
      lastStreamingTextRef.current = '';
      hasSpokeRef.current = false;
      setDisplayText('');
      resetTranscript();
      setPhase('listening');
      setStatusText('Listening...');
      startListening();
    } else if (isListening) {
      stopListening();
      if (!transcript.trim()) {
        setPhase('idle');
        setStatusText('Tap the mic to start');
      }
    } else {
      isProcessingRef.current = false;
      resetTranscript();
      setDisplayText('');
      setPhase('listening');
      setStatusText('Listening...');
      startListening();
    }
  }, [isListening, isSpeaking, transcript, startListening, stopListening, stopSpeaking, resetTranscript]);

  // ─── Determine orb mode ────────────────────────────────────────────────
  const orbMode = phase === 'listening' ? 'listening'
    : phase === 'thinking' ? 'thinking'
    : phase === 'speaking' ? 'speaking'
    : 'idle';

  if (!isOpen) return null;

  return (
    <>
      <style>{OVERLAY_CSS}</style>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col voice-overlay-glass"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,20,0.98) 50%, rgba(0,0,0,0.95) 100%)',
          }}
        >
          {/* ─── Top bar ─── */}
          <div className="w-full flex items-center justify-between px-5 py-4 shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/60 font-medium">Voice Mode</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* ─── Center — Orb + Status + Transcript ─── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
            {/* Status text */}
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-4"
            >
              <p className="text-xs font-semibold text-white/40 tracking-[0.2em] uppercase">
                {statusText}
              </p>
            </motion.div>

            {/* Orb */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="shrink-0"
            >
              <VoiceOrb mode={orbMode} volume={volume} size={110} />
            </motion.div>

            {/* Transcript / Response display */}
            <div className="w-full max-w-md mt-4 min-h-[60px] max-h-[140px] overflow-y-auto voice-scrollbar">
              <AnimatePresence mode="wait">
                {displayText && (
                  <motion.div
                    key={phase + '-text'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-center px-4"
                  >
                    <p className={`text-sm leading-relaxed ${
                      phase === 'listening'
                        ? 'text-white/90'
                        : phase === 'thinking'
                          ? 'text-purple-300/70'
                          : 'text-cyan-200/70'
                    }`}>
                      {displayText}
                      {phase === 'listening' && interimTranscript && (
                        <span className="text-white/30"> {interimTranscript}</span>
                      )}
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center px-4"
                  >
                    <p className="text-xs text-red-400/80">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Bottom controls ─── */}
          <div className="shrink-0 flex flex-col items-center gap-4 pb-8 pt-4 px-6">
            <div className="flex items-center gap-4">
              {/* Mic toggle button */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleMicToggle}
                whileTap={{ scale: 0.9 }}
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'bg-white/15 text-white ring-2 ring-white/30 ring-offset-2 ring-offset-transparent'
                    : isSpeaking
                      ? 'bg-white/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/10 text-white/60 border border-white/15 hover:bg-white/15 hover:text-white'
                }`}
                title={isListening ? 'Stop listening' : isSpeaking ? 'Interrupt' : 'Start listening'}
              >
                {isListening ? (
                  <MicOff size={22} />
                ) : (
                  <Mic size={22} />
                )}
              </motion.button>

              {/* End call button */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleClose}
                whileTap={{ scale: 0.9 }}
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white transition-all hover:brightness-110 active:brightness-90"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                title="End voice session"
              >
                <Phone size={22} className="rotate-[135deg]" />
              </motion.button>
            </div>

            <p className="text-[11px] text-white/20 text-center">
              {phase === 'listening' ? 'Auto-stops when you pause speaking'
                : phase === 'speaking' ? 'Tap mic to interrupt'
                : phase === 'thinking' ? 'Processing your question...'
                : 'Tap mic to begin'}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
