"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { z } from "zod";
import { database } from "@repo/prisma-neon";
import { chunkText } from "@/lib/chunk-text";
import { generateEmbedding } from "@/lib/generate-embedding";
import { embeddingToVectorString, validateEmbedding } from "@/lib/vector-utils";

const processNoteSchema = z.object({
  note_id: z.string().uuid("Invalid note ID"),
});

export async function processNote(input: { note_id: string }) {
  try {
    const validatedInput = processNoteSchema.parse(input);
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

    // Check if already processed
    if (note.summary) {
      const chunksCount = await database.note_chunks.count({
        where: { note_id: validatedInput.note_id },
      });

      if (chunksCount > 0) {
        return {
          success: true as const,
          data: {
            summary: note.summary,
            chunksCount,
            alreadyProcessed: true,
          },
        };
      }
    }

    // Step 1: Generate summary and save immediately (so it appears in UI right away)
    const { text: summary } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a helpful assistant that creates clear, comprehensive summaries of long text.
Your summaries should:
- Capture the main points and key information
- Be concise but complete
- Maintain the original meaning and context
- Use clear, readable language
- Be structured with proper paragraphs for readability`,
      prompt: `Please provide a comprehensive summary of the following text:\n\n${note.content}`,
    });

    // Save summary immediately so it appears in the UI while chunks are being processed
    await database.notes.update({
      where: { id: validatedInput.note_id },
      data: { summary },
    });

    // Step 2: Chunk the text
    const chunks = await chunkText(note.content);

    // Step 3: Generate embeddings for all chunks (this takes time)
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        // Generate embedding for each chunk
        const embedding = await generateEmbedding(chunk.content);
        validateEmbedding(embedding);
        const embeddingString = embeddingToVectorString(embedding);

        return {
          note_id: validatedInput.note_id,
          content: chunk.content,
          chunk_index: chunk.index,
          embedding: embeddingString,
        };
      })
    );

    // Step 4: Save chunks with embeddings in a separate transaction
    await database.$transaction(
      async (tx) => {
        // Insert chunks with vector embeddings using raw SQL
        // Prisma doesn't support Unsupported("vector") type, so we bypass it completely
        for (const chunkData of chunksWithEmbeddings) {
          // Escape single quotes in content for SQL
          const escapedContent = chunkData.content.replace(/'/g, "''");
          // Embedding string is already formatted as [0.1,0.2,...] so we can use it directly
          await tx.$executeRawUnsafe(
            `INSERT INTO note_chunks (note_id, content, chunk_index, embedding)
             VALUES ('${chunkData.note_id}'::uuid, '${escapedContent}'::text, ${chunkData.chunk_index}, '${chunkData.embedding}'::vector)`
          );
        }
      },
      {
        timeout: 10_000, // 10 seconds timeout for transaction
      }
    );

    const result = {
      summary,
      chunksCount: chunksWithEmbeddings.length,
    };

    return {
      success: true as const,
      data: {
        summary: result.summary,
        chunksCount: result.chunksCount,
        alreadyProcessed: false,
      },
    };
  } catch (error) {
    console.error("Error processing note:", error);

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
        error instanceof Error ? error.message : "Failed to process note",
    };
  }
}

