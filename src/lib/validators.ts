import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters.")
  .max(32, "Username must be at most 32 characters.")
  .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, underscores or hyphens.");

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be at most 128 characters.");

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  displayName: z.string().min(1).max(120).optional().or(z.literal("")).optional(),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
});

export const projectSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters.").max(160),
  summary: z.string().max(500).optional().or(z.literal("")).optional(),
  tags: z.array(z.string().min(1).max(32)).max(10).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  coverImageId: z.string().uuid().optional().or(z.literal(null)).optional(),
});

export const updateSchema = z.object({
  projectId: z.string().uuid(),
  headline: z.string().max(160).optional().or(z.literal("")).optional(),
  blocks: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        type: z.enum(["PARAGRAPH", "HEADING", "IMAGE", "VIDEO", "LIST", "QUOTE", "CODE", "EMBED"]),
        position: z.number().int().min(0),
        text: z.string().optional(),
        data: z.unknown().optional(),
      }),
    )
    .min(1, "At least one block is required.")
    .max(200, "Maximum 200 blocks per update."),
  isDraft: z.boolean().optional(),
});

export const highlightToggleSchema = z.object({
  projectId: z.string().uuid(),
  updateId: z.string().uuid(),
  enabled: z.boolean(),
});

export const mediaAssetSchema = z
  .object({
    projectId: z.string().uuid().optional(),
    updateId: z.string().uuid().optional(),
    type: z.enum(["IMAGE", "VIDEO"]),
    originalPath: z.string().min(1, "Original path is required."),
    storageBucket: z.string().min(1).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    durationSeconds: z.number().int().nonnegative().optional(),
    filesize: z
      .number()
      .int()
      .positive()
      .max(500 * 1024 * 1024, "File size exceeds 500 MB limit.")
      .optional(),
    altText: z.string().max(240).optional(),
    caption: z.string().max(480).optional(),
  })
  .refine((value) => value.projectId || value.updateId, {
    message: "Provide a project or update reference.",
    path: ["projectId"],
  });
