// FM Code generation + result persistence in localStorage.

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,1,O,I
const CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const RESULT_KEY_PREFIX = "fm_result_";
const ACTIONS_KEY_PREFIX = "fm_actions_";
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000; // 6 months

function randomBlock(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export function generateCode() {
  return `FM-${randomBlock(4)}-${randomBlock(4)}`;
}

export function saveResult(code, resultData) {
  try {
    localStorage.setItem(
      RESULT_KEY_PREFIX + code,
      JSON.stringify({ result: resultData, timestamp: new Date().toISOString() })
    );
  } catch {
    // localStorage quota exceeded — result won't persist but analysis still works
  }
}

export function loadResult(code) {
  if (!CODE_REGEX.test(code)) return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY_PREFIX + code);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Remove result and action entries older than MAX_AGE_MS.
// Called once on app initialisation — failures are swallowed silently.
export function cleanupExpiredResults(now = Date.now()) {
  let removedCount = 0;
  try {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(RESULT_KEY_PREFIX)) continue;

      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const ts = parsed?.timestamp ? Date.parse(parsed.timestamp) : NaN;
        if (!Number.isNaN(ts) && now - ts > MAX_AGE_MS) {
          keysToDelete.push(key);
        }
      } catch {
        // Corrupt entry — mark for deletion too
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const code = key.slice(RESULT_KEY_PREFIX.length);
      localStorage.removeItem(key);
      localStorage.removeItem(ACTIONS_KEY_PREFIX + code);
      removedCount++;
    }
  } catch {
    // localStorage unavailable — no-op
  }
  return removedCount;
}
