export const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];

// Currently all params are required. If optional params are added later,
// this can diverge from PARAM_ORDER.
export const REQUIRED_PARAMS = PARAM_ORDER;


export const PARAM_META = {
  spermCount: { label: "Sperm Count", unit: "million/mL", whoRange: "≥ 16 million/mL", higherBetter: true },
  motility: { label: "Total Motility", unit: "%", whoRange: "≥ 42%", higherBetter: true },
  morphology: { label: "Morphology", unit: "%", whoRange: "≥ 4% (Kruger)", higherBetter: true },
  volume: { label: "Volume", unit: "mL", whoRange: "1.4 – 7.6 mL", higherBetter: null },
  pH: { label: "pH", unit: "", whoRange: "7.2 – 8.0", higherBetter: null },
  wbc: { label: "WBC (Pus Cells)", unit: "million/mL", whoRange: "< 1 million/mL", higherBetter: false },
};

export const REQUIRED_FIELDS = [
  { key: "spermCount", label: "Sperm Count", unit: "million/mL", hint: "WHO: ≥ 16 million/mL", tooltip: "The concentration of sperm per millilitre of semen.", min: 0, max: 500, step: "any", extraNote: null },
  { key: "motility", label: "Total Motility", unit: "%", hint: "WHO: ≥ 42%", tooltip: "The percentage of sperm that are moving.", min: 0, max: 100, step: "any", extraNote: null },
  { key: "morphology", label: "Morphology", unit: "%", hint: "WHO: ≥ 4% (Kruger strict)", tooltip: "The percentage of sperm with a normal shape, using Kruger strict criteria.", min: 0, max: 100, step: "any", extraNote: "Even 2–3% is more common than you think." },
  { key: "volume", label: "Semen Volume", unit: "mL", hint: "WHO: 1.4 – 7.6 mL", tooltip: "The total amount of semen produced in one ejaculate.", min: 0, max: 30, step: "any", extraNote: null },
  { key: "pH", label: "pH", unit: "", hint: "WHO: 7.2 – 8.0", tooltip: "The acidity/alkalinity of the sample.", min: 0, max: 14, step: "any", extraNote: null },
  { key: "wbc", label: "WBC (Pus Cells)", unit: "million/mL", hint: "WHO: < 1 million/mL", tooltip: "White blood cells or pus cells indicating potential inflammation.", min: 0, max: 100, step: "any", extraNote: null },
];

// ── TMSC (Total Motile Sperm Count) clinical tiers ─────────────────
// TMSC = Volume × Concentration × (Total Motility / 100)
// Thresholds are widely used in reproductive medicine to guide
// treatment pathway decisions.
export const TMSC_TIERS = {
  NATURAL: { min: 20, label: "Natural conception likely", description: "TMSC of 20 million or higher suggests natural conception is likely with time." },
  IUI: { min: 5, label: "IUI may be recommended", description: "TMSC between 5–20 million is the range where intrauterine insemination (IUI) is often successful." },
  IVF: { min: 0, label: "IVF/ICSI territory", description: "TMSC below 5 million typically indicates assisted reproductive technology (IVF or ICSI) offers the best chance." },
};


export const FM_CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export const DRAFT_KEY = "fm_input_draft";

export const FERTIQ_URL = "https://www.formen.health/products/fertiq-male-fertility-supplement?utm_source=lab-report&utm_medium=tool&utm_campaign=fertiq";

// Verdict config — warm, non-alarming palette.
// Research: saturated reds trigger stress responses in health contexts.
// We use emerald → amber → deep orange instead of emerald → amber → red.
export const VERDICT_CONFIG = {
  ALL_NORMAL: { label: "Looking Strong", bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-700" },
  ATTENTION: { label: "Room to Improve", bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-700" },
  ACT_NOW: { label: "Action Plan Ready", bg: "bg-orange-50", border: "border-orange-600", text: "text-orange-700" },
};

export const STATUS_CONFIG = {
  NORMAL:   { badgeBg: "bg-wellness-100",  badgeText: "text-wellness-800", label: "Normal",      dotColor: "#659F73" },
  WARNING:  { badgeBg: "bg-yellow-100",    badgeText: "text-yellow-800",   label: "Borderline",  dotColor: "#B77900" },
  CRITICAL: { badgeBg: "bg-orange-100",    badgeText: "text-orange-700",   label: "Needs Focus", dotColor: "#c2410c" },
};


export const TIMELINE_ORDER = ["Immediate", "30 Days", "90 Days"];

export const STATUS_LABELS = { NORMAL: "Normal", WARNING: "Borderline", CRITICAL: "Critical" };

export const STATUS_RANK = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
