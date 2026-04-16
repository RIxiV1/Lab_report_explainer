// Shared UI formatting helpers. Keeping these in one file means a
// brand-wide change (e.g. switching locale, adjusting precision) only
// touches one place.

const DATE_OPTS = { year: "numeric", month: "short", day: "numeric" };

// Renders a Date in the canonical en-IN form used everywhere in the
// app: "16 Apr 2026". Returns an em-dash for null/undefined so the
// UI can render the result directly without null-guards everywhere.
export function formatDate(date) {
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", DATE_OPTS);
}

// "Today" in the same format. Used for the welcome-back banner check
// (last-result.date !== todayLabel() → it's from a previous day).
export function todayLabel() {
  return formatDate(new Date());
}

// Rounds clinical numbers to one decimal place to suppress OCR
// artefacts like "7.707" while preserving meaningful precision.
// Integers pass through untouched. Used for parameter values and the
// TMSC count-up.
export function displayValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number") {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return value;
    value = parsed;
  }
  if (Number.isInteger(value)) return value;
  const decimals = String(value).split(".")[1]?.length ?? 0;
  return decimals > 1 ? Math.round(value * 10) / 10 : value;
}
