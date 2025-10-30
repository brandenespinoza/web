const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export function generateSlug(input: string, suffix?: string) {
  const base = slugify(input);
  if (!suffix) {
    return base;
  }
  return `${base}-${suffix}`;
}

