import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("supersecurepass");
    expect(hash).toMatch(/^\$argon2id\$/);

    const valid = await verifyPassword(hash, "supersecurepass");
    expect(valid).toBe(true);

    const invalid = await verifyPassword(hash, "wrongpass");
    expect(invalid).toBe(false);
  });
});
