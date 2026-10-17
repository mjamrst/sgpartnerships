export default function Loading() {
  return (
    <main className="p-12 animate-pulse">
      <div className="h-4 w-40 bg-muted rounded" />
      <div className="mt-8 h-12 w-96 max-w-full bg-muted rounded" />
      <div className="mt-12 h-80 bg-muted rounded-xl" />
      <p className="mt-5 text-sm text-muted-foreground">
        Loading your workspace…
      </p>
    </main>
  );
}
