"use client";

import { createAuthClient } from "@neondatabase/neon-js/auth/next";

// For Next.js, createAuthClient() automatically reads from NEXT_PUBLIC_NEON_AUTH_URL
// Make sure to set this in your .env.local file
export const authClient = createAuthClient();
