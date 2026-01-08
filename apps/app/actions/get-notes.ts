"use server";

import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { z } from "zod";
import { database } from "@repo/prisma-neon";

const getNotesSchema = z.object({
  tag: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export async function getNotes(input?: {
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const validatedInput = getNotesSchema.parse(input || {});
    const { user } = await neonAuth();

    // Require authentication - only get notes for the current user
    if (!user) {
      return {
        success: false as const,
        error: "Unauthorized - must be logged in to view notes",
      };
    }

    // Build where clause (only notes created from text)
    const where: {
      user_id: string;
      source_type: string;
      tags?: { has: string };
    } = {
      user_id: user.id,
      source_type: "text",
    };

    // If tag is specified, filter by tag
    if (validatedInput.tag) {
      where.tags = { has: validatedInput.tag };
    }

    // Fetch notes
    const notes = await database.notes.findMany({
      where,
      orderBy: { updated_at: "desc" },
      take: validatedInput.limit,
      skip: validatedInput.offset,
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        tags: true,
        source_type: true,
        source_id: true,
        file_url: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Get total count for pagination
    const totalCount = await database.notes.count({
      where,
    });

    return {
      success: true as const,
      data: {
        notes,
        totalCount,
        limit: validatedInput.limit,
        offset: validatedInput.offset,
        hasMore: validatedInput.offset + notes.length < totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching notes:", error);

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
        error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
}

