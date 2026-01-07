import { authApiHandler } from "@neondatabase/neon-js/auth/next";

// authApiHandler() automatically reads from NEON_AUTH_BASE_URL environment variable
// Make sure to set this in your .env.local file:
// NEON_AUTH_BASE_URL=https://your-neon-auth-url.neon.tech
export const { GET, POST } = authApiHandler();
