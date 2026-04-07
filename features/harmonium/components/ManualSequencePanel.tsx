"use client";

import { KEYBOARD_MAP } from "@/features/harmonium/data";

interface ManualSequencePanelProps {
  manualKeyInput: string;
  parsedManualPreviewKeys: string[];
  parsedManualSequenceLength: number;
  isManualSequencePlaying: boolean;
  onManualKeyInputChange: (value: string) => void;
  onPlay: () => void;
  onStop: () => void;
}

/**
 * Manual sequence input and playback controls.
 */
export const ManualSequencePanel = ({
  manualKeyInput,
  parsedManualPreviewKeys,
  parsedManualSequenceLength,
  isManualSequencePlaying,
  onManualKeyInputChange,
  onPlay,
  onStop,
}: ManualSequencePanelProps) => {
  return (
    <section className="rounded-2xl border border-paper-200/10 bg-paper-50/5 p-3 shadow-panel backdrop-blur sm:rounded-[2rem] sm:p-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
            Manual Chord Input
          </p>
          <div className="space-y-2">
            <h2 className="font-display text-xl text-paper-50 sm:text-2xl">
              Enter a note sequence separated by commas
            </h2>
            <p className="max-w-2xl font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
              Type mapped keyboard keys like <span className="font-display">a,b,3,4</span>{" "}
              or <span className="font-display">[,\\,',/</span>. The sequence plays
              left to right at a readable pace and repeated notes are preserved.
            </p>
          </div>
          <label className="block" htmlFor="manual-keys">
            <span className="sr-only">Comma-separated harmonium keys</span>
            <input
              className="w-full rounded-xl border border-paper-200/10 bg-ink-900 px-3 py-3 font-body text-sm text-paper-50 outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-400/30 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
              id="manual-keys"
              onChange={(event) => {
                onManualKeyInputChange(event.target.value);
              }}
              placeholder="a, b, 3, 4, [, /"
              type="text"
              value={manualKeyInput}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            className="rounded-xl border border-sage-400 bg-sage-400 px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-ink-950 transition hover:bg-sage-300 disabled:cursor-not-allowed disabled:border-paper-200/10 disabled:bg-paper-50/10 disabled:text-paper-300 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
            disabled={parsedManualSequenceLength === 0}
            onClick={onPlay}
            type="button"
          >
            Play Sequence
          </button>
          <button
            className="rounded-xl border border-paper-200/10 bg-transparent px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-paper-50 transition hover:border-paper-200/30 hover:bg-paper-50/5 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
            disabled={!isManualSequencePlaying}
            onClick={onStop}
            type="button"
          >
            Stop
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
        {parsedManualPreviewKeys.length > 0 ? (
          parsedManualPreviewKeys.map((keyboardKey) => {
            const noteDefinition = KEYBOARD_MAP[keyboardKey];

            return (
              <span
                className="rounded-full border border-bronze-500/40 bg-bronze-500/10 px-2.5 py-0.5 font-body text-[0.6rem] uppercase tracking-[0.18em] text-paper-50 sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.22em]"
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
  );
};
