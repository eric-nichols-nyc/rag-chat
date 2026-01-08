/**
 * Converts an embedding array to pgvector string format.
 * @param embedding - Array of numbers representing the embedding vector
 * @returns String in pgvector format: '[0.1,0.2,0.3,...]'
 */
export function embeddingToVectorString(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Validates that an embedding array is not empty.
 * @param embedding - Array of numbers to validate
 * @throws Error if embedding is empty
 */
export function validateEmbedding(embedding: number[]): void {
  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding cannot be empty");
  }
}
