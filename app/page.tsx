"use client";

import { useEffect, useState } from "react";

import {
  AudioVisualizer,
  DroneStopsPanel,
  HarmoniumHero,
  HarmoniumInstrumentPanel,
  KeyboardLegend,
  ManualSequencePanel,
  OctaveShiftControls,
  SynthControlPanel,
} from "@/features/harmonium/components";
import { KEYBOARD_NOTES } from "@/features/harmonium/constants";
import { useHarmonium, useManualSequence } from "@/features/harmonium/hooks";
import { DRONE_NOTES } from "@/features/harmonium/lib/audio";
import { isEditableTarget } from "@/features/harmonium/lib";

/**
 * Renders the playable harmonium experience and keyboard listeners.
 */
export default function Page() {
  const {
    activeKeys,
    synthParams,
    octaveShift,
    activeDrones,
    analyserNode,
    playNote,
    stopNote,
    setSynthParams,
    setOctaveShift,
    toggleDrone,
  } = useHarmonium();

  const [keyboardView, setKeyboardView] = useState<"grid" | "harmonium">("grid");
  const [layoutMode, setLayoutMode] = useState<"full" | "compact">("full");

  const {
    isManualSequencePlaying,
    manualKeyInput,
    parsedManualPreviewKeys,
    parsedManualSequence,
    setManualKeyInput,
    stopManualSequence,
    handleManualPlay,
  } = useManualSequence({
    playNote,
    stopNote,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      void playNote(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      stopNote(event.key);
    };

    const handleWindowBlur = () => {
      activeKeys.forEach((keyboardKey) => {
        stopNote(keyboardKey);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeKeys, playNote, stopNote]);

  const handleTilePressStart = (keyboardKey: string) => {
    void playNote(keyboardKey);
  };

  const handleTilePressEnd = (keyboardKey: string) => {
    stopNote(keyboardKey);
  };

  const handleToggleDrone = (droneId: string) => {
    void toggleDrone(droneId);
  };

  return (
    <main className="min-h-screen bg-ink-950 text-paper-50">
      <section className="mx-auto flex min-h-screen max-w-[96rem] flex-col gap-5 px-3 py-4 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-10 lg:py-12">
        <HarmoniumHero />
        <AudioVisualizer analyserNode={analyserNode} />

        {/* Instrument keys directly below the visualizer */}
        <HarmoniumInstrumentPanel
          activeKeys={activeKeys}
          keyboardView={keyboardView}
          layoutMode={layoutMode}
          onKeyboardViewChange={setKeyboardView}
          onLayoutModeChange={setLayoutMode}
          onTilePressEnd={handleTilePressEnd}
          onTilePressStart={handleTilePressStart}
        />

        {/* Sound Engine Controls */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SynthControlPanel
            onSynthParamsChange={setSynthParams}
            synthParams={synthParams}
          />
          <div className="flex flex-col gap-5 sm:gap-6">
            <DroneStopsPanel
              activeDrones={activeDrones}
              drones={DRONE_NOTES}
              onToggleDrone={handleToggleDrone}
            />
            <OctaveShiftControls
              octaveShift={octaveShift}
              onOctaveShiftChange={setOctaveShift}
            />
          </div>
        </div>

        <ManualSequencePanel
          isManualSequencePlaying={isManualSequencePlaying}
          manualKeyInput={manualKeyInput}
          onManualKeyInputChange={setManualKeyInput}
          onPlay={handleManualPlay}
          onStop={stopManualSequence}
          parsedManualPreviewKeys={parsedManualPreviewKeys}
          parsedManualSequenceLength={parsedManualSequence.length}
        />
        <KeyboardLegend activeKeys={activeKeys} notes={KEYBOARD_NOTES} />
      </section>
    </main>
  );
}
