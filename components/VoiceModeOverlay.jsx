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
    audioDevices,
    selectedDeviceId,
    startListening,
    stopListening,
    speakText,
    addToSpeechQueue,
    finalizeSpeechQueue,
    stopSpeaking,
    resetTranscript,
    changeMicrophone,
    playAudioTone,
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
  const processedTextLengthRef = useRef(0);

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
      processedTextLengthRef.current = 0;
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
      processedTextLengthRef.current = 0;
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

  // ─── Capture streaming text and stream to TTS ──────────────────────────
  useEffect(() => {
    if (streamingText && isProcessingRef.current) {
      lastStreamingTextRef.current = streamingText;

      // Look for completed sentences in the newly arrived text
      const newText = streamingText.slice(processedTextLengthRef.current);
      // Regex matches up to the last sentence boundary (. ! ? \n) followed by a space or end of string
      const match = newText.match(/^[\s\S]*[.!?\n](?=\s|$)/);
      if (match) {
         const sentenceToSpeak = match[0];
         processedTextLengthRef.current += sentenceToSpeak.length;
         addToSpeechQueue(sentenceToSpeak);
      }

      const clean = stripMarkdown(streamingText);
      if (clean) {
        setPhase('speaking');
        setStatusText('Speaking...');
        setDisplayText(clean);
      }
    }
  }, [streamingText, addToSpeechQueue]);

  // ─── When processing finishes, finalize speech queue ───────────────────
  useEffect(() => {
    if (!isProcessing && isProcessingRef.current && lastTranscriptRef.current && !hasSpokeRef.current) {
      hasSpokeRef.current = true;

      // Feed any remaining text that wasn't matched as a full sentence
      const savedText = lastStreamingTextRef.current;
      const remainingText = savedText.slice(processedTextLengthRef.current);
      if (remainingText.trim()) {
         addToSpeechQueue(remainingText);
      }
      
      const cleanText = stripMarkdown(savedText);
      if (cleanText) {
        setPhase('speaking');
        setStatusText('Speaking...');
        setDisplayText(cleanText);
      }

      finalizeSpeechQueue(() => {
        // After speaking completes — auto-listen for next turn
        isProcessingRef.current = false;
        lastTranscriptRef.current = '';
        lastStreamingTextRef.current = '';
        processedTextLengthRef.current = 0;
        hasSpokeRef.current = false;
        setDisplayText('');
        setPhase('listening');
        setStatusText('Listening...');
        resetTranscript();
        startListening();
      });
    }
  }, [isProcessing, addToSpeechQueue, finalizeSpeechQueue, resetTranscript, startListening]);

  // ─── Handle close ──────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    playAudioTone('call-end');
    stopListening();
    stopSpeaking();
    resetTranscript();
    isProcessingRef.current = false;
    lastTranscriptRef.current = '';
    lastStreamingTextRef.current = '';
    processedTextLengthRef.current = 0;
    hasSpokeRef.current = false;
    setPhase('idle');
    onClose();
  }, [playAudioTone, stopListening, stopSpeaking, resetTranscript, onClose]);

  // ─── Handle mic toggle ────────────────────────────────────────────────
  const handleMicToggle = useCallback(() => {
    if (isSpeaking) {
      playAudioTone('mic-on');
      stopSpeaking();
      isProcessingRef.current = false;
      lastTranscriptRef.current = '';
      lastStreamingTextRef.current = '';
      processedTextLengthRef.current = 0;
      hasSpokeRef.current = false;
      setDisplayText('');
      resetTranscript();
      setPhase('listening');
      setStatusText('Listening...');
      startListening();
    } else if (isListening) {
      playAudioTone('mic-off');
      stopListening();
      if (!transcript.trim()) {
        setPhase('idle');
        setStatusText('Tap the mic to start');
      }
    } else {
      playAudioTone('mic-on');
      isProcessingRef.current = false;
      resetTranscript();
      setDisplayText('');
      setPhase('listening');
      setStatusText('Listening...');
      startListening();
    }
  }, [playAudioTone, isListening, isSpeaking, transcript, startListening, stopListening, stopSpeaking, resetTranscript]);

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
          className="fixed inset-0 z-[200] flex flex-col voice-overlay-glass bg-gradient-to-b from-slate-50/95 via-white/98 to-slate-50/95 dark:from-black/95 dark:via-[#0a0a14]/98 dark:to-black/95"
        >
          {/* ─── Top bar ─── */}
          <div className="w-full flex items-center justify-between px-5 py-4 shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-sm text-slate-500 dark:text-white/60 font-medium">Voice Mode</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
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
              <p className="text-xs font-semibold text-slate-400 dark:text-white/40 tracking-[0.2em] uppercase">
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
                    <p className={`text-sm leading-relaxed ${phase === 'listening'
                      ? 'text-slate-800 dark:text-white/90'
                      : phase === 'thinking'
                        ? 'text-purple-600 dark:text-purple-300/70'
                        : 'text-cyan-700 dark:text-cyan-200/70'
                      }`}>
                      {displayText}
                      {phase === 'listening' && interimTranscript && (
                        <span className="text-slate-400 dark:text-white/30"> {interimTranscript}</span>
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
                    <p className="text-xs text-red-500 dark:text-red-400/80">{error}</p>
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
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                  ? 'bg-slate-900 dark:bg-white/15 text-white ring-2 ring-slate-900/30 dark:ring-white/30 ring-offset-2 ring-offset-transparent'
                  : isSpeaking
                    ? 'bg-cyan-50 dark:bg-white/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60 border border-slate-200 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white'
                  }`}
                title={isListening ? 'Stop listening' : isSpeaking ? 'Interrupt' : 'Start listening'}
              >
                {isListening ? (
                  <Mic size={22} />
                ) : (
                  <MicOff size={22} />
                )}
              </motion.button>

              {/* End call button */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleClose}
                whileTap={{ scale: 0.9 }}
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white transition-all hover:brightness-160 hover:shadow-2xl active:brightness-60 brightness-90"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                title="End voice session"
              >
                <Phone size={22} className="rotate-[135deg]" />
              </motion.button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-white/20 text-center">
              {phase === 'listening' ? 'Auto-stops when you pause speaking'
                : phase === 'speaking' ? 'Tap mic to interrupt'
                  : phase === 'thinking' ? 'Processing your question...'
                    : 'Tap mic to begin'}
            </p>

            {/* Mic Selector */}
            {audioDevices && audioDevices.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-1"
              >
                <select
                  value={selectedDeviceId}
                  onChange={(e) => changeMicrophone(e.target.value)}
                  className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 text-[10px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 outline-none hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white/80 transition-all cursor-pointer w-48 text-center appearance-none"
                  style={{
                    textOverflow: 'ellipsis',
                  }}
                  title="Select Microphone"
                >
                  {audioDevices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">
                      {device.label || `Microphone ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
