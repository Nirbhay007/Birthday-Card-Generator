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

/**
 * Strip NUL bytes and lone UTF-16 surrogates (e.g. from slicing mid-emoji) so
 * PostgreSQL and Prisma's WASM engine never choke on invalid UTF-8/hex escapes.
 */
export function sanitizeText(value, maxLength, { trim = false } = {}) {
  if (typeof value !== "string") return "";
  let clean = value.replace(/\u0000/g, "");
  if (trim) clean = clean.trim();
  if (typeof maxLength === "number" && maxLength >= 0) {
    clean = clean.slice(0, maxLength);
  }
  if (typeof clean.toWellFormed === "function") {
    clean = clean.toWellFormed().replace(/\uFFFD/g, "");
  } else {
    clean = clean.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
  }
  return trim ? clean.trim() : clean;
}
