import type { NoteDefinition } from "@/features/harmonium/types";

const SEMITONE_STEPS: readonly string[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const KEY_SEQUENCE: readonly string[] = [
  "`",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "=",
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
  "p",
  "[",
  "]",
  "\\",
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  ";",
  "'",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  ",",
  ".",
  "/",
] as const;

/**
 * Physical keyboard row groupings used by the instrument layout.
 */
export const KEYBOARD_ROWS: readonly (readonly string[])[] = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
] as const;

/**
 * Converts a MIDI note number into a stable hertz value.
 */
const midiToFrequency = (midiNote: number): number => {
  return Number((440 * 2 ** ((midiNote - 69) / 12)).toFixed(2));
};

/**
 * Builds the chromatic harmonium key map from C2 upward across the printable keyboard.
 */
const buildKeyboardMap = (): Record<string, NoteDefinition> => {
  const keyboardMap: Record<string, NoteDefinition> = {};

  KEY_SEQUENCE.forEach((keyboardKey, index) => {
    const midiNote = 36 + index;
    const note = SEMITONE_STEPS[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;

    keyboardMap[keyboardKey] = {
      note,
      octave,
      freq: midiToFrequency(midiNote),
      keyboardKey,
    };
  });

  return keyboardMap;
};

/**
 * All playable keyboard bindings for the harmonium.
 */
export const KEYBOARD_MAP: Record<string, NoteDefinition> = buildKeyboardMap();

/**
 * Sorted note definitions used by the keyboard UI and legend.
 */
export const KEYBOARD_NOTES: NoteDefinition[] = Object.values(KEYBOARD_MAP).sort(
  (leftNote, rightNote) => leftNote.freq - rightNote.freq,
);
