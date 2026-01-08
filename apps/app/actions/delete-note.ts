"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { z } from "zod";

const deleteNoteSchema = z.object({
  note_id: z.string().uuid("Invalid note ID"),
});

export async function deleteNote(input: { note_id: string }) {
  try {
    const validatedInput = deleteNoteSchema.parse(input);
    const { user } = await neonAuth();

    // First verify the note exists and user has access
    const note = await database.notes.findUnique({
      where: { id: validatedInput.note_id },
      select: { id: true, user_id: true },
    });

    if (!note) {
      return {
        success: false as const,
        error: "Note not found",
      };
    }

    // Verify user owns the note (if authenticated)
    if (user && note.user_id && note.user_id !== user.id) {
      return {
        success: false as const,
        error: "Unauthorized",
      };
    }

    // Delete the note - chunks will be automatically deleted via cascade
    await database.notes.delete({
      where: { id: validatedInput.note_id },
    });

    return {
      success: true as const,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting note:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false as const,
        error: firstError?.message || "Invalid input",
      };
    }

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}
