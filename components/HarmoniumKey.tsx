"use client";

import { motion } from "framer-motion";

import { keyVariants } from "@/constants/motionVariants";
import type { HarmoniumKeyProps } from "@/types/harmonium";

/**
 * Renders one harmonium key with pressed-state motion feedback.
 */
export const HarmoniumKey = ({
  note,
  freq,
  keyboardKey,
  isBlack,
  isActive,
}: HarmoniumKeyProps) => {
  return (
    <motion.div
      animate={isActive ? "pressed" : "idle"}
      aria-label={`${keyboardKey.toUpperCase()} plays ${note}`}
      aria-pressed={isActive}
      className={[
        "flex min-h-28 min-w-0 select-none flex-col justify-between rounded-[1.35rem] border px-3 py-3 shadow-key transition-colors duration-150",
        isBlack
          ? isActive
            ? "border-sage-400/60 bg-sage-400/15 text-paper-50"
            : "border-paper-200/10 bg-ink-900 text-paper-50"
          : isActive
            ? "border-bronze-500/70 bg-bronze-500/15 text-paper-50"
            : "border-paper-200/10 bg-paper-50/5 text-paper-50",
      ].join(" ")}
      initial="idle"
      role="presentation"
      variants={keyVariants}
    >
      <div className="space-y-1">
        <p className="font-body text-[0.6rem] uppercase tracking-[0.24em] text-sage-500">
          Key
        </p>
        <p className="truncate font-display text-xl uppercase tracking-[0.08em] sm:text-2xl">
          {keyboardKey}
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-display text-base tracking-[0.08em] sm:text-lg">{note}</p>
        <p
          className={[
            "font-body text-[0.7rem] tracking-[0.14em]",
            isBlack ? "text-paper-300" : "text-paper-300",
          ].join(" ")}
        >
          {freq.toFixed(2)} Hz
        </p>
      </div>
    </motion.div>
  );
};
