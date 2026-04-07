import type { NoteDefinition } from "@/features/harmonium/types/domain";

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
