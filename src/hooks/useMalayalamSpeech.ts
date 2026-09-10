'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useMalayalamSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<{ id: string; text: string }[]>([]);
  const currentIndexRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSectionId(null);
    queueRef.current = [];
    currentIndexRef.current = 0;
  }, []);

  const speakNext = useCallback(() => {
    if (currentIndexRef.current >= queueRef.current.length) {
      stop();
      return;
    }

    const item = queueRef.current[currentIndexRef.current];
    setCurrentSectionId(item.id);

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = 'ml-IN';
    utterance.rate = 0.85; // Slightly slower, calm speed for devotional listening
    utterance.pitch = 1.0;

    // Pick Malayalam voice if available
    const voices = window.speechSynthesis.getVoices();
    const malayalamVoice = voices.find((v) => v.lang.includes('ml') || v.name.toLowerCase().includes('malayalam'));
    if (malayalamVoice) {
      utterance.voice = malayalamVoice;
    }

    utterance.onend = () => {
      currentIndexRef.current++;
      speakNext();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      stop();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [stop]);

  const speakSection = useCallback((id: string, text: string) => {
    stop();
    queueRef.current = [{ id, text }];
    currentIndexRef.current = 0;
    speakNext();
  }, [stop, speakNext]);

  const speakChapter = useCallback((sections: { id: string; meaning: string }[]) => {
    stop();
    queueRef.current = sections.map((s) => ({ id: s.id, text: s.meaning }));
    currentIndexRef.current = 0;
    speakNext();
  }, [stop, speakNext]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    currentSectionId,
    speakSection,
    speakChapter,
    pause,
    resume,
    stop,
  };
}
