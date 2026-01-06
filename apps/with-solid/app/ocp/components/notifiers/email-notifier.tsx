"use client";

type EmailNotifierProps = {
  message: string;
  recipient: string;
};

export function EmailNotifier({ message, recipient }: EmailNotifierProps) {
  const send = () => {
    console.log(`Sending email to ${recipient}: ${message}`);
  };

  return (
    <div className="p-3 border rounded">
      <p className="text-sm font-medium">EMAIL</p>
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

