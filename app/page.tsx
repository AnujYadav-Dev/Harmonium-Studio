"use client";

import { HarmoniumStudio } from "@/features/harmonium/components/HarmoniumStudio";

/**
 * Renders the playable harmonium experience.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-ink-950 text-paper-50">
      <HarmoniumStudio />
    </main>
  );
}
