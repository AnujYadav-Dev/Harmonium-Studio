"use client";

import { motion } from "framer-motion";

import { keyVariants } from "@/features/harmonium/constants";
import type { HarmoniumKeyProps } from "@/features/harmonium/types";

/**
 * Renders one harmonium key with pressed-state motion feedback.
 */
export const HarmoniumKey = ({
  note,
  freq,
  keyboardKey,
  isBlack,
  isActive,
  variant,
  density = "default",
  className,
  onPressStart,
  onPressEnd,
}: HarmoniumKeyProps) => {
  const isCompactHarmonium = variant === "harmonium" && density === "compact";

  const variantClassName =
    variant === "harmonium"
      ? isBlack
        ? isCompactHarmonium
          ? "h-full w-full rounded-b-[0.95rem] px-1.5 py-1.5 sm:rounded-b-[1.15rem] sm:px-2 sm:py-2"
          : "h-full w-full rounded-b-[0.9rem] px-1.5 py-2 sm:rounded-b-[1.2rem] sm:px-2.5 sm:py-3"
        : isCompactHarmonium
          ? "h-full w-full rounded-b-[1.15rem] px-1.5 py-2 sm:rounded-b-[1.5rem] sm:px-2.5 sm:py-2.5"
          : "h-full w-full rounded-b-[1.1rem] px-1.5 py-2.5 sm:rounded-b-[1.6rem] sm:px-3 sm:py-4"
      : "min-h-24 min-w-0 rounded-[1.2rem] px-2.5 py-3 sm:min-h-28 sm:px-3";

  const surfaceClassName =
    variant === "harmonium"
      ? isBlack
        ? isActive
          ? "border-sage-400/60 bg-sage-400/20 text-paper-50"
          : "border-ink-700 bg-ink-900 text-paper-50"
        : isActive
          ? "border-bronze-500/70 bg-paper-100 text-ink-950"
          : "border-paper-200 bg-paper-50 text-ink-950"
      : isBlack
        ? isActive
          ? "border-sage-400/60 bg-sage-400/15 text-paper-50"
          : "border-paper-200/10 bg-ink-900 text-paper-50"
        : isActive
          ? "border-bronze-500/70 bg-bronze-500/15 text-paper-50"
          : "border-paper-200/10 bg-paper-50/5 text-paper-50";

  return (
    <motion.button
      animate={isActive ? "pressed" : "idle"}
      aria-label={`${keyboardKey.toUpperCase()} plays ${note}`}
      aria-pressed={isActive}
      className={[
        "flex touch-manipulation select-none flex-col justify-between border text-left shadow-key transition-colors duration-150",
        variantClassName,
        surfaceClassName,
        className ?? "",
      ].join(" ")}
      initial="idle"
      onPointerCancel={() => {
        onPressEnd(keyboardKey);
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        onPressStart(keyboardKey);
      }}
      onPointerLeave={() => {
        onPressEnd(keyboardKey);
      }}
      onPointerUp={() => {
        onPressEnd(keyboardKey);
      }}
      type="button"
      variants={keyVariants}
    >
      <div className={isCompactHarmonium ? "space-y-0.5" : "space-y-1"}>
        <p
          className={[
            isCompactHarmonium
              ? "font-body text-[0.5rem] uppercase tracking-[0.2em]"
              : "font-body text-[0.58rem] uppercase tracking-[0.24em]",
            variant === "harmonium" && !isBlack ? "text-ink-500" : "text-sage-500",
          ].join(" ")}
        >
          Key
        </p>
        <p
          className={[
            "truncate font-display uppercase tracking-[0.08em]",
            variant === "harmonium"
              ? isCompactHarmonium
                ? "text-sm sm:text-lg"
                : "text-sm sm:text-xl"
              : "text-lg sm:text-2xl",
          ].join(" ")}
        >
          {keyboardKey}
        </p>
      </div>

      <div className={isCompactHarmonium ? "space-y-0.5" : "space-y-1"}>
        <p
          className={[
            "font-display tracking-[0.08em]",
            variant === "harmonium"
              ? isCompactHarmonium
                ? "text-[0.72rem] sm:text-[0.95rem]"
                : "text-[0.72rem] sm:text-base"
              : "text-sm sm:text-lg",
          ].join(" ")}
        >
          {note}
        </p>
        {isCompactHarmonium ? null : (
          <p
            className={[
              "font-body text-[0.62rem] tracking-[0.14em] sm:text-[0.7rem]",
              variant === "harmonium"
                ? !isBlack
                  ? "text-ink-500"
                  : "text-paper-300"
                : "text-paper-300",
            ].join(" ")}
          >
            {freq.toFixed(2)} Hz
          </p>
        )}
      </div>
    </motion.button>
  );
};
