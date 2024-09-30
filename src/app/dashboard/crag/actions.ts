"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseWithZod } from "@conform-to/zod";
import { getServerSession } from "next-auth";

import options from "@/config/auth";
import db from "@/db";
import climbs, { InsertClimbSchema } from "@/db/schema/climbs";
import requireAuth from "@/utils/require-auth";

export async function createClimbEntry(prevState: unknown, formData: FormData) {
  await requireAuth();
  const submission = parseWithZod(formData, {
    schema: InsertClimbSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const session = (await getServerSession(options))!;

  await db.insert(climbs).values({
    userId: session.user.id,
    grade: submission.value.grade,
    // Add date field from the form data
    date: new Date(formData.get("date") as string),
  });

  revalidatePath("/dashboard/crag");
  redirect("/dashboard/crag");
}
