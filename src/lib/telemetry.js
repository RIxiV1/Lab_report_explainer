// Client-side parser telemetry.
//
// Captures HOW extraction went — never the actual medical values.
// Stored in localStorage so you can debug user-reported failures without
// needing them to forward logs. Drop-in replaceable with a network
// endpoint later: swap the body of `logParseAttempt` and keep the API.
//
// Inspect in DevTools:
//   JSON.parse(localStorage.getItem("fm_parser_telemetry"))

const TELEMETRY_KEY = "fm_parser_telemetry";
const MAX_ENTRIES = 50;

export function logParseAttempt(entry) {
  const record = { timestamp: new Date().toISOString(), ...entry };
  try {
    const existing = JSON.parse(localStorage.getItem(TELEMETRY_KEY) || "[]");
    // Newest first, cap at MAX_ENTRIES to keep localStorage bounded
    const next = [record, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable or quota exceeded — non-fatal
  }
  if (typeof console !== "undefined" && console.debug) {
    console.debug("[fm-telemetry]", record);
  }
}

export function getTelemetry() {
  try {
    return JSON.parse(localStorage.getItem(TELEMETRY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearTelemetry() {
  try {
    localStorage.removeItem(TELEMETRY_KEY);
  } catch {
    // non-fatal
  }
}
