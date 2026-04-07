import type { DroneDefinition, NoteDefinition, SynthParams } from "@/features/harmonium/types/domain";

/**
 * Props for a single rendered harmonium key.
 */
export interface HarmoniumKeyProps {
  note: string;
  freq: number;
  keyboardKey: string;
  isBlack: boolean;
  isActive: boolean;
  variant: "grid" | "harmonium";
  density?: "default" | "compact";
  className?: string;
  onPressStart: (keyboardKey: string) => void;
  onPressEnd: (keyboardKey: string) => void;
}

/**
 * Props for the keyboard mapping legend.
 */
export interface KeyboardLegendProps {
  notes: NoteDefinition[];
  activeKeys: Set<string>;
}

/**
 * Props for the real-time audio spectrum visualizer.
 */
export interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
}

/**
 * Props for the synthesizer control panel with rotary knobs.
 */
export interface SynthControlPanelProps {
  synthParams: SynthParams;
  onSynthParamsChange: (params: SynthParams) => void;
}

/**
 * Props for the drone stops toggle panel.
 */
export interface DroneStopsPanelProps {
  drones: readonly DroneDefinition[];
  activeDrones: Set<string>;
  onToggleDrone: (droneId: string) => void;
}

/**
 * Props for the octave shift controls.
 */
export interface OctaveShiftControlsProps {
  octaveShift: number;
  onOctaveShiftChange: (shift: number) => void;
}
