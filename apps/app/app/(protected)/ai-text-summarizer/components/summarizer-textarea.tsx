"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { createNote } from "@/actions/create-note";

const MAX_LENGTH = 100_000;

export function SummarizerTextarea() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setError(null);

    startTransition(() => {
      createNote({ text })
        .then((createNoteResult) => {
          if (!createNoteResult.success) {
            setError(createNoteResult.error || "Failed to create note");
          }
          // If successful, createNote will redirect, so we don't need to handle success here
        })
        .catch((err) => {
          console.error("Error creating note:", err);
          setError("Failed to create note");
        });
    });
  };

  const characterCount = text.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          className="min-h-[400px] resize-y"
          disabled={isPending}
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
            disabled={isPending || !text.trim()}
            onClick={handleSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Create Note & Summarize
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
    </div>
  );
}

