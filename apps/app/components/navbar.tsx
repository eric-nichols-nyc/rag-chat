"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ButtonGroup } from "@repo/design-system/components/ui/button-group";
import { cn } from "@repo/design-system/lib/utils";
import { Link2, Paperclip, Play, Type, Video, Waves } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type ContentType = "youtube" | "video" | "audio" | "files" | "webpage" | "text";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Map routes to button types
  const routeMap: Record<string, ContentType> = {
    "/notes": "youtube", // Default for notes page
    "/ai-text-summarizer": "text",
    // Add more routes as they're created:
    // "/youtube": "youtube",
    // "/video": "video",
    // "/audio": "audio",
    // "/files": "files",
    // "/webpage": "webpage",
  };

  const buttons = [
    {
      type: "youtube" as ContentType,
      label: "YouTube",
      icon: Play,
      route: "/notes", // Default route for now
    },
    {
      type: "video" as ContentType,
      label: "Video",
      icon: Video,
      route: "/notes", // Placeholder
    },
    {
      type: "audio" as ContentType,
      label: "Audio",
      icon: Waves,
      route: "/notes", // Placeholder
    },
    {
      type: "files" as ContentType,
      label: "PDF, Image & More Files",
      icon: Paperclip,
      route: "/notes", // Placeholder
    },
    {
      type: "webpage" as ContentType,
      label: "Webpage",
      icon: Link2,
      route: "/notes", // Placeholder
    },
    {
      type: "text" as ContentType,
      label: "Long Text",
      icon: Type,
      route: "/ai-text-summarizer",
    },
  ] as const;

  // Determine active button based on current route
  const activeType = routeMap[pathname] || "youtube";

  return (
    <ButtonGroup className="w-full" orientation="horizontal">
      {buttons.map(({ type, label, icon: Icon, route }, index) => {
        const isActive = activeType === type;
        const isLast = index === buttons.length - 1;
        const isDisabled = !isLast;
        const handleClick = () => {
          if (isDisabled) {
            return;
          }
          router.push(route);
        };
        return (
          <Button
            className={cn(
              "flex items-center gap-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            )}
            disabled={isDisabled}
            key={type}
            onClick={handleClick}
            variant={isActive ? "default" : "outline"}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
