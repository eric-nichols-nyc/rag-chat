"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { redirect } from "next/navigation";
import { z } from "zod";

const createNoteSchema = z.object({
  text: z.string().min(1, "Text is required").max(100_000, "Text is too long"),
  title: z.string().optional(),
});

/**
 * Generates a title from the first sentence/paragraph of text.
 * Truncates to max 200 characters and cleans whitespace.
 */
function generateTitle(text: string, maxLength = 200): string {
  // Try to extract first paragraph or first sentence
  const firstParagraph = text.split("\n\n")[0]?.trim() || text.trim();
  // biome-ignore lint/performance/useTopLevelRegex: Regex is used infrequently, inline is acceptable
  const firstSentence = firstParagraph.split(/[.!?]/)[0]?.trim();

  // Use first sentence if it exists and is reasonable, otherwise first paragraph
  const titleText =
    firstSentence && firstSentence.length <= maxLength
      ? firstSentence
      : firstParagraph;

  // Clean up and truncate
  const cleaned = titleText.replace(/\s+/g, " ").trim().slice(0, maxLength);

  // If we truncated, remove trailing incomplete words
  if (cleaned.length === maxLength && titleText.length > maxLength) {
    const lastSpace = cleaned.lastIndexOf(" ");
    return lastSpace > 0 ? cleaned.slice(0, lastSpace) : cleaned;
  }

  return cleaned || "Untitled Note";
}

export async function createNote(input: { text: string; title?: string }) {
  try {
    const validatedInput = createNoteSchema.parse(input);

    if (validatedInput.text.trim().length === 0) {
      return {
        success: false as const,
        error: "Text cannot be empty",
      };
    }

    const { user } = await neonAuth();

    // User should already be synced via the protected layout
    // But we'll ensure they exist here as a safety check
    if (!user) {
      return {
        success: false as const,
        error: "You must be logged in to create a note",
      };
    }

    // Generate title from text if not provided
    const title =
      validatedInput.title?.trim() || generateTitle(validatedInput.text);

    // Create note in database
    const note = await database.notes.create({
      data: {
        title,
        content: validatedInput.text,
        user_id: user?.id || null,
        source_type: "text",
        tags: ["text"], // Tag text notes for easy filtering
        summary: null, // Will be populated later
      },
    });

    // Redirect to the note detail page
    redirect(`/ai-text-summarizer/${note.id}`);
  } catch (error) {
    console.error("Error creating note:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false as const,
        error: firstError?.message || "Invalid input",
      };
    }

    // If it's a redirect error, rethrow it (Next.js redirect throws)
    // Also handle mocked redirects in tests that throw Error with "REDIRECT:" message
    if (
      (error && typeof error === "object" && "digest" in error) ||
      (error instanceof Error && error.message.startsWith("REDIRECT:"))
    ) {
      throw error;
    }

    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create note",
    };
  }
}
