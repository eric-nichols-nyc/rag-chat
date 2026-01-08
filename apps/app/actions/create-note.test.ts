import { describe, expect, it, vi, beforeEach } from "vitest";
import { createNote } from "./create-note";

// Mock dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { redirect } from "next/navigation";

describe("createNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates note with auto-generated title and redirects", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-456",
      title: "First sentence of the text",
      content: "First sentence of the text. Rest of the content here.",
      user_id: "user-123",
      source_type: "text",
      summary: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.create).mockResolvedValue(mockNote as never);

    await expect(
      createNote({ text: "First sentence of the text. Rest of the content here." })
    ).rejects.toThrow("REDIRECT:/ai-text-summarizer/note-456");

    expect(database.notes.create).toHaveBeenCalledWith({
      data: {
        title: "First sentence of the text",
        content: "First sentence of the text. Rest of the content here.",
        user_id: "user-123",
        source_type: "text",
        summary: null,
      },
    });
    expect(redirect).toHaveBeenCalledWith("/ai-text-summarizer/note-456");
  });

  it("creates note with user-provided title", async () => {
    const mockUser = { id: "user-123" };
    const mockNote = {
      id: "note-789",
      title: "Custom Title",
      content: "Some content",
      user_id: "user-123",
      source_type: "text",
      summary: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.create).mockResolvedValue(mockNote as never);

    await expect(
      createNote({ text: "Some content", title: "Custom Title" })
    ).rejects.toThrow("REDIRECT:/ai-text-summarizer/note-789");

    expect(database.notes.create).toHaveBeenCalledWith({
      data: {
        title: "Custom Title",
        content: "Some content",
        user_id: "user-123",
        source_type: "text",
        summary: null,
      },
    });
  });

  it("creates note with null user_id when not authenticated", async () => {
    const mockNote = {
      id: "note-999",
      title: "Title",
      content: "Content",
      user_id: null,
      source_type: "text",
      summary: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: null } as never);
    vi.mocked(database.notes.create).mockResolvedValue(mockNote as never);

    await expect(createNote({ text: "Content" })).rejects.toThrow(
      "REDIRECT:/ai-text-summarizer/note-999"
    );

    expect(database.notes.create).toHaveBeenCalledWith({
      data: {
        title: expect.any(String),
        content: "Content",
        user_id: null,
        source_type: "text",
        summary: null,
      },
    });
  });

  it("returns error for empty text", async () => {
    const result = await createNote({ text: "" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Text cannot be empty");
    expect(database.notes.create).not.toHaveBeenCalled();
  });

  it("returns error for text that's too long", async () => {
    const longText = "a".repeat(100_001);

    const result = await createNote({ text: longText });

    expect(result.success).toBe(false);
    expect(result.error).toContain("too long");
    expect(database.notes.create).not.toHaveBeenCalled();
  });

  it("truncates title if first sentence is too long", async () => {
    const mockUser = { id: "user-123" };
    const longFirstSentence = "a".repeat(300);
    const mockNote = {
      id: "note-trunc",
      title: expect.any(String),
      content: longFirstSentence + " Rest of content.",
      user_id: "user-123",
      source_type: "text",
      summary: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.create).mockResolvedValue(mockNote as never);

    await expect(
      createNote({ text: longFirstSentence + " Rest of content." })
    ).rejects.toThrow();

    const createCall = vi.mocked(database.notes.create).mock.calls[0]?.[0];
    expect(createCall?.data?.title.length).toBeLessThanOrEqual(200);
  });

  it("returns error when database create fails", async () => {
    const mockUser = { id: "user-123" };
    const mockError = new Error("Database connection failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as never);
    vi.mocked(database.notes.create).mockRejectedValue(mockError);

    const result = await createNote({ text: "Some content" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Database connection failed");
  });

  it("returns error when authentication fails", async () => {
    const mockError = new Error("Authentication failed");

    vi.mocked(neonAuth).mockRejectedValue(mockError);

    const result = await createNote({ text: "Some content" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Authentication failed");
  });
});

