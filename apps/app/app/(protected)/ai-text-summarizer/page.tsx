import { SummarizerTextarea } from "./components/summarizer-textarea";

export default function AiTextSummarizerPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">AI Text Summarizer</h1>
        <p className="text-muted-foreground text-sm">
          Paste your text below and we&apos;ll create a summary and enable AI-powered
          chat about it.
        </p>
      </div>
      <SummarizerTextarea />
    </div>
  );
}

