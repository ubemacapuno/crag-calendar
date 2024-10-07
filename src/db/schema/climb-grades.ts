import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import climbingSessions from "./climbing-sessions";
import grades from "./grades";

const climbGrades = pgTable(
  "climb_grades",
  {
    climbId: uuid("climb_id")
      .notNull()
      .references(() => climbingSessions.id, { onDelete: "cascade" }),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: { columns: [t.climbId, t.gradeId] },
  })
);

export const climbGradesRelations = relations(climbGrades, ({ one }) => ({
  climb: one(climbingSessions, {
    fields: [climbGrades.climbId],
    references: [climbingSessions.id],
  }),
  grade: one(grades, {
    fields: [climbGrades.gradeId],
    references: [grades.id],
  }),
}));

export default climbGrades;
