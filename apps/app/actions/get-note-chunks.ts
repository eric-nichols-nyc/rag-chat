"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { z } from "zod";
import { database } from "@repo/prisma-neon";

const getNoteChunksSchema = z.object({
  note_id: z.string().uuid("Invalid note ID"),
});

export async function getNoteChunks(input: { note_id: string }) {
  try {
    const validatedInput = getNoteChunksSchema.parse(input);
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

    // Fetch chunks ordered by chunk_index
    const chunks = await database.note_chunks.findMany({
      where: { note_id: validatedInput.note_id },
      orderBy: { chunk_index: "asc" },
      select: {
        id: true,
        content: true,
        chunk_index: true,
        embedding: true,
        created_at: true,
      },
    });

    return {
      success: true as const,
      data: chunks,
    };
  } catch (error) {
    console.error("Error fetching note chunks:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false as const,
        error: firstError?.message || "Invalid input",
      };
    }

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch note chunks",
    };
  }
}
