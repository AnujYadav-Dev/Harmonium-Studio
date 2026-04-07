"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KEYBOARD_MAP } from "@/features/harmonium/constants";
import {
  createVoice,
  RELEASE_SECONDS,
  stopOscillatorSafely,
} from "@/features/harmonium/lib/audio";
import type { HarmoniumAudioNode, HarmoniumState } from "@/features/harmonium/types";

export const useHarmonium = (): HarmoniumState & {
  playNote: (keyboardKey: string) => Promise<void>;
  stopNote: (keyboardKey: string) => void;
} => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeVoicesRef = useRef<Map<string, HarmoniumAudioNode>>(new Map());

  /**
   * Lazily creates the audio context to satisfy autoplay restrictions.
   */
  const ensureAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (audioContextRef.current === null) {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      audioContextRef.current = new AudioContextConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  /**
   * Starts a note if its keyboard key is not already held.
   */
  const playNote = useCallback(
    async (keyboardKey: string) => {
      const normalizedKey = keyboardKey.toLowerCase();
      const noteDefinition = KEYBOARD_MAP[normalizedKey];

      if (!noteDefinition || activeVoicesRef.current.has(normalizedKey)) {
        return;
      }

      const audioContext = await ensureAudioContext();
      const voice = createVoice(audioContext, noteDefinition.freq);

      activeVoicesRef.current.set(normalizedKey, voice);
      setActiveKeys((previousKeys) => {
        const nextKeys = new Set(previousKeys);
        nextKeys.add(normalizedKey);
        return nextKeys;
      });
    },
    [ensureAudioContext],
  );

  /**
   * Releases a held note with a long exponential fade.
   */
  const stopNote = useCallback((keyboardKey: string) => {
    const normalizedKey = keyboardKey.toLowerCase();
    const activeVoice = activeVoicesRef.current.get(normalizedKey);

    if (!activeVoice || audioContextRef.current === null) {
      return;
    }

    const now = audioContextRef.current.currentTime;
    activeVoice.gainNode.gain.cancelScheduledValues(now);
    activeVoice.gainNode.gain.setValueAtTime(
      Math.max(activeVoice.gainNode.gain.value, 0.0001),
      now,
    );
    activeVoice.gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      now + RELEASE_SECONDS,
    );
    activeVoice.lowpassFilter.frequency.cancelScheduledValues(now);
    activeVoice.lowpassFilter.frequency.setValueAtTime(
      activeVoice.lowpassFilter.frequency.value,
      now,
    );
    activeVoice.lowpassFilter.frequency.exponentialRampToValueAtTime(
      700,
      now + RELEASE_SECONDS,
    );

    stopOscillatorSafely(activeVoice.tremoloOscillator, now + RELEASE_SECONDS + 0.08);

    activeVoice.oscillators.forEach((oscillator) => {
      stopOscillatorSafely(oscillator, now + RELEASE_SECONDS + 0.08);
    });

    activeVoicesRef.current.delete(normalizedKey);
    setActiveKeys((previousKeys) => {
      const nextKeys = new Set(previousKeys);
      nextKeys.delete(normalizedKey);
      return nextKeys;
    });
  }, []);

  useEffect(() => {
    return () => {
      activeVoicesRef.current.forEach((voice) => {
        stopOscillatorSafely(voice.tremoloOscillator);
        voice.oscillators.forEach((oscillator) => {
          stopOscillatorSafely(oscillator);
        });
      });

      activeVoicesRef.current.clear();

      if (audioContextRef.current !== null) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    activeKeys,
    playNote,
    stopNote,
  };
};
