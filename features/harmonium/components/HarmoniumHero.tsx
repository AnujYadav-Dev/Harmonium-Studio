/**
 * Introductory copy and high-level range stats for the harmonium page.
 */
export const HarmoniumHero = () => {
  return (
    <header className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
      <div className="space-y-5">
        <p className="font-body text-xs uppercase tracking-[0.34em] text-sage-400">
          Browser Harmonium
        </p>
        <div className="space-y-4">
          <h1 className="max-w-4xl font-display text-[1.7rem] leading-[0.95] text-paper-50 min-[360px]:text-4xl min-[420px]:text-5xl sm:text-6xl xl:text-7xl">
            A minimal desktop harmonium tuned for the keyboard under your hands.
          </h1>
          <p className="max-w-2xl font-body text-sm leading-6 text-paper-300 sm:text-base sm:leading-7 lg:text-lg">
            Press the mapped keys to shape air-driven harmonium tones with a soft
            attack, long release, and subtle motion in both sound and interface.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-paper-200/10 bg-paper-50/5 p-4 shadow-panel backdrop-blur sm:rounded-[2rem] sm:p-6">
        <p className="font-body text-xs uppercase tracking-[0.28em] text-sage-400">
          Playing Range
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-display text-2xl text-paper-50 sm:text-3xl">C2-A#5</p>
            <p className="mt-1 font-body text-sm leading-6 text-paper-300">
              Nearly four chromatic octaves across the printable keyboard.
            </p>
          </div>
          <div>
            <p className="font-display text-2xl text-paper-50 sm:text-3xl">47 keys</p>
            <p className="mt-1 font-body text-sm leading-6 text-paper-300">
              Numbers, letters, and punctuation all participate in the map.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
