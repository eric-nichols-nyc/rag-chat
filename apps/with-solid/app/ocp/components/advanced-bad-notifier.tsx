"use client";

import { Card, CardContent } from "@repo/design-system/components/ui/card";

/**
 * ❌ BAD: Must modify this component to add new notification types
 */
type Notification = {
  type: "email" | "sms" | "push";
  message: string;
  recipient: string;
};

export const AdvancedBadNotifier = () => {
  const notifications: Notification[] = [
    { type: "email", message: "Welcome!", recipient: "user@example.com" },
    { type: "sms", message: "Your code is 1234", recipient: "+1234567890" },
    { type: "push", message: "New message", recipient: "device-id-123" },
  ];

  const sendNotification = (notification: Notification) => {
    // Must modify this function to add new types
    switch (notification.type) {
      case "email":
        console.log(`Sending email to ${notification.recipient}: ${notification.message}`);
        // Email sending logic
        break;
      case "sms":
        console.log(`Sending SMS to ${notification.recipient}: ${notification.message}`);
        // SMS sending logic
        break;
      case "push":
        console.log(`Sending push to ${notification.recipient}: ${notification.message}`);
        // Push notification logic
        break;
      default:
        throw new Error("Unknown notification type");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.map((notif, idx) => (
          <div key={idx} className="p-3 border rounded">
            <p className="text-sm font-medium">{notif.type.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">{notif.message}</p>
            <button
              className="mt-2 text-xs text-primary hover:underline"
              onClick={() => sendNotification(notif)}
            >
              Send
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

