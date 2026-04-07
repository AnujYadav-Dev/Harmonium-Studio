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
}

/**
 * Props for a single rendered harmonium key.
 */
export interface HarmoniumKeyProps {
  note: string;
  freq: number;
  keyboardKey: string;
  isBlack: boolean;
  isActive: boolean;
}

/**
 * Props for the keyboard mapping legend.
 */
export interface KeyboardLegendProps {
  notes: NoteDefinition[];
  activeKeys: Set<string>;
}
