import { createHmac, timingSafeEqual } from "crypto";

const PAYLOAD = "visual-pages-admin-v1";

export function createAdminSessionToken(secret: string): string {
  return createHmac("sha256", secret).update(PAYLOAD).digest("hex");
}

export function verifyAdminSession(
  secret: string | undefined,
  cookieValue: string | undefined,
): boolean {
  if (!secret || !cookieValue) return false;
  const expected = createAdminSessionToken(secret);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(cookieValue, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.CONTENT_ADMIN_SECRET?.trim() &&
      process.env.CONTENT_ADMIN_SECRET.length >= 8,
  );
}
