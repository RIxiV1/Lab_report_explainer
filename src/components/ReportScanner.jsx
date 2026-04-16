import { useState, useRef, useEffect } from "react";
import { parseReportText } from "../lib/parseReportText";
import { PARAM_META, PARAM_ORDER } from "../lib/constants";
import { logParseAttempt } from "../lib/telemetry";
import {
  loadPdfPages,
  buildPdfTextCandidates,
  runPdfOcr,
  runImageOcr,
  MIN_USABLE_TEXT_LENGTH,
} from "../lib/pdfExtract";

const STEPS_TEXT = [
  "Opening your report...",
  "Reading the text...",
  "Finding your numbers...",
  "Done.",
];

const STEPS_OCR = [
  "Opening your report...",
  "This is a scanned file — reading the image...",
  "Preparing each page...",
  "Reading the text from the image...",
  "Finding your numbers...",
  "Done.",
];

const STEPS_IMAGE = [
  "Opening the image...",
  "Reading the text...",
  "Finding your numbers...",
  "Done.",
];

const STEP_TICK_MS = 800;
const PASTE_DELAY_MS = 300;

// Computes the fields that the parser did NOT extract successfully.
// Used in telemetry entries.
const missingFieldsFrom = (parsed) =>
  parsed ? PARAM_ORDER.filter((k) => !(k in parsed.results)) : PARAM_ORDER;

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
  const startedAtRef = useRef(0);
  // Tracks the deferred paste-parse timer so we can cancel it if the
  // component unmounts mid-delay (avoids "setState on unmounted" warnings
  // and stale telemetry). Both paste paths reuse this slot.
  const pasteTimerRef = useRef(null);

  const durationSinceStart = () =>
    startedAtRef.current ? Date.now() - startedAtRef.current : null;

  useEffect(() => {
    if (status !== "processing") return;
    const interval = setInterval(() => {
      setCurrentStep((p) => (p < steps.length - 1 ? p + 1 : p));
    }, STEP_TICK_MS);
    return () => clearInterval(interval);
  }, [status, steps.length]);

  // Cancel any pending paste-parse timer when the scanner unmounts so
  // the deferred callback can't try to setState on a dead component.
  useEffect(() => () => {
    if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
  }, []);

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
    const meta = {
      subtypes: parsed.subtypes || {},
      unitWarnings: parsed.unitWarnings || {},
      extras: parsed.extras || {},
    };
    setExtractedMeta(meta);
    onExtracted(parsed.results, meta);
  };

  const finishWithError = (msg) => {
    setStatus("error");
    setMessage(msg);
  };

  const finishParsedOrError = (parsed, errorMsg) => {
    if (parsed) finishWithResult(parsed);
    else finishWithError(errorMsg);
  };

  // Records a telemetry entry for paste-sourced text.
  // PDF and OCR paths log their own entries directly.
  const finishPastedText = (text) => {
    const parsed = tryParse(text);
    logParseAttempt({
      source: "paste",
      strategy: "paste",
      outcome: parsed ? "success" : "paste-no-matches",
      foundFields: parsed ? Object.keys(parsed.results) : [],
      missingFields: missingFieldsFrom(parsed),
      unitWarnings: parsed ? Object.keys(parsed.unitWarnings || {}) : [],
      subtypes: parsed?.subtypes || {},
      pastedLength: text.length,
      durationMs: durationSinceStart(),
    });
    finishParsedOrError(
      parsed,
      "Could not find semen analysis metrics. Try pasting the report text or use manual entry."
    );
  };

  const runOCROnPdf = async (pdf, meta = {}) => {
    setSteps(STEPS_OCR);
    setCurrentStep(2);

    try {
      const { text, pagesScanned } = await runPdfOcr(pdf, {
        onPageStart: () => setCurrentStep(3),
      });
      setCurrentStep(4);

      const parsed = tryParse(text);
      logParseAttempt({
        source: "pdf-ocr",
        strategy: "ocr",
        outcome: parsed ? "success" : "ocr-no-matches",
        foundFields: parsed ? Object.keys(parsed.results) : [],
        missingFields: missingFieldsFrom(parsed),
        unitWarnings: parsed ? Object.keys(parsed.unitWarnings || {}) : [],
        subtypes: parsed?.subtypes || {},
        pagesScanned,
        fileSize: meta.fileSize,
        pageCount: meta.pageCount,
        ocrTextLength: text.length,
        durationMs: durationSinceStart(),
      });
      finishParsedOrError(
        parsed,
        "We couldn't find the test values in this file. Paste the report text below, or type the numbers in by hand."
      );
    } catch (err) {
      console.error("PDF OCR failed:", err);
      logParseAttempt({
        source: "pdf-ocr",
        outcome: "error",
        errorMessage: String(err?.message || err),
        fileSize: meta.fileSize,
        pageCount: meta.pageCount,
        durationMs: durationSinceStart(),
      });
      finishWithError("Couldn't read this PDF. Try a clearer picture, or paste the text below.");
    }
  };

  const extractTextFromPDF = async (file) => {
    setStatus("processing");
    setSteps(STEPS_TEXT);
    setCurrentStep(0);
    startedAtRef.current = Date.now();

    const fileSize = file.size;
    let pageCount = null;
    // Held outside the try so the finally can release pdfjs's internal
    // worker buffers. Without this, repeated uploads accumulate memory.
    let pdfDoc = null;

    try {
      const { pdf, pageContents, totalCharCount } = await loadPdfPages(file);
      pdfDoc = pdf;
      pageCount = pdf.numPages;
      setCurrentStep(1);

      // Empty text layer → straight to OCR
      if (totalCharCount < MIN_USABLE_TEXT_LENGTH) {
        logParseAttempt({
          source: "pdf", strategy: null, outcome: "text-layer-empty",
          fileSize, pageCount, totalCharCount,
          durationMs: durationSinceStart(),
          note: "falling through to OCR",
        });
        await runOCROnPdf(pdf, { fileSize, pageCount });
        return;
      }

      // Try each reconstruction strategy; pick the one with the most
      // parser matches. Track scores for telemetry.
      const candidates = buildPdfTextCandidates(pageContents);
      let best = null;
      let bestStrategy = null;
      const strategyScores = {};
      for (const c of candidates) {
        const parsed = tryParse(c.text);
        strategyScores[c.name] = parsed?.foundCount ?? 0;
        if (parsed && (!best || parsed.foundCount > best.foundCount)) {
          best = parsed;
          bestStrategy = c.name;
        }
      }

      if (best) {
        setCurrentStep(2);
        logParseAttempt({
          source: "pdf", strategy: bestStrategy, outcome: "success",
          foundFields: Object.keys(best.results),
          missingFields: missingFieldsFrom(best),
          unitWarnings: Object.keys(best.unitWarnings || {}),
          subtypes: best.subtypes || {},
          strategyScores, fileSize, pageCount, totalCharCount,
          durationMs: durationSinceStart(),
        });
        finishWithResult(best);
        return;
      }

      // Text layer present but nothing parses — fall through to OCR
      logParseAttempt({
        source: "pdf", strategy: null, outcome: "text-parsed-no-matches",
        strategyScores, fileSize, pageCount, totalCharCount,
        durationMs: durationSinceStart(),
        note: "falling through to OCR",
      });
      await runOCROnPdf(pdf, { fileSize, pageCount });
    } catch (err) {
      console.error("PDF extraction failed:", err);
      logParseAttempt({
        source: "pdf", outcome: "error",
        errorMessage: String(err?.message || err),
        fileSize, pageCount,
        durationMs: durationSinceStart(),
      });
      finishWithError("Couldn't read this PDF. Try uploading a photo of your report, or paste the text below.");
    } finally {
      // Release pdfjs's internal worker buffers. Without this, repeated
      // uploads accumulate memory until the tab eventually OOMs (esp.
      // on lower-end mobile devices common in the Indian user base).
      // .destroy() returns a promise but is fire-and-forget here.
      if (pdfDoc?.destroy) pdfDoc.destroy().catch(() => {});
    }
  };

  const handleImageOCR = async (file) => {
    setStatus("processing");
    setSteps(STEPS_IMAGE);
    setCurrentStep(0);
    startedAtRef.current = Date.now();

    const fileSize = file.size;

    try {
      setCurrentStep(1);
      const { text } = await runImageOcr(file);
      setCurrentStep(2);

      const parsed = tryParse(text);
      logParseAttempt({
        source: "image-ocr", strategy: "ocr",
        outcome: parsed ? "success" : "ocr-no-matches",
        foundFields: parsed ? Object.keys(parsed.results) : [],
        missingFields: missingFieldsFrom(parsed),
        unitWarnings: parsed ? Object.keys(parsed.unitWarnings || {}) : [],
        subtypes: parsed?.subtypes || {},
        fileSize, ocrTextLength: text.length,
        durationMs: durationSinceStart(),
      });
      finishParsedOrError(
        parsed,
        "We couldn't find the test values in this file. Paste the report text below, or type the numbers in by hand."
      );
    } catch (err) {
      console.error("Image OCR failed:", err);
      logParseAttempt({
        source: "image-ocr", outcome: "error",
        errorMessage: String(err?.message || err),
        fileSize,
        durationMs: durationSinceStart(),
      });
      finishWithError("Couldn't read this image. Try pasting the text below instead.");
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
      setMessage("Please upload a PDF or a photo of your report.");
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
      startedAtRef.current = Date.now();
      clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => finishPastedText(text), PASTE_DELAY_MS);
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
    startedAtRef.current = Date.now();
    setTimeout(() => finishPastedText(text), PASTE_DELAY_MS);
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
              <p className="text-[14px] font-semibold text-gray-900">Found {keys.length} values</p>
              <p className="text-[11px] text-gray-500">Read on your phone. Nothing was uploaded.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[1px] bg-surface-divider mb-6">
            {keys.map((key) => {
              const meta = PARAM_META[key];
              if (!meta) return null;
              return (
                <div key={key} className="bg-surface-mid p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{meta.label}</p>
                  <p className="font-serif text-[24px] font-bold text-gray-900 tabular-nums">
                    {extractedData[key]}
                    {meta.unit && <span className="text-[12px] text-gray-500 font-sans font-medium ml-1">{meta.unit}</span>}
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
                  {w.title || `Note on ${meta.label}`}
                </p>
                <p className="text-[12px] text-gray-700 leading-relaxed">
                  {w.message}
                </p>
              </div>
            );
          })}

          <button onClick={() => onAnalyzeNow(extractedData, extractedMeta)} className="btn-primary w-full py-4 text-[14px]">
            Looks right? See My Report
          </button>

          <div className="flex justify-between mt-4">
            <button onClick={handleReset} className="text-[11px] text-gray-500 hover:text-gray-600 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors">
              Use a different file
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
              <p className="text-[13px] font-semibold text-gray-900 mb-3">Reading your report</p>
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
                    <span className={i <= currentStep ? "text-gray-700" : "text-gray-500"}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Stays on your phone. Never uploaded.
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
              <p className="text-[14px] font-semibold text-gray-900 mb-1">Couldn't read this file</p>
              <p role="alert" aria-live="assertive" className="text-[13px] text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="report-paste" className="label-clinical block mb-2">Paste the report text here</label>
            <textarea
              id="report-paste"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your full report text here. We'll look for sperm count, motility, morphology, volume, pH and pus cells."
              className="w-full bg-white p-3 text-[13px] leading-relaxed border border-surface-divider focus:outline-none focus:border-brand-500 transition-colors resize-y"
              rows={6}
            />
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={handlePastedTextSubmit}
              disabled={pastedText.trim().length < 20}
              className="btn-primary py-2.5 px-5 text-[11px]"
            >
              Read This Text
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
  const bgClass = isHovering ? "bg-surface-divider" : "bg-white";

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
              Drop a PDF or photo here, or click to choose a file. You can also paste the report text.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8BB992" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[11px] text-gray-500">Your file stays on your phone. We never upload it.</span>
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
