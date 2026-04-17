// PDF + image extraction primitives.
//
// Kept out of the React component so the UI file stays focused on
// rendering. All functions are pure async — they don't touch React state.
//
// BUG HISTORY & HARDENING (audit trail):
//   - yTolerance=5 was too fragile for dense tables → made adaptive
//   - Single-space join in position reconstruction split "43" → "4 3"
//     causing motility=4 instead of 43 → now uses X-gap–aware joining
//   - Canvas buffers not freed after toDataURL → now zeroed immediately
//   - No CMap support → CID-keyed fonts extracted as garbage → now loads
//     CMaps from jsdelivr CDN (same as tesseract data)
//   - Encrypted PDFs crashed silently → now caught + clear error message
//   - No OCR timeout → could hang forever → 45s per-page timeout added

export const OCR_MAX_PAGES = 3;
export const PDF_RENDER_SCALE = 2.5;
export const MIN_USABLE_TEXT_LENGTH = 50;

// Per-page OCR timeout. Tesseract can take 30-60s per page on slow
// Android devices; beyond 45s it's almost certainly stuck.
const OCR_PAGE_TIMEOUT_MS = 45_000;

// ── Lazy loaders for heavy dependencies ─────────────────────────────
let pdfjsPromise = null;
export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      const pdfjsLib = mod.default || mod;
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.min.js",
            import.meta.url
          ).href;
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
      }
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

let tesseractPromise = null;
export function loadTesseract() {
  if (!tesseractPromise) {
    tesseractPromise = import("tesseract.js").then((mod) => mod.createWorker);
  }
  return tesseractPromise;
}

// ── Text reconstruction strategies ──────────────────────────────────
// Lab PDFs vary wildly. We run all three strategies and let the caller
// pick whichever gives the parser the most matches.

// Group items by Y coordinate, sort left-to-right within a line.
// Uses adaptive Y tolerance (based on median item height) and
// X-gap–aware joining so "43" split across two text items doesn't
// become "4 3" → parsed as 4.
export function reconstructByPosition(textContent) {
  const items = textContent.items.filter((it) => it.str?.trim());
  if (!items.length) return "";

  // Adaptive Y tolerance: use median item height × 0.6. Falls back
  // to 5pt if height data is missing (older pdfjs or stripped fonts).
  const heights = items.map((it) => it.height || it.transform?.[0] || 0).filter((h) => h > 0);
  const yTolerance = heights.length
    ? heights.sort((a, b) => a - b)[Math.floor(heights.length / 2)] * 0.6
    : 5;

  // Group into lines using a Map keyed by quantized Y for O(n) instead
  // of O(n²). Quantize Y to nearest yTolerance bucket.
  const lineMap = new Map();
  for (const item of items) {
    const x = item.transform?.[4] ?? 0;
    const y = item.transform?.[5] ?? 0;
    const width = item.width ?? (item.str.length * (item.height || 8) * 0.5);
    const bucket = Math.round(y / yTolerance);

    // Check this bucket and neighbours (±1) to handle items that
    // straddle a bucket boundary.
    let bestLine = null;
    for (const b of [bucket, bucket - 1, bucket + 1]) {
      const existing = lineMap.get(b);
      if (existing && Math.abs(existing.y - y) < yTolerance) {
        bestLine = existing;
        break;
      }
    }
    if (!bestLine) {
      bestLine = { y, items: [] };
      lineMap.set(bucket, bestLine);
    }
    bestLine.items.push({ x, width, str: item.str });
  }

  const lines = [...lineMap.values()];
  lines.sort((a, b) => b.y - a.y); // PDF Y increases upward → reverse

  return lines.map((line) => {
    line.items.sort((a, b) => a.x - b.x);

    // Smart joining: if the gap between the end of one item and the
    // start of the next is smaller than half a typical character width,
    // join WITHOUT a space (the items are parts of the same word/number
    // split by the PDF renderer). Otherwise add a single space.
    let result = "";
    for (let i = 0; i < line.items.length; i++) {
      const cur = line.items[i];
      if (i > 0) {
        const prev = line.items[i - 1];
        const prevEnd = prev.x + prev.width;
        const gap = cur.x - prevEnd;
        const charWidth = prev.width / Math.max(prev.str.length, 1);
        result += gap > charWidth * 0.3 ? " " : "";
      }
      result += cur.str;
    }
    return result;
  }).join("\n");
}

// Naive stream-order join. Works for simple linear PDFs.
export function reconstructByStream(textContent) {
  return textContent.items.map((i) => i.str || "").join(" ");
}

// Stream order but with newlines when pdfjs signals EOL.
export function reconstructByEOL(textContent) {
  let result = "";
  for (const item of textContent.items) {
    result += item.str || "";
    result += item.hasEOL ? "\n" : " ";
  }
  return result;
}

// Render a PDF page to a canvas, convert to Blob for OCR.
// Zeros the canvas buffer immediately after conversion to free
// ~70MB per A4 page at 2.5x scale.
export async function renderPageToImage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;

  // Prefer Blob (no 33% base64 overhead) but fall back to dataURL
  // if toBlob isn't available (very old browsers).
  let imageData;
  if (canvas.toBlob) {
    imageData = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } else {
    imageData = canvas.toDataURL("image/png");
  }

  // Free the pixel buffer immediately — without this, three A4 pages
  // at 2.5x scale hold ~210MB of canvas RAM until GC runs.
  canvas.width = 0;
  canvas.height = 0;

  return imageData;
}

// ── High-level orchestration ────────────────────────────────────────

// Load a PDF and collect all pages' raw text content. Returns the
// pdfjs document handle (so the caller can OCR it later) plus the
// per-page content array and total character count.
//
// Passes cMapUrl so PDFs with CID-keyed fonts (common in Indian lab
// reports with custom font subsets) extract readable Unicode instead
// of glyph IDs.
export async function loadPdfPages(file) {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise;
  } catch (err) {
    // Surface a clear message for encrypted/password-protected PDFs
    // instead of the generic pdfjs error string.
    if (err?.name === "PasswordException" || /password/i.test(err?.message)) {
      throw new Error("This PDF is password-protected. Please unlock it first, then re-upload.");
    }
    throw err;
  }

  const pageContents = [];
  let totalCharCount = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    pageContents.push(tc);
    totalCharCount += tc.items.reduce((n, it) => n + (it.str?.length || 0), 0);
  }
  return { pdf, pageContents, totalCharCount, pageCount: pdf.numPages };
}

// Given page content objects, produce three candidate full-document
// strings (one per reconstruction strategy).
export function buildPdfTextCandidates(pageContents) {
  return [
    { name: "position", text: pageContents.map((tc) => reconstructByPosition(tc)).join("\n") },
    { name: "eol",      text: pageContents.map(reconstructByEOL).join("\n") },
    { name: "stream",   text: pageContents.map(reconstructByStream).join("\n") },
  ];
}

// OCR a PDF by rendering up to OCR_MAX_PAGES pages and running them
// through Tesseract. onPageStart(pageIndex) fires before each page so
// the caller can update progress UI.
//
// Each page has a 45-second timeout — if tesseract hangs (corrupt
// image, pathological content), we skip that page rather than blocking
// the entire extraction forever.
export async function runPdfOcr(pdf, { onPageStart } = {}) {
  const createWorker = await loadTesseract();
  const worker = await createWorker("eng");
  try {
    let fullText = "";
    const pagesToScan = Math.min(pdf.numPages, OCR_MAX_PAGES);
    for (let i = 1; i <= pagesToScan; i++) {
      onPageStart?.(i);
      const imgData = await renderPageToImage(pdf, i);

      // Race the OCR against a timeout so a single stuck page doesn't
      // block the whole extraction. Skips the page on timeout rather
      // than failing the entire upload.
      try {
        const result = await Promise.race([
          worker.recognize(imgData),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`OCR timeout on page ${i}`)), OCR_PAGE_TIMEOUT_MS)
          ),
        ]);
        fullText += result.data.text + "\n";
      } catch (pageErr) {
        console.warn(`Skipping page ${i}:`, pageErr?.message);
        fullText += `\n[page ${i} skipped]\n`;
      }
    }
    return { text: fullText, pagesScanned: pagesToScan };
  } finally {
    await worker.terminate();
  }
}

// OCR a plain image file.
export async function runImageOcr(file) {
  const createWorker = await loadTesseract();
  const worker = await createWorker("eng");
  try {
    const result = await Promise.race([
      worker.recognize(file),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OCR timeout")), OCR_PAGE_TIMEOUT_MS)
      ),
    ]);
    return { text: result.data.text };
  } finally {
    await worker.terminate();
  }
}
