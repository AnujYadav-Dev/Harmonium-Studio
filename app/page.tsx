"use client";

import { useEffect, useMemo, useState } from "react";

import { HarmoniumKey } from "@/components/HarmoniumKey";
import { KeyboardLegend } from "@/components/KeyboardLegend";
import {
  KEYBOARD_MAP,
  KEYBOARD_NOTES,
  KEYBOARD_ROWS,
} from "@/constants/keyboardMap";
import { useHarmonium } from "@/hooks/useHarmonium";

/**
 * Renders the playable harmonium experience and keyboard listeners.
 */
export default function Page() {
  const { activeKeys, playNote, stopNote } = useHarmonium();
  const [manualKeyInput, setManualKeyInput] = useState<string>("");
  const [manualActiveKeys, setManualActiveKeys] = useState<string[]>([]);

  /**
   * Parses the comma-separated key input into valid playable keyboard keys.
   */
  const parsedManualKeys = useMemo(() => {
    const normalizedKeys = manualKeyInput
      .split(",")
      .map((keyValue) => keyValue.trim().toLowerCase())
      .filter((keyValue) => keyValue.length > 0);

    return normalizedKeys.filter((keyValue, index) => {
      return normalizedKeys.indexOf(keyValue) === index && KEYBOARD_MAP[keyValue];
    });
  }, [manualKeyInput]);

  useEffect(() => {
    /**
     * Starts notes from physical keyboard input while skipping repeat events.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      playNote(event.key);
    };

    /**
     * Releases notes when the physical keyboard key is lifted.
     */
    const handleKeyUp = (event: KeyboardEvent) => {
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
    return () => {
      manualActiveKeys.forEach((keyboardKey) => {
        stopNote(keyboardKey);
      });
    };
  }, [manualActiveKeys, stopNote]);

  /**
   * Starts every valid key entered in the manual comma-separated input.
   */
  const handleManualPlay = async () => {
    manualActiveKeys.forEach((keyboardKey) => {
      stopNote(keyboardKey);
    });

    await Promise.all(
      parsedManualKeys.map(async (keyboardKey) => {
        await playNote(keyboardKey);
      }),
    );

    setManualActiveKeys(parsedManualKeys);
  };

  /**
   * Stops the currently previewed manual keys.
   */
  const handleManualStop = () => {
    manualActiveKeys.forEach((keyboardKey) => {
      stopNote(keyboardKey);
    });

    setManualActiveKeys([]);
  };

  return (
    <main className="min-h-screen bg-ink-950 text-paper-50">
      <section className="mx-auto flex min-h-screen max-w-[96rem] flex-col gap-10 px-6 py-10 lg:px-10 lg:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
          <div className="space-y-5">
            <p className="font-body text-xs uppercase tracking-[0.34em] text-sage-400">
              Browser Harmonium
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl leading-[0.95] text-paper-50 sm:text-6xl xl:text-7xl">
                A minimal desktop harmonium tuned for the keyboard under your
                hands.
              </h1>
              <p className="max-w-2xl font-body text-base leading-7 text-paper-300 sm:text-lg">
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

        <section className="overflow-x-auto pb-4">
          <div className="rounded-[2.5rem] border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-4 shadow-panel sm:p-6">
            <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.28em] text-sage-400">
                  Instrument
                </p>
                <h2 className="mt-2 font-display text-3xl text-paper-50">
                  Play from your physical keyboard
                </h2>
              </div>
              <p className="max-w-sm font-body text-sm leading-6 text-paper-300">
                Hold a key for sustain and release it to hear the harmonium fade
                naturally. Repeated keydown events are ignored while a note is
                already active, even with the expanded full-keyboard layout.
              </p>
            </div>

            <div className="rounded-[2rem] border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:p-4">
              <div className="space-y-3">
                {KEYBOARD_ROWS.map((rowKeys, rowIndex) => {
                  return (
                    <div
                      className={[
                        "grid gap-2 sm:gap-3",
                        rowIndex === 0
                          ? "grid-cols-4 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]"
                          : rowIndex === 1
                            ? "grid-cols-4 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]"
                            : rowIndex === 2
                              ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-[repeat(11,minmax(0,1fr))]"
                              : "grid-cols-4 sm:grid-cols-5 lg:grid-cols-[repeat(10,minmax(0,1fr))]",
                      ].join(" ")}
                      key={`keyboard-row-${rowIndex + 1}`}
                    >
                      {rowKeys.map((keyboardKey) => {
                        const noteDefinition = KEYBOARD_MAP[keyboardKey];
                        const noteId = `${noteDefinition.note}${noteDefinition.octave}`;

                        return (
                          <HarmoniumKey
                            freq={noteDefinition.freq}
                            isActive={activeKeys.has(noteDefinition.keyboardKey)}
                            isBlack={noteDefinition.note.includes("#")}
                            keyboardKey={noteDefinition.keyboardKey}
                            key={keyboardKey}
                            note={noteId}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-paper-200/10 bg-paper-50/5 p-6 shadow-panel backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-3">
              <p className="font-body text-xs uppercase tracking-[0.32em] text-sage-400">
                Manual Chord Input
              </p>
              <div className="space-y-2">
                <h2 className="font-display text-2xl text-paper-50">
                  Enter keyboard keys separated by commas
                </h2>
                <p className="max-w-2xl font-body text-sm leading-6 text-paper-300">
                  Type mapped keyboard keys like{" "}
                  <span className="font-display">a,b,3,4</span> or{" "}
                  <span className="font-display">[,\\,',/</span>. Valid mapped
                  entries will sound together when you press play.
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
                disabled={parsedManualKeys.length === 0}
                onClick={() => {
                  void handleManualPlay();
                }}
                type="button"
              >
                Play Keys
              </button>
              <button
                className="rounded-2xl border border-paper-200/10 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-paper-50 transition hover:border-paper-200/30 hover:bg-paper-50/5"
                disabled={manualActiveKeys.length === 0}
                onClick={handleManualStop}
                type="button"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {parsedManualKeys.length > 0 ? (
              parsedManualKeys.map((keyboardKey) => {
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
