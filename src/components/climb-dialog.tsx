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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vScaleBoulderingGrades } from "@/db/schema/grades";

interface ClimbDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | undefined;
  climbs: Array<{ id: string; gradeName: string; description: string | null }>;
  addError: string | null;
  handleRemoveGrade: (climbId: string) => Promise<void>;
  handleAddGrade: (
    event: React.FormEvent<HTMLFormElement>,
    grade: string,
    description: string
  ) => Promise<void>;
  formId: string;
  handleUpdateDescription: (climbId: string, newDescription: string) => void;
  isSubmitting: boolean;
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
}: ClimbDialogProps) {
  const today = new Date();
  const [selectedGrade, setSelectedGrade] = useState<string>("V0-");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAddGrade(event, selectedGrade, description);
    setDescription(""); // Clear description after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Climbs for {selectedDay && format(selectedDay, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        {selectedDay && (
          <>
            {selectedDay > today ? (
              <AlertDestructive />
            ) : (
              <>
                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Logged Grades:</h3>
                  {climbs.length > 0 ? (
                    <ul className="space-y-2">
                      {climbs.map((climb) => (
                        <li
                          key={climb.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <GradeCircle grade={climb.gradeName} />
                            <EditableDescription
                              initialDescription={climb.description}
                              onSave={(newDescription) =>
                                handleUpdateDescription(
                                  climb.id,
                                  newDescription
                                )
                              }
                              onCancel={() => {}} // You can add any cancel logic here if needed
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGrade(climb.id)}
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
                  id={formId}
                  onSubmit={handleSubmit}
                  className="mt-4 flex flex-col gap-2"
                >
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
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="rounded-md border p-2"
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Grade"}
                  </Button>
                  {addError && <div className="text-red-500">{addError}</div>}
                </form>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
