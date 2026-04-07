"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KEYBOARD_MAP } from "@/constants/keyboardMap";
import type { HarmoniumAudioNode, HarmoniumState } from "@/types/harmonium";

const ATTACK_SECONDS = 0.08;
const RELEASE_SECONDS = 0.6;
const BASE_GAIN = 0.16;
const VIBRATO_RATE = 5.1;
const VIBRATO_DEPTH = 5.5;

/**
 * Stops an oscillator safely even if it has already been scheduled to stop.
 */
const stopOscillatorSafely = (oscillator: OscillatorNode, stopTime?: number) => {
  try {
    if (typeof stopTime === "number") {
      oscillator.stop(stopTime);
      return;
    }

    oscillator.stop();
  } catch {
    // Ignore duplicate stop calls during cleanup.
  }
};

/**
 * Synthesizes a harmonium-like voice with partials and gentle vibrato.
 */
const createVoice = (
  context: AudioContext,
  frequency: number,
): HarmoniumAudioNode => {
  const envelopeGain = context.createGain();
  envelopeGain.gain.setValueAtTime(0.0001, context.currentTime);
  envelopeGain.connect(context.destination);

  const harmonicRatios = [1, 2, 3] as const;
  const harmonicGains = [1, 0.4, 0.2] as const;
  const oscillators: OscillatorNode[] = [];

  const vibratoOscillator = context.createOscillator();
  const vibratoDepth = context.createGain();
  vibratoOscillator.type = "sine";
  vibratoOscillator.frequency.value = VIBRATO_RATE;
  vibratoDepth.gain.value = VIBRATO_DEPTH;
  vibratoOscillator.connect(vibratoDepth);

  harmonicRatios.forEach((ratio, index) => {
    const oscillator = context.createOscillator();
    const harmonicGain = context.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency * ratio;
    harmonicGain.gain.value = harmonicGains[index];

    vibratoDepth.connect(oscillator.detune);
    oscillator.connect(harmonicGain);
    harmonicGain.connect(envelopeGain);
    oscillator.start();
    oscillators.push(oscillator);
  });

  vibratoOscillator.start();
  oscillators.push(vibratoOscillator);

  const now = context.currentTime;
  envelopeGain.gain.cancelScheduledValues(now);
  envelopeGain.gain.setValueAtTime(0.0001, now);
  envelopeGain.gain.exponentialRampToValueAtTime(BASE_GAIN, now + ATTACK_SECONDS);

  return {
    oscillators,
    gainNode: envelopeGain,
  };
};

/**
 * Manages keyboard-triggered harmonium synthesis and active note state.
 */
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
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

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
