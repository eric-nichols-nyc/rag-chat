import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () => {
  try {
    return createEnv({
      server: {
        DATABASE_URL: z.url(),
      },
      runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is required but not set. Please set it in your .env file."
      );
    }
    if (error instanceof Error) {
      throw new Error(
        `Failed to validate DATABASE_URL environment variable: ${error.message}. Please ensure DATABASE_URL is a valid URL.`
      );
    }
    throw error;
  }
};
