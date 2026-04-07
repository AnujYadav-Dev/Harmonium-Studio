"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KEYBOARD_MAP, DEFAULT_SYNTH_PARAMS, DRONE_NOTES, MAX_OCTAVE_SHIFT, MIN_OCTAVE_SHIFT } from "@/features/harmonium/data";
import {
  createDroneVoice,
  createVoice,
  stopDroneVoice,
  stopOscillatorSafely,
} from "@/features/harmonium/utils/audio";
import type {
  DroneVoice,
  HarmoniumAudioNode,
  SynthParams,
} from "@/features/harmonium/types";

interface UseHarmoniumReturn {
  activeKeys: Set<string>;
  synthParams: SynthParams;
  octaveShift: number;
  activeDrones: Set<string>;
  analyserNode: AnalyserNode | null;
  playNote: (keyboardKey: string) => Promise<void>;
  stopNote: (keyboardKey: string) => void;
  setSynthParams: (params: SynthParams) => void;
  setOctaveShift: (shift: number) => void;
  toggleDrone: (droneId: string) => void;
}

export const useHarmonium = (): UseHarmoniumReturn => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [synthParams, setSynthParams] = useState<SynthParams>(DEFAULT_SYNTH_PARAMS);
  const [octaveShift, setOctaveShiftState] = useState<number>(0);
  const [activeDrones, setActiveDrones] = useState<Set<string>>(new Set());
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeVoicesRef = useRef<Map<string, HarmoniumAudioNode>>(new Map());
  const activeDroneVoicesRef = useRef<Map<string, DroneVoice>>(new Map());
  const synthParamsRef = useRef<SynthParams>(DEFAULT_SYNTH_PARAMS);
  const octaveShiftRef = useRef<number>(0);

  // Keep refs in sync with state for use in callbacks.
  useEffect(() => {
    synthParamsRef.current = synthParams;
  }, [synthParams]);

  useEffect(() => {
    octaveShiftRef.current = octaveShift;
  }, [octaveShift]);

  // Apply master volume reactively.
  useEffect(() => {
    if (masterGainRef.current !== null) {
      masterGainRef.current.gain.setTargetAtTime(
        synthParams.masterVolume,
        audioContextRef.current?.currentTime ?? 0,
        0.05,
      );
    }
  }, [synthParams.masterVolume]);

  /**
   * Lazily creates the audio context, master gain, and analyser nodes.
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

      const ctx = new AudioContextConstructor();
      audioContextRef.current = ctx;

      // Build master chain: masterGain → analyser → destination.
      const masterGain = ctx.createGain();
      masterGain.gain.value = synthParamsRef.current.masterVolume;
      masterGainRef.current = masterGain;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      analyserRef.current = analyser;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      setAnalyserNode(analyser);
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  /**
   * Computes the actual frequency with octave shift applied.
   */
  const getShiftedFrequency = useCallback(
    (baseFreq: number): number => {
      return baseFreq * 2 ** octaveShiftRef.current;
    },
    [],
  );

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
      const destination = masterGainRef.current ?? audioContext.destination;
      const shiftedFreq = getShiftedFrequency(noteDefinition.freq);
      const voice = createVoice(
        audioContext,
        shiftedFreq,
        destination,
        synthParamsRef.current,
      );

      activeVoicesRef.current.set(normalizedKey, voice);
      setActiveKeys((previousKeys) => {
        const nextKeys = new Set(previousKeys);
        nextKeys.add(normalizedKey);
        return nextKeys;
      });
    },
    [ensureAudioContext, getShiftedFrequency],
  );

  /**
   * Releases a held note with an exponential fade.
   */
  const stopNote = useCallback((keyboardKey: string) => {
    const normalizedKey = keyboardKey.toLowerCase();
    const activeVoice = activeVoicesRef.current.get(normalizedKey);

    if (!activeVoice || audioContextRef.current === null) {
      return;
    }

    const releaseSeconds = synthParamsRef.current.releaseSeconds;
    const now = audioContextRef.current.currentTime;
    activeVoice.gainNode.gain.cancelScheduledValues(now);
    activeVoice.gainNode.gain.setValueAtTime(
      Math.max(activeVoice.gainNode.gain.value, 0.0001),
      now,
    );
    activeVoice.gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      now + releaseSeconds,
    );
    activeVoice.lowpassFilter.frequency.cancelScheduledValues(now);
    activeVoice.lowpassFilter.frequency.setValueAtTime(
      activeVoice.lowpassFilter.frequency.value,
      now,
    );
    activeVoice.lowpassFilter.frequency.exponentialRampToValueAtTime(
      700,
      now + releaseSeconds,
    );

    stopOscillatorSafely(activeVoice.tremoloOscillator, now + releaseSeconds + 0.08);

    activeVoice.oscillators.forEach((oscillator) => {
      stopOscillatorSafely(oscillator, now + releaseSeconds + 0.08);
    });

    activeVoicesRef.current.delete(normalizedKey);
    setActiveKeys((previousKeys) => {
      const nextKeys = new Set(previousKeys);
      nextKeys.delete(normalizedKey);
      return nextKeys;
    });
  }, []);

  /**
   * Toggles a drone stop on or off.
   */
  const toggleDrone = useCallback(
    async (droneId: string) => {
      const existingDrone = activeDroneVoicesRef.current.get(droneId);

      if (existingDrone) {
        // Stop drone.
        if (audioContextRef.current !== null) {
          stopDroneVoice(audioContextRef.current, existingDrone);
        }
        activeDroneVoicesRef.current.delete(droneId);
        setActiveDrones((prev) => {
          const next = new Set(prev);
          next.delete(droneId);
          return next;
        });
        return;
      }

      // Start drone.
      const droneDefinition = DRONE_NOTES.find((d) => d.id === droneId);
      if (!droneDefinition) {
        return;
      }

      const audioContext = await ensureAudioContext();
      const destination = masterGainRef.current ?? audioContext.destination;
      const droneVoice = createDroneVoice(
        audioContext,
        droneDefinition.freq,
        destination,
      );

      activeDroneVoicesRef.current.set(droneId, droneVoice);
      setActiveDrones((prev) => {
        const next = new Set(prev);
        next.add(droneId);
        return next;
      });
    },
    [ensureAudioContext],
  );

  /**
   * Sets octave shift with clamping.
   */
  const setOctaveShift = useCallback((shift: number) => {
    const clamped = Math.max(MIN_OCTAVE_SHIFT, Math.min(MAX_OCTAVE_SHIFT, shift));
    setOctaveShiftState(clamped);
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      activeVoicesRef.current.forEach((voice) => {
        stopOscillatorSafely(voice.tremoloOscillator);
        voice.oscillators.forEach((oscillator) => {
          stopOscillatorSafely(oscillator);
        });
      });
      activeVoicesRef.current.clear();

      activeDroneVoicesRef.current.forEach((drone) => {
        if (audioContextRef.current !== null) {
          stopDroneVoice(audioContextRef.current, drone);
        }
      });
      activeDroneVoicesRef.current.clear();

      if (audioContextRef.current !== null) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    activeKeys,
    synthParams,
    octaveShift,
    activeDrones,
    analyserNode,
    playNote,
    stopNote,
    setSynthParams,
    setOctaveShift,
    toggleDrone,
  };
};
