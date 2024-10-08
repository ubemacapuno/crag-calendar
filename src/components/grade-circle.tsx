"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vScaleBoulderingGrades } from "@/db/schema/grades";

interface GradeCircleProps {
  grade: string;
  isEditable?: boolean;
  onGradeChange?: (newGrade: string) => Promise<void>;
}

export function GradeCircle({
  grade,
  isEditable = false,
  onGradeChange,
}: GradeCircleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getColorComponents = (grade: string) => {
    const match = grade.match(/V(\d+)([-+])?/);
    let value = 0;
    if (match) {
      value = parseInt(match[1]);
      if (match[2] === "-") value -= 0.5;
      if (match[2] === "+") value += 0.5;
    }

    // Use sine functions to create smooth color transitions
    const frequency = 0.3;
    const r = Math.sin(frequency * value + 0) * 127 + 128;
    const g = Math.sin(frequency * value + 2) * 127 + 128;
    const b = Math.sin(frequency * value + 4) * 127 + 128;

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };

  const { r, g, b } = getColorComponents(grade);
  const backgroundColor = `rgb(${r}, ${g}, ${b})`;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  const textColor = luma < 128 ? "white" : "black";

  const handleGradeChange = async (newGrade: string) => {
    if (onGradeChange) {
      await onGradeChange(newGrade);
      setIsEditing(false);
    }
  };

  if (isEditable && isEditing) {
    return (
      <Select onValueChange={handleGradeChange} defaultValue={grade}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Select grade" />
        </SelectTrigger>
        <SelectContent>
          {vScaleBoulderingGrades.map((vGrade) => (
            <SelectItem key={vGrade} value={vGrade}>
              {vGrade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs"
      style={{
        backgroundColor,
        color: textColor,
      }}
      onClick={() => isEditable && setIsEditing(true)}
    >
      {grade}
    </div>
  );
}
