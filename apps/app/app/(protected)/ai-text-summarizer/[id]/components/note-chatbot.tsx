"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Loader2, Send, Bot, User } from "lucide-react";
import { useState, useTransition } from "react";
import { chatWithNote } from "@/actions/chat-with-note";
import { cn } from "@repo/design-system/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  chunksUsed?: number;
};

type NoteChatbotProps = {
  noteId: string;
  isProcessingComplete: boolean;
};

export function NoteChatbot({
  noteId,
  isProcessingComplete,
}: NoteChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const sendMessage = async () => {
    if (!input.trim() || isPending || !isProcessingComplete) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");

    startTransition(async () => {
      const result = await chatWithNote({
        note_id: noteId,
        question: currentInput,
      });

      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.data.answer,
          chunksUsed: result.data.chunksUsed,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.error || "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Ask Questions</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          {isProcessingComplete
            ? "Ask questions about the document, and I'll use RAG to find relevant sections."
            : "Processing in progress... The chatbot will be available once embeddings are generated."}
        </p>

        <div className="space-y-4">
          <div className="flex h-[300px] flex-col space-y-4 overflow-y-auto rounded-md border bg-muted/30 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No messages yet. Ask a question to get started!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Bot className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                    {message.role === "assistant" && message.chunksUsed && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Used {message.chunksUsed} relevant section
                        {message.chunksUsed !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <User className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))
            )}
            {isPending && (
              <div className="flex gap-3">
                <Bot className="mt-1 size-5 shrink-0 text-muted-foreground" />
                <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              disabled={isPending || !isProcessingComplete}
              onKeyDown={handleKeyPress}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isProcessingComplete
                  ? "Ask a question about the document..."
                  : "Processing in progress..."
              }
              value={input}
            />
            <Button
              disabled={isPending || !input.trim() || !isProcessingComplete}
              onClick={sendMessage}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

