"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { z } from "zod";
import { database } from "@repo/prisma-neon";

const getNoteSchema = z.object({
  note_id: z.string().uuid("Invalid note ID"),
});

export async function getNote(input: { note_id: string }) {
  try {
    const validatedInput = getNoteSchema.parse(input);
    const { user } = await neonAuth();

    // Fetch the note
    const note = await database.notes.findUnique({
      where: { id: validatedInput.note_id },
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

    // Count chunks and check if they have embeddings
    const chunksCount = await database.note_chunks.count({
      where: { note_id: validatedInput.note_id },
    });

    // Check if any chunks have embeddings (checking for non-null embedding)
    const chunksWithEmbeddings = await database.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::bigint as count
      FROM note_chunks
      WHERE note_id = ${validatedInput.note_id}::uuid
        AND embedding IS NOT NULL
    `;

    const embeddingsCount = Number(chunksWithEmbeddings[0]?.count || 0);

    return {
      success: true as const,
      data: {
        note,
        chunksCount,
        embeddingsCount,
        isProcessed: !!note.summary && chunksCount > 0,
        hasEmbeddings: embeddingsCount > 0,
      },
    };
  } catch (error) {
    console.error("Error fetching note:", error);

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
        error instanceof Error ? error.message : "Failed to fetch note",
    };
  }
}

