"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";

/**
 * Ensures a user exists in the database.
 * This should be called when a user first signs in or creates their first note.
 * The user ID comes from Neon Auth.
 */
export async function ensureUserExists() {
  try {
    const { user } = await neonAuth();

    if (!user) {
      return { success: false as const, error: "Not authenticated" };
    }

    // Check if user already exists
    const existingUser = await database.users.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (existingUser) {
      return { success: true as const, data: { user: existingUser } };
    }

    // Create user if they don't exist
    const newUser = await database.users.create({
      data: {
        id: user.id,
      },
      select: { id: true, created_at: true },
    });

    return { success: true as const, data: { user: newUser } };
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to sync user",
    };
  }
}

