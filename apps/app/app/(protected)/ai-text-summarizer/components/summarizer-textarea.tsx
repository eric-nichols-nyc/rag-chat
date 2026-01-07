"use client";

import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useState } from "react";

const MAX_LENGTH = 100_000;

export function SummarizerTextarea() {
  const [characterCount, setCharacterCount] = useState(0);

  return (
    <div className="space-y-2">
      <Textarea
        className="min-h-[400px] resize-y"
        maxLength={MAX_LENGTH}
        onChange={(e) => setCharacterCount(e.target.value.length)}
        placeholder="Paste or type your text here..."
      />
      <div className="flex justify-end">
        <p className="text-muted-foreground text-sm">
          {characterCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
