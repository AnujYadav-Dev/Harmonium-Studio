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
 * UI state for the currently active keyboard keys.
 */
export interface HarmoniumState {
  activeKeys: Set<string>;
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
