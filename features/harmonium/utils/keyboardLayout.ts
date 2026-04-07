import {
  BLACK_KEY_WIDTH_RATIO,
  COMPACT_RANGE,
  HARMONIUM_ROW_LABELS,
  HARMONIUM_ROW_NATURAL_TARGETS,
} from "@/features/harmonium/constants";
import type { HarmoniumRow, NoteDefinition } from "@/features/harmonium/types";

/**
 * Splits a chromatic note list into contiguous rows using natural-key targets.
 */
export const splitRowsByNaturalTargets = (
  notes: NoteDefinition[],
  naturalTargets: readonly number[],
): NoteDefinition[][] => {
  const rows: NoteDefinition[][] = [];
  let currentRow: NoteDefinition[] = [];
  let naturalsInCurrentRow = 0;
  let targetIndex = 0;

  notes.forEach((noteDefinition, index) => {
    currentRow.push(noteDefinition);

    if (!noteDefinition.note.includes("#")) {
      naturalsInCurrentRow += 1;
    }

    const activeTarget = naturalTargets[targetIndex];
    const nextNote = notes[index + 1];
    const nextNoteStartsCleanly =
      nextNote === undefined || !nextNote.note.includes("#");

    if (
      activeTarget !== undefined &&
      naturalsInCurrentRow >= activeTarget &&
      nextNoteStartsCleanly
    ) {
      rows.push(currentRow);
      currentRow = [];
      naturalsInCurrentRow = 0;
      targetIndex += 1;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

/**
 * Splits the full chromatic note list into three contiguous rows with balanced natural-key counts.
 */
export const partitionHarmoniumRows = (notes: NoteDefinition[]): NoteDefinition[][] => {
  return splitRowsByNaturalTargets(notes, HARMONIUM_ROW_NATURAL_TARGETS);
};

/**
 * Builds a compact but still musically useful central range for smaller layouts.
 */
export const getCompactNotes = (notes: NoteDefinition[]): NoteDefinition[] => {
  const startIndex = notes.findIndex((noteDefinition) => {
    return `${noteDefinition.note}${noteDefinition.octave}` === COMPACT_RANGE.start;
  });
  const endIndex = notes.findIndex((noteDefinition) => {
    return `${noteDefinition.note}${noteDefinition.octave}` === COMPACT_RANGE.end;
  });

  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return notes;
  }

  return notes.slice(startIndex, endIndex + 1);
};

/**
 * Converts a row of notes into positioned white and black keys for harmonium rendering.
 */
export const buildHarmoniumRows = (
  notes: NoteDefinition[],
  naturalTargets: readonly number[],
): HarmoniumRow[] => {
  const rows = splitRowsByNaturalTargets(notes, naturalTargets);

  return rows.map((rowNotes, rowIndex) => {
    const whiteNotes = rowNotes.filter((noteDefinition) => !noteDefinition.note.includes("#"));
    const whiteKeyWidth = 100 / whiteNotes.length;
    const blackKeyWidth = whiteKeyWidth * BLACK_KEY_WIDTH_RATIO;

    const blackNotes = rowNotes
      .filter((noteDefinition) => noteDefinition.note.includes("#"))
      .map((noteDefinition) => {
        const naturalIndex = whiteNotes.findIndex((whiteNote) => {
          return (
            whiteNote.octave === noteDefinition.octave &&
            ["C", "D", "F", "G", "A"].includes(whiteNote.note) &&
            `${whiteNote.note}#` === noteDefinition.note
          );
        });
        const leftPosition = Math.max(
          0,
          Math.min(
            (naturalIndex + 1) * whiteKeyWidth - blackKeyWidth / 2,
            100 - blackKeyWidth,
          ),
        );

        return {
          ...noteDefinition,
          left: `${leftPosition}%`,
          width: `${blackKeyWidth}%`,
        };
      });

    return {
      label: HARMONIUM_ROW_LABELS[rowIndex] ?? `Register ${rowIndex + 1}`,
      whiteNotes,
      blackNotes,
    };
  });
};

