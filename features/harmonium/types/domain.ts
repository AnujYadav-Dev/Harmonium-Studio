/**
 * A single playable harmonium note bound to a physical keyboard key.
 */
export interface NoteDefinition {
  note: string;
  octave: number;
  freq: number;
  keyboardKey: string;
}

/**
 * Configurable synthesizer parameters exposed to the UI.
 */
export interface SynthParams {
  masterVolume: number;
  vibratoRate: number;
  vibratoDepth: number;
  harmonicMix: readonly [number, number, number];
  attackSeconds: number;
  releaseSeconds: number;
}

/**
 * Definition for a drone stop note.
 */
export interface DroneDefinition {
  id: string;
  label: string;
  note: string;
  octave: number;
  freq: number;
}

/**
 * Active audio nodes for a playing drone voice.
 */
export interface DroneVoice {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lowpassFilter: BiquadFilterNode;
  tremoloOscillator: OscillatorNode;
}

/**
 * UI state for the currently active keyboard keys and synthesizer controls.
 */
export interface HarmoniumState {
  activeKeys: Set<string>;
  synthParams: SynthParams;
  octaveShift: number;
  activeDrones: Set<string>;
  analyserNode: AnalyserNode | null;
}

/**
 * Audio graph nodes used to synthesize one harmonium note voice.
 */
export interface HarmoniumAudioNode {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lowpassFilter: BiquadFilterNode;
  highpassFilter: BiquadFilterNode;
  tremoloOscillator: OscillatorNode;
  tremoloDepthGain: GainNode;
}

/**
 * Black-note positioning metadata used by the harmonium row layout.
 */
export interface PositionedBlackNote extends NoteDefinition {
  left: string;
  width: string;
}

/**
 * One rendered harmonium row containing natural and accidental notes.
 */
export interface HarmoniumRow {
  label: string;
  whiteNotes: NoteDefinition[];
  blackNotes: PositionedBlackNote[];
}
