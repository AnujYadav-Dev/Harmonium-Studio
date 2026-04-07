"use client";

import { useCallback } from "react";
import { RotaryKnob } from "@/components/ui/RotaryKnob";
import type { SynthControlPanelProps } from "@/features/harmonium/types";

/**
 * Premium synthesizer parameter controls using rotary knobs.
 */
export const SynthControlPanel = ({
  synthParams,
  onSynthParamsChange,
}: SynthControlPanelProps) => {
  const updateParam = useCallback(
    <K extends keyof typeof synthParams>(key: K, value: (typeof synthParams)[K]) => {
      onSynthParamsChange({ ...synthParams, [key]: value });
    },
    [synthParams, onSynthParamsChange],
  );

  const updateHarmonicMix = useCallback(
    (index: number, value: number) => {
      const next: [number, number, number] = [...synthParams.harmonicMix] as [
        number,
        number,
        number,
      ];
      next[index] = value;
      onSynthParamsChange({ ...synthParams, harmonicMix: next });
    },
    [synthParams, onSynthParamsChange],
  );

  return (
    <div className="rounded-2xl border border-paper-200/10 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 p-3 shadow-panel sm:rounded-[2rem] sm:p-6">
      <div className="mb-4 space-y-1.5 sm:mb-6 sm:space-y-2">
        <p className="font-body text-[0.6rem] uppercase tracking-[0.28em] text-sage-400 sm:text-xs sm:tracking-[0.32em]">
          Sound Engine
        </p>
        <h2 className="font-display text-xl text-paper-50 sm:text-2xl">
          Synthesizer Controls
        </h2>
        <p className="max-w-lg font-body text-xs leading-5 text-paper-300 sm:text-sm sm:leading-6">
          Drag knobs vertically to shape the harmonium tone. Changes apply in
          real-time to new notes.
        </p>
      </div>

      {/* Volume */}
      <div className="mb-4 rounded-xl border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:mb-6 sm:rounded-2xl sm:p-4">
        <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.22em] text-bronze-500 sm:mb-4 sm:text-[0.65rem] sm:tracking-[0.26em]">
          Master
        </p>
        <div className="flex justify-center">
          <RotaryKnob
            accentColor="#b7864f"
            label="Volume"
            max={1}
            min={0}
            onChange={(v) => {
              updateParam("masterVolume", v);
            }}
            step={0.01}
            value={synthParams.masterVolume}
          />
        </div>
      </div>

      {/* Vibrato */}
      <div className="mb-4 rounded-xl border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:mb-6 sm:rounded-2xl sm:p-4">
        <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.22em] text-sage-400 sm:mb-4 sm:text-[0.65rem] sm:tracking-[0.26em]">
          Vibrato
        </p>
        <div className="flex justify-center gap-4 sm:gap-10">
          <RotaryKnob
            accentColor="#97af86"
            label="Rate"
            max={12}
            min={0.5}
            onChange={(v) => {
              updateParam("vibratoRate", v);
            }}
            step={0.1}
            unit="Hz"
            value={synthParams.vibratoRate}
          />
          <RotaryKnob
            accentColor="#97af86"
            label="Depth"
            max={0.15}
            min={0}
            onChange={(v) => {
              updateParam("vibratoDepth", v);
            }}
            step={0.001}
            value={synthParams.vibratoDepth}
          />
        </div>
      </div>

      {/* Envelope */}
      <div className="mb-4 rounded-xl border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:mb-6 sm:rounded-2xl sm:p-4">
        <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.22em] text-sage-400 sm:mb-4 sm:text-[0.65rem] sm:tracking-[0.26em]">
          Envelope
        </p>
        <div className="flex justify-center gap-4 sm:gap-10">
          <RotaryKnob
            label="Attack"
            max={0.5}
            min={0.01}
            onChange={(v) => {
              updateParam("attackSeconds", v);
            }}
            step={0.01}
            unit="sec"
            value={synthParams.attackSeconds}
          />
          <RotaryKnob
            label="Release"
            max={3}
            min={0.1}
            onChange={(v) => {
              updateParam("releaseSeconds", v);
            }}
            step={0.05}
            unit="sec"
            value={synthParams.releaseSeconds}
          />
        </div>
      </div>

      {/* Timbre / Harmonic Mix */}
      <div className="rounded-xl border border-paper-200/10 bg-paper-50/[0.03] p-3 sm:rounded-2xl sm:p-4">
        <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.22em] text-sage-400 sm:mb-4 sm:text-[0.65rem] sm:tracking-[0.26em]">
          Timbre — Harmonic Mix
        </p>
        <div className="flex justify-center gap-3 sm:gap-8">
          <RotaryKnob
            accentColor="#bfd0b0"
            label="Fundamental"
            max={1}
            min={0}
            onChange={(v) => {
              updateHarmonicMix(0, v);
            }}
            step={0.01}
            value={synthParams.harmonicMix[0]}
          />
          <RotaryKnob
            accentColor="#bfd0b0"
            label="2nd Harmonic"
            max={0.8}
            min={0}
            onChange={(v) => {
              updateHarmonicMix(1, v);
            }}
            step={0.01}
            value={synthParams.harmonicMix[1]}
          />
          <RotaryKnob
            accentColor="#bfd0b0"
            label="3rd Harmonic"
            max={0.5}
            min={0}
            onChange={(v) => {
              updateHarmonicMix(2, v);
            }}
            step={0.01}
            value={synthParams.harmonicMix[2]}
          />
        </div>
      </div>
    </div>
  );
};
