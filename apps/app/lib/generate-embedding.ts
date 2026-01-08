import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generates an embedding vector for the given text using OpenAI's embedding model.
 * @param text - The text to generate an embedding for
 * @returns A promise that resolves to an array of numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text,
    });

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate embedding"
    );
  }
}
