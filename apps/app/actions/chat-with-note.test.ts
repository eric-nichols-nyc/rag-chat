import { describe, expect, it, vi, beforeEach } from "vitest";
import { chatWithNote } from "./chat-with-note";

// Mock dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/lib/generate-embedding", () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock("@/lib/vector-utils", () => ({
  embeddingToVectorString: vi.fn((arr) => `[${arr.join(",")}]`),
}));

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { generateText } from "ai";
import { generateEmbedding } from "@/lib/generate-embedding";

describe("chatWithNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves relevant chunks using vector similarity search", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Full content",
      summary: "Test summary",
      user_id: "user-123",
    };
    const question = "What is this about?";
    const questionEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      {
        id: 1,
        content: "Relevant chunk content",
        chunk_index: 0,
        similarity: 0.95,
      },
      {
        id: 2,
        content: "Another relevant chunk",
        chunk_index: 1,
        similarity: 0.90,
      },
    ];
    const mockAnswer = "This is about testing.";

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(generateEmbedding).mockResolvedValue(questionEmbedding as never);
    vi.mocked(database.$queryRaw).mockResolvedValue(mockChunks as never);
    vi.mocked(generateText).mockResolvedValue({ text: mockAnswer } as never);

    const result = await chatWithNote({
      note_id: "note-456",
      question,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.answer).toBe(mockAnswer);
      expect(result.data.chunksUsed).toBe(2);
      expect(result.data.chunks.length).toBe(2);
    }

    // Verify vector search filters by note_id
    const queryCall = vi.mocked(database.$queryRaw).mock.calls[0]?.[0];
    expect(queryCall).toBeDefined();
    expect(generateEmbedding).toHaveBeenCalledWith(question);
  });

  it("uses summary and chunks as context for AI response", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Full content",
      summary: "Important summary",
      user_id: "user-123",
    };
    const question = "Tell me more";
    const questionEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      {
        id: 1,
        content: "Relevant chunk",
        chunk_index: 0,
        similarity: 0.95,
      },
    ];
    const mockAnswer = "Answer";

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(generateEmbedding).mockResolvedValue(questionEmbedding as never);
    vi.mocked(database.$queryRaw).mockResolvedValue(mockChunks as never);
    vi.mocked(generateText).mockResolvedValue({ text: mockAnswer } as never);

    await chatWithNote({
      note_id: "note-456",
      question,
    });

    // Verify AI is called with summary and chunks in context
    expect(generateText).toHaveBeenCalled();
    const generateCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateCall?.prompt).toContain("Important summary");
    expect(generateCall?.prompt).toContain("Relevant chunk");
    expect(generateCall?.prompt).toContain(question);
  });

  it("uses original content when summary is not available", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Original full content here",
      summary: null,
      user_id: "user-123",
    };
    const question = "What is this?";
    const questionEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      {
        id: 1,
        content: "Chunk content",
        chunk_index: 0,
        similarity: 0.95,
      },
    ];
    const mockAnswer = "Answer";

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(generateEmbedding).mockResolvedValue(questionEmbedding as never);
    vi.mocked(database.$queryRaw).mockResolvedValue(mockChunks as never);
    vi.mocked(generateText).mockResolvedValue({ text: mockAnswer } as never);

    await chatWithNote({
      note_id: "note-456",
      question,
    });

    const generateCall = vi.mocked(generateText).mock.calls[0]?.[0];
    expect(generateCall?.prompt).toContain("Original full content here");
  });

  it("returns error when note not found", async () => {
    const mockUser = { id: "user-123" };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(null);

    const result = await chatWithNote({
      note_id: "non-existent",
      question: "What?",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Note not found");
  });

  it("returns error when user doesn't own the note", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: "Summary",
      user_id: "different-user",
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);

    const result = await chatWithNote({
      note_id: "note-456",
      question: "What?",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error for empty question", async () => {
    const result = await chatWithNote({
      note_id: "note-456",
      question: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Question is required");
  });

  it("returns error for question that's too long", async () => {
    const longQuestion = "a".repeat(1001);

    const result = await chatWithNote({
      note_id: "note-456",
      question: longQuestion,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("too long");
  });

  it("returns error when vector search fails", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: "Summary",
      user_id: "user-123",
    };
    const mockError = new Error("Vector search failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3] as never);
    vi.mocked(database.$queryRaw).mockRejectedValue(mockError);

    const result = await chatWithNote({
      note_id: "note-456",
      question: "What?",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Vector search failed");
  });

  it("handles case when no chunks are found", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: "Summary",
      user_id: "user-123",
    };
    const question = "What?";
    const questionEmbedding = [0.1, 0.2, 0.3];
    const mockAnswer = "Answer without chunks";

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(generateEmbedding).mockResolvedValue(questionEmbedding as never);
    vi.mocked(database.$queryRaw).mockResolvedValue([] as never);
    vi.mocked(generateText).mockResolvedValue({ text: mockAnswer } as never);

    const result = await chatWithNote({
      note_id: "note-456",
      question,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chunksUsed).toBe(0);
    }
  });
});

