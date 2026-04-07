import type { DroneDefinition, SynthParams } from "@/features/harmonium/types";

export const ATTACK_SECONDS = 0.08;
export const RELEASE_SECONDS = 0.6;
export const BASE_GAIN = 0.14;
export const AIR_BLOOM_SECONDS = 0.18;
export const TREMOLO_RATE = 4.4;
export const TREMOLO_DEPTH = 0.025;
export const FILTER_Q = 0.9;
export const LOWPASS_BASE = 2400;
export const LOWPASS_TRACKING = 7;
export const HIGHPASS_CUTOFF = 140;
export const REED_DETUNE_CENTS = [-5, 0, 4] as const;
export const HARMONIC_GAINS = [0.62, 0.24, 0.1] as const;
export const WAVE_COEFFICIENTS = {
  real: new Float32Array([0, 0, 0, 0, 0, 0]),
  imag: new Float32Array([0, 1, 0.55, 0.22, 0.12, 0.05]),
} as const;

/**
 * Default synthesizer parameters matching the original hardcoded values.
 */
export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  masterVolume: 0.8,
  vibratoRate: TREMOLO_RATE,
  vibratoDepth: TREMOLO_DEPTH,
  harmonicMix: [0.62, 0.24, 0.1] as const,
  attackSeconds: ATTACK_SECONDS,
  releaseSeconds: RELEASE_SECONDS,
};

/**
 * Octave shift constraints.
 */
export const MIN_OCTAVE_SHIFT = -2;
export const MAX_OCTAVE_SHIFT = 2;

/**
 * Traditional harmonium drone stop definitions (Sa and Pa in two octaves).
 */
export const DRONE_NOTES: readonly DroneDefinition[] = [
  { id: "sa-low", label: "Sa (Low)", note: "C", octave: 3, freq: 130.81 },
  { id: "pa-low", label: "Pa (Low)", note: "G", octave: 3, freq: 196.0 },
  { id: "sa-mid", label: "Sa (Mid)", note: "C", octave: 4, freq: 261.63 },
  { id: "pa-mid", label: "Pa (Mid)", note: "G", octave: 4, freq: 392.0 },
] as const;
