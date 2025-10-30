import argon2 from "argon2";

const HASH_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB per hash
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  return argon2.hash(password, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, candidate: string) {
  return argon2.verify(hash, candidate, HASH_OPTIONS);
}

