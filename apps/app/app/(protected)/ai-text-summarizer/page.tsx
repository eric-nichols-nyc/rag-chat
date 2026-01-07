"use client";

import { Navbar } from "@/components/navbar";
import { SummarizerTextarea } from "./components/summarizer-textarea";

export default function AiTextSummarizer() {
  return (
    <div className="p-4">
      <h1 className="mb-2 font-bold text-2xl">AI Text Summarizer</h1>
      <p className="mb-6 text-muted-foreground">
        Generate clear, comprehensive summaries of long text in seconds.
      </p>
      <div className="mb-6">
        <Navbar />
      </div>
      <SummarizerTextarea />
    </div>
  );
}
