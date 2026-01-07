import { describe, expect, it, vi, beforeEach } from "vitest";
import { getNotes } from "../get-notes";

// Mock the dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      findMany: vi.fn(),
    },
  },
}));

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";

describe("getNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success with notes when user is authenticated", async () => {
    const mockUser = { id: "user-123" };
    const mockNotes = [
      {
        id: 1,
        title: "Test Note 1",
        content: "Content 1",
        user_id: "user-123",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Test Note 2",
        content: "Content 2",
        user_id: "user-123",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(database.notes.findMany).mockResolvedValue(mockNotes as any);

    const result = await getNotes();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockNotes);
    expect(neonAuth).toHaveBeenCalledOnce();
    expect(database.notes.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
      orderBy: {
        updated_at: "desc",
      },
    });
  });

  it("returns success with empty array when no notes found", async () => {
    const mockUser = { id: "user-123" };

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(database.notes.findMany).mockResolvedValue([]);

    const result = await getNotes();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(database.notes.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
      orderBy: {
        updated_at: "desc",
      },
    });
  });

  it("returns success with all notes when user is not authenticated", async () => {
    const mockNotes = [
      {
        id: 1,
        title: "Public Note",
        content: "Content",
        user_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(neonAuth).mockResolvedValue({ user: null } as any);
    vi.mocked(database.notes.findMany).mockResolvedValue(mockNotes as any);

    const result = await getNotes();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockNotes);
    expect(database.notes.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: {
        updated_at: "desc",
      },
    });
  });

  it("returns error when database query fails", async () => {
    const mockUser = { id: "user-123" };
    const mockError = new Error("Database connection failed");

    vi.mocked(neonAuth).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(database.notes.findMany).mockRejectedValue(mockError);

    const result = await getNotes();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Database connection failed");
  });

  it("returns error when authentication fails", async () => {
    const mockError = new Error("Authentication failed");

    vi.mocked(neonAuth).mockRejectedValue(mockError);

    const result = await getNotes();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Authentication failed");
  });
});

