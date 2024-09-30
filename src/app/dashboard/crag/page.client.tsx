"use client";

import { useState } from "react";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { format } from "date-fns";
import { useFormState } from "react-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InsertClimbSchema } from "@/db/schema/climbs";

import { createClimbEntry } from "./actions";

export default function CragClient() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [lastResult, action] = useFormState(createClimbEntry, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InsertClimbSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Calendar
        mode="single"
        selected={selectedDay}
        onSelect={handleDayClick}
        className="rounded-md border shadow"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add Climb for {selectedDay && format(selectedDay, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <form
            id={form.id}
            onSubmit={form.onSubmit}
            action={action}
            noValidate
            className="mt-4 flex flex-col gap-2"
          >
            <Input
              type="hidden"
              name="date"
              value={selectedDay ? selectedDay.toISOString() : ""}
            />
            <Input
              key={fields.grade.key}
              name={fields.grade.name}
              placeholder="Enter climb grade (e.g., V5)"
              className="w-full"
            />
            <Button type="submit">Add Climb</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
