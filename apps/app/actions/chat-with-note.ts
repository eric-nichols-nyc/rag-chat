"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { z } from "zod";
import { database } from "@repo/prisma-neon";
import { generateEmbedding } from "@/lib/generate-embedding";
import { embeddingToVectorString } from "@/lib/vector-utils";

const chatWithNoteSchema = z.object({
  note_id: z.string().uuid("Invalid note ID"),
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question is too long"),
});

type ChunkResult = {
  id: number;
  content: string;
  chunk_index: number;
  similarity: number;
};

export async function chatWithNote(input: {
  note_id: string;
  question: string;
}) {
  try {
    const validatedInput = chatWithNoteSchema.parse(input);
    const { user } = await neonAuth();

    // Fetch the note to verify access
    const note = await database.notes.findUnique({
      where: { id: validatedInput.note_id },
      select: {
        id: true,
        user_id: true,
        summary: true,
        content: true,
        title: true,
      },
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

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(validatedInput.question);
    const embeddingString = embeddingToVectorString(questionEmbedding);

    // Perform vector similarity search using Prisma $queryRaw
    const chunks = await database.$queryRaw<ChunkResult[]>`
      SELECT
        id,
        content,
        chunk_index,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM note_chunks
      WHERE note_id = ${validatedInput.note_id}::uuid
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT 5
    `;

    // Build context from top chunks and summary
    const topChunks = chunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Get top 5 most similar chunks

    const chunksContext = topChunks
      .map((chunk, idx) => `[Chunk ${chunk.chunk_index + 1}]: ${chunk.content}`)
      .join("\n\n");

    const context = note.summary
      ? `Summary: ${note.summary}\n\nRelevant sections:\n${chunksContext}`
      : `Original text:\n${note.content}\n\nRelevant sections:\n${chunksContext}`;

    // Generate response using AI
    const { text: answer } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a helpful assistant that answers questions about a specific document or text.
You have access to a summary and relevant sections from the document.
Answer the user's question based on the provided context.
If the answer is not in the context, say so clearly.
Be concise but complete, and cite which chunks you're using when relevant.`,
      prompt: `Document Title: ${note.title}

${context}

User Question: ${validatedInput.question}

Please provide a helpful answer based on the context above.`,
    });

    return {
      success: true as const,
      data: {
        answer,
        chunksUsed: topChunks.length,
        chunks: topChunks.map((chunk) => ({
          index: chunk.chunk_index,
          similarity: chunk.similarity,
          preview: chunk.content.slice(0, 100) + "...",
        })),
      },
    };
  } catch (error) {
    console.error("Error in chat with note:", error);

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
          : "Failed to process chat request",
    };
  }
}

