import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export type TextChunk = {
  content: string;
  index: number;
};

/**
 * Splits text into semantically meaningful chunks for RAG storage.
 * Uses LangChain's RecursiveCharacterTextSplitter with configuration:
 * - Chunk size: 1000 characters
 * - Chunk overlap: 200 characters
 * - Splits on paragraphs, sentences, then words
 */
export async function chunkText(text: string): Promise<TextChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const chunks = await splitter.splitText(text);

  // Ensure chunks is an array
  if (!Array.isArray(chunks)) {
    throw new Error("splitText did not return an array");
  }

  return chunks.map((content, index) => ({
    content,
    index,
  }));
}
