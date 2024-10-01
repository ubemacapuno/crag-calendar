"use client";

import { useCallback, useState } from "react";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { format, startOfDay } from "date-fns";
// Import startOfDay
import { Trash2 } from "lucide-react";
import { useFormState } from "react-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsertClimbSchema, vScaleBoulderingGrades } from "@/db/schema/climbs";

import {
  createClimbEntry,
  getClimbsForDate,
  removeClimbGrade,
} from "./actions";

export default function CragClient() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [climbGrades, setClimbGrades] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  const [lastResult, action] = useFormState(createClimbEntry, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InsertClimbSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleDayClick = useCallback(async (day: Date | undefined) => {
    if (!day) return;

    const normalizedDay = startOfDay(day); // Normalize the date
    setSelectedDay(normalizedDay);
    setAddError(null);

    try {
      const grades = await getClimbsForDate(normalizedDay);
      setClimbGrades(Array.isArray(grades) ? grades : []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setClimbGrades([]);
      setAddError("Failed to fetch grades. Please try again.");
    }
  }, []);

  const handleRemoveGrade = async (index: number) => {
    if (selectedDay) {
      try {
        await removeClimbGrade(selectedDay, index);
        await handleDayClick(selectedDay); // Refetch grades after removal
      } catch (error) {
        console.error("Error removing grade:", error);
        setAddError("Failed to remove grade. Please try again.");
      }
    }
  };

  const handleAddGrade = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddError(null);

    if (!selectedDay) {
      setAddError("Please select a date first");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("date", format(selectedDay, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));

    try {
      const result = await action(formData);
      if (result && result.status === "error") {
        setAddError(result.message);
      } else {
        await handleDayClick(selectedDay); // Refetch grades after addition
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      setAddError("Failed to add grade. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Calendar
        mode="single"
        selected={selectedDay}
        onSelect={handleDayClick}
        className="rounded-md border shadow"
      />

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            // When closing the modal, reset the selected day
            setSelectedDay(undefined);
            setClimbGrades([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Climbs for {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <h3 className="mb-2 font-semibold">Logged Grades:</h3>
            {climbGrades.length > 0 ? (
              <ul className="space-y-2">
                {climbGrades.map((grade, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{grade}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGrade(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No grades logged for this day.</p>
            )}
          </div>
          <form
            id={form.id}
            onSubmit={handleAddGrade}
            className="mt-4 flex flex-col gap-2"
          >
            <Select name={fields.grade.name}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {vScaleBoulderingGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Add Grade</Button>
            {addError && <div className="text-red-500">{addError}</div>}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
