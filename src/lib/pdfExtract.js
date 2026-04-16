// PDF + image extraction primitives.
//
// Kept out of the React component so the UI file stays focused on
// rendering. All functions are pure async — they don't touch React state.

export const OCR_MAX_PAGES = 3;
export const PDF_RENDER_SCALE = 2.5;
export const MIN_USABLE_TEXT_LENGTH = 50;

// ── Lazy loaders for heavy dependencies ─────────────────────────────
// pdfjs-dist (~1MB) and tesseract.js are only loaded when the user
// actually drops a file. Keeps the initial bundle small.
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
// Handles tables and multi-column layouts where content-stream order
// != reading order.
export function reconstructByPosition(textContent, yTolerance = 5) {
  const lines = [];
  for (const item of textContent.items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform?.[4] ?? 0;
    const y = item.transform?.[5] ?? 0;
    let line = lines.find((l) => Math.abs(l.y - y) < yTolerance);
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, str: item.str });
  }
  lines.sort((a, b) => b.y - a.y); // PDF Y increases upward → reverse
  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines.map((l) => l.items.map((i) => i.str).join(" ")).join("\n");
}

// Naive stream-order join. Works for simple linear PDFs.
export function reconstructByStream(textContent) {
  return textContent.items.map((i) => i.str || "").join(" ");
}

// Stream order but with newlines when pdfjs signals EOL.
// Preserves line breaks without needing spatial math.
export function reconstructByEOL(textContent) {
  let result = "";
  for (const item of textContent.items) {
    result += item.str || "";
    result += item.hasEOL ? "\n" : " ";
  }
  return result;
}

// Render a PDF page to a PNG data URL at high DPI for OCR accuracy.
export async function renderPageToImage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
}

// ── High-level orchestration ────────────────────────────────────────

// Load a PDF and collect all pages' raw text content. Returns the
// pdfjs document handle (so the caller can OCR it later) plus the
// per-page content array and total character count.
export async function loadPdfPages(file) {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

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
    { name: "position", text: pageContents.map(reconstructByPosition).join("\n") },
    { name: "eol",      text: pageContents.map(reconstructByEOL).join("\n") },
    { name: "stream",   text: pageContents.map(reconstructByStream).join("\n") },
  ];
}

// OCR a PDF by rendering up to OCR_MAX_PAGES pages and running them
// through Tesseract. onPageStart(pageIndex) fires before each page so
// the caller can update progress UI.
export async function runPdfOcr(pdf, { onPageStart } = {}) {
  const createWorker = await loadTesseract();
  const worker = await createWorker("eng");
  try {
    let fullText = "";
    const pagesToScan = Math.min(pdf.numPages, OCR_MAX_PAGES);
    for (let i = 1; i <= pagesToScan; i++) {
      onPageStart?.(i);
      const imgUrl = await renderPageToImage(pdf, i);
      const { data } = await worker.recognize(imgUrl);
      fullText += data.text + "\n";
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
    const { data } = await worker.recognize(file);
    return { text: data.text };
  } finally {
    await worker.terminate();
  }
}
