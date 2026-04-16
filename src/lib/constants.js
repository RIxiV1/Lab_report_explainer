export const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];

// Currently all params are required. If optional params are added later,
// this can diverge from PARAM_ORDER.
export const REQUIRED_PARAMS = PARAM_ORDER;


// Single source of truth for parameter display + analysis metadata.
// Form-specific config (hint/tooltip/min/max/step) lives in FIELD_CONFIG below.
export const PARAM_META = {
  spermCount: { label: "Sperm Count",    unit: "million/mL", whoRange: "≥ 16 million/mL", higherBetter: true  },
  motility:   { label: "Total Motility", unit: "%",          whoRange: "≥ 42%",           higherBetter: true  },
  morphology: { label: "Morphology",     unit: "%",          whoRange: "≥ 4% (Kruger)",   higherBetter: true  },
  volume:     { label: "Volume",         unit: "mL",         whoRange: "1.4 – 7.6 mL",    higherBetter: null  },
  pH:         { label: "pH",             unit: "",           whoRange: "7.2 – 8.0",       higherBetter: null  },
  wbc:        { label: "WBC (Pus Cells)", unit: "million/mL", whoRange: "< 1 million/mL", higherBetter: false },
};

// Form-input config only — label/unit derive from PARAM_META.
// Keys must match PARAM_ORDER; InputForm overrides `label` for "Semen Volume".
const FIELD_CONFIG = {
  spermCount: { hint: "Healthy: 16 million/mL or more",     tooltip: "How many sperm are in each millilitre of your sample.", min: 0, max: 500, step: "any" },
  motility:   { hint: "Healthy: 42% or more",               tooltip: "How many sperm are moving.",             min: 0, max: 100, step: "any" },
  morphology: { hint: "Healthy: 4% or more (Kruger)", tooltip: "How many sperm have a normal shape, using the Kruger method.", min: 0, max: 100, step: "any", extraNote: "Even 2–3% is more common than you'd think." },
  volume:     { hint: "Healthy: 1.4 – 7.6 mL",        tooltip: "The total amount of semen in one sample.", min: 0.1, max: 30,  step: "any", label: "Semen Volume" },
  pH:         { hint: "Healthy: 7.2 – 8.0",           tooltip: "How acidic or alkaline the sample is.",               min: 0, max: 14,  step: "any" },
  wbc:        { hint: "Healthy: below 1 million/mL",      tooltip: "Pus cells in semen. High values can mean infection.", min: 0, max: 100, step: "any" },
};

export const REQUIRED_FIELDS = PARAM_ORDER.map((key) => ({
  key,
  label: FIELD_CONFIG[key].label ?? PARAM_META[key].label,
  unit: PARAM_META[key].unit,
  extraNote: null,
  ...FIELD_CONFIG[key],
}));

// ── TMSC (Total Motile Sperm Count) reference tiers ────────────────
// TMSC = Volume × Concentration × (Total Motility / 100)
//
// These thresholds are widely used in reproductive medicine as reference
// ranges. We deliberately do NOT name specific treatment pathways (IUI,
// IVF, ICSI) — recommending a specific clinical course is a diagnostic
// function that belongs with a qualified doctor, not this tool.
export const TMSC_TIERS = {
  NATURAL: {
    min: 20,
    label: "Good for trying naturally",
    description: "A TMSC of 20 million or more usually means good chances of conceiving naturally, given enough time.",
  },
  IUI: {
    min: 5,
    label: "Worth talking to a fertility doctor",
    description: "A TMSC between 5 and 20 million is a grey zone. A fertility doctor can walk you through what this means for your options.",
  },
  IVF: {
    min: 0,
    label: "See a fertility doctor soon",
    description: "A TMSC below 5 million is a clear signal worth acting on. A fertility doctor will give you the clearest picture of what comes next.",
  },
};


export const FM_CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export const FERTIQ_URL = "https://www.formen.health/products/fertiq-male-fertility-supplement?utm_source=lab-report&utm_medium=tool&utm_campaign=fertiq";

// Summary state config — descriptive, not evaluative.
// Previous labels ("Looking Strong" / "Act Now") read diagnostic; renamed
// to plain descriptors so the UI summarises the report rather than
// pronouncing a verdict. Clinical decisions stay with a doctor.
// Palette: emerald → amber → deep orange (saturated reds trigger stress).
export const VERDICT_CONFIG = {
  ALL_NORMAL: { label: "Everything looks healthy", bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-700" },
  ATTENTION:  { label: "A few things to watch", bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-700" },
  ACT_NOW:    { label: "Some things need attention", bg: "bg-orange-50", border: "border-orange-600", text: "text-orange-700" },
};

export const STATUS_CONFIG = {
  NORMAL:   { badgeBg: "bg-wellness-100",  badgeText: "text-wellness-800", label: "Normal",      dotColor: "#659F73" },
  WARNING:  { badgeBg: "bg-yellow-100",    badgeText: "text-yellow-800",   label: "Borderline",  dotColor: "#B77900" },
  CRITICAL: { badgeBg: "bg-orange-100",    badgeText: "text-orange-700",   label: "Needs Focus", dotColor: "#c2410c" },
};


export const TIMELINE_ORDER = ["Immediate", "30 Days", "90 Days"];

export const STATUS_RANK = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
