"use client";

import { motion } from "framer-motion";

import { legendItemVariants, legendVariants } from "@/constants/motion";
import type { KeyboardLegendProps } from "@/features/harmonium/types";

/**
 * Displays the full keyboard-to-note map for quick reference.
 */
export const KeyboardLegend = ({ notes, activeKeys }: KeyboardLegendProps) => {
  return (
    <motion.section
      animate="visible"
      className="rounded-2xl border border-paper-200/10 bg-ink-900/70 p-3 shadow-panel backdrop-blur sm:rounded-[2rem] sm:p-6"
      initial="hidden"
      variants={legendVariants}
    >
      <div className="mb-3 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
            Mapping Guide
          </p>
          <h2 className="mt-1.5 font-display text-xl text-paper-50 sm:mt-2 sm:text-2xl">
            Laptop keys to harmonium notes
          </h2>
        </div>
        <p className="max-w-xs font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
          Use the lower and upper letter rows together with the number row sharps
          to cover the full C3 to B4 range.
        </p>
      </div>

      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((noteDefinition) => {
          const noteId = `${noteDefinition.note}${noteDefinition.octave}`;
          const isActive = activeKeys.has(noteDefinition.keyboardKey);

          return (
            <motion.div
              key={noteId}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2 transition-colors duration-150 sm:rounded-2xl sm:px-4 sm:py-3",
                isActive
                  ? "border-bronze-500/60 bg-bronze-500/10"
                  : "border-paper-200/10 bg-paper-50/5",
              ].join(" ")}
              variants={legendItemVariants}
            >
              <div>
                <p className="font-display text-lg text-paper-50">{noteId}</p>
                <p className="font-body text-xs uppercase tracking-[0.24em] text-paper-300">
                  {noteDefinition.freq.toFixed(2)} Hz
                </p>
              </div>
              <p className="font-display text-xl uppercase tracking-[0.14em] text-sage-300">
                {noteDefinition.keyboardKey}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
