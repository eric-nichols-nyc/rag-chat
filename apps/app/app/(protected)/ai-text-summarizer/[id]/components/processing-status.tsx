"use client";

import { cn } from "@repo/design-system/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type ProcessingStatusProps = {
  hasSummary: boolean;
  chunksCount: number;
  embeddingsCount: number;
  isProcessing?: boolean;
};

type StatusItem = {
  label: string;
  completed: boolean;
  inProgress: boolean;
};

export function ProcessingStatus({
  hasSummary,
  chunksCount,
  embeddingsCount,
  isProcessing = false,
}: ProcessingStatusProps) {
  const statusItems: StatusItem[] = [
    {
      label: "Generating summary",
      completed: hasSummary,
      inProgress: isProcessing && !hasSummary,
    },
    {
      label: "Creating text chunks",
      completed: chunksCount > 0,
      inProgress: isProcessing && hasSummary && chunksCount === 0,
    },
    {
      label: "Generating embeddings",
      completed: embeddingsCount > 0 && embeddingsCount === chunksCount,
      inProgress:
        isProcessing && chunksCount > 0 && embeddingsCount < chunksCount,
    },
  ];

  const allCompleted = statusItems.every((item) => item.completed);

  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-sm">Processing Status</h3>
      <div className="space-y-2">
        {statusItems.map((item) => {
          let Icon = Circle;
          if (item.completed) {
            Icon = CheckCircle2;
          } else if (item.inProgress) {
            Icon = Loader2;
          }

          return (
            <div className="flex items-center gap-2 text-sm" key={item.label}>
              <Icon
                className={cn(
                  "size-4",
                  !!item.completed && "text-green-600",
                  !!item.inProgress && "animate-spin text-blue-600",
                  !!(item.completed || item.inProgress) === false &&
                    "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  !!item.completed && "text-green-600",
                  !!item.inProgress && "text-blue-600",
                  !!(item.completed || item.inProgress) === false &&
                    "text-muted-foreground"
                )}
              >
                {item.label}
                {!!item.completed && item.label === "Creating text chunks" && (
                  <span className="ml-1">({chunksCount} chunks)</span>
                )}
                {!!item.completed && item.label === "Generating embeddings" && (
                  <span className="ml-1">
                    ({embeddingsCount}/{chunksCount})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {!!allCompleted && (
        <p className="mt-2 text-muted-foreground text-xs">
          All processing complete! You can now use the chatbot.
        </p>
      )}
    </div>
  );
}
