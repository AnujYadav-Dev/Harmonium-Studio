"use client";

import { useMemo } from "react";

import { HarmoniumKey } from "@/features/harmonium/components/HarmoniumKey";
import { KEYBOARD_NOTES } from "@/features/harmonium/data";
import {
  COMPACT_ROW_NATURAL_TARGETS,
  HARMONIUM_ROW_NATURAL_TARGETS,
  KEYBOARD_VIEW_LABELS,
} from "@/features/harmonium/constants";
import { buildHarmoniumRows, getCompactNotes } from "@/features/harmonium/utils";
import type { NoteDefinition } from "@/features/harmonium/types";

interface HarmoniumInstrumentPanelProps {
  activeKeys: Set<string>;
  keyboardView: "grid" | "harmonium";
  layoutMode: "full" | "compact";
  onKeyboardViewChange: (view: "grid" | "harmonium") => void;
  onLayoutModeChange: (mode: "full" | "compact") => void;
  onTilePressStart: (keyboardKey: string) => void;
  onTilePressEnd: (keyboardKey: string) => void;
}

/**
 * Main interactive instrument surface, including grid and harmonium layouts.
 */
export const HarmoniumInstrumentPanel = ({
  activeKeys,
  keyboardView,
  layoutMode,
  onKeyboardViewChange,
  onLayoutModeChange,
  onTilePressStart,
  onTilePressEnd,
}: HarmoniumInstrumentPanelProps) => {
  const compactNotes = useMemo(() => {
    return getCompactNotes(KEYBOARD_NOTES);
  }, []);

  const displayedGridNotes: NoteDefinition[] =
    layoutMode === "compact" ? compactNotes : KEYBOARD_NOTES;

  const harmoniumRows = useMemo(() => {
    return buildHarmoniumRows(KEYBOARD_NOTES, HARMONIUM_ROW_NATURAL_TARGETS);
  }, []);

  const compactHarmoniumRows = useMemo(() => {
    return buildHarmoniumRows(compactNotes, COMPACT_ROW_NATURAL_TARGETS);
  }, [compactNotes]);

  const displayedHarmoniumRows =
    layoutMode === "compact" ? compactHarmoniumRows : harmoniumRows;

  return (
    <section className="pb-4">
      <div className="rounded-2xl border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-3 shadow-panel sm:rounded-[2.5rem] sm:p-6">
        <div className="mb-4 grid gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
          <div>
            <p className="font-body text-[0.6rem] uppercase tracking-[0.24em] text-sage-400 sm:text-xs sm:tracking-[0.28em]">
              Instrument
            </p>
            <h2 className="mt-1.5 font-display text-xl text-paper-50 sm:mt-2 sm:text-3xl">
              Play from your keyboard or tap the on-screen keys
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <p className="max-w-sm font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
              Hold a key for sustain and release it to hear the harmonium fade
              naturally. Repeated keydown events are ignored while a note is already
              active. On touch devices, press and hold any tile to play it directly.
            </p>
            <div className="flex flex-wrap gap-2">
              {(["grid", "harmonium"] as const).map((viewName) => {
                const isSelected = keyboardView === viewName;

                return (
                  <button
                    className={[
                      "rounded-full border px-3 py-1.5 font-body text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]",
                      isSelected
                        ? "border-sage-400 bg-sage-400 text-ink-950"
                        : "border-paper-200/10 bg-paper-50/5 text-paper-300 hover:border-paper-200/30 hover:bg-paper-50/10",
                    ].join(" ")}
                    key={viewName}
                    onClick={() => {
                      onKeyboardViewChange(viewName);
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
                      "rounded-full border px-3 py-1.5 font-body text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]",
                      isSelected
                        ? "border-bronze-500 bg-bronze-500 text-ink-950"
                        : "border-paper-200/10 bg-paper-50/5 text-paper-300 hover:border-paper-200/30 hover:bg-paper-50/10",
                    ].join(" ")}
                    key={modeName}
                    onClick={() => {
                      onLayoutModeChange(modeName);
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

        <div className="rounded-xl border border-paper-200/10 bg-paper-50/[0.03] p-2 sm:rounded-[2rem] sm:p-4">
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
                      onPressEnd={onTilePressEnd}
                      onPressStart={onTilePressStart}
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
                                onPressEnd={onTilePressEnd}
                                onPressStart={onTilePressStart}
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
                                onPressEnd={onTilePressEnd}
                                onPressStart={onTilePressStart}
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
  );
};
