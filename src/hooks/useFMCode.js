const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,1,O,I
const CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

function randomBlock(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

function generateCode() {
  const code = `FM-${randomBlock(4)}-${randomBlock(4)}`;
  localStorage.setItem("fm_active_code", code);
  return code;
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

function getActiveCode() {
  return localStorage.getItem("fm_active_code") || null;
}

function downloadCode(code) {
  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const content = `Your FM Lab Report Code: ${code}
Generated: ${date}

To access your results:
Visit the FM Lab Report Explainer and enter this code on the home screen.

Important: Results are stored only on the device where you first generated them. This code will not work on a different device.

ForMen Health — formen.health`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${code}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useFMCode() {
  return { generateCode, saveResult, loadResult, getActiveCode, downloadCode };
}
