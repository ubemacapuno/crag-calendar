import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import climbs from "./climbs";
import users from "./users";

const climbingSessions = pgTable("climbing_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  date: timestamp("date").notNull(),
});

export const climbingSessionsRelations = relations(
  climbingSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [climbingSessions.userId],
      references: [users.id],
    }),
    climbs: many(climbs),
  })
);

export const InsertClimbingSessionSchema = createInsertSchema(
  climbingSessions
).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const SingleGradeInputSchema = z.object({
  date: z.coerce.date(),
  grade: z.string(),
  description: z.string().optional(),
  attempts: z.number().gte(1).default(1),
});

export default climbingSessions;
