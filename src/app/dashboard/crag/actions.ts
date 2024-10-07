"use server";

import { revalidatePath } from "next/cache";

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

export async function getclimbingSessionsForDate(date: Date) {
  await requireAuth();
  const session = (await getServerSession(options))!;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  try {
    const result = await db
      .select({
        climbId: climbingSessions.id,
        gradeName: grades.name,
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

    const gradeNames = result
      .map((r) => r.gradeName)
      .filter(Boolean) as string[];

    // Sort the grades based on their index in vScaleBoulderingGrades
    return gradeNames.sort(
      (a, b) =>
        vScaleBoulderingGrades.indexOf(a as any) -
        vScaleBoulderingGrades.indexOf(b as any)
    );
  } catch (error) {
    console.error("Error fetching climbingSessions:", error);
    return [];
  }
}

export async function removeClimbGrade(date: Date, gradeName: string) {
  await requireAuth();
  const session = (await getServerSession(options))!;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const climb = await db
      .select({ id: climbingSessions.id })
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, session.user.id),
          eq(climbingSessions.date, startOfDay)
        )
      )
      .limit(1);

    if (climb.length > 0) {
      const grade = await db
        .select({ id: grades.id })
        .from(grades)
        .where(eq(grades.name, gradeName))
        .limit(1);

      if (grade.length > 0) {
        await db
          .delete(climbs)
          .where(
            and(
              eq(climbs.climbId, climb[0].id),
              eq(climbs.gradeId, grade[0].id)
            )
          );
      }
    }

    revalidatePath("/dashboard/crag");
  } catch (error) {
    console.error("Error removing climb grade:", error);
    throw error;
  }
}

export async function createClimbEntry(prevState: unknown, formData: FormData) {
  await requireAuth();
  const session = (await getServerSession(options))!;

  console.log("Received form data:", Object.fromEntries(formData));

  const submission = parseWithZod(formData, {
    schema: SingleGradeInputSchema,
  });

  if (submission.status !== "success") {
    console.error("Submission validation failed:", submission.error);
    return submission.reply();
  }

  const { date, grade } = submission.value;

  console.log("Parsed submission:", { date, grade });

  try {
    console.log("Attempting to create climb entry:", { date, grade });

    // First, find or create the grade
    let gradeId: string;
    const existingGrade = await db
      .select({ id: grades.id })
      .from(grades)
      .where(eq(grades.name, grade))
      .limit(1);

    if (existingGrade.length > 0) {
      gradeId = existingGrade[0].id;
      console.log("Using existing grade:", gradeId);
    } else {
      const insertGradeResult = await db
        .insert(grades)
        .values({
          name: grade,
        })
        .returning({ id: grades.id });
      gradeId = insertGradeResult[0].id;
      console.log("Created new grade:", gradeId);
    }

    // Now, find or create the climb
    const existingClimb = await db
      .select({ id: climbingSessions.id })
      .from(climbingSessions)
      .where(
        and(
          eq(climbingSessions.userId, session.user.id),
          eq(climbingSessions.date, date)
        )
      )
      .limit(1);

    let climbId: string;

    if (existingClimb.length > 0) {
      climbId = existingClimb[0].id;
      console.log("Using existing climb:", climbId);
    } else {
      const insertClimbResult = await db
        .insert(climbingSessions)
        .values({
          userId: session.user.id,
          date: date,
        })
        .returning({ id: climbingSessions.id });
      climbId = insertClimbResult[0].id;
      console.log("Created new climb:", climbId);
    }

    // Finally, create the climb-grade association
    const insertClimbGradeResult = await db
      .insert(climbs)
      .values({
        climbId: climbId,
        gradeId: gradeId,
      })
      .returning({
        climbId: climbs.climbId,
        gradeId: climbs.gradeId,
      });

    console.log("Inserted climb grade:", insertClimbGradeResult);

    revalidatePath("/dashboard/crag");
    return { status: "success" };
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
