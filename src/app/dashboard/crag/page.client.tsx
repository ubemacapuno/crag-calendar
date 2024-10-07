"use client";

import React, { useCallback, useState } from "react";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { format, isFuture, startOfDay } from "date-fns";
// Add isFuture import
import { useFormState } from "react-dom";

import { ClimbDialog } from "@/components/climb-dialog";
import { Calendar } from "@/components/ui/calendar";
import { InsertClimbingSessionSchema } from "@/db/schema/climbing-sessions";

import {
  createClimbEntry,
  getclimbingSessionsForDate,
  removeClimbGrade,
} from "./actions";

export default function CragClient() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [climbs, setclimbs] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  const [lastResult, action] = useFormState(createClimbEntry, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InsertClimbingSessionSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Function to disable future dates
  const disableFutureDates = (date: Date) => {
    return isFuture(date);
  };

  const handleDayClick = useCallback(async (day: Date | undefined) => {
    if (!day || isFuture(day)) return; // Prevent clicks on future dates

    if (!day) return;

    const normalizedDay = startOfDay(day);
    setSelectedDay(normalizedDay);
    setAddError(null);

    try {
      const grades = await getclimbingSessionsForDate(normalizedDay);
      setclimbs(grades);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setclimbs([]);
      setAddError("Failed to fetch grades. Please try again.");
    }
  }, []);

  const handleRemoveGrade = async (grade: string) => {
    if (selectedDay) {
      try {
        await removeClimbGrade(selectedDay, grade);
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

    console.log("Form data:", Object.fromEntries(formData));

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
        disabled={disableFutureDates}
        className="rounded-md border shadow"
      />

      <ClimbDialog
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setSelectedDay(undefined);
            setclimbs([]);
          }
        }}
        selectedDay={selectedDay}
        climbs={climbs}
        addError={addError}
        handleRemoveGrade={handleRemoveGrade}
        handleAddGrade={handleAddGrade}
        formId={form.id}
      />
    </div>
  );
}
