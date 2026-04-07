import {
  AIR_BLOOM_SECONDS,
  ATTACK_SECONDS,
  BASE_GAIN,
  FILTER_Q,
  HARMONIC_GAINS,
  HIGHPASS_CUTOFF,
  LOWPASS_BASE,
  LOWPASS_TRACKING,
  REED_DETUNE_CENTS,
  TREMOLO_DEPTH,
  TREMOLO_RATE,
  WAVE_COEFFICIENTS,
} from "@/features/harmonium/lib/audio/constants";
import type { HarmoniumAudioNode } from "@/features/harmonium/types";

/**
 * Synthesizes a reed-organ style harmonium voice with shaped harmonics and tremolo.
 */
export const createVoice = (
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
