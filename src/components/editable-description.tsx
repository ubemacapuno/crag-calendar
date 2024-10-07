"use client";

import React, { useState } from "react";

import { Check, X } from "lucide-react";

interface EditableDescriptionProps {
  initialDescription: string | null;
  onSave: (newDescription: string) => void;
  onCancel: () => void;
}

export function EditableDescription({
  initialDescription,
  onSave,
  onCancel,
}: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription || "");

  if (isEditing) {
    return (
      <div className="flex items-center">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mr-2 rounded-md border p-1 text-xs"
        />
        <button
          onClick={() => {
            onSave(description);
            setIsEditing(false);
          }}
          className="mr-1 text-green-500"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setDescription(initialDescription || "");
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
      {description || "Add description"}
    </span>
  );
}
