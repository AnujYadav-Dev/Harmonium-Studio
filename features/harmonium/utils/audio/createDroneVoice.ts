import {
  FILTER_Q,
  HIGHPASS_CUTOFF,
  LOWPASS_BASE,
  LOWPASS_TRACKING,
  WAVE_COEFFICIENTS,
} from "@/features/harmonium/data";
import type { DroneVoice } from "@/features/harmonium/types";

const DRONE_FADE_IN_SECONDS = 0.4;
const DRONE_GAIN = 0.08;
const DRONE_TREMOLO_RATE = 3.6;
const DRONE_TREMOLO_DEPTH = 0.012;

/**
 * Creates a continuous drone voice that sustains indefinitely until manually stopped.
 */
export const createDroneVoice = (
  context: AudioContext,
  frequency: number,
  destination: AudioNode,
): DroneVoice => {
  const lowpassFilter = context.createBiquadFilter();
  lowpassFilter.type = "lowpass";
  lowpassFilter.frequency.value = Math.min(
    LOWPASS_BASE + frequency * LOWPASS_TRACKING,
    3600,
  );
  lowpassFilter.Q.value = FILTER_Q * 0.7;

  const envelopeGain = context.createGain();
  envelopeGain.gain.setValueAtTime(0.0001, context.currentTime);

  const highpassFilter = context.createBiquadFilter();
  highpassFilter.type = "highpass";
  highpassFilter.frequency.value = HIGHPASS_CUTOFF;
  highpassFilter.Q.value = 0.3;

  highpassFilter.connect(lowpassFilter);
  lowpassFilter.connect(envelopeGain);
  envelopeGain.connect(destination);

  const wave = context.createPeriodicWave(
    WAVE_COEFFICIENTS.real,
    WAVE_COEFFICIENTS.imag,
  );
  const oscillators: OscillatorNode[] = [];

  const fundamentalOsc = context.createOscillator();
  const fundamentalGain = context.createGain();
  fundamentalOsc.setPeriodicWave(wave);
  fundamentalOsc.frequency.value = frequency;
  fundamentalGain.gain.value = 0.55;
  fundamentalOsc.connect(fundamentalGain);
  fundamentalGain.connect(highpassFilter);
  fundamentalOsc.start();
  oscillators.push(fundamentalOsc);

  const secondHarmonicOsc = context.createOscillator();
  const secondHarmonicGain = context.createGain();
  secondHarmonicOsc.setPeriodicWave(wave);
  secondHarmonicOsc.frequency.value = frequency * 2;
  secondHarmonicOsc.detune.value = -3;
  secondHarmonicGain.gain.value = 0.18;
  secondHarmonicOsc.connect(secondHarmonicGain);
  secondHarmonicGain.connect(highpassFilter);
  secondHarmonicOsc.start();
  oscillators.push(secondHarmonicOsc);

  const tremoloOscillator = context.createOscillator();
  const tremoloDepthGain = context.createGain();
  tremoloOscillator.type = "sine";
  tremoloOscillator.frequency.value = DRONE_TREMOLO_RATE;
  tremoloDepthGain.gain.value = DRONE_TREMOLO_DEPTH;
  tremoloOscillator.connect(tremoloDepthGain);
  tremoloDepthGain.connect(envelopeGain.gain);
  tremoloOscillator.start();

  const now = context.currentTime;
  envelopeGain.gain.cancelScheduledValues(now);
  envelopeGain.gain.setValueAtTime(0.0001, now);
  envelopeGain.gain.linearRampToValueAtTime(DRONE_GAIN, now + DRONE_FADE_IN_SECONDS);

  return {
    oscillators,
    gainNode: envelopeGain,
    lowpassFilter,
    tremoloOscillator,
  };
};

const DRONE_FADE_OUT_SECONDS = 0.5;

/**
 * Gracefully stops a drone voice with a fade-out envelope.
 */
export const stopDroneVoice = (
  context: AudioContext,
  drone: DroneVoice,
): void => {
  const now = context.currentTime;
  drone.gainNode.gain.cancelScheduledValues(now);
  drone.gainNode.gain.setValueAtTime(
    Math.max(drone.gainNode.gain.value, 0.0001),
    now,
  );
  drone.gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    now + DRONE_FADE_OUT_SECONDS,
  );

  const stopTime = now + DRONE_FADE_OUT_SECONDS + 0.1;

  try {
    drone.tremoloOscillator.stop(stopTime);
  } catch {
    // Already stopped.
  }

  drone.oscillators.forEach((oscillator) => {
    try {
      oscillator.stop(stopTime);
    } catch {
      // Already stopped.
    }
  });
};
