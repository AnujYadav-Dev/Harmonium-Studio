"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { HarmoniumKey } from "@/components/HarmoniumKey";
import { KeyboardLegend } from "@/components/KeyboardLegend";
import {
  KEYBOARD_MAP,
  KEYBOARD_NOTES,
} from "@/constants/keyboardMap";
import { useHarmonium } from "@/hooks/useHarmonium";

const KEYBOARD_VIEW_LABELS = {
  grid: "Keyboard Grid",
  harmonium: "Harmonium Keys",
} as const;

const HARMONIUM_ROW_LABELS = [
  "Lower Register",
  "Middle Register",
  "Upper Register",
] as const;

const HARMONIUM_ROW_NATURAL_TARGETS = [10, 9] as const;
const COMPACT_ROW_NATURAL_TARGETS = [5, 5] as const;
const BLACK_KEY_WIDTH_RATIO = 0.6;
const COMPACT_RANGE = {
  start: "C3",
  end: "C5",
} as const;

/**
 * Splits a chromatic note list into contiguous rows using natural-key targets.
 */
const splitRowsByNaturalTargets = (
  notes: typeof KEYBOARD_NOTES,
  naturalTargets: readonly number[],
) => {
  const rows: typeof KEYBOARD_NOTES[] = [];
  let currentRow: typeof KEYBOARD_NOTES = [];
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
const partitionHarmoniumRows = (notes: typeof KEYBOARD_NOTES) => {
  return splitRowsByNaturalTargets(notes, HARMONIUM_ROW_NATURAL_TARGETS);
};

/**
 * Builds a compact but still musically useful central range for smaller layouts.
 */
const getCompactNotes = (notes: typeof KEYBOARD_NOTES) => {
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
const buildHarmoniumRows = (
  notes: typeof KEYBOARD_NOTES,
  naturalTargets: readonly number[],
) => {
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

/**
 * Returns true when the user is typing into an editable form control.
 */
const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
};

/**
 * Renders the playable harmonium experience and keyboard listeners.
 */
export default function Page() {
  const { activeKeys, playNote, stopNote } = useHarmonium();
  const [keyboardView, setKeyboardView] = useState<"grid" | "harmonium">("grid");
  const [layoutMode, setLayoutMode] = useState<"full" | "compact">("full");
  const [manualKeyInput, setManualKeyInput] = useState<string>("");
  const [manualPlaybackKey, setManualPlaybackKey] = useState<string | null>(null);
  const [isManualSequencePlaying, setIsManualSequencePlaying] = useState<boolean>(false);
  const playbackTimeoutsRef = useRef<number[]>([]);
  const manualPlaybackKeyRef = useRef<string | null>(null);

  const MANUAL_NOTE_DURATION_MS = 320;
  const MANUAL_GAP_DURATION_MS = 40;

  /**
   * Parses the comma-separated key input into an ordered list of valid playable keys.
   */
  const parsedManualSequence = useMemo(() => {
    return manualKeyInput
      .split(",")
      .map((keyValue) => keyValue.trim().toLowerCase())
      .filter((keyValue) => keyValue.length > 0 && Boolean(KEYBOARD_MAP[keyValue]));
  }, [manualKeyInput]);

  /**
   * Unique valid keys used only for the input preview chips.
   */
  const parsedManualPreviewKeys = useMemo(() => {
    return parsedManualSequence.filter((keyValue, index) => {
      return parsedManualSequence.indexOf(keyValue) === index;
    });
  }, [parsedManualSequence]);

  /**
   * Groups notes into three continuous harmonium rows that stay visible on small screens.
   */
  const compactNotes = useMemo(() => {
    return getCompactNotes(KEYBOARD_NOTES);
  }, []);

  const displayedGridNotes = layoutMode === "compact" ? compactNotes : KEYBOARD_NOTES;

  const harmoniumRows = useMemo(() => {
    return buildHarmoniumRows(KEYBOARD_NOTES, HARMONIUM_ROW_NATURAL_TARGETS);
  }, []);

  const compactHarmoniumRows = useMemo(() => {
    return buildHarmoniumRows(compactNotes, COMPACT_ROW_NATURAL_TARGETS);
  }, [compactNotes]);

  const displayedHarmoniumRows =
    layoutMode === "compact" ? compactHarmoniumRows : harmoniumRows;

  useEffect(() => {
    /**
     * Starts notes from physical keyboard input while skipping repeat events.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      void playNote(event.key);
    };

    /**
     * Releases notes when the physical keyboard key is lifted.
     */
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      stopNote(event.key);
    };

    /**
     * Prevents stuck notes if the browser window loses focus.
     */
    const handleWindowBlur = () => {
      activeKeys.forEach((keyboardKey) => {
        stopNote(keyboardKey);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeKeys, playNote, stopNote]);

  useEffect(() => {
    manualPlaybackKeyRef.current = manualPlaybackKey;
  }, [manualPlaybackKey]);

  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      playbackTimeoutsRef.current = [];

      if (manualPlaybackKeyRef.current !== null) {
        stopNote(manualPlaybackKeyRef.current);
      }
    };
  }, [stopNote]);

  /**
   * Stops all pending manual sequence timers and releases any held sequence note.
   */
  const stopManualSequence = () => {
    playbackTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    playbackTimeoutsRef.current = [];

    if (manualPlaybackKeyRef.current !== null) {
      stopNote(manualPlaybackKeyRef.current);
    }

    setManualPlaybackKey(null);
    setIsManualSequencePlaying(false);
  };

  /**
   * Plays the manual comma-separated keys as a readable sequence.
   */
  const handleManualPlay = () => {
    stopManualSequence();
    setIsManualSequencePlaying(true);

    parsedManualSequence.forEach((keyboardKey, index) => {
      const noteStartTime =
        index * (MANUAL_NOTE_DURATION_MS + MANUAL_GAP_DURATION_MS);
      const noteStopTime = noteStartTime + MANUAL_NOTE_DURATION_MS;

      const startTimeoutId = window.setTimeout(() => {
        if (
          manualPlaybackKeyRef.current !== null &&
          manualPlaybackKeyRef.current !== keyboardKey
        ) {
          stopNote(manualPlaybackKeyRef.current);
        }

        setManualPlaybackKey(keyboardKey);
        void playNote(keyboardKey);
      }, noteStartTime);

      const stopTimeoutId = window.setTimeout(() => {
        stopNote(keyboardKey);
        setManualPlaybackKey((currentKey) => {
          return currentKey === keyboardKey ? null : currentKey;
        });
      }, noteStopTime);

      playbackTimeoutsRef.current.push(startTimeoutId, stopTimeoutId);
    });

    const finalCleanupTimeoutId = window.setTimeout(() => {
      setManualPlaybackKey(null);
      setIsManualSequencePlaying(false);
      playbackTimeoutsRef.current = [];
    }, parsedManualSequence.length * (MANUAL_NOTE_DURATION_MS + MANUAL_GAP_DURATION_MS));

    playbackTimeoutsRef.current.push(finalCleanupTimeoutId);
  };

  /**
   * Stops the currently playing manual sequence.
   */
  const handleManualStop = () => {
    stopManualSequence();
  };

  /**
   * Starts one on-screen key for mouse and touch interaction.
   */
  const handleTilePressStart = (keyboardKey: string) => {
    void playNote(keyboardKey);
  };

  /**
   * Releases one on-screen key for mouse and touch interaction.
   */
  const handleTilePressEnd = (keyboardKey: string) => {
    stopNote(keyboardKey);
  };

  return (
    <main className="min-h-screen bg-ink-950 text-paper-50">
      <section className="mx-auto flex min-h-screen max-w-[96rem] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
          <div className="space-y-5">
            <p className="font-body text-xs uppercase tracking-[0.34em] text-sage-400">
              Browser Harmonium
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-4xl leading-[0.95] text-paper-50 min-[420px]:text-5xl sm:text-6xl xl:text-7xl">
                A minimal desktop harmonium tuned for the keyboard under your
                hands.
              </h1>
              <p className="max-w-2xl font-body text-sm leading-6 text-paper-300 sm:text-base sm:leading-7 lg:text-lg">
                Press the mapped keys to shape air-driven harmonium tones with a
                soft attack, long release, and subtle motion in both sound and
                interface.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-paper-200/10 bg-paper-50/5 p-6 shadow-panel backdrop-blur">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-sage-400">
              Playing Range
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-display text-3xl text-paper-50">C2-A#5</p>
                <p className="mt-1 font-body text-sm leading-6 text-paper-300">
                  Nearly four chromatic octaves across the printable keyboard.
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-paper-50">47 keys</p>
                <p className="mt-1 font-body text-sm leading-6 text-paper-300">
                  Numbers, letters, and punctuation all participate in the map.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="pb-4">
          <div className="rounded-[2.5rem] border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-4 shadow-panel sm:p-6">
            <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.28em] text-sage-400">
                  Instrument
                </p>
                <h2 className="mt-2 font-display text-3xl text-paper-50">
                  Play from your keyboard or tap the on-screen keys
                </h2>
              </div>
              <div className="space-y-4">
                <p className="max-w-sm font-body text-sm leading-6 text-paper-300">
                  Hold a key for sustain and release it to hear the harmonium fade
                  naturally. Repeated keydown events are ignored while a note is
                  already active. On touch devices, press and hold any tile to play
                  it directly.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["grid", "harmonium"] as const).map((viewName) => {
                    const isSelected = keyboardView === viewName;

                    return (
                      <button
                        className={[
                          "rounded-full border px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.18em] transition",
                          isSelected
                            ? "border-sage-400 bg-sage-400 text-ink-950"
                            : "border-paper-200/10 bg-paper-50/5 text-paper-300 hover:border-paper-200/30 hover:bg-paper-50/10",
                        ].join(" ")}
                        key={viewName}
                        onClick={() => {
                          setKeyboardView(viewName);
                        }}
                        type="button"
                      >
                        {KEYBOARD_VIEW_LABELS[viewName]}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["full", "compact"] as const).map((modeName) => {
                    const isSelected = layoutMode === modeName;

                    return (
                      <button
                        className={[
                          "rounded-full border px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.18em] transition",
                          isSelected
                            ? "border-bronze-500 bg-bronze-500 text-ink-950"
                            : "border-paper-200/10 bg-paper-50/5 text-paper-300 hover:border-paper-200/30 hover:bg-paper-50/10",
                        ].join(" ")}
                        key={modeName}
                        onClick={() => {
                          setLayoutMode(modeName);
                        }}
                        type="button"
                      >
                        {modeName === "full" ? "Full Layout" : "Compact Layout"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:p-4">
              {keyboardView === "grid" ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-sage-400">
                      {layoutMode === "compact"
                        ? "Compact grid focuses on the central playable range"
                        : "Dynamic grid packs every mapped key without empty gaps"}
                    </p>
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-paper-300">
                      {displayedGridNotes.length} keys visible
                    </p>
                  </div>

                  <div
                    className="grid gap-2 sm:gap-3"
                    style={{
                      gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))",
                    }}
                  >
                    {displayedGridNotes.map((noteDefinition) => {
                      const noteId = `${noteDefinition.note}${noteDefinition.octave}`;

                      return (
                        <HarmoniumKey
                          freq={noteDefinition.freq}
                          isActive={activeKeys.has(noteDefinition.keyboardKey)}
                          isBlack={noteDefinition.note.includes("#")}
                          keyboardKey={noteDefinition.keyboardKey}
                          key={noteDefinition.keyboardKey}
                          note={noteId}
                          onPressEnd={handleTilePressEnd}
                          onPressStart={handleTilePressStart}
                          variant="grid"
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-body text-xs uppercase tracking-[0.24em] text-sage-400">
                        {layoutMode === "compact"
                          ? "Compact harmonium focuses on the main center keys"
                          : "Real harmonium layout arranged across three rows"}
                      </p>
                      <p className="font-body text-xs uppercase tracking-[0.24em] text-paper-300">
                        {layoutMode === "compact"
                          ? "Reduced range with both white and black keys kept playable"
                          : "Natural notes are light, accidentals are dark"}
                      </p>
                    </div>
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-paper-300">
                      {layoutMode === "compact" ? "25 keys visible" : "47 keys visible"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {displayedHarmoniumRows.map((rowGroup) => {
                      return (
                        <div
                          className={[
                            "rounded-[1.8rem] border border-paper-200/10 bg-gradient-to-b from-wood-700 to-wood-900 shadow-key",
                            layoutMode === "compact" ? "p-2.5 sm:p-3" : "p-3 sm:p-4",
                          ].join(" ")}
                          key={`harmonium-row-${rowGroup.label}`}
                        >
                          {layoutMode === "full" ? (
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="font-body text-[0.65rem] uppercase tracking-[0.26em] text-sage-300">
                                {rowGroup.label}
                              </p>
                              <p className="font-body text-[0.65rem] uppercase tracking-[0.24em] text-paper-300">
                                Tap any key
                              </p>
                            </div>
                          ) : null}

                          <div
                            className={[
                              "relative overflow-hidden",
                              layoutMode === "compact" ? "pt-1" : "pt-2",
                            ].join(" ")}
                          >
                              <div
                                className={[
                                  "grid gap-1",
                                  layoutMode === "compact" ? "h-20 sm:h-28" : "h-24 sm:h-36",
                                ].join(" ")}
                                style={{
                                  gridTemplateColumns: `repeat(${rowGroup.whiteNotes.length}, minmax(0, 1fr))`,
                              }}
                            >
                              {rowGroup.whiteNotes.map((noteDefinition) => {
                                const noteId = `${noteDefinition.note}${noteDefinition.octave}`;

                                return (
                                  <HarmoniumKey
                                    className="relative z-10"
                                    density={layoutMode === "compact" ? "compact" : "default"}
                                    freq={noteDefinition.freq}
                                    isActive={activeKeys.has(noteDefinition.keyboardKey)}
                                    isBlack={false}
                                    keyboardKey={noteDefinition.keyboardKey}
                                    key={noteId}
                                    note={noteId}
                                    onPressEnd={handleTilePressEnd}
                                    onPressStart={handleTilePressStart}
                                    variant="harmonium"
                                  />
                                );
                              })}
                            </div>

                            {rowGroup.blackNotes.map((noteDefinition) => {
                              const noteId = `${noteDefinition.note}${noteDefinition.octave}`;

                              return (
                                <div
                                  className={[
                                    "absolute top-0 z-20",
                                    layoutMode === "compact" ? "h-12 sm:h-20" : "h-14 sm:h-24",
                                  ].join(" ")}
                                  key={noteId}
                                  style={{
                                    left: noteDefinition.left,
                                    width: noteDefinition.width,
                                  }}
                                >
                                  <HarmoniumKey
                                    density={layoutMode === "compact" ? "compact" : "default"}
                                    freq={noteDefinition.freq}
                                    isActive={activeKeys.has(noteDefinition.keyboardKey)}
                                    isBlack
                                    keyboardKey={noteDefinition.keyboardKey}
                                    note={noteId}
                                    onPressEnd={handleTilePressEnd}
                                    onPressStart={handleTilePressStart}
                                    variant="harmonium"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-paper-200/10 bg-paper-50/5 p-4 shadow-panel backdrop-blur sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-3">
              <p className="font-body text-xs uppercase tracking-[0.32em] text-sage-400">
                Manual Chord Input
              </p>
              <div className="space-y-2">
                <h2 className="font-display text-2xl text-paper-50">
                  Enter a note sequence separated by commas
                </h2>
                <p className="max-w-2xl font-body text-sm leading-6 text-paper-300">
                  Type mapped keyboard keys like{" "}
                  <span className="font-display">a,b,3,4</span> or{" "}
                  <span className="font-display">[,\\,',/</span>. The sequence
                  plays left to right at a readable pace and repeated notes are
                  preserved.
                </p>
              </div>
              <label className="block" htmlFor="manual-keys">
                <span className="sr-only">Comma-separated harmonium keys</span>
                <input
                  className="w-full rounded-2xl border border-paper-200/10 bg-ink-900 px-5 py-4 font-body text-base text-paper-50 outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-400/30"
                  id="manual-keys"
                  onChange={(event) => {
                    setManualKeyInput(event.target.value);
                  }}
                  placeholder="a, b, 3, 4, [, /"
                  type="text"
                  value={manualKeyInput}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl border border-sage-400 bg-sage-400 px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-sage-300 disabled:cursor-not-allowed disabled:border-paper-200/10 disabled:bg-paper-50/10 disabled:text-paper-300"
                disabled={parsedManualSequence.length === 0}
                onClick={handleManualPlay}
                type="button"
              >
                Play Sequence
              </button>
              <button
                className="rounded-2xl border border-paper-200/10 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-paper-50 transition hover:border-paper-200/30 hover:bg-paper-50/5"
                disabled={!isManualSequencePlaying}
                onClick={handleManualStop}
                type="button"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {parsedManualPreviewKeys.length > 0 ? (
              parsedManualPreviewKeys.map((keyboardKey) => {
                const noteDefinition = KEYBOARD_MAP[keyboardKey];

                return (
                  <span
                    className="rounded-full border border-bronze-500/40 bg-bronze-500/10 px-3 py-1 font-body text-xs uppercase tracking-[0.22em] text-paper-50"
                    key={keyboardKey}
                  >
                    {keyboardKey} to {noteDefinition.note}
                    {noteDefinition.octave}
                  </span>
                );
              })
            ) : (
              <p className="font-body text-sm leading-6 text-paper-300">
                No valid mapped keys detected yet. Use keys from the on-screen legend.
              </p>
            )}
          </div>
        </section>

        <KeyboardLegend activeKeys={activeKeys} notes={KEYBOARD_NOTES} />
      </section>
    </main>
  );
}
