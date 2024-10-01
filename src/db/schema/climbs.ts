import { relations } from "drizzle-orm";
import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import users from "./users";

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

// TODO: Add "Font" bouldering scale too ?

const climbs = pgTable("climb", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  date: timestamp("date").notNull(), // Add this line
  grades: jsonb("grades").notNull().$type<string[]>(), // Store as JSON array
});

export const climbsRelations = relations(climbs, ({ one }) => ({
  user: one(users, {
    fields: [climbs.userId],
    references: [users.id],
  }),
}));

export const InsertClimbSchema = createInsertSchema(climbs, {
  grades: z.array(z.enum(vScaleBoulderingGrades)).nonempty(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// New schema for single grade input
export const SingleGradeInputSchema = z.object({
  grade: z.enum(vScaleBoulderingGrades),
  date: z.string().transform((str) => new Date(str)),
});

export default climbs;
