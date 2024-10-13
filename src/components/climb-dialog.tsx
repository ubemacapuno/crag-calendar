import React, { useState } from "react";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { AlertDestructive } from "@/components/alert-destructive";
import { EditableDescription } from "@/components/editable-description";
import { GradeCircle } from "@/components/grade-circle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vScaleBoulderingGrades } from "@/db/schema/grades";

import { EditableAttempts } from "./editable-attempts";

interface ClimbDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | undefined;
  climbs: Array<{
    id: string;
    gradeName: string;
    description: string | null;
    attempts: number;
  }>;
  addError: string | null;
  handleRemoveGrade: (climbId: string) => Promise<void>;
  handleAddGrade: (
    event: React.FormEvent<HTMLFormElement>,
    grade: string,
    description: string,
    attempts: number
  ) => Promise<void>;
  formId: string;
  handleUpdateDescription: (climbId: string, newDescription: string) => void;
  isSubmitting: boolean;
  handleUpdateGrade: (climbId: string, newGrade: string) => Promise<void>;
  handleUpdateAttempts: (climbId: string, newAttempts: number) => Promise<void>;
}

export function ClimbDialog({
  isOpen,
  onOpenChange,
  selectedDay,
  climbs,
  addError,
  handleRemoveGrade,
  handleAddGrade,
  formId,
  handleUpdateDescription,
  isSubmitting,
  handleUpdateGrade,
  handleUpdateAttempts,
}: ClimbDialogProps) {
  const today = new Date();
  const [selectedGrade, setSelectedGrade] = useState<string>("V0-");
  const [description, setDescription] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(1);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAddGrade(event, selectedGrade, description, attempts);
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedDay && format(selectedDay, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        {selectedDay && (
          <>
            {selectedDay > today ? (
              <AlertDestructive />
            ) : (
              <>
                <form
                  id={formId}
                  onSubmit={handleSubmit}
                  className="mt-4 flex flex-col gap-4"
                >
                  <div className="flex flex-col">
                    <Label className="pb-1">Grade</Label>
                    <Select
                      value={selectedGrade}
                      onValueChange={setSelectedGrade}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {vScaleBoulderingGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col">
                    <Label className="pb-1" htmlFor="attempts">
                      Attempts
                    </Label>
                    <input
                      type="number"
                      id="attempts"
                      value={attempts}
                      onChange={(e) => setAttempts(Number(e.target.value))}
                      min={1}
                      max={99}
                      className="rounded-md border p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label className="pb-1">Description</Label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="rounded-md border p-2"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Climb"}
                  </Button>
                  {addError && <div className="text-red-500">{addError}</div>}
                </form>

                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Logged Climbs:</h3>
                  {climbs.length > 0 ? (
                    <ul className="space-y-2">
                      {climbs.map((climb) => (
                        <li
                          key={climb.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-grow items-center justify-between space-x-2">
                              <GradeCircle
                                grade={climb.gradeName}
                                isEditable={true}
                                onGradeChange={(newGrade) =>
                                  handleUpdateGrade(climb.id, newGrade)
                                }
                              />
                              <EditableDescription
                                initialDescription={climb.description}
                                onSave={(newDescription) =>
                                  handleUpdateDescription(
                                    climb.id,
                                    newDescription
                                  )
                                }
                                onCancel={() => {}}
                              />
                              <EditableAttempts
                                initialAttempts={climb.attempts}
                                onSave={(newAttempts) =>
                                  handleUpdateAttempts(climb.id, newAttempts)
                                }
                                onCancel={() => {}}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGrade(climb.id)}
                              className="ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No grades logged for this day.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
