# ForMen Lab Report Explainer
### Clinically Precise interpretation of Semen Analysis Reports — Powered by WHO 2021 (6th Ed.)

A premium, private-by-design interpretative tool that translates complex fertility parameters into actionable, plain-English insights. Built for precision, speed, and absolute user privacy.

---

## 🏛️ Clinical Foundation

Unlike generic health trackers, this system implements a rigid rule engine mapped directly against the **WHO Laboratory Manual for the Examination and Processing of Human Semen (6th Edition, 2021)**.

- **Primary Indicators**: Processes Sperm Concentration (16M/mL), Total motility (42%), Progressive motility (30%), and Morphology (4%).
- **Secondary Parameters**: Evaluates Semen Volume (1.4mL), pH (7.2+), and WBC/Pus Cells (<1.0M/mL).
- **TMSC Calculation**: Automatically derives the *Total Motile Sperm Count*, the clinical metric highest-correlated with natural conception.
- **Urgency Logic**: Accounts for patient age and TTC (Time to Conceive) duration to flag clinical priority.

## 🛡️ Privacy First (FM Codes)

The application operates on a **Zero-PII** (Personally Identifiable Information) architecture. 

- **Local-Only**: Data is processed and saved strictly within the browser's `localStorage`. No server-side database ever touches user clinical values.
- **Proprietary FM Codes**: Generates unique keys (e.g., `FM-XXXX-XXXX`) allowing users to revisit results without an account.
- **Encrypted-at-Rest Behavior**: Since data never leaves the device, the "account" is the device itself.

## ⚡ Technical Architecture

Built as a high-performance SPA (Single Page Application) with an emphasis on fluid "Modern Alchemist" aesthetics.

- **Core**: React 18 + Vite.
- **OCR Engine**: Tesseract.js for client-side image recognition of printed reports.
- **PDF Extraction**: PDF.js for parsing digital document text layers.
- **Refinement Layer**: `uiUtils.js` provides centralized, clinical rounding and date formatting to avoid OCR artifacts.
- **State Engine**: Consolidated form state with real-time validation feedback.

## ✨ Core Features

- **Editorial Staggered Reveal**: Results flow in with 90ms staggered timing to reduce cognitive load and enhance the premium feel.
- **Real-Time Validation**: Instant feedback on clinical ranges (e.g., pH 0-14) preventing logic errors before submission.
- **Multimodal Entry**: Switch between high-speed PDF scanning and manual pinpoint entry.
- **Interactive Checklists**: Personalised "Next Steps" categorized by biological timeline (Immediate, 30 Days, 90 Days).
- **Comparison Engine**: Compare multiple reports side-by-side to track fertility improvements over time.

## 🛠️ Development

Ensure you have Node.js 18+ installed.

1.  **Install**: `npm install`
2.  **Dev**: `npm run dev` (Starts Vite server)
3.  **Build**: `npm run build` (Generates optimized production bundle)
4.  **Test**: `npm test` (Runs Vitest suite for the rule engine)

## ⚖️ Disclaimer

This software is an **interpretative aid** based on WHO 2021 guidelines. It is not a substitute for professional medical diagnosis. All results should be reviewed by a qualified andrologist or medical professional.

---
© 2024 ForMen Health. Private. Precise. Powerful.
