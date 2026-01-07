"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { generateSummary } from "@/actions/generate-summary";

const MAX_LENGTH = 100_000;

export function SummarizerTextarea() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      const result = await generateSummary({ text });

      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setError(result.error || "Failed to generate summary");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = text.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          className="min-h-[400px] resize-y"
          disabled={isLoading}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder="Paste or type your text here..."
          value={text}
        />
        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={isLoading || !text.trim()}
            onClick={handleGenerateSummary}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Summary
              </>
            )}
          </Button>
          <div className="flex justify-end">
            <p className="text-muted-foreground text-sm">
              {characterCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </p>
          </div>
        </div>
        {error !== null && <p className="text-destructive text-sm">{error}</p>}
      </div>
      {summary !== "" && (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Summary</h2>
          <div className="rounded-lg border bg-card p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
