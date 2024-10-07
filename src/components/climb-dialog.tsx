import React from "react";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { AlertDestructive } from "@/components/alert-destructive";
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
  climbs: string[];
  addError: string | null;
  handleRemoveGrade: (grade: string) => Promise<void>;
  handleAddGrade: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  formId: string;
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
}: ClimbDialogProps) {
  const today = new Date();

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
                      {climbs.map((grade, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <GradeCircle grade={grade} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGrade(grade)}
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
                  onSubmit={handleAddGrade}
                  className="mt-4 flex flex-col gap-2"
                >
                  <Select name="grade">
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
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
