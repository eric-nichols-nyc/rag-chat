"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";

export async function getNotes() {
  try {
    const { user } = await neonAuth();

    const notes = await database.notes.findMany({
      where: user ? { user_id: user.id } : undefined,
      orderBy: {
        updated_at: "desc",
      },
    });

    return { success: true, data: notes };
  } catch (error) {
    console.error("Error fetching notes:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
}
