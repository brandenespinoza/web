import { describe, expect, it } from "vitest";

import {
  projectSchema,
  registerSchema,
  updateSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("rejects passwords shorter than 12 characters", () => {
    const result = registerSchema.safeParse({
      username: "maker",
      password: "shortpass",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid payload", () => {
    const result = registerSchema.safeParse({
      username: "maker",
      password: "supersecurepass",
      displayName: "Maker One",
    });
    expect(result.success).toBe(true);
  });
});

describe("projectSchema", () => {
  it("limits tags to ten entries", () => {
    const tags = Array.from({ length: 12 }, (_, index) => `tag-${index}`);
    const result = projectSchema.safeParse({
      title: "Robot build",
      summary: "A fun robot",
      tags,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid project definition", () => {
    const result = projectSchema.safeParse({
      title: "Robot build",
      summary: "A fun robot",
      tags: ["robotics", "arduino"],
      visibility: "PRIVATE",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateSchema", () => {
  it("requires at least one block", () => {
    const result = updateSchema.safeParse({
      projectId: crypto.randomUUID(),
      blocks: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a single paragraph block", () => {
    const result = updateSchema.safeParse({
      projectId: crypto.randomUUID(),
      blocks: [
        {
          position: 0,
          type: "PARAGRAPH",
          text: "Documenting progress",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
