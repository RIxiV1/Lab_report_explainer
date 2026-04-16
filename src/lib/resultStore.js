// FM Code generation + all client-side persistence.
//
// All localStorage access for this app is funneled through this module
// so that:
//   - key naming is consistent (single "fm_" namespace)
//   - try/catch + JSON parsing logic isn't repeated in every component
//   - wipeAllData() can find every entry by prefix without surprises
//   - schema migrations have a single seam to evolve

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,1,O,I
const CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const RESULT_KEY_PREFIX = "fm_result_";
const ACTIONS_KEY_PREFIX = "fm_actions_";
const DRAFT_KEY = "fm_input_draft";
const LAST_RESULT_KEY = "fm_last_result";
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000; // 6 months

// Tiny JSON-safe wrappers so callers don't repeat try/catch and
// JSON.parse boilerplate. Returns the fallback on any failure
// (missing key, parse error, storage unavailable).
function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKey(key) {
  try { localStorage.removeItem(key); } catch {}
}

function randomBlock(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export function generateCode() {
  return `FM-${randomBlock(4)}-${randomBlock(4)}`;
}

export function saveResult(code, resultData) {
  writeJSON(RESULT_KEY_PREFIX + code, {
    result: resultData,
    timestamp: new Date().toISOString(),
  });
}

export function loadResult(code) {
  if (!CODE_REGEX.test(code)) return null;
  return readJSON(RESULT_KEY_PREFIX + code);
}

// ── Form draft (auto-saved values from InputForm) ────────────────
export function getDraft() {
  return readJSON(DRAFT_KEY, {});
}
export function saveDraft(draft) {
  writeJSON(DRAFT_KEY, draft);
}
export function clearDraft() {
  removeKey(DRAFT_KEY);
}

// ── Pointer to the most recent result, used for the "Welcome back"
// banner and for restoring after a same-day refresh ───────────────
export function getLastResultPointer() {
  return readJSON(LAST_RESULT_KEY);
}
export function saveLastResultPointer(code, date) {
  writeJSON(LAST_RESULT_KEY, { code, date });
}
export function clearLastResultPointer() {
  removeKey(LAST_RESULT_KEY);
}

// ── Per-result action checkbox state (which "Next Steps" the user
// has ticked off) ─────────────────────────────────────────────────
export function getActions(code) {
  if (!CODE_REGEX.test(code)) return {};
  return readJSON(ACTIONS_KEY_PREFIX + code, {});
}
export function saveActions(code, actions) {
  if (!CODE_REGEX.test(code)) return;
  writeJSON(ACTIONS_KEY_PREFIX + code, actions);
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
