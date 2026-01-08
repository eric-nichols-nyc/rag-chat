import { describe, expect, it, vi } from "vitest";
import { deleteNote } from "./delete-note";

// Mock dependencies
vi.mock("@neondatabase/neon-js/auth/next/server", () => ({
  neonAuth: vi.fn(),
}));

vi.mock("@repo/prisma-neon", () => ({
  database: {
    notes: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("deleteNote", () => {
  it("should be a function", () => {
    expect(typeof deleteNote).toBe("function");
  });
});
