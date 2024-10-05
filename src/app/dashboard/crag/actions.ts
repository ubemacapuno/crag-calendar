"use server";

import { revalidatePath } from "next/cache";

import { parseWithZod } from "@conform-to/zod";
import { endOfDay, startOfDay } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { getServerSession } from "next-auth";

import options from "@/config/auth";
import db from "@/db";
import climbGrades from "@/db/schema/climb-grades";
import climbs, { SingleGradeInputSchema } from "@/db/schema/climbs";
import grades, { vScaleBoulderingGrades } from "@/db/schema/grades";
import requireAuth from "@/utils/require-auth";

export async function getClimbsForDate(date: Date) {
  await requireAuth();
  const session = (await getServerSession(options))!;

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  try {
    const result = await db
      .select({
        climbId: climbs.id,
        gradeName: grades.name,
      })
      .from(climbs)
      .leftJoin(climbGrades, eq(climbs.id, climbGrades.climbId))
      .leftJoin(grades, eq(climbGrades.gradeId, grades.id))
      .where(
        and(
          eq(climbs.userId, session.user.id),
          gte(climbs.date, dayStart),
          lte(climbs.date, dayEnd)
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
    console.error("Error fetching climbs:", error);
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
      .select({ id: climbs.id })
      .from(climbs)
      .where(
        and(eq(climbs.userId, session.user.id), eq(climbs.date, startOfDay))
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
          .delete(climbGrades)
          .where(
            and(
              eq(climbGrades.climbId, climb[0].id),
              eq(climbGrades.gradeId, grade[0].id)
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
      .select({ id: climbs.id })
      .from(climbs)
      .where(and(eq(climbs.userId, session.user.id), eq(climbs.date, date)))
      .limit(1);

    let climbId: string;

    if (existingClimb.length > 0) {
      climbId = existingClimb[0].id;
      console.log("Using existing climb:", climbId);
    } else {
      const insertClimbResult = await db
        .insert(climbs)
        .values({
          userId: session.user.id,
          date: date,
        })
        .returning({ id: climbs.id });
      climbId = insertClimbResult[0].id;
      console.log("Created new climb:", climbId);
    }

    // Finally, create the climb-grade association
    const insertClimbGradeResult = await db
      .insert(climbGrades)
      .values({
        climbId: climbId,
        gradeId: gradeId,
      })
      .returning({
        climbId: climbGrades.climbId,
        gradeId: climbGrades.gradeId,
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
