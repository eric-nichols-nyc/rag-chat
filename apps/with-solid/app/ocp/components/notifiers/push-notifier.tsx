"use client";

type PushNotifierProps = {
  message: string;
  recipient: string;
};

export function PushNotifier({ message, recipient }: PushNotifierProps) {
  const send = () => {
    console.log(`Sending push to ${recipient}: ${message}`);
  };

  return (
    <div className="p-3 border rounded">
      <p className="text-sm font-medium">PUSH</p>
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

