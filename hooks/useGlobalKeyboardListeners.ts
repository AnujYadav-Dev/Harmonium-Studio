import { useEffect } from "react";

import { isEditableTarget } from "@/lib/utils";

interface UseGlobalKeyboardListenersProps {
  activeKeys: Set<string>;
  playNote: (key: string) => void;
  stopNote: (key: string) => void;
}

/**
 * Attaches global keyboard event listeners to trigger harmonium notes,
 * safely ignoring events when the user is typing in generic form inputs.
 */
export const useGlobalKeyboardListeners = ({
  activeKeys,
  playNote,
  stopNote,
}: UseGlobalKeyboardListenersProps) => {
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
};
