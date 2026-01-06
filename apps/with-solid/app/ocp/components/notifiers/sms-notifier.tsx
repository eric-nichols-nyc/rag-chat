"use client";

type SmsNotifierProps = {
  message: string;
  recipient: string;
};

export function SmsNotifier({ message, recipient }: SmsNotifierProps) {
  const send = () => {
    console.log(`Sending SMS to ${recipient}: ${message}`);
  };

  return (
    <div className="p-3 border rounded">
      <p className="text-sm font-medium">SMS</p>
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

