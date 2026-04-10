const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,1,O,I
const CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

function randomBlock(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

function generateCode() {
  return `FM-${randomBlock(4)}-${randomBlock(4)}`;
}

function saveResult(code, resultData) {
  localStorage.setItem(
    "fm_result_" + code,
    JSON.stringify({ result: resultData, timestamp: new Date().toISOString() })
  );
}

function loadResult(code) {
  if (!CODE_REGEX.test(code)) return null;
  try {
    const raw = localStorage.getItem("fm_result_" + code);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function useFMCode() {
  return { generateCode, saveResult, loadResult };
}
