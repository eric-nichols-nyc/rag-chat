import { Button } from "@repo/design-system/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote } from "@/actions/get-note";
import { processNote } from "@/actions/process-note";
import { NoteChatbot } from "./components/note-chatbot";
import { PollingWrapper } from "./components/polling-wrapper";
import { ProcessingStatus } from "./components/processing-status";

type TextSummaryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TextSummaryPage({
  params,
}: TextSummaryPageProps) {
  const { id } = await params;

  // Fetch the note
  const noteResult = await getNote({ note_id: id });

  if (!noteResult.success) {
    notFound();
  }

  if (!noteResult.data) {
    notFound();
  }

  const { note, chunksCount, embeddingsCount, isProcessed, hasEmbeddings } =
    noteResult.data;

  // Trigger processing if not already processed
  const isMissingSummary = !isProcessed;
  const isMissingEmbeddings = !hasEmbeddings;
  if (isMissingSummary || isMissingEmbeddings) {
    // Process in the background (fire and forget)
    // In a real app, you might want to use a background job queue
    processNote({ note_id: id }).catch((error) => {
      console.error("Error processing note:", error);
    });
  }

  const hasAllEmbeddings = embeddingsCount === chunksCount;
  const allStepsComplete = isProcessed && hasEmbeddings && hasAllEmbeddings;
  const isProcessingComplete = Boolean(allStepsComplete);

  return (
    <PollingWrapper isProcessing={!isProcessingComplete} noteId={id}>
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/ai-text-summarizer">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="mb-2 font-bold text-2xl">{note.title}</h1>
            <p className="text-muted-foreground text-sm">
              Created:{" "}
              {new Date(note.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <ProcessingStatus
          chunksCount={chunksCount}
          embeddingsCount={embeddingsCount}
          hasSummary={!!note.summary}
          isProcessing={!isProcessingComplete}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="mb-2 font-semibold text-lg">Original Text</h2>
            <div className="rounded-lg border bg-card p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {note.content}
              </p>
            </div>
          </div>

          {note.summary ? (
            <div className="lg:col-span-1">
              <h2 className="mb-2 font-semibold text-lg">Summary</h2>
              <div className="rounded-lg border bg-card p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {note.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-1" />
          )}

          <div className="lg:col-span-1">
            <NoteChatbot
              isProcessingComplete={isProcessingComplete}
              noteId={id}
            />
          </div>
        </div>
      </div>
    </PollingWrapper>
  );
}

