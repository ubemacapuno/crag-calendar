import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

import climbs from "./climbs";
import grades from "./grades";

const climbGrades = pgTable(
  "climb_grades",
  {
    climbId: uuid("climb_id")
      .notNull()
      .references(() => climbs.id, { onDelete: "cascade" }),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: { columns: [t.climbId, t.gradeId] },
  })
);

export const climbGradesRelations = relations(climbGrades, ({ one }) => ({
  climb: one(climbs, {
    fields: [climbGrades.climbId],
    references: [climbs.id],
  }),
  grade: one(grades, {
    fields: [climbGrades.gradeId],
    references: [grades.id],
  }),
}));

export default climbGrades;
