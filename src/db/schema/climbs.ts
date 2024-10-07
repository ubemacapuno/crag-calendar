import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import climbingSessions from "./climbing-sessions";
import grades from "./grades";

const climbs = pgTable(
  "climbs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    climbId: uuid("climb_id")
      .notNull()
      .references(() => climbingSessions.id, { onDelete: "cascade" }),
    gradeId: uuid("grade_id")
      .notNull()
      .references(() => grades.id, { onDelete: "cascade" }),
    description: text("description"),
  },
  (t) => ({
    pk: { columns: [t.climbId, t.gradeId] },
  })
);

export const climbsRelations = relations(climbs, ({ one }) => ({
  climb: one(climbingSessions, {
    fields: [climbs.climbId],
    references: [climbingSessions.id],
  }),
  grade: one(grades, {
    fields: [climbs.gradeId],
    references: [grades.id],
  }),
}));

export default climbs;
