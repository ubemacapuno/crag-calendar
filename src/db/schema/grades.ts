import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import climbs from "./climbs";

export const vScaleBoulderingGrades = [
  "V0-",
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
  "V17+",
] as const;

const grades = pgTable("grade", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 5 }).notNull().unique(),
});

export const gradesRelations = relations(grades, ({ many }) => ({
  climbs: many(climbs),
}));

export const InsertGradeSchema = createInsertSchema(grades, {
  name: z.enum(vScaleBoulderingGrades),
}).omit({
  id: true,
});

export default grades;
