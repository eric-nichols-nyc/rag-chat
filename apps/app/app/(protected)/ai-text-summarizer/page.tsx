import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { getNotes } from "@/actions/get-notes";
import { SummarizerTextarea } from "./components/summarizer-textarea";

export default async function AiTextSummarizerPage() {
  const notesResult = await getNotes(); // Get all notes (no tag filter)

  // Debug: log the full result
  console.log("getNotes result:", JSON.stringify(notesResult, null, 2));

  // Debug: log success or error
  if (notesResult.success) {
    console.log("Notes count:", notesResult.data.notes.length);
    console.log("Notes:", notesResult.data.notes);
  } else {
    console.error("getNotes error:", notesResult.error);
  }

  const notes = notesResult.success ? notesResult.data.notes : [];
  const error = notesResult.success ? null : notesResult.error;

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      {/* Header and Textarea */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">AI Text Summarizer</h1>
          <p className="text-muted-foreground text-sm">
            Paste your text below and we&apos;ll create a summary and enable
            AI-powered chat about it.
          </p>
        </div>
        <SummarizerTextarea />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl">Your Notes</h2>
          {notes.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {notes.length} note{notes.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {error !== null && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 size-12 text-destructive" />
              <p className="text-center text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!error && notes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 size-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No notes yet. Paste some text above to create your first note.
              </p>
            </CardContent>
          </Card>
        )}

        {!error && notes.length > 0 && (
          <div className="flex gap-2">
            {notes.map((note) => {
              const isProcessed = !!note.summary;
              const createdAt = note.created_at
                ? new Date(note.created_at).toLocaleDateString()
                : "Unknown date";

              return (
                <Link
                  className="flex"
                  href={`/ai-text-summarizer/${note.id}`}
                  key={note.id}
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="line-clamp-1 text-base">
                          {note.title}
                        </CardTitle>
                        <Badge
                          className="shrink-0"
                          variant={isProcessed ? "default" : "secondary"}
                        >
                          {isProcessed ? (
                            <>
                              <CheckCircle className="mr-1 size-3" />
                              Processed
                            </>
                          ) : (
                            <>
                              <Loader2 className="mr-1 size-3 animate-spin" />
                              Processing
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="size-3" />
                        {createdAt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-muted-foreground text-sm">
                        {note.summary || `${note.content.slice(0, 200)}...`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
