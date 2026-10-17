import Link from "next/link";
export default function NotFound() {
  return (
    <main className="p-16">
      <h1 className="display text-4xl">This engagement isn't here.</h1>
      <Link href="/" className="mt-8 inline-block underline">
        Back to engagements
      </Link>
    </main>
  );
}
