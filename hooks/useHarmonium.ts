"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KEYBOARD_MAP } from "@/constants/keyboardMap";
import type { HarmoniumAudioNode, HarmoniumState } from "@/types/harmonium";

const ATTACK_SECONDS = 0.08;
const RELEASE_SECONDS = 0.6;
const BASE_GAIN = 0.14;
const AIR_BLOOM_SECONDS = 0.18;
const TREMOLO_RATE = 4.4;
const TREMOLO_DEPTH = 0.025;
const FILTER_Q = 0.9;
const LOWPASS_BASE = 2400;
const LOWPASS_TRACKING = 7;
const HIGHPASS_CUTOFF = 140;
const REED_DETUNE_CENTS = [-5, 0, 4] as const;
const HARMONIC_GAINS = [0.62, 0.24, 0.1] as const;
const WAVE_COEFFICIENTS = {
  real: new Float32Array([0, 0, 0, 0, 0, 0]),
  imag: new Float32Array([0, 1, 0.55, 0.22, 0.12, 0.05]),
} as const;

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
 * Synthesizes a reed-organ style harmonium voice with shaped harmonics and tremolo.
 */
const createVoice = (
  context: AudioContext,
  frequency: number,
): HarmoniumAudioNode => {
  const lowpassFilter = context.createBiquadFilter();
  lowpassFilter.type = "lowpass";
  lowpassFilter.frequency.value = Math.min(
    LOWPASS_BASE + frequency * LOWPASS_TRACKING,
    4200,
  );
  lowpassFilter.Q.value = FILTER_Q;

  const highpassFilter = context.createBiquadFilter();
  highpassFilter.type = "highpass";
  highpassFilter.frequency.value = HIGHPASS_CUTOFF;
  highpassFilter.Q.value = 0.3;

  const envelopeGain = context.createGain();
  envelopeGain.gain.setValueAtTime(0.0001, context.currentTime);

  highpassFilter.connect(lowpassFilter);
  lowpassFilter.connect(envelopeGain);
  envelopeGain.connect(context.destination);

  const wave = context.createPeriodicWave(
    WAVE_COEFFICIENTS.real,
    WAVE_COEFFICIENTS.imag,
  );
  const oscillators: OscillatorNode[] = [];

  HARMONIC_GAINS.forEach((partialGain, index) => {
    const oscillator = context.createOscillator();
    const reedGain = context.createGain();
    const harmonicNumber = index + 1;
    const detuneOffset = REED_DETUNE_CENTS[index];

    oscillator.setPeriodicWave(wave);
    oscillator.frequency.value = frequency * harmonicNumber;
    oscillator.detune.value = detuneOffset;
    reedGain.gain.value = partialGain;

    oscillator.connect(reedGain);
    reedGain.connect(highpassFilter);
    oscillator.start();
    oscillators.push(oscillator);
  });

  const shimmerOscillator = context.createOscillator();
  const shimmerGain = context.createGain();
  shimmerOscillator.type = "triangle";
  shimmerOscillator.frequency.value = frequency * 2;
  shimmerOscillator.detune.value = 2;
  shimmerGain.gain.value = 0.035;
  shimmerOscillator.connect(shimmerGain);
  shimmerGain.connect(highpassFilter);
  shimmerOscillator.start();
  oscillators.push(shimmerOscillator);

  const tremoloOscillator = context.createOscillator();
  const tremoloDepthGain = context.createGain();
  tremoloOscillator.type = "sine";
  tremoloOscillator.frequency.value = TREMOLO_RATE;
  tremoloDepthGain.gain.value = TREMOLO_DEPTH;
  tremoloOscillator.connect(tremoloDepthGain);
  tremoloDepthGain.connect(envelopeGain.gain);
  tremoloOscillator.start();

  const now = context.currentTime;
  envelopeGain.gain.cancelScheduledValues(now);
  envelopeGain.gain.setValueAtTime(0.0001, now);
  envelopeGain.gain.linearRampToValueAtTime(BASE_GAIN * 0.72, now + ATTACK_SECONDS);
  envelopeGain.gain.linearRampToValueAtTime(
    BASE_GAIN,
    now + ATTACK_SECONDS + AIR_BLOOM_SECONDS,
  );

  return {
    oscillators,
    gainNode: envelopeGain,
    highpassFilter,
    lowpassFilter,
    tremoloDepthGain,
    tremoloOscillator,
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
