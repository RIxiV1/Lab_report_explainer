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

// Asks the browser to mark this origin's storage as persistent so it
// survives aggressive cache-eviction (especially on iOS Safari, which
// otherwise prunes site data within a few weeks of disuse). The browser
// decides whether to grant — Chrome/Edge silently allow based on
// engagement signals, Firefox may prompt. Idempotent and safe to call
// repeatedly. Without this, a user's reports could vanish before the
// 6-month TTL even fires.
export async function requestStoragePersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // API unavailable — no-op
  }
}

// Returns a summary of all FM-related data stored in localStorage.
// Used by the "Manage my data" panel so users can see what's stored
// and how old it is before deciding to wipe.
export function getStorageStats() {
  let resultCount = 0;
  let oldestTs = Infinity;
  let newestTs = 0;
  let approxBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("fm_")) continue;
      const raw = localStorage.getItem(key) || "";
      // UTF-16 in JS strings: 2 bytes per char is the right rough estimate
      approxBytes += (key.length + raw.length) * 2;
      if (key.startsWith(RESULT_KEY_PREFIX)) {
        resultCount++;
        try {
          const ts = Date.parse(JSON.parse(raw)?.timestamp);
          if (!Number.isNaN(ts)) {
            if (ts < oldestTs) oldestTs = ts;
            if (ts > newestTs) newestTs = ts;
          }
        } catch {}
      }
    }
  } catch {}
  return {
    resultCount,
    oldestDate: oldestTs === Infinity ? null : new Date(oldestTs),
    newestDate: newestTs === 0 ? null : new Date(newestTs),
    approxBytes,
  };
}

// Removes every FM-related key from localStorage. Used by the
// "Delete all my data" action — irreversible, scoped only to fm_*
// so we don't touch other origins' state.
export function wipeAllData() {
  try {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("fm_")) keysToDelete.push(key);
    }
    for (const key of keysToDelete) localStorage.removeItem(key);
    return keysToDelete.length;
  } catch {
    return 0;
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
