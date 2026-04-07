"use client";

import { motion } from "framer-motion";

import {
  MAX_OCTAVE_SHIFT,
  MIN_OCTAVE_SHIFT,
} from "@/features/harmonium/data";
import type { OctaveShiftControlsProps } from "@/features/harmonium/types";

/**
 * Simple octave shift controls with − / + buttons.
 */
export const OctaveShiftControls = ({
  octaveShift,
  onOctaveShiftChange,
}: OctaveShiftControlsProps) => {
  const canShiftDown = octaveShift > MIN_OCTAVE_SHIFT;
  const canShiftUp = octaveShift < MAX_OCTAVE_SHIFT;

  const shiftLabel =
    octaveShift === 0
      ? "Original"
      : octaveShift > 0
        ? `+${octaveShift} Octave${octaveShift > 1 ? "s" : ""}`
        : `${octaveShift} Octave${octaveShift < -1 ? "s" : ""}`;

  return (
    <div className="rounded-2xl border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-3 shadow-panel sm:rounded-[2rem] sm:p-6">
      <div className="mb-3 space-y-1.5 sm:mb-5 sm:space-y-2">
        <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
          Transpose
        </p>
        <h2 className="font-display text-xl text-paper-50 sm:text-2xl">Octave Shift</h2>
        <p className="max-w-lg font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
          Shift the entire keyboard up or down without changing the layout.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <motion.button
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl border font-display text-lg transition-all sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl",
            canShiftDown
              ? "border-paper-200/10 bg-paper-50/5 text-paper-50 hover:border-sage-400/40 hover:bg-sage-400/10"
              : "cursor-not-allowed border-paper-200/5 bg-paper-50/[0.02] text-ink-500",
          ].join(" ")}
          disabled={!canShiftDown}
          onClick={() => {
            onOctaveShiftChange(octaveShift - 1);
          }}
          type="button"
          whileTap={canShiftDown ? { scale: 0.92 } : undefined}
        >
          −
        </motion.button>

        <div className="min-w-[7rem] text-center sm:min-w-[10rem]">
          <p className="font-display text-2xl text-paper-50 sm:text-3xl">{shiftLabel}</p>
          <p className="mt-1 font-body text-[0.62rem] uppercase tracking-[0.24em] text-paper-300">
            Range: {MIN_OCTAVE_SHIFT} to +{MAX_OCTAVE_SHIFT}
          </p>
        </div>

        <motion.button
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl border font-display text-lg transition-all sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl",
            canShiftUp
              ? "border-paper-200/10 bg-paper-50/5 text-paper-50 hover:border-sage-400/40 hover:bg-sage-400/10"
              : "cursor-not-allowed border-paper-200/5 bg-paper-50/[0.02] text-ink-500",
          ].join(" ")}
          disabled={!canShiftUp}
          onClick={() => {
            onOctaveShiftChange(octaveShift + 1);
          }}
          type="button"
          whileTap={canShiftUp ? { scale: 0.92 } : undefined}
        >
          +
        </motion.button>
      </div>
    </div>
  );
};
