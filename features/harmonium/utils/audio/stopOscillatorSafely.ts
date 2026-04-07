/**
 * Stops an oscillator safely even if it has already been scheduled to stop.
 */
export const stopOscillatorSafely = (
  oscillator: OscillatorNode,
  stopTime?: number,
) => {
  try {
    if (typeof stopTime === "number") {
      oscillator.stop(stopTime);
      return;
    }

    oscillator.stop();
  } catch {
    // Ignore duplicate stop calls during cleanup.
  }
};
