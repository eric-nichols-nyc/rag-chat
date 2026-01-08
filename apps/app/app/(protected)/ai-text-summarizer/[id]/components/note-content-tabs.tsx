"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import { NoteOriginalText } from "./note-original-text";
import { NoteSummary } from "./note-summary";

type NoteContentTabsProps = {
  content: string;
  summary: string | null;
};

export function NoteContentTabs({ content, summary }: NoteContentTabsProps) {
  return (
    <Tabs className="lg:col-span-2" defaultValue="original">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="original">Original Text</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="original">
        <NoteOriginalText content={content} />
      </TabsContent>
      <TabsContent className="mt-4" value="summary">
        <NoteSummary summary={summary} />
      </TabsContent>
    </Tabs>
  );
}

