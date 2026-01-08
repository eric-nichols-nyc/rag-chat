import { Skeleton } from "@repo/design-system/components/ui/skeleton";

type NoteSummaryProps = {
  summary: string | null;
};

export function NoteSummary({ summary }: NoteSummaryProps) {
  if (!summary) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
    </div>
  );
}
