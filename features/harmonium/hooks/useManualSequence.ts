"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { KEYBOARD_MAP } from "@/features/harmonium/constants";

const MANUAL_NOTE_DURATION_MS = 320;
const MANUAL_GAP_DURATION_MS = 40;

interface UseManualSequenceOptions {
  playNote: (keyboardKey: string) => Promise<void>;
  stopNote: (keyboardKey: string) => void;
}

/**
 * Parses and plays a comma-separated manual sequence of keyboard bindings.
 */
export const useManualSequence = ({
  playNote,
  stopNote,
}: UseManualSequenceOptions) => {
  const [manualKeyInput, setManualKeyInput] = useState<string>("");
  const [manualPlaybackKey, setManualPlaybackKey] = useState<string | null>(null);
  const [isManualSequencePlaying, setIsManualSequencePlaying] = useState<boolean>(false);
  const playbackTimeoutsRef = useRef<number[]>([]);
  const manualPlaybackKeyRef = useRef<string | null>(null);

  const parsedManualSequence = useMemo(() => {
    return manualKeyInput
      .split(",")
      .map((keyValue) => keyValue.trim().toLowerCase())
      .filter((keyValue) => keyValue.length > 0 && Boolean(KEYBOARD_MAP[keyValue]));
  }, [manualKeyInput]);

  const parsedManualPreviewKeys = useMemo(() => {
    return parsedManualSequence.filter((keyValue, index) => {
      return parsedManualSequence.indexOf(keyValue) === index;
    });
  }, [parsedManualSequence]);

  useEffect(() => {
    manualPlaybackKeyRef.current = manualPlaybackKey;
  }, [manualPlaybackKey]);

  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      playbackTimeoutsRef.current = [];

      if (manualPlaybackKeyRef.current !== null) {
        stopNote(manualPlaybackKeyRef.current);
      }
    };
  }, [stopNote]);

  const stopManualSequence = () => {
    playbackTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    playbackTimeoutsRef.current = [];

    if (manualPlaybackKeyRef.current !== null) {
      stopNote(manualPlaybackKeyRef.current);
    }

    setManualPlaybackKey(null);
    setIsManualSequencePlaying(false);
  };

  const handleManualPlay = () => {
    stopManualSequence();
    setIsManualSequencePlaying(true);

    parsedManualSequence.forEach((keyboardKey, index) => {
      const noteStartTime =
        index * (MANUAL_NOTE_DURATION_MS + MANUAL_GAP_DURATION_MS);
      const noteStopTime = noteStartTime + MANUAL_NOTE_DURATION_MS;

      const startTimeoutId = window.setTimeout(() => {
        if (
          manualPlaybackKeyRef.current !== null &&
          manualPlaybackKeyRef.current !== keyboardKey
        ) {
          stopNote(manualPlaybackKeyRef.current);
        }

        setManualPlaybackKey(keyboardKey);
        void playNote(keyboardKey);
      }, noteStartTime);

      const stopTimeoutId = window.setTimeout(() => {
        stopNote(keyboardKey);
        setManualPlaybackKey((currentKey) => {
          return currentKey === keyboardKey ? null : currentKey;
        });
      }, noteStopTime);

      playbackTimeoutsRef.current.push(startTimeoutId, stopTimeoutId);
    });

    const finalCleanupTimeoutId = window.setTimeout(() => {
      setManualPlaybackKey(null);
      setIsManualSequencePlaying(false);
      playbackTimeoutsRef.current = [];
    }, parsedManualSequence.length * (MANUAL_NOTE_DURATION_MS + MANUAL_GAP_DURATION_MS));

    playbackTimeoutsRef.current.push(finalCleanupTimeoutId);
  };

  return {
    isManualSequencePlaying,
    manualKeyInput,
    manualPlaybackKey,
    parsedManualPreviewKeys,
    parsedManualSequence,
    setManualKeyInput,
    stopManualSequence,
    handleManualPlay,
  };
};
