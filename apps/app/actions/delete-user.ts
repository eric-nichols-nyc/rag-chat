"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { database } from "@repo/prisma-neon";
import { z } from "zod";

const deleteUserSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
});

export async function deleteUser(input: { user_id: string }) {
  try {
    const validatedInput = deleteUserSchema.parse(input);
    const { user } = await neonAuth();

    // Only allow admins or users deleting themselves
    // For now, we'll allow users to delete themselves
    // You can add admin check here if needed
    if (user && user.id !== validatedInput.user_id) {
      return {
        success: false as const,
        error: "Unauthorized - you can only delete your own account",
      };
    }

    // Check if user exists in our database
    const userRecord = await database.users.findUnique({
      where: { id: validatedInput.user_id },
      select: { id: true },
    });

    if (!userRecord) {
      return {
        success: false as const,
        error: "User not found",
      };
    }

    // Mark user as deleted in Neon Auth (soft delete)
    // Neon Auth uses the neon_auth.users_sync table with a deleted_at column
    // Setting deleted_at marks the user as deleted in Neon Auth
    try {
      await database.$executeRaw`
        UPDATE neon_auth.users_sync
        SET deleted_at = NOW()
        WHERE id = ${validatedInput.user_id}::uuid
          AND deleted_at IS NULL
      `;
    } catch (error) {
      // If the table doesn't exist or there's an error, log it but continue
      // This allows the deletion to proceed even if Neon Auth sync table isn't available
      console.warn(
        "Could not update neon_auth.users_sync (user may not exist in sync table):",
        error instanceof Error ? error.message : "Unknown error",
      );
      // Note: This is not a fatal error - the user might not be in the sync table yet
      // or Neon Auth might handle deletions differently
    }

    // Delete from our database - this will cascade to:
    // 1. All notes owned by the user (via onDelete: Cascade)
    // 2. All chunks for those notes (via existing cascade from notes -> chunks)
    await database.users.delete({
      where: { id: validatedInput.user_id },
    });

    return {
      success: true as const,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false as const,
        error: firstError?.message || "Invalid input",
      };
    }

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

