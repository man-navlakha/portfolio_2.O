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
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

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
  const selectedDeviceIdRef = useRef('');
  const ttsQueueRef = useRef([]);

  // ─── Tone Generator ─────────────────────────────────────────────────────
  const playAudioTone = useCallback((type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (type === 'mic-on') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'mic-off') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'call-end') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio tone failed', e);
    }
  }, []);

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
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch(e) {}
      analyserRef.current = null;
    }
    setVolume(0);
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const constraints = {
        audio: selectedDeviceIdRef.current 
          ? { deviceId: { exact: selectedDeviceIdRef.current } } 
          : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      if (!selectedDeviceIdRef.current && audioInputs.length > 0) {
        const track = stream.getAudioTracks()[0];
        const activeDevice = audioInputs.find(d => d.label === track.label) || audioInputs[0];
        setSelectedDeviceId(activeDevice.deviceId);
        selectedDeviceIdRef.current = activeDevice.deviceId;
      }
    } catch (err) {
      console.warn('Audio analysis failed:', err);
    }
  }, []);

  const changeMicrophone = useCallback((deviceId) => {
    setSelectedDeviceId(deviceId);
    selectedDeviceIdRef.current = deviceId;
    if (micStreamRef.current) {
      cleanupAudio();
      startAudioAnalysis();
    }
  }, [cleanupAudio, startAudioAnalysis]);

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

  // ─── Stop Speaking (TTS) ───────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    isSpeakingRef.current = false;
    ttsQueueRef.current = [];
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    onSpeakEndCallbackRef.current = null;
  }, []);

  // ─── Seamless Speaking (TTS Queue) ─────────────────────────────────────
  const processSpeechQueue = useCallback(() => {
    if (!synthRef.current) return;
    if (isSpeakingRef.current) return;
    
    if (ttsQueueRef.current.length === 0) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (onSpeakEndCallbackRef.current) {
        onSpeakEndCallbackRef.current();
        onSpeakEndCallbackRef.current = null;
      }
      return;
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    const text = ttsQueueRef.current.shift();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      processSpeechQueue();
    };

    utterance.onerror = (e) => {
      isSpeakingRef.current = false;
      processSpeechQueue();
    };

    synthRef.current.speak(utterance);
  }, []);

  const addToSpeechQueue = useCallback((text) => {
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/[-•]/g, '')
      .replace(/\|{3}SUGGESTIONS\|{3}.*/s, '')
      .replace(/\[SHOW_HIRE_FORM\]/g, '')
      .trim();

    if (!cleanText) return;

    const sentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);

    if (sentences.length === 0) return;

    ttsQueueRef.current.push(...sentences);
    if (!isSpeakingRef.current) {
      processSpeechQueue();
    }
  }, [processSpeechQueue]);

  const finalizeSpeechQueue = useCallback((onEnd) => {
    onSpeakEndCallbackRef.current = onEnd || null;
    if (!isSpeakingRef.current && ttsQueueRef.current.length === 0) {
      onEnd?.();
      onSpeakEndCallbackRef.current = null;
    }
  }, []);

  // Backwards compatibility for full text speak
  const speakText = useCallback((text, onEnd) => {
    stopSpeaking();
    addToSpeechQueue(text);
    finalizeSpeechQueue(onEnd);
  }, [stopSpeaking, addToSpeechQueue, finalizeSpeechQueue]);

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
    audioDevices,
    selectedDeviceId,

    // Actions
    startListening,
    stopListening,
    speakText,
    addToSpeechQueue,
    finalizeSpeechQueue,
    stopSpeaking,
    resetTranscript,
    changeMicrophone,
    playAudioTone,
  };
}
