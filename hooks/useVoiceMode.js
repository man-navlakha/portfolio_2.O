"use client";
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoiceMode — Custom hook for Speech-to-Text (STT) and Text-to-Speech (TTS)
 * 
 * STT: Uses Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * TTS: Uses browser SpeechSynthesis API with smart voice selection
 */
export default function useVoiceMode() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0); // 0-1 for visualizations

  // ─── Refs ───────────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const selectedVoiceRef = useRef(null);
  const volumeIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartingRef = useRef(false);
  const onSpeakEndCallbackRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // ─── Check support on mount ─────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
    const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;

    setIsSupported(!!SpeechRecognition && hasSynth);

    if (hasSynth) {
      synthRef.current = window.speechSynthesis;
      // Pre-load voices
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          selectedVoiceRef.current = pickBestVoice(voices);
        }
      };
      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // ─── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      cleanupAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Pick best voice ────────────────────────────────────────────────────
  function pickBestVoice(voices) {
    // Preference order: natural/enhanced English voices
    const preferred = [
      'Google UK English Female',
      'Google UK English Male',
      'Google US English',
      'Microsoft Zira',
      'Microsoft David',
      'Samantha',   // macOS
      'Daniel',     // macOS
      'Karen',      // macOS
      'Alex',       // macOS
    ];

    for (const name of preferred) {
      const match = voices.find(v => v.name.includes(name));
      if (match) return match;
    }

    // Fallback: any English voice
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en') && !v.name.includes('espeak')
    );
    return englishVoice || voices[0];
  }

  // ─── Audio analysis for volume visualization ────────────────────────────
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      volumeIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(average / 128, 1));
      }, 50);
    } catch (err) {
      console.warn('Audio analysis failed:', err);
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
  }, []);

  // ─── Start Listening (STT) ─────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        restartingRef.current = true;
        recognitionRef.current.abort();
      } catch (e) { /* ignore */ }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      restartingRef.current = false;
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
          setTranscript(finalTranscript.trim());

          // Reset silence timer on speech
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            // Auto-stop after 2 seconds of silence after getting some text
            if (finalTranscript.trim() && isListeningRef.current) {
              stopListeningInternal();
            }
          }, 2500);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') {
        // Silently ignore aborted errors (expected when we manually stop)
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }
      if (event.error === 'no-speech') {
        // Restart recognition on no-speech error if still supposed to be listening
        if (isListeningRef.current) {
          try {
            recognition.stop();
            setTimeout(() => {
              if (isListeningRef.current) {
                recognition.start();
              }
            }, 100);
          } catch (e) { /* ignore */ }
        }
        return;
      }
      console.error('Speech recognition error:', event.error);
      setError(event.error === 'not-allowed'
        ? 'Microphone access denied. Please allow microphone permission.'
        : `Recognition error: ${event.error}`
      );
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current && !restartingRef.current) {
        try {
          setTimeout(() => {
            if (isListeningRef.current) {
              recognition.start();
            }
          }, 100);
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else if (!restartingRef.current) {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      startAudioAnalysis();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start speech recognition');
    }
  }, [startAudioAnalysis]);

  // ─── Internal stop (used by silence timer) ──────────────────────────────
  const stopListeningInternal = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        restartingRef.current = false;
        recognitionRef.current.abort(); // Abort instead of stop to immediately kill it
      } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    cleanupAudio();
    setInterimTranscript('');
  }, [cleanupAudio]);

  // ─── Stop Listening (STT) — public ─────────────────────────────────────
  const stopListening = useCallback(() => {
    stopListeningInternal();
  }, [stopListeningInternal]);

  // ─── Speak Text (TTS) ──────────────────────────────────────────────────
  const speakText = useCallback((text, onEnd) => {
    if (!synthRef.current || !text?.trim()) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    onSpeakEndCallbackRef.current = onEnd || null;

    // Clean text for speech (remove markdown, links, etc.)
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
      .replace(/#{1,6}\s/g, '')                   // headers
      .replace(/\*\*([^*]+)\*\*/g, '$1')           // bold
      .replace(/\*([^*]+)\*/g, '$1')               // italic
      .replace(/`([^`]+)`/g, '$1')                 // code
      .replace(/```[\s\S]*?```/g, '')              // code blocks
      .replace(/\n{2,}/g, '. ')                    // double newlines → pause
      .replace(/[-•]/g, '')                        // bullets
      .replace(/\|{3}SUGGESTIONS\|{3}.*/s, '')     // strip suggestions
      .replace(/\[SHOW_HIRE_FORM\]/g, '')          // strip hire form trigger
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    // Split into sentences for more natural speech
    const sentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);

    if (sentences.length === 0) {
      onEnd?.();
      return;
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;

    let currentIndex = 0;

    const speakNext = () => {
      if (!isSpeakingRef.current) return;

      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        onSpeakEndCallbackRef.current?.();
        onSpeakEndCallbackRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.rate = 1.05;   // Slightly faster for natural feel
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        if (!isSpeakingRef.current) return;
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (e) => {
        if (!isSpeakingRef.current) return;
        console.error('TTS error:', e);
        currentIndex++;
        speakNext();
      };

      synthRef.current.speak(utterance);
    };

    speakNext();
  }, []);

  // ─── Stop Speaking (TTS) ───────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    isSpeakingRef.current = false;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    onSpeakEndCallbackRef.current = null;
  }, []);

  // ─── Reset transcript ──────────────────────────────────────────────────
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    isSupported,
    error,
    volume,

    // Actions
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    resetTranscript,
  };
}
