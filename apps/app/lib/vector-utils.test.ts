import { describe, expect, it } from "vitest";
import { embeddingToVectorString, validateEmbedding } from "./vector-utils";

describe("embeddingToVectorString", () => {
  it("converts embedding array to pgvector format", () => {
    const embedding = [0.1, 0.2, 0.3];
    const result = embeddingToVectorString(embedding);

    expect(result).toBe("[0.1,0.2,0.3]");
  });

  it("handles negative numbers", () => {
    const embedding = [-0.1, 0.2, -0.3];
    const result = embeddingToVectorString(embedding);

    expect(result).toBe("[-0.1,0.2,-0.3]");
  });

  it("handles large embedding arrays", () => {
    const embedding = Array.from({ length: 1536 }, (_, i) => i * 0.001);
    const result = embeddingToVectorString(embedding);

    expect(result).toContain("[0,");
    expect(result).toContain("1.535");
    expect(result.split(",").length).toBe(1536);
  });

  it("handles decimal numbers with many places", () => {
    const embedding = [0.123456789, -0.987654321];
    const result = embeddingToVectorString(embedding);

    expect(result).toBe("[0.123456789,-0.987654321]");
  });
});

describe("validateEmbedding", () => {
  it("does not throw for valid embedding", () => {
    const embedding = [0.1, 0.2, 0.3];

    expect(() => validateEmbedding(embedding)).not.toThrow();
  });

  it("throws for empty array", () => {
    const embedding: number[] = [];

    expect(() => validateEmbedding(embedding)).toThrow("Embedding cannot be empty");
  });

  it("throws for null", () => {
    const embedding = null as unknown as number[];

    expect(() => validateEmbedding(embedding)).toThrow("Embedding cannot be empty");
  });

  it("throws for undefined", () => {
    const embedding = undefined as unknown as number[];

    expect(() => validateEmbedding(embedding)).toThrow("Embedding cannot be empty");
  });
});

