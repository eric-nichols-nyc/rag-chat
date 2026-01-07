"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

const summarySchema = z.object({
  text: z.string().min(1, "Text is required").max(100_000, "Text is too long"),
});

export async function generateSummary(input: { text: string }) {
  try {
    // Validate input
    const validatedInput = summarySchema.parse(input);

    if (validatedInput.text.trim().length === 0) {
      return {
        success: false,
        error: "Text cannot be empty",
      };
    }

    // Generate summary using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a helpful assistant that creates clear, comprehensive summaries of long text.
Your summaries should:
- Capture the main points and key information
- Be concise but complete
- Maintain the original meaning and context
- Use clear, readable language
- Be structured with proper paragraphs for readability`,
      prompt: `Please provide a comprehensive summary of the following text:\n\n${validatedInput.text}`,
    });

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error("Error generating summary:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid input",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate summary",
    };
  }
}
