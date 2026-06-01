import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export const GUEST_COOKIE = "se_user_id";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function getOrCreateGuestId(): string {
  const cookieStore = cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  return uuidv4();
}

export function getGuestId(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(GUEST_COOKIE)?.value ?? null;
}
