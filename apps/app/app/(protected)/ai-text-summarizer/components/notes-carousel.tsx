"use client";

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@repo/design-system/components/ui/carousel";
import { NoteCardItem } from "./note-card-item";

type Note = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  created_at: Date | string | null;
};

type NotesCarouselProps = {
  notes: Note[];
};

export function NotesCarousel({ notes }: NotesCarouselProps) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {notes.map((note) => (
          <NoteCardItem key={note.id} note={note} />
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
