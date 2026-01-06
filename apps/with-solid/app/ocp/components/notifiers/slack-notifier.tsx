"use client";

type SlackNotifierProps = {
  message: string;
  recipient: string;
};

/**
 * ✅ NEW: Added without modifying existing notifiers
 */
export function SlackNotifier({ message, recipient }: SlackNotifierProps) {
  const send = () => {
    console.log(`Sending Slack message to ${recipient}: ${message}`);
  };

  return (
    <div className="p-3 border rounded">
      <p className="text-sm font-medium">SLACK</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        className="mt-2 text-xs text-primary hover:underline"
        onClick={send}
      >
        Send
      </button>
    </div>
  );
}

