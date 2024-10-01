"use server";

import { revalidatePath } from "next/cache";

import { parseWithZod } from "@conform-to/zod";
import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { getServerSession } from "next-auth";

import options from "@/config/auth";
import db from "@/db";
import climbs, { SingleGradeInputSchema } from "@/db/schema/climbs";
import requireAuth from "@/utils/require-auth";

export async function getClimbsForDate(date: Date) {
  await requireAuth();
  const session = (await getServerSession(options))!;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  console.log("Fetching climbs for date range:", dayStart, "to", dayEnd);

  try {
    const result = await db
      .select({ grades: climbs.grades })
      .from(climbs)
      .where(
        and(
          eq(climbs.userId, session.user.id),
          gte(climbs.date, dayStart),
          lte(climbs.date, dayEnd)
        )
      );

    console.log("Query result:", result);

    return result.length > 0 ? result[0].grades : [];
  } catch (error) {
    console.error("Error fetching climbs:", error);
    return [];
  }
}

export async function removeClimbGrade(date: Date, index: number) {
  await requireAuth();
  const session = (await getServerSession(options))!;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const climbEntry = await db
    .select()
    .from(climbs)
    .where(
      and(
        eq(climbs.userId, session.user.id),
        gte(climbs.createdAt, startOfDay),
        lte(climbs.createdAt, endOfDay)
      )
    )
    .limit(1);

  if (climbEntry.length > 0) {
    const updatedGrades = [...climbEntry[0].grades];
    updatedGrades.splice(index, 1);

    await db
      .update(climbs)
      .set({ grades: updatedGrades })
      .where(eq(climbs.id, climbEntry[0].id));
  }

  revalidatePath("/dashboard/crag");
}

export async function createClimbEntry(prevState: unknown, formData: FormData) {
  await requireAuth();
  const session = (await getServerSession(options))!;

  console.log("Form data received:", Object.fromEntries(formData));

  const submission = parseWithZod(formData, {
    schema: SingleGradeInputSchema,
  });

  if (submission.status !== "success") {
    console.error("Validation failed:", submission.error);
    return submission.reply();
  }

  console.log("Submission value:", submission.value);

  const { date, grade } = submission.value;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  console.log("Date range for query:", startOfDay, "to", endOfDay);

  try {
    const existingEntry = await db
      .select()
      .from(climbs)
      .where(
        and(eq(climbs.userId, session.user.id), eq(climbs.date, startOfDay))
      )
      .limit(1);

    console.log("Existing entry:", existingEntry);

    if (existingEntry.length > 0) {
      // Parse the existing grades as JSON if it's stored as a string
      const existingGrades = Array.isArray(existingEntry[0].grades)
        ? existingEntry[0].grades
        : JSON.parse(existingEntry[0].grades);

      const updatedGrades = [...existingGrades, grade];
      console.log("Updating existing entry with grades:", updatedGrades);

      const updateResult = await db
        .update(climbs)
        .set({
          grades: updatedGrades,
        })
        .where(eq(climbs.id, existingEntry[0].id));

      console.log("Update result:", updateResult);
    } else {
      console.log("Inserting new entry with grade:", grade);

      const insertResult = await db.insert(climbs).values({
        userId: session.user.id,
        grades: [grade],
        date: date, // Add this line
        createdAt: new Date(), // This will be the current timestamp
      });

      console.log("Insert result:", insertResult);
    }

    console.log("Database operation completed successfully");
    revalidatePath("/dashboard/crag");
    return { status: "success" };
  } catch (error) {
    console.error("Error in createClimbEntry:", error);
    return { status: "error", message: "Failed to add climb entry" };
  }
}
