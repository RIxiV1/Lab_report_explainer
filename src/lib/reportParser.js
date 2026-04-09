// Parses pasted lab report text and extracts semen analysis values.
// Handles common Indian lab report formats (SRL, Thyrocare, Metropolis, Dr Lal PathLabs, etc.)

const PARAM_PATTERNS = [
  {
    key: "spermCount",
    patterns: [
      /sperm\s*(?:count|concentration)\s*[:\-–]?\s*([\d.]+)/i,
      /concentration\s*[:\-–]?\s*([\d.]+)\s*(?:million|mil|x\s*10)/i,
      /count\s*[:\-–]?\s*([\d.]+)\s*(?:million|mil)/i,
    ],
  },
  {
    key: "motility",
    patterns: [
      /total\s*motil(?:ity|e)\s*[:\-–]?\s*([\d.]+)\s*%?/i,
      /motil(?:ity|e)\s*\(?\s*total\s*\)?\s*[:\-–]?\s*([\d.]+)/i,
      /(?:^|\n)\s*motil(?:ity|e)\s*[:\-–]?\s*([\d.]+)\s*%?/im,
    ],
  },
  {
    key: "morphology",
    patterns: [
      /(?:normal\s*)?morphology\s*[:\-–]?\s*([\d.]+)\s*%?/i,
      /normal\s*forms?\s*[:\-–]?\s*([\d.]+)\s*%?/i,
      /kruger.*?[:\-–]?\s*([\d.]+)\s*%?/i,
    ],
  },
  {
    key: "volume",
    patterns: [
      /(?:semen\s*)?volume\s*[:\-–]?\s*([\d.]+)\s*(?:ml|cc)?/i,
      /quantity\s*[:\-–]?\s*([\d.]+)\s*(?:ml|cc)?/i,
    ],
  },
  {
    key: "pH",
    patterns: [
      /\bph\s*[:\-–]?\s*([\d.]+)/i,
      /acidity\s*[:\-–]?\s*([\d.]+)/i,
    ],
  },
  {
    key: "wbc",
    patterns: [
      /(?:wbc|pus\s*cells?|leukocytes?|white\s*blood\s*cells?)\s*[:\-–]?\s*([\d.]+)/i,
      /round\s*cells?\s*[:\-–]?\s*([\d.]+)/i,
    ],
  },
];

export function parseReportText(text) {
  const results = {};
  const matched = {};

  for (const param of PARAM_PATTERNS) {
    for (const pattern of param.patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          results[param.key] = value;
          matched[param.key] = match[0].trim();
          break;
        }
      }
    }
  }

  return { results, matched, foundCount: Object.keys(results).length };
}
