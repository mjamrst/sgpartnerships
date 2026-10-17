"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg p-12">
      <h1 className="display text-3xl">We couldn't load this workspace.</h1>
      <p className="my-6 text-muted-foreground">
        Check the database connection and try again. Your saved work is still
        there.
      </p>
      <button
        className="rounded-lg bg-primary px-5 py-3 text-white"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
