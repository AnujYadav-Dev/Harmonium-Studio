"use client";

import { motion } from "framer-motion";

import type { DroneStopsPanelProps } from "@/features/harmonium/types";

/**
 * Traditional harmonium drone stops rendered as toggle switches.
 */
export const DroneStopsPanel = ({
  drones,
  activeDrones,
  onToggleDrone,
}: DroneStopsPanelProps) => {
  return (
    <div className="rounded-2xl border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-3 shadow-panel sm:rounded-[2rem] sm:p-6">
      <div className="mb-4 space-y-1.5 sm:mb-6 sm:space-y-2">
        <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
          Drone Stops
        </p>
        <h2 className="font-display text-xl text-paper-50 sm:text-2xl">
          Continuous Background Drones
        </h2>
        <p className="max-w-lg font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
          Toggle a drone stop to add a sustained background tone. Traditional
          harmoniums use Sa and Pa drones for tonal grounding.
        </p>
      </div>

      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
        {drones.map((drone) => {
          const isActive = activeDrones.has(drone.id);

          return (
            <motion.button
              animate={isActive ? { scale: 1 } : { scale: 1 }}
              className={[
                "group flex items-center justify-between rounded-xl border px-3 py-3 transition-all duration-300 sm:rounded-2xl sm:px-5 sm:py-4",
                isActive
                  ? "border-sage-400/50 bg-sage-400/10"
                  : "border-paper-200/10 bg-paper-50/[0.03] hover:border-paper-200/20 hover:bg-paper-50/[0.06]",
              ].join(" ")}
              key={drone.id}
              onClick={() => {
                onToggleDrone(drone.id);
              }}
              type="button"
              whileTap={{ scale: 0.97 }}
            >
              <div className="text-left">
                <p className="font-display text-base text-paper-50 sm:text-lg">
                  {drone.label}
                </p>
                <p className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-paper-300 sm:text-xs sm:tracking-[0.2em]">
                  {drone.note}
                  {drone.octave} — {drone.freq.toFixed(2)} Hz
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Pulsing indicator */}
                <motion.div
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            "0 0 4px rgba(151,175,134,0.4)",
                            "0 0 14px rgba(151,175,134,0.7)",
                            "0 0 4px rgba(151,175,134,0.4)",
                          ],
                        }
                      : { boxShadow: "0 0 0px rgba(0,0,0,0)" }
                  }
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-colors duration-300 sm:h-3 sm:w-3",
                    isActive ? "bg-sage-400" : "bg-ink-500",
                  ].join(" ")}
                  transition={
                    isActive
                      ? { duration: 2, ease: "easeInOut", repeat: Infinity }
                      : { duration: 0.3 }
                  }
                />

                {/* Toggle label */}
                <span
                  className={[
                    "rounded-full border px-2.5 py-0.5 font-body text-[0.55rem] font-semibold uppercase tracking-[0.2em] transition-all duration-300 sm:px-3 sm:py-1 sm:text-[0.6rem] sm:tracking-[0.24em]",
                    isActive
                      ? "border-sage-400 bg-sage-400 text-ink-950"
                      : "border-paper-200/10 bg-paper-50/5 text-paper-300",
                  ].join(" ")}
                >
                  {isActive ? "On" : "Off"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
