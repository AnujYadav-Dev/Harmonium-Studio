"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

import {
  HarmoniumHero,
  HarmoniumInstrumentPanel,
  KeyboardLegend,
  OctaveShiftControls,
} from "@/features/harmonium/components";

const AudioVisualizer = dynamic(
  () => import("@/features/harmonium/components/AudioVisualizer").then((mod) => mod.AudioVisualizer),
  { ssr: false }
);

const DroneStopsPanel = dynamic(
  () => import("@/features/harmonium/components/DroneStopsPanel").then((mod) => mod.DroneStopsPanel),
  { ssr: false }
);

const ManualSequencePanel = dynamic(
  () => import("@/features/harmonium/components/ManualSequencePanel").then((mod) => mod.ManualSequencePanel),
  { ssr: false }
);

const SynthControlPanel = dynamic(
  () => import("@/features/harmonium/components/SynthControlPanel").then((mod) => mod.SynthControlPanel),
  { ssr: false }
);
import { KEYBOARD_NOTES } from "@/features/harmonium/data";
import { useHarmonium, useManualSequence } from "@/features/harmonium/hooks";
import { DRONE_NOTES } from "@/features/harmonium/data";
import { useGlobalKeyboardListeners } from "@/hooks/useGlobalKeyboardListeners";

/**
 * The core orchestrator component for the Harmonium Studio experience.
 */
export const HarmoniumStudio = () => {
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

  useGlobalKeyboardListeners({
    activeKeys,
    playNote,
    stopNote,
  });

  const handleTilePressStart = useCallback((keyboardKey: string) => {
    void playNote(keyboardKey);
  }, [playNote]);

  const handleTilePressEnd = useCallback((keyboardKey: string) => {
    stopNote(keyboardKey);
  }, [stopNote]);

  const handleToggleDrone = useCallback((droneId: string) => {
    void toggleDrone(droneId);
  }, [toggleDrone]);

  return (
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
  );
};
