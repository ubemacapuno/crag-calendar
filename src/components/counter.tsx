"use client";

import { useState } from "react";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CounterProps {
  label: string;
}

export default function Counter({ label = "Count" }: CounterProps) {
  const [count, setCount] = useState(0);

  const decrement = () => setCount((prev) => Math.max(0, prev - 1));
  const increment = () => setCount((prev) => Math.min(99, prev + 1));

  return (
    <div className="flex items-center space-x-2">
      <span
        className="w-16 truncate text-sm font-medium text-muted-foreground"
        title={label}
      >
        {label}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-5 w-5 rounded-full p-0"
        onClick={decrement}
        disabled={count === 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div
        className="w-6 text-center text-sm font-medium"
        aria-live="polite"
        aria-label={`Current ${label.toLowerCase()}: ${count}`}
      >
        {count}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-5 w-5 rounded-full p-0"
        onClick={increment}
        disabled={count === 99}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
