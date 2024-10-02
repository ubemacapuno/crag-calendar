import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import climbGrades from "./climb-grades";
import users from "./users";

const climbs = pgTable("climb", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  date: timestamp("date").notNull(),
});

export const climbsRelations = relations(climbs, ({ one, many }) => ({
  user: one(users, {
    fields: [climbs.userId],
    references: [users.id],
  }),
  climbGrades: many(climbGrades),
}));

export const InsertClimbSchema = createInsertSchema(climbs).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const SingleGradeInputSchema = z.object({
  grade: z.string(),
  date: z.string().transform((str) => new Date(str)),
});

export default climbs;
