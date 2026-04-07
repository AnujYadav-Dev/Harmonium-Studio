"use client";

import { motion } from "framer-motion";

import { legendItemVariants, legendVariants } from "@/constants/motionVariants";
import type { KeyboardLegendProps } from "@/types/harmonium";

/**
 * Displays the full keyboard-to-note map for quick reference.
 */
export const KeyboardLegend = ({ notes, activeKeys }: KeyboardLegendProps) => {
  return (
    <motion.section
      animate="visible"
      className="rounded-[2rem] border border-paper-200/10 bg-ink-900/70 p-6 shadow-panel backdrop-blur"
      initial="hidden"
      variants={legendVariants}
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.32em] text-sage-400">
            Mapping Guide
          </p>
          <h2 className="mt-2 font-display text-2xl text-paper-50">
            Laptop keys to harmonium notes
          </h2>
        </div>
        <p className="max-w-xs font-body text-sm leading-6 text-paper-300">
          Use the lower and upper letter rows together with the number row sharps
          to cover the full C3 to B4 range.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((noteDefinition) => {
          const noteId = `${noteDefinition.note}${noteDefinition.octave}`;
          const isActive = activeKeys.has(noteDefinition.keyboardKey);

          return (
            <motion.div
              key={noteId}
              className={[
                "flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors duration-150",
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
