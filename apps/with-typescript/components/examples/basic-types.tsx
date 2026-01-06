"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";

export const BasicTypesExamples = () => {
  const examples = {
    string: "Hello, TypeScript!",
    number: 42,
    boolean: true,
    array: [1, 2, 3],
    object: { name: "John", age: 30 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Type Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold">string</p>
            <p className="mt-1 font-mono text-sm">{examples.string}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold">number</p>
            <p className="mt-1 font-mono text-sm">{examples.number}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold">boolean</p>
            <p className="mt-1 font-mono text-sm">{String(examples.boolean)}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold">number[]</p>
            <p className="mt-1 font-mono text-sm">
              [{examples.array.join(", ")}]
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold">object</p>
            <p className="mt-1 font-mono text-sm">
              {JSON.stringify(examples.object, null, 2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

