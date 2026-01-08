import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await neonAuth();

  // If user is not logged in, redirect to sign-in page
  if (!user) {
    redirect("/auth/sign-in");
  }

  // If user is logged in, redirect to the main app page
  redirect("/ai-text-summarizer");
}
