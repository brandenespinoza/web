import { describe, expect, it } from "vitest";

import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("creates kebab-case strings", () => {
    expect(generateSlug("My First Project")).toBe("my-first-project");
  });

  it("appends suffix when provided", () => {
    expect(generateSlug("My First Project", "2")).toBe("my-first-project-2");
  });

  it("handles symbols and trims hyphens", () => {
    expect(generateSlug("!Project -- Alpha!!"))
      .toBe("project-alpha");
  });
});
