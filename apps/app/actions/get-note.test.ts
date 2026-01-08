import { describe, expect, it, vi, beforeEach } from "vitest";
import { getNote } from "./get-note";

// Mock dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      findUnique: vi.fn(),
    },
    note_chunks: {
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";

describe("getNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns note with processing status", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: "Summary",
      user_id: "user-123",
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(5);
    vi.mocked(database.$queryRaw).mockResolvedValue([{ count: 5n }] as never);

    const result = await getNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toEqual(mockNote);
      expect(result.data.chunksCount).toBe(5);
      expect(result.data.embeddingsCount).toBe(5);
      expect(result.data.isProcessed).toBe(true);
      expect(result.data.hasEmbeddings).toBe(true);
    }
  });

  it("returns correct status for unprocessed note", async () => {
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

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(database.$queryRaw).mockResolvedValue([{ count: 0n }] as never);

    const result = await getNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isProcessed).toBe(false);
      expect(result.data.hasEmbeddings).toBe(false);
    }
  });

  it("returns error when note not found", async () => {
    const mockUser = { id: "user-123" };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(null);

    const result = await getNote({ note_id: "non-existent" });

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

    const result = await getNote({ note_id: "note-456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("allows access for unauthenticated user to note with null user_id", async () => {
    const mockNote = {
      id: "note-456",
      title: "Test Note",
      content: "Content",
      summary: null,
      user_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: null } as never);
    vi.mocked(database.notes.findUnique).mockResolvedValue(mockNote as never);
    vi.mocked(database.note_chunks.count).mockResolvedValue(0);
    vi.mocked(database.$queryRaw).mockResolvedValue([{ count: 0n }] as never);

    const result = await getNote({ note_id: "note-456" });

    expect(result.success).toBe(true);
  });

  it("returns error for invalid note_id format", async () => {
    const result = await getNote({ note_id: "invalid-uuid" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid note ID");
  });

  it("returns error when database query fails", async () => {
    const mockUser = { id: "user-123" };
    const mockError = new Error("Database connection failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.findUnique).mockRejectedValue(mockError);

    const result = await getNote({ note_id: "note-456" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Database connection failed");
  });
});

