"use server";

import { parseWithZod } from "@conform-to/zod";
import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";

import options from "@/config/auth";
import db from "@/db";
import climbingSessions, {
  SingleGradeInputSchema,
} from "@/db/schema/climbing-sessions";
import climbs from "@/db/schema/climbs";
import grades, { vScaleBoulderingGrades } from "@/db/schema/grades";
import requireAuth from "@/utils/require-auth";

// TODO: Remove logs when done debugging

export async function getclimbingSessionsForDate(date: Date) {
  await requireAuth();
  const session = (await getServerSession(options))!;
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  console.log("Fetching climbs for date:", date);

  try {
    const result = await db
      .select({
        id: climbs.id,
        climbId: climbingSessions.id,
        gradeName: grades.name,
        description: climbs.description,
        attempts: climbs.attempts, // Ensure attempts is included
      })
      .from(climbingSessions)
      .leftJoin(climbs, eq(climbingSessions.id, climbs.climbId))
      .leftJoin(grades, eq(climbs.gradeId, grades.id))
      .where(
        and(
          eq(climbingSessions.userId, session.user.id),
          gte(climbingSessions.date, dayStart),
          lte(climbingSessions.date, dayEnd)
        )
      );

    console.log("Raw fetched climbs:", result);

    // Filter out climbs without a grade
    const filteredResult = result.filter((r) => r.gradeName);
    console.log("Filtered climbs:", filteredResult);

    // Sort climbs by grade and then by description
    return filteredResult.sort((a, b) => {
      const gradeComparison =
        vScaleBoulderingGrades.indexOf(a.gradeName as any) -
        vScaleBoulderingGrades.indexOf(b.gradeName as any);
      if (gradeComparison === 0) {
        // If grades are the same, sort by description
        return (a.description || "").localeCompare(b.description || "");
      }
      return gradeComparison;
    });
  } catch (error) {
    console.error("Error fetching climbingSessions:", error);
    return [];
  }
}

export async function removeClimbGrade(date: Date, climbId: string) {
  await requireAuth();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  try {
    await db.delete(climbs).where(eq(climbs.id, climbId));
  } catch (error) {
    console.error("Error removing climb grade:", error);
    throw error;
  }
}

export async function createClimbEntry(prevState: unknown, formData: FormData) {
  console.log(
    "createClimbEntry called with formData:",
    Object.fromEntries(formData)
  );

  await requireAuth();
  const session = (await getServerSession(options))!;

  const submission = parseWithZod(formData, {
    schema: SingleGradeInputSchema,
  });

  if (submission.status !== "success") {
    console.error("Submission validation failed:", submission.error);
    return submission.reply();
  }

  const { date, grade, description, attempts } = submission.value;

  if (!grade || grade === "undefined") {
    return {
      status: "error",
      message: "Grade is required",
    };
  }

  console.log("Parsed submission:", { date, grade, description, attempts });

  try {
    // Find or create the grade
    let gradeId: string;
    const existingGrade = await db
      .select({ id: grades.id })
      .from(grades)
      .where(eq(grades.name, grade))
      .limit(1);

    if (existingGrade.length > 0) {
      gradeId = existingGrade[0].id;
    } else {
      const insertGradeResult = await db
        .insert(grades)
        .values({ name: grade })
        .returning({ id: grades.id });
      gradeId = insertGradeResult[0].id;
    }

    // Find or create the climbing session
    let climbingSessionId: string;
    const existingSession = await db
      .select({ id: climbingSessions.id })
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, session.user.id),
          eq(climbingSessions.date, date)
        )
      )
      .limit(1);

    if (existingSession.length > 0) {
      climbingSessionId = existingSession[0].id;
    } else {
      const insertSessionResult = await db
        .insert(climbingSessions)
        .values({
          userId: session.user.id,
          date: date,
        })
        .returning({ id: climbingSessions.id });
      climbingSessionId = insertSessionResult[0].id;
    }

    // Always create a new climb entry
    const insertClimbResult = await db
      .insert(climbs)
      .values({
        climbId: climbingSessionId,
        gradeId: gradeId,
        description: description || null,
        attempts: attempts || 1,
      })
      .returning({
        id: climbs.id,
        climbId: climbs.climbId,
        gradeId: climbs.gradeId,
        description: climbs.description,
        attempts: climbs.attempts,
      });

    const newClimb = insertClimbResult[0];
    console.log("New climb created:", newClimb);

    return { status: "success", data: newClimb };
  } catch (error) {
    console.error("Error in createClimbEntry:", error);
    return {
      status: "error",
      message: `Failed to add climb entry: ${(error as Error).message}`,
    };
  }
}

export async function getTotalLoggedClimbs() {
  await requireAuth();
  const session = (await getServerSession(options))!;

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(climbs)
      .leftJoin(climbingSessions, eq(climbingSessions.id, climbs.climbId))
      .where(eq(climbingSessions.userId, session.user.id));

    return result[0].count;
  } catch (error) {
    console.error("Error fetching total logged climbs:", error);
    return 0;
  }
}

export async function updateClimbDescription(
  climbId: string,
  newDescription: string
) {
  await requireAuth();

  try {
    await db
      .update(climbs)
      .set({ description: newDescription })
      .where(eq(climbs.id, climbId));
  } catch (error) {
    console.error("Error updating climb description:", error);
    throw error;
  }
}

export async function updateClimbGrade(climbId: string, newGrade: string) {
  await requireAuth();

  try {
    // Find or create the grade
    let gradeId: string;
    const existingGrade = await db
      .select({ id: grades.id })
      .from(grades)
      .where(eq(grades.name, newGrade))
      .limit(1);

    if (existingGrade.length > 0) {
      gradeId = existingGrade[0].id;
    } else {
      const insertGradeResult = await db
        .insert(grades)
        .values({ name: newGrade })
        .returning({ id: grades.id });
      gradeId = insertGradeResult[0].id;
    }

    // Update the climb with the new grade
    await db
      .update(climbs)
      .set({ gradeId: gradeId })
      .where(eq(climbs.id, climbId));
  } catch (error) {
    console.error("Error updating climb grade:", error);
    throw error;
  }
}

// Function to update the attempts for a specific climb
export async function updateClimbAttempts(
  climbId: string,
  newAttempts: number
) {
  await requireAuth();

  try {
    await db
      .update(climbs)
      .set({ attempts: newAttempts })
      .where(eq(climbs.id, climbId));
  } catch (error) {
    console.error("Error updating climb attempts:", error);
    throw error;
  }
}
