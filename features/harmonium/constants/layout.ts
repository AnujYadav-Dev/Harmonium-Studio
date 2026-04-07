export const KEYBOARD_VIEW_LABELS = {
  grid: "Keyboard Grid",
  harmonium: "Harmonium Keys",
} as const;

export const HARMONIUM_ROW_LABELS = [
  "Lower Register",
  "Middle Register",
  "Upper Register",
] as const;

export const HARMONIUM_ROW_NATURAL_TARGETS = [10, 9] as const;
export const COMPACT_ROW_NATURAL_TARGETS = [5, 5] as const;
export const BLACK_KEY_WIDTH_RATIO = 0.6;

export const COMPACT_RANGE = {
  start: "C3",
  end: "C5",
} as const;
