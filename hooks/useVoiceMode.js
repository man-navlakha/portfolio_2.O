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
  const audioElementRef = useRef(null); // Reference to native HTML Audio
  const prefetchedAudioRef = useRef(null);

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
    // Priority 1: High-quality Natural/Neural voices (best quality)
    const premiumPatterns = [
      'Google UK English Female',  // Chrome's best female voice
      'Google UK English Male',    // Chrome's best male voice
      'Google US English',         // Chrome's US voice
      'Microsoft Aria',            // Edge Neural (very natural)
      'Microsoft Jenny',           // Edge Neural
      'Microsoft Guy',             // Edge Neural
      'Microsoft Ana',             // Edge Neural
      'Microsoft Zira',            // Windows built-in (decent)
      'Microsoft David',           // Windows built-in
    ];

    for (const name of premiumPatterns) {
      const match = voices.find(v => v.name.includes(name));
      if (match) {
        console.log('🎙️ Voice selected:', match.name);
        return match;
      }
    }

    // Priority 2: Any voice with "Natural" or "Neural" in the name
    const neuralVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Premium') || v.name.includes('Enhanced'))
    );
    if (neuralVoice) {
      console.log('🎙️ Voice selected (neural):', neuralVoice.name);
      return neuralVoice;
    }

    // Priority 3: macOS premium voices
    const macVoices = ['Samantha', 'Karen', 'Daniel', 'Moira', 'Tessa', 'Alex'];
    for (const name of macVoices) {
      const match = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (match) {
        console.log('🎙️ Voice selected (mac):', match.name);
        return match;
      }
    }

    // Priority 4: Any English voice that is NOT espeak (espeak sounds very robotic)
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en') && !v.name.toLowerCase().includes('espeak')
    );
    if (englishVoice) {
      console.log('🎙️ Voice selected (en fallback):', englishVoice.name);
      return englishVoice;
    }

    console.log('🎙️ Voice selected (last resort):', voices[0]?.name);
    return voices[0];
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
    setIsSpeaking(false);
    onSpeakEndCallbackRef.current = null;
    
    // Stop native HTML Audio playback if it's running
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }

    if (prefetchedAudioRef.current?.audio) {
      prefetchedAudioRef.current.audio.pause();
      prefetchedAudioRef.current.audio.src = '';
      prefetchedAudioRef.current = null;
    }
  }, []);

  const createTtsAudio = useCallback((textChunk) => {
    const url = `https://tts-production-57ce.up.railway.app/tts/live?text=${encodeURIComponent(textChunk)}&voice=af_heart&lang_code=a`;
    const audio = new window.Audio(url);
    audio.preload = 'auto';
    return audio;
  }, []);

  const prefetchNextAudio = useCallback(() => {
    if (prefetchedAudioRef.current || ttsQueueRef.current.length === 0) return;

    const nextText = ttsQueueRef.current[0];
    const audio = createTtsAudio(nextText);
    prefetchedAudioRef.current = { text: nextText, audio };

    try {
      audio.load();
    } catch (err) {
      console.warn('Audio prefetch failed:', err);
      prefetchedAudioRef.current = null;
    }
  }, [createTtsAudio]);

  const processSpeechQueue = useCallback(async () => {
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

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    
    const textChunk = ttsQueueRef.current.shift();
    let audio = null;

    if (prefetchedAudioRef.current?.text === textChunk) {
      audio = prefetchedAudioRef.current.audio;
      prefetchedAudioRef.current = null;
    } else {
      if (prefetchedAudioRef.current?.audio) {
        prefetchedAudioRef.current.audio.pause();
        prefetchedAudioRef.current.audio.src = '';
      }
      prefetchedAudioRef.current = null;
      audio = createTtsAudio(textChunk);
    }

    prefetchNextAudio();

    try {
      // Store reference to stop it if user closes voice mode
      audioElementRef.current = audio;

      audio.onended = () => {
        audioElementRef.current = null;
        isSpeakingRef.current = false;
        processSpeechQueue(); // play next chunk
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        audioElementRef.current = null;
        isSpeakingRef.current = false;
        processSpeechQueue(); // Fallback to next chunk
      };

      // Play instantly as it streams
      await audio.play();
    } catch (err) {
      console.error('Audio initialization error:', err);
      isSpeakingRef.current = false;
      processSpeechQueue(); 
    }
  }, [createTtsAudio, prefetchNextAudio]);

  function cleanTextForSpeech(text) {
    return text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\|{3}SUGGESTIONS\|{3}.*/s, '')
      .replace(/\[SHOW_HIRE_FORM\]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[-•▸▹►]/g, '')
      .replace(/https?:\/\/[^\s)]+/g, 'link')
      .replace(/\be\.g\./gi, 'for example')
      .replace(/\bi\.e\./gi, 'that is')
      .replace(/\betc\./gi, 'etcetera')
      .replace(/\bvs\./gi, 'versus')
      .replace(/\bMan\b/g, 'Mun')       // Phonetic fix for TTS pronunciation
      .replace(/\bMan's\b/g, "Mun's")   // Phonetic fix for TTS pronunciation
      .replace(/\bMan\./g, 'Mun.')      // Phonetic fix for TTS pronunciation
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  const addToSpeechQueue = useCallback((text) => {
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    // Kokoro can silently drop characters near its sequence limit, so stay under
    // the risky range while avoiding tiny fragments that create extra requests.
    const MAX_LEN = 145;
    const MIN_COMBINE_LEN = 45;
    
    if (cleanText.length <= MAX_LEN) {
      ttsQueueRef.current.push(cleanText);
    } else {
      // 1. Try splitting by sentence boundaries
      let parts = cleanText.split(/(?<=[.!?])\s+/);
      
      const safeChunks = [];
      for (let part of parts) {
        if (part.trim().length === 0) continue;
        
        if (part.length <= MAX_LEN) {
          safeChunks.push(part);
        } else {
          // 2. If a single sentence is STILL too long, split by commas, semicolons, or conjunctions
          let subParts = part.split(/(?<=[,;:])\s+|(?=\b(?:and|or|but|because|offering|which|that)\b)/i);
          let temp = '';
          for (let sub of subParts) {
            if (temp.length + sub.length < MAX_LEN) {
              temp += (temp ? ' ' : '') + sub;
            } else {
              if (temp) safeChunks.push(temp.trim());
              temp = sub;
            }
          }
          if (temp) safeChunks.push(temp.trim());
        }
      }
      
      // Combine tiny chunks so we don't spam the API with 3-word requests.
      const finalChunks = [];
      let buffer = '';
      for (let c of safeChunks) {
        if (buffer.length < MIN_COMBINE_LEN && buffer.length + c.length < MAX_LEN) {
          buffer += (buffer ? ' ' : '') + c;
        } else {
          if (buffer) finalChunks.push(buffer);
          buffer = c;
        }
      }
      if (buffer) finalChunks.push(buffer);
      
      ttsQueueRef.current.push(...finalChunks);
    }

    if (!isSpeakingRef.current) {
      processSpeechQueue();
    } else {
      prefetchNextAudio();
    }
  }, [processSpeechQueue, prefetchNextAudio]);

  const finalizeSpeechQueue = useCallback((onEnd) => {
    onSpeakEndCallbackRef.current = onEnd || null;
    if (!isSpeakingRef.current && ttsQueueRef.current.length === 0) {
      onEnd?.();
      onSpeakEndCallbackRef.current = null;
    }
  }, []);

  // Backwards compatibility for full text speak (fallback if audio fails)
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
