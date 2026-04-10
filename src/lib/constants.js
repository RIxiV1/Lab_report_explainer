export const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];

export const PARAM_META = {
  spermCount: { label: "Sperm Count", unit: "million/mL", whoRange: "≥ 16 million/mL", higherBetter: true },
  motility:   { label: "Motility",    unit: "%",          whoRange: "≥ 42%",            higherBetter: true },
  morphology: { label: "Morphology",  unit: "%",          whoRange: "≥ 4% (Kruger)",    higherBetter: true },
  volume:     { label: "Volume",      unit: "mL",         whoRange: "1.4 – 7.6 mL",     higherBetter: null },
  pH:         { label: "pH",          unit: "",            whoRange: "7.2 – 8.0",        higherBetter: null },
  wbc:        { label: "WBC",         unit: "million/mL",  whoRange: "< 1 million/mL",   higherBetter: false },
};

export const INPUT_FIELDS = [
  { key: "spermCount", label: "Sperm Count",    unit: "million/mL", hint: "WHO: ≥ 16 million/mL",      tooltip: "The concentration of sperm per millilitre of semen.",                          min: 0,   max: 500, step: "any", extraNote: null },
  { key: "motility",   label: "Total Motility",  unit: "%",          hint: "WHO: ≥ 42%",                tooltip: "The percentage of sperm that are moving.",                                     min: 0,   max: 100, step: "any", extraNote: null },
  { key: "morphology", label: "Morphology",      unit: "%",          hint: "WHO: ≥ 4% (Kruger strict)", tooltip: "The percentage of sperm with a normal shape, using Kruger strict criteria.", min: 0,   max: 100, step: "any", extraNote: "Even 2–3% is more common than you think." },
  { key: "volume",     label: "Semen Volume",    unit: "mL",         hint: "WHO: 1.4 – 7.6 mL",         tooltip: "The total amount of semen produced in one ejaculate.",                         min: 0,   max: 30,  step: "any", extraNote: null },
  { key: "pH",         label: "pH",              unit: null,         hint: "WHO: 7.2 – 8.0",             tooltip: "The acidity level of semen — should be slightly alkaline.",                    min: 6.0, max: 9.0, step: "0.1", extraNote: null },
  { key: "wbc",        label: "WBC / Pus Cells", unit: "million/mL", hint: "WHO: < 1 million/mL",        tooltip: "White blood cells in semen — elevated levels may indicate infection.",          min: 0,   max: 50,  step: "any", extraNote: null },
];

export const FM_CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export const DRAFT_KEY = "fm_input_draft";

export const FERTIQ_URL = "https://www.formen.health/products/fertiq-male-fertility-supplement?utm_source=lab-report&utm_medium=tool&utm_campaign=fertiq";

export const VERDICT_CONFIG = {
  ALL_NORMAL: { label: "Looking Good",    bg: "bg-green-50",  border: "border-green-500", text: "text-green-700" },
  ATTENTION:  { label: "Needs Attention", bg: "bg-amber-50",  border: "border-amber-500", text: "text-amber-700" },
  ACT_NOW:    { label: "Act Now",         bg: "bg-red-50",    border: "border-red-500",   text: "text-red-700" },
};

export const STATUS_CONFIG = {
  NORMAL:   { border: "border-l-green-500", badgeBg: "bg-green-100", badgeText: "text-green-700", label: "Normal",     dotColor: "#15803d" },
  WARNING:  { border: "border-l-amber-500", badgeBg: "bg-amber-100", badgeText: "text-amber-700", label: "Borderline", dotColor: "#b45309" },
  CRITICAL: { border: "border-l-red-500",   badgeBg: "bg-red-100",   badgeText: "text-red-700",   label: "Act Now",    dotColor: "#be123c" },
};

export const TIMELINE_ORDER = ["Immediate", "30 Days", "90 Days"];

export const STATUS_LABELS = { NORMAL: "Normal", WARNING: "Borderline", CRITICAL: "Critical" };

export const STATUS_RANK = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
