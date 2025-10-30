"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ProjectVisibility } from "@/generated/prisma";
import { invalidateSession, getSession } from "@/lib/session";
import { projectSchema } from "@/lib/validators";
import { createProject } from "@/services/project-service";

export type ProjectFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialState: ProjectFormState = { status: "idle" };

export function createProjectInitialState(): ProjectFormState {
  return initialState;
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: "You must be signed in." };
  }

  const tagsString = String(formData.get("tags") ?? "");
  const visibilityInput = String(formData.get("visibility") ?? "PRIVATE").toUpperCase();

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    tags: tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    visibility: visibilityInput === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    coverImageId: null,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { status: "error", message: firstError };
  }

  try {
    await createProject({
      ownerId: session.userId,
      title: parsed.data.title,
      summary: parsed.data.summary ?? null,
      tags: parsed.data.tags ?? [],
      visibility: (parsed.data.visibility as ProjectVisibility) ?? ProjectVisibility.PRIVATE,
      coverImageId: parsed.data.coverImageId ?? undefined,
    });
  } catch (error) {
    console.error("Failed to create project", error);
    return { status: "error", message: "Unable to create project. Please try again." };
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Project created." };
}

export async function logoutAction() {
  await invalidateSession();
  redirect("/login");
}
