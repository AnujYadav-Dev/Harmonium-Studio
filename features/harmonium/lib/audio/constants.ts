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
