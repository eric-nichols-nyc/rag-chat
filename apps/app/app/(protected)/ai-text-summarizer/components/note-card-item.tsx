"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { CarouselItem } from "@repo/design-system/components/ui/carousel";
import { CheckCircle, Clock, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteNote } from "@/actions/delete-note";

type Note = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  created_at: Date | string | null;
};

type NoteCardItemProps = {
  note: Note;
};

export function NoteCardItem({ note }: NoteCardItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isProcessed = !!note.summary;
  const createdAt = note.created_at
    ? new Date(note.created_at).toLocaleDateString()
    : "Unknown date";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      const result = await deleteNote({ note_id: note.id });

      if (result.success) {
        // Refresh the page to update the notes list
        router.refresh();
      } else {
        console.error("Failed to delete note:", result.error);
        setIsDeleting(false);
        // Show error dialog or toast here if needed
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setIsDeleting(false);
    }
  };

  return (
    <CarouselItem className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3">
      <div className="relative">
        <Link href={`/ai-text-summarizer/${note.id}`}>
          <Card className="border-2 border-border transition-colors hover:bg-muted/50">
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
        <Button
          aria-label="Delete note"
          className="absolute right-2 bottom-2 z-10 size-7 hover:bg-destructive/10 hover:text-destructive"
          disabled={isDeleting}
          onClick={handleDeleteClick}
          size="icon-sm"
          variant="ghost"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone and will permanently delete the note and all its chunks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CarouselItem>
  );
}
