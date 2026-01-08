import { describe, expect, it, vi, beforeEach } from "vitest";
import { processNote } from "./process-note";

// Mock dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    note_chunks: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/lib/chunk-text", () => ({
  chunkText: vi.fn(),
}));

vi.mock("@/lib/generate-embedding", () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock("@/lib/vector-utils", () => ({
  embeddingToVectorString: vi.fn((arr) => `[${arr.join(",")}]`),
  validateEmbedding: vi.fn(),
}));

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { generateText } from "ai";
import { chunkText } from "@/lib/chunk-text";
import { generateEmbedding } from "@/lib/generate-embedding";

describe("processNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates summary and saves it immediately", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "This is the full content of the note.",
      summary: null,
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockSummary = "This is a generated summary.";
    const mockChunks = [
      { content: "This is", index: 0 },
      { content: "the full", index: 1 },
      { content: "content", index: 2 },
    ];
    const mockEmbeddings = [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
      [0.7, 0.8, 0.9],
    ];

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(generateText).mockResolvedValue({ text: mockSummary } as never);
    vi.mocked(chunkText).mockResolvedValue(mockChunks as never);
    mockEmbeddings.forEach((emb, idx) => {
      vi.mocked(generateEmbedding)
        .mockResolvedValueOnce(emb)
        .mockResolvedValueOnce(emb);
    });
    vi.mocked(database.notes.update).mockResolvedValue({
      ...mockNote,
      summary: mockSummary,
    } as never);
    vi.mocked(database.$transaction).mockImplementation(async (fn) => {
      return fn({
        $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
      } as never);
    });

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe(mockSummary);
      expect(result.data.chunksCount).toBe(3);
    }

    // Verify summary is saved immediately (outside transaction)
    expect(database.notes.update).toHaveBeenCalledWith({
      where: { id: "note-456" },
      data: { summary: mockSummary },
    });

    // Verify chunks are processed
    expect(chunkText).toHaveBeenCalledWith(mockNote.content);
    expect(generateEmbedding).toHaveBeenCalledTimes(3);
  });

  it("returns already processed note without reprocessing", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: "Existing summary",
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(5);

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alreadyProcessed).toBe(true);
      expect(result.data.summary).toBe("Existing summary");
      expect(result.data.chunksCount).toBe(5);
    }

    // Should not regenerate summary or chunks
    expect(generateText).not.toHaveBeenCalled();
    expect(chunkText).not.toHaveBeenCalled();
  });

  it("returns error when note not found", async () => {
    const mockUser = { id: "user-123" };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(null);

    const result = await processNote({ note_id: "non-existent" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Note not found");
  });

  it("returns error when user doesn't own the note", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: null,
      user_id: "different-user",
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("handles empty chunks gracefully", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Very short",
      summary: null,
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockSummary = "Summary";
    const mockChunks = [{ content: "Very short", index: 0 }];

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(generateText).mockResolvedValue({ text: mockSummary } as never);
    vi.mocked(chunkText).mockResolvedValue(mockChunks as never);
    vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3] as never);
    vi.mocked(database.notes.update).mockResolvedValue({
      ...mockNote,
      summary: mockSummary,
    } as never);
    vi.mocked(database.$transaction).mockImplementation(async (fn) => {
      return fn({
        $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
      } as never);
    });

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chunksCount).toBe(1);
    }
  });

  it("returns error when summary generation fails", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: null,
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockError = new Error("AI generation failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(generateText).mockRejectedValue(mockError);

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("AI generation failed");
  });

  it("returns error when embedding generation fails", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: null,
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockSummary = "Summary";
    const mockChunks = [{ content: "Content", index: 0 }];
    const mockError = new Error("Embedding generation failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(generateText).mockResolvedValue({ text: mockSummary } as never);
    vi.mocked(chunkText).mockResolvedValue(mockChunks as never);
    vi.mocked(generateEmbedding).mockRejectedValue(mockError);
    vi.mocked(database.notes.update).mockResolvedValue({
      ...mockNote,
      summary: mockSummary,
    } as never);

    const result = await processNote({ note_id: "note-456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Embedding generation failed");
  });

  it("returns error for invalid note_id format", async () => {
    const result = await processNote({ note_id: "invalid-uuid" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid note ID");
  });
});

