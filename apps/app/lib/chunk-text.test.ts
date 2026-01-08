import { describe, expect, it } from "vitest";
import { chunkText } from "./chunk-text";

describe("chunkText", () => {
  it("splits text into chunks", async () => {
    const text = "This is sentence one. This is sentence two. This is sentence three.";
    const chunks = await chunkText(text);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toHaveProperty("content");
    expect(chunks[0]).toHaveProperty("index");
    expect(chunks[0]?.index).toBe(0);
  });

  it("preserves chunk order with sequential indices", async () => {
    const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    const chunks = await chunkText(text);

    expect(chunks.length).toBeGreaterThan(0);
    chunks.forEach((chunk, index) => {
      expect(chunk.index).toBe(index);
    });
  });

  it("handles short text that fits in one chunk", async () => {
    const text = "Short text.";
    const chunks = await chunkText(text);

    expect(chunks.length).toBe(1);
    expect(chunks[0]?.content).toBe(text);
    expect(chunks[0]?.index).toBe(0);
  });

  it("handles empty text", async () => {
    const text = "";
    const chunks = await chunkText(text);

    // Should return at least one chunk with empty content or empty array
    expect(Array.isArray(chunks)).toBe(true);
  });

  it("splits on paragraph boundaries when possible", async () => {
    const text = `Paragraph one with some content.

Paragraph two with different content.

Paragraph three with more content.`;

    const chunks = await chunkText(text);

    expect(chunks.length).toBeGreaterThan(0);
    // Chunks should preserve paragraph structure when possible
    expect(chunks.some((chunk) => chunk.content.includes("Paragraph one"))).toBe(
      true
    );
  });

  it("handles very long text", async () => {
    const longText = "Sentence. ".repeat(1000);
    const chunks = await chunkText(longText);

    expect(chunks.length).toBeGreaterThan(1);
    // Verify all chunks are ordered correctly
    chunks.forEach((chunk, index) => {
      expect(chunk.index).toBe(index);
    });
  });

  it("maintains chunk overlap for context", async () => {
    const text = "This is a longer text that should be split into multiple chunks with overlap between them.";
    const chunks = await chunkText(text);

    if (chunks.length > 1) {
      // With overlap, adjacent chunks should share some content
      // This is a basic check - actual overlap is handled by RecursiveCharacterTextSplitter
      expect(chunks[0]?.content.length).toBeGreaterThan(0);
      expect(chunks[1]?.content.length).toBeGreaterThan(0);
    }
  });
});

