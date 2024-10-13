"use client";

import { useEffect, useState } from "react";

import { Check, X } from "lucide-react";

import { Label } from "@/components/ui/label";

// Define prop types
interface EditableAttemptsProps {
  initialAttempts: number;
  onSave: (newAttempts: number) => void;
  onCancel: () => void;
}

export function EditableAttempts({
  initialAttempts,
  onSave,
  onCancel,
}: EditableAttemptsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [attempts, setAttempts] = useState(initialAttempts);

  // Update attempts state when initialAttempts prop changes
  useEffect(() => {
    setAttempts(initialAttempts);
  }, [initialAttempts]);

  if (isEditing) {
    return (
      <div className="flex items-center">
        <input
          type="number"
          id="attempts"
          value={attempts}
          onChange={(e) => setAttempts(Number(e.target.value))}
          min={1}
          max={99}
          className="mr-2 rounded-md border p-1 text-xs"
        />
        <Label className="mx-1" htmlFor="attempts">
          attempts
        </Label>
        <button
          onClick={() => {
            onSave(attempts);
            setIsEditing(false);
          }}
          className="mr-1 text-green-500"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setAttempts(initialAttempts);
            setIsEditing(false);
            onCancel();
          }}
          className="text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <span
      className="ml-2 cursor-pointer text-xs text-gray-500 hover:text-gray-700"
      onClick={() => setIsEditing(true)}
    >
      {attempts} attempts
    </span>
  );
}
