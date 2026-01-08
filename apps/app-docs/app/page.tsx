import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          RAG Chat Documentation
        </h1>
        <p className="text-center mb-8 text-muted-foreground">
          Documentation for the RAG Chat Application - AI Text Summarizer with
          Note Processing
        </p>
        <div className="flex justify-center">
          <Link
            href="/docs"
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            View Documentation →
          </Link>
        </div>
      </div>
    </main>
  );
}
