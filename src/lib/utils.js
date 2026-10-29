import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Pragmatic email check shared by the creator form, checkout and email
 * sender. Deliberately not an RFC 5322 parser: it only rejects values that
 * cannot work, and the real validator is the mail provider.
 */
export function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
