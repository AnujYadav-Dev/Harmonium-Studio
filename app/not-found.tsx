/**
 * Fallback route for unknown pages in the App Router.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-paper-50">
      <div className="rounded-[2rem] border border-paper-200/10 bg-paper-50/5 p-8 text-center shadow-panel backdrop-blur">
        <p className="font-body text-xs uppercase tracking-[0.32em] text-sage-400">
          Not Found
        </p>
        <h1 className="mt-3 font-display text-4xl text-paper-50">Page not found</h1>
        <p className="mt-3 max-w-md font-body text-sm leading-6 text-paper-300">
          The page you requested does not exist. Return to the harmonium and keep
          playing.
        </p>
      </div>
    </main>
  );
}
