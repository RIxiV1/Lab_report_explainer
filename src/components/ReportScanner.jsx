import { useState, useRef, useEffect } from "react";
import { parseReportText } from "../lib/parseReportText";
import { PARAM_META } from "../lib/constants";

const STEPS_TEXT = [
  "Reading document locally...",
  "Extracting text layer...",
  "Matching semen analysis values...",
  "Done.",
];

const STEPS_OCR = [
  "Reading document locally...",
  "No text layer found — switching to OCR...",
  "Rendering pages as images...",
  "Running optical character recognition...",
  "Matching semen analysis values...",
  "Done.",
];

const STEPS_IMAGE = [
  "Reading image...",
  "Running OCR...",
  "Matching values...",
  "Done.",
];

const STEP_TICK_MS = 800;
const PASTE_DELAY_MS = 300;
const OCR_MAX_PAGES = 3;
const PDF_RENDER_SCALE = 2.5;
const MIN_USABLE_TEXT_LENGTH = 50;

// ── Lazy loaders for heavy dependencies ─────────────────────────────
// pdfjs-dist (~1MB) and tesseract.js are only loaded when the user
// actually drops a file. The dropzone itself stays lightweight.
let pdfjsPromise = null;
function loadPdfjs() {
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
function loadTesseract() {
  if (!tesseractPromise) {
    tesseractPromise = import("tesseract.js").then((mod) => mod.createWorker);
  }
  return tesseractPromise;
}

// Lab PDFs vary wildly. We try multiple reconstruction strategies and
// pick whichever gives the parser the most matches. Empirically, Dr Lal
// PathLabs and Metropolis use table layouts where content-stream order
// != reading order — stream-join yields garbage, spatial grouping works.
// Other labs are the opposite. Trying both is cheap and robust.

// Strategy 1: group items by Y coordinate, sort left-to-right within a
// line. Handles tables and multi-column layouts.
function reconstructByPosition(textContent, yTolerance = 5) {
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

// Strategy 2: naive stream-order join. Works for simple linear PDFs.
function reconstructByStream(textContent) {
  return textContent.items.map((i) => i.str || "").join(" ");
}

// Strategy 3: stream order but with newlines when pdfjs signals EOL
// (modern pdfjs sets hasEOL on the last item of each line). Preserves
// line breaks without needing spatial math.
function reconstructByEOL(textContent) {
  let result = "";
  for (const item of textContent.items) {
    result += item.str || "";
    if (item.hasEOL) result += "\n";
    else result += " ";
  }
  return result;
}

// Render a PDF page to a PNG data URL at high DPI for OCR accuracy.
async function renderPageToImage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
}

export default function ReportScanner({ onExtracted, onAnalyzeNow }) {
  const [isHovering, setIsHovering] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [steps, setSteps] = useState(STEPS_TEXT);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [unitWarnings, setUnitWarnings] = useState({});
  const [extractedMeta, setExtractedMeta] = useState({ subtypes: {} });
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status !== "processing") return;
    const interval = setInterval(() => {
      setCurrentStep((p) => (p < steps.length - 1 ? p + 1 : p));
    }, STEP_TICK_MS);
    return () => clearInterval(interval);
  }, [status, steps.length]);

  // Try parsing a candidate text; returns the parsed result if any
  // metrics were found, else null.
  const tryParse = (text) => {
    const result = parseReportText(text);
    return result.foundCount > 0 ? result : null;
  };

  const finishWithResult = (parsed) => {
    setStatus("success");
    setExtractedData(parsed.results);
    setUnitWarnings(parsed.unitWarnings || {});
    setExtractedMeta({ subtypes: parsed.subtypes || {} });
    onExtracted(parsed.results, { subtypes: parsed.subtypes || {} });
  };

  const finishWithError = (msg) => {
    setStatus("error");
    setMessage(msg);
  };

  const finishWithText = (text) => {
    const parsed = tryParse(text);
    if (parsed) finishWithResult(parsed);
    else finishWithError("Could not find semen analysis metrics. Try pasting the report text or use manual entry.");
  };

  const runOCROnPdf = async (pdf) => {
    setSteps(STEPS_OCR);
    setCurrentStep(2);

    try {
      const createWorker = await loadTesseract();
      const worker = await createWorker("eng");
      let fullText = "";

      const pagesToScan = Math.min(pdf.numPages, OCR_MAX_PAGES);
      for (let i = 1; i <= pagesToScan; i++) {
        setCurrentStep(3);
        const imgUrl = await renderPageToImage(pdf, i);
        const { data } = await worker.recognize(imgUrl);
        fullText += data.text + "\n";
      }

      await worker.terminate();
      setCurrentStep(4);
      finishWithText(fullText);
    } catch (err) {
      console.error("PDF OCR failed:", err);
      finishWithError("Could not read this PDF. Try uploading a clearer image or pasting the report text.");
    }
  };

  const extractTextFromPDF = async (file) => {
    setStatus("processing");
    setSteps(STEPS_TEXT);
    setCurrentStep(0);

    try {
      const pdfjsLib = await loadPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setCurrentStep(1);

      // Collect all pages' textContent once, then try multiple
      // reconstruction strategies on the same data.
      const pageContents = [];
      let totalCharCount = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        pageContents.push(tc);
        totalCharCount += tc.items.reduce((n, it) => n + (it.str?.length || 0), 0);
      }

      // If the text layer is basically empty, skip straight to OCR
      if (totalCharCount < MIN_USABLE_TEXT_LENGTH) {
        await runOCROnPdf(pdf);
        return;
      }

      // Try each strategy; pick the one with the most parser matches
      const candidates = [
        pageContents.map((tc) => reconstructByPosition(tc)).join("\n"),
        pageContents.map((tc) => reconstructByEOL(tc)).join("\n"),
        pageContents.map((tc) => reconstructByStream(tc)).join("\n"),
      ];

      let best = null;
      for (const text of candidates) {
        const parsed = tryParse(text);
        if (parsed && (!best || parsed.foundCount > best.foundCount)) {
          best = parsed;
        }
      }

      if (best) {
        setCurrentStep(2);
        finishWithResult(best);
        return;
      }

      // Text layer exists but nothing parses — likely a rendered-image
      // PDF with junk text annotations. Fall back to OCR.
      await runOCROnPdf(pdf);
    } catch (err) {
      console.error("PDF extraction failed:", err);
      finishWithError("Could not read this PDF. Try uploading an image or pasting the report text instead.");
    }
  };

  const handleImageOCR = async (file) => {
    setStatus("processing");
    setSteps(STEPS_IMAGE);
    setCurrentStep(0);

    try {
      const createWorker = await loadTesseract();
      const worker = await createWorker("eng");
      setCurrentStep(1);
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setCurrentStep(2);
      finishWithText(data.text);
    } catch (err) {
      console.error("Image OCR failed:", err);
      setStatus("error");
      setMessage("Failed to read image. Try pasting text instead.");
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.type === "application/pdf") {
      extractTextFromPDF(file);
    } else if (file.type.startsWith("image/")) {
      handleImageOCR(file);
    } else {
      setStatus("error");
      setMessage("Please upload a PDF or image file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (text) {
      e.preventDefault();
      setStatus("processing");
      setSteps(STEPS_TEXT);
      setCurrentStep(0);
      setTimeout(() => finishWithText(text), PASTE_DELAY_MS);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setMessage("");
    setExtractedData(null);
    setUnitWarnings({});
    setExtractedMeta({ subtypes: {} });
    setPastedText("");
    setCurrentStep(0);
    setSteps(STEPS_TEXT);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePastedTextSubmit = () => {
    const text = pastedText.trim();
    if (!text) return;
    setStatus("processing");
    setSteps(STEPS_TEXT);
    setCurrentStep(0);
    setTimeout(() => finishWithText(text), PASTE_DELAY_MS);
  };

  // ── SUCCESS STATE ──
  if (status === "success" && extractedData) {
    const keys = Object.keys(extractedData);
    return (
      <div className="mb-8 animate-editorial" role="status" aria-live="polite">
        <div className="card-tonal p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #8BB992, #659F73)', boxShadow: '0 4px 12px rgba(101,159,115,0.3)' }}>✓</div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">{keys.length} metrics extracted</p>
              <p className="text-[11px] text-gray-400">Processed locally — your file never left this device</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[1px] bg-[#E3E9EA] mb-6">
            {keys.map((key) => {
              const meta = PARAM_META[key];
              if (!meta) return null;
              return (
                <div key={key} className="bg-[#EFF5F6] p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{meta.label}</p>
                  <p className="font-serif text-[24px] font-bold text-gray-900 tabular-nums">
                    {extractedData[key]}
                    {meta.unit && <span className="text-[12px] text-gray-400 font-sans font-medium ml-1">{meta.unit}</span>}
                  </p>
                </div>
              );
            })}
          </div>

          {Object.entries(unitWarnings).map(([key, w]) => {
            const meta = PARAM_META[key];
            if (!meta) return null;
            return (
              <div key={key} role="alert" className="mb-6 p-4 bg-yellow-50 border-l-[3px] border-yellow-500">
                <p className="text-[12px] font-semibold text-gray-900 mb-1">
                  Clinical note: {meta.label} reported as {w.value} {w.rawUnit}
                </p>
                <p className="text-[12px] text-gray-700 leading-relaxed">
                  Your lab reported this in <strong>{w.rawUnit}</strong>, which can't be graded against the
                  {" "}{meta.unit} threshold used here. For pus cells, values of <strong>1 or more per HPF</strong>
                  {" "}can indicate possible infection (leukocytospermia) and are worth showing to your doctor.
                  If your lab provided a value in {meta.unit}, please enter it manually.
                </p>
              </div>
            );
          })}

          <button onClick={() => onAnalyzeNow(extractedData, extractedMeta)} className="btn-primary w-full py-4 text-[14px]">
            Everything look correct? Analyse Now
          </button>

          <div className="flex justify-between mt-4">
            <button onClick={handleReset} className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors">
              Upload different file
            </button>
            <button onClick={() => onExtracted(extractedData, extractedMeta)} className="text-[11px] text-brand-500 hover:text-brand-700 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors">
              Edit values first
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PROCESSING STATE ──
  if (status === "processing") {
    return (
      <div className="mb-8" role="status" aria-live="polite" aria-busy="true">
        <div className="card-tonal p-10 md:p-14">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #36458E, #111852)', boxShadow: '0 8px 24px rgba(17,24,82,0.2)' }}>
              <div className="w-4 h-4 border-[2px] border-white/30 border-t-white animate-spin rounded-full" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900 mb-3">Processing Your Report</p>
              <div className="space-y-2 text-left max-w-[300px] mx-auto">
                {steps.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[12px] transition-opacity duration-300 ${i <= currentStep ? "opacity-100" : "opacity-20"}`}>
                    <span
                      className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[9px]"
                      style={{
                        background: i < currentStep ? '#8BB992' : i === currentStep ? '#36458E' : '#E3E9EA',
                        color: i <= currentStep ? '#fff' : '#767682',
                      }}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </span>
                    <span className={i <= currentStep ? "text-gray-700" : "text-gray-400"}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Everything stays on this device — nothing is uploaded
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE (with paste-text recovery) ──
  if (status === "error") {
    return (
      <div className="mb-8 animate-editorial">
        <div className="card-tonal bg-orange-50 p-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ background: '#c2410c' }}>!</div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 mb-1">We couldn't read this file</p>
              <p role="alert" aria-live="assertive" className="text-[13px] text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="report-paste" className="label-clinical block mb-2">Paste report text instead</label>
            <textarea
              id="report-paste"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the full text of your report here. We'll look for sperm count, motility, morphology, volume, pH, and WBC."
              className="w-full bg-white p-3 text-[13px] leading-relaxed border border-[#E3E9EA] focus:outline-none focus:border-brand-500 transition-colors resize-y"
              rows={6}
            />
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={handlePastedTextSubmit}
              disabled={pastedText.trim().length < 20}
              className="btn-primary py-2.5 px-5 text-[11px]"
            >
              Parse Pasted Text
            </button>
            <button onClick={handleReset} className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors">
              Try another file
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── IDLE STATE ──
  const bgClass = isHovering ? "bg-[#E3E9EA]" : "bg-white";

  return (
    <div className="mb-8">
      <div
        className={`card-tonal ${bgClass} p-10 md:p-14 transition-all cursor-pointer relative group`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <div className="flex flex-col items-center text-center space-y-5">
          <div
            className="w-12 h-12 text-white flex items-center justify-center group-hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #36458E, #111852)',
              boxShadow: '0 8px 24px rgba(17,24,82,0.2)',
              transition: 'all 0.3s cubic-bezier(0.2,0,0,1)',
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="square" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
          </div>

          <div>
            <h2 className="font-serif text-[22px] tracking-tight mb-2 text-gray-900">
              Upload Lab Report
            </h2>
            <p className="text-[13px] text-gray-500 max-w-[320px] mx-auto leading-relaxed">
              Drop a PDF or image here, click to browse, or paste your report text.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8BB992" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[11px] text-gray-400">File never leaves your device. Processed locally in your browser.</span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleFile(e.target.files[0]); }}
        />
      </div>
    </div>
  );
}
