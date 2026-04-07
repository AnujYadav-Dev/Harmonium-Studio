import type { Variants } from "framer-motion";

/**
 * Motion states for individual harmonium keys.
 */
export const keyVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  pressed: {
    scale: 0.97,
    y: 4,
    transition: {
      duration: 0.08,
      ease: "easeInOut",
    },
  },
};

/**
 * Entrance animation for the keyboard mapping legend.
 */
export const legendVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.03,
    },
  },
};

/**
 * Small staggered reveal used for legend rows.
 */
export const legendItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};
