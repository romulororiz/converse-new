'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff } from 'lucide-react';
import { selectVoiceForBook } from '@/lib/voice/elevenlabs';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceChatProps {
  visible: boolean;
  onClose: () => void;
  onConversationComplete: (messages: ConversationMessage[]) => void;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
}

export function VoiceChat({
  visible,
  onClose,
  onConversationComplete,
  bookId,
  bookTitle,
  bookAuthor,
}: VoiceChatProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [statusText, setStatusText] = useState('Tap to speak');
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceIdRef = useRef<string>('');
  const closedRef = useRef(true);
  const processingRef = useRef(false);
  const conversationRef = useRef<ConversationMessage[]>([]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    if (visible) {
      closedRef.current = false;
      processingRef.current = false;
      setConversation([]);
      conversationRef.current = [];
      setState('idle');
      setStatusText('Tap to speak');
      setAudioLevel(0);
      voiceIdRef.current = selectVoiceForBook(bookAuthor, bookId);
    } else {
      hardCleanup();
    }
    return () => hardCleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hardCleanup = useCallback(() => {
    closedRef.current = true;
    processingRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
      autoListenTimerRef.current = null;
    }
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
      }
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      const src = audioRef.current.src;
      audioRef.current.src = '';
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      audioRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const monitorAudioLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      if (closedRef.current) return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      setAudioLevel(avg / 255);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const startListening = useCallback(async () => {
    if (closedRef.current || processingRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (closedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        setAudioLevel(0);
        stream.getTracks().forEach((t) => t.stop());

        if (closedRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          setState('idle');
          setStatusText('Tap to speak');
          return;
        }
        processAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('listening');
      setStatusText('Listening...');
      monitorAudioLevel();

      silenceTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 15000);
    } catch {
      if (!closedRef.current) {
        setState('idle');
        setStatusText('Microphone access denied');
      }
    }
  }, [monitorAudioLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      if (closedRef.current || processingRef.current) return;
      processingRef.current = true;

      setState('processing');
      setStatusText('Processing...');

      try {
        const formData = new FormData();
        formData.append('audio', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));

        const transcribeRes = await fetch('/api/voice/transcribe', {
          method: 'POST',
          body: formData,
        });
        if (closedRef.current) { processingRef.current = false; return; }
        if (!transcribeRes.ok) throw new Error('Transcription failed');
        const { text: transcription } = await transcribeRes.json();

        if (!transcription?.trim()) {
          processingRef.current = false;
          if (!closedRef.current) {
            setState('idle');
            setStatusText('Could not hear you. Tap to try again.');
          }
          return;
        }

        const userMsg: ConversationMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: transcription.trim(),
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, userMsg]);

        const historyForAI = [...conversationRef.current, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        if (closedRef.current) { processingRef.current = false; return; }

        const chatRes = await fetch('/api/voice/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId,
            message: transcription.trim(),
            conversationHistory: historyForAI,
          }),
        });
        if (closedRef.current) { processingRef.current = false; return; }
        if (!chatRes.ok) throw new Error('AI response failed');
        const { content: aiText } = await chatRes.json();

        const aiMsg: ConversationMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiText,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, aiMsg]);

        if (closedRef.current) { processingRef.current = false; return; }

        await speakText(aiText);
      } catch {
        if (!closedRef.current) {
          setState('idle');
          setStatusText('Something went wrong. Tap to try again.');
        }
      } finally {
        processingRef.current = false;
      }
    },
    [bookId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const speakText = useCallback(
    async (text: string) => {
      if (closedRef.current) return;

      setState('speaking');
      setStatusText('Speaking...');

      try {
        const ttsRes = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId: voiceIdRef.current }),
        });
        if (closedRef.current) return;
        if (!ttsRes.ok) throw new Error('TTS failed');

        const blob = await ttsRes.blob();
        if (closedRef.current) return;

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Audio playback failed'));
          };
          audio.play().catch(reject);
        });

        if (closedRef.current) return;

        setState('idle');
        setStatusText('Tap to speak');
        autoListenTimerRef.current = setTimeout(() => {
          if (!closedRef.current) startListening();
        }, 500);
      } catch {
        if (!closedRef.current) {
          setState('idle');
          setStatusText('Tap to speak');
        }
      }
    },
    [startListening],
  );

  const toggleMicrophone = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle') {
      startListening();
    }
  }, [state, startListening, stopListening]);

  const handleClose = useCallback(() => {
    const msgs = conversationRef.current;
    hardCleanup();
    if (msgs.length > 0) {
      onConversationComplete(msgs);
    }
    setState('idle');
    setStatusText('Tap to speak');
    setAudioLevel(0);
    setConversation([]);
    onClose();
  }, [hardCleanup, onConversationComplete, onClose]);

  if (!visible) return null;

  const orbScale = state === 'listening' ? 1 + audioLevel * 0.4 : state === 'speaking' ? 1.05 : 1;
  const orbGlowScale = state === 'listening' ? 1.3 + audioLevel * 0.5 : state === 'speaking' ? 1.2 : 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95"
        >
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
          >
            <X size={20} />
          </button>

          {bookTitle && (
            <div className="absolute top-8 left-0 right-0 text-center px-16">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Talking with</p>
              <p className="text-white/80 text-sm font-semibold mt-0.5 truncate">{bookTitle}</p>
            </div>
          )}

          <div className="relative flex items-center justify-center mb-16">
            <motion.div
              animate={{
                scale: orbGlowScale,
                opacity: state === 'listening' || state === 'speaking' ? 0.2 : 0.05,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 80 }}
              className="absolute w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(196,130,42,0.4) 0%, transparent 70%)' }}
            />

            <motion.div
              animate={{
                scale: state === 'listening' ? 1.15 + audioLevel * 0.3 : state === 'speaking' ? 1.1 : 1,
                opacity: state === 'listening' || state === 'speaking' ? 0.3 : 0.1,
              }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="absolute w-36 h-36 rounded-full border border-[#C4822A]/30"
            />

            <motion.div
              animate={{ scale: orbScale }}
              transition={{ type: 'spring', damping: 8, stiffness: 120 }}
              className="w-28 h-28 rounded-full relative overflow-hidden"
              style={{
                background: state === 'listening'
                  ? 'radial-gradient(circle at 35% 35%, #e0a84c, #C4822A, #8B5A1A)'
                  : state === 'processing'
                    ? 'radial-gradient(circle at 35% 35%, #9ca3af, #6b7280, #4b5563)'
                    : state === 'speaking'
                      ? 'radial-gradient(circle at 35% 35%, #d4a44a, #C4822A, #9B6A2A)'
                      : 'radial-gradient(circle at 35% 35%, #d4a44a, #C4822A, #8B5A1A)',
                boxShadow: state === 'listening'
                  ? `0 0 ${30 + audioLevel * 40}px rgba(196,130,42,0.5)`
                  : state === 'speaking'
                    ? '0 0 30px rgba(196,130,42,0.3)'
                    : '0 0 15px rgba(196,130,42,0.2)',
              }}
            >
              <div
                className="absolute top-3 left-4 w-8 h-8 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
              />
            </motion.div>

            {state === 'processing' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute w-36 h-36 rounded-full border-2 border-transparent border-t-[#C4822A]/50"
              />
            )}
          </div>

          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-lg font-medium mb-8"
          >
            {statusText}
          </motion.p>

          <button
            onClick={toggleMicrophone}
            disabled={state === 'processing' || state === 'speaking'}
            className={`w-[70px] h-[70px] rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
              state === 'listening'
                ? 'bg-red-500/30 border-red-500 text-white'
                : state === 'processing' || state === 'speaking'
                  ? 'bg-gray-500/30 border-gray-500/30 text-white/50 cursor-default'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
          >
            {state === 'listening' ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
