"use client";

import { useEffect, useState } from "react";

import {
  HarmoniumHero,
  HarmoniumInstrumentPanel,
  KeyboardLegend,
  ManualSequencePanel,
} from "@/features/harmonium/components";
import { KEYBOARD_NOTES } from "@/features/harmonium/constants";
import { useHarmonium, useManualSequence } from "@/features/harmonium/hooks";
import { isEditableTarget } from "@/features/harmonium/lib";

/**
 * Renders the playable harmonium experience and keyboard listeners.
 */
export default function Page() {
  const { activeKeys, playNote, stopNote } = useHarmonium();
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

  return (
    <main className="min-h-screen bg-ink-950 text-paper-50">
      <section className="mx-auto flex min-h-screen max-w-[96rem] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
        <HarmoniumHero />
        <HarmoniumInstrumentPanel
          activeKeys={activeKeys}
          keyboardView={keyboardView}
          layoutMode={layoutMode}
          onKeyboardViewChange={setKeyboardView}
          onLayoutModeChange={setLayoutMode}
          onTilePressEnd={handleTilePressEnd}
          onTilePressStart={handleTilePressStart}
        />
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
