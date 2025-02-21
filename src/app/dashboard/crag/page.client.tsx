"use client";

import React, { useCallback, useState } from "react";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { format, isFuture, startOfDay } from "date-fns";
import { useFormState } from "react-dom";

import { ClimbDialog } from "@/components/climb-dialog";
import { Calendar } from "@/components/ui/calendar";
import { InsertClimbingSessionSchema } from "@/db/schema/climbing-sessions";

import {
  createClimbEntry,
  getclimbingSessionsForDate,
  removeClimbGrade,
  updateClimbAttempts,
  updateClimbDescription,
  updateClimbGrade,
} from "./actions";

// TODO: Remove logs when done debugging

export default function CragClient({
  onClimbsChange,
}: {
  onClimbsChange: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [climbs, setClimbs] = useState<
    Array<{
      id: string;
      gradeName: string;
      description: string | null;
      attempts: number;
    }>
  >([]);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to disable future dates
  const disableFutureDates = (date: Date) => {
    return isFuture(date);
  };

  const handleDayClick = useCallback(async (day: Date | undefined) => {
    if (!day || isFuture(day)) return; // Prevent clicks on future dates

    const normalizedDay = startOfDay(day);
    setSelectedDay(normalizedDay);
    setAddError(null);

    try {
      const climbData = await getclimbingSessionsForDate(normalizedDay);
      console.log("Fetched climb data:", climbData);
      setClimbs(
        climbData.map((climb) => ({
          id: climb.id || "",
          gradeName: climb.gradeName || "",
          description: climb.description || null,
          attempts: climb.attempts || 0,
        }))
      );
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setClimbs([]);
      setIsModalOpen(false);
      setAddError("Failed to fetch grades. Please try again.");
    }
  }, []);

  const handleRemoveGrade = async (climbId: string) => {
    if (selectedDay) {
      try {
        await removeClimbGrade(selectedDay, climbId);
        await handleDayClick(selectedDay); // Fetch and display climbs for selectedDay
        onClimbsChange(); // Update climbing stats after changes
      } catch (error) {
        console.error("Error removing grade:", error);
        setAddError("Failed to remove grade. Please try again.");
      }
    }
  };

  const handleUpdateDescription = async (
    climbId: string,
    newDescription: string
  ) => {
    try {
      await updateClimbDescription(climbId, newDescription);
      await handleDayClick(selectedDay); // Fetch and display climbs for selectedDay
    } catch (error) {
      console.error("Error updating description:", error);
      setAddError("Failed to update description. Please try again.");
    }
  };

  const handleAddGrade = async (
    event: React.FormEvent<HTMLFormElement>,
    grade: string,
    description: string,
    attempts: number
  ) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setAddError(null);

    if (!selectedDay) {
      setAddError("Please select a date first");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.set("date", format(selectedDay, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    formData.set("grade", grade);
    formData.set("description", description);
    formData.set("attempts", attempts.toString());

    console.log("Submitting form data:", Object.fromEntries(formData));

    try {
      const result = await createClimbEntry(null, formData);
      console.log("Create climb entry result:", result);
      if (result && result.status === "error") {
        setAddError(result.message);
      } else {
        await handleDayClick(selectedDay); // Fetch and display climbs for selectedDay
        onClimbsChange(); // Update climbing stats after changes
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      setAddError("Failed to add grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGrade = async (climbId: string, newGrade: string) => {
    try {
      await updateClimbGrade(climbId, newGrade);
      await handleDayClick(selectedDay); // Fetch and display climbs for selectedDay
      onClimbsChange(); // Update climbing stats after changes
    } catch (error) {
      console.error("Error updating grade:", error);
      setAddError("Failed to update grade. Please try again.");
    }
  };

  const handleUpdateAttempts = async (climbId: string, newAttempts: number) => {
    try {
      await updateClimbAttempts(climbId, newAttempts);
      await handleDayClick(selectedDay); // Fetch and display climbs for selectedDay
      onClimbsChange(); // Update climbing stats after changes
    } catch (error) {
      console.error("Error updating attempts:", error);
      setAddError("Failed to update attempts. Please try again.");
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
            setClimbs([]);
          }
        }}
        selectedDay={selectedDay}
        climbs={climbs}
        addError={addError}
        handleRemoveGrade={handleRemoveGrade}
        handleAddGrade={handleAddGrade}
        handleUpdateDescription={handleUpdateDescription}
        formId={form.id}
        isSubmitting={isSubmitting}
        handleUpdateGrade={handleUpdateGrade}
        handleUpdateAttempts={handleUpdateAttempts}
      />
    </div>
  );
}
