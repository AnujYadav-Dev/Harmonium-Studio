"use client";

import { KEYBOARD_MAP } from "@/features/harmonium/constants";

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
              Type mapped keyboard keys like <span className="font-display">a,b,3,4</span>{" "}
              or <span className="font-display">[,\\,',/</span>. The sequence plays
              left to right at a readable pace and repeated notes are preserved.
            </p>
          </div>
          <label className="block" htmlFor="manual-keys">
            <span className="sr-only">Comma-separated harmonium keys</span>
            <input
              className="w-full rounded-2xl border border-paper-200/10 bg-ink-900 px-5 py-4 font-body text-base text-paper-50 outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-400/30"
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

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-2xl border border-sage-400 bg-sage-400 px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-ink-950 transition hover:bg-sage-300 disabled:cursor-not-allowed disabled:border-paper-200/10 disabled:bg-paper-50/10 disabled:text-paper-300"
            disabled={parsedManualSequenceLength === 0}
            onClick={onPlay}
            type="button"
          >
            Play Sequence
          </button>
          <button
            className="rounded-2xl border border-paper-200/10 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-paper-50 transition hover:border-paper-200/30 hover:bg-paper-50/5"
            disabled={!isManualSequencePlaying}
            onClick={onStop}
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
  );
};
