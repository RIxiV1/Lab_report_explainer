# ForMen Lab Report Explainer

A specialized interpretative tool designed to translate complex semen analysis parameters into actionable, plain-English insights. This application focuses on male reproductive health by mapping clinical lab values against standard WHO fertility guidelines.

## Logical Foundation

Unlike generic analysis tools, this system implements a custom rule engine that processes primary fertility indicators:
- Sperm Count and Concentration
- Total and Progressive Motility
- Morphology (Kruger Strict Criteria)
- Semen Volume and pH
- WBC / Pus Cell counts

The interpretation logic goes beyond simple "Pass/Fail" thresholds, providing contextual nuances for borderline values and prioritizing parameters like motility that have higher correlations with natural conception outcomes.

## Privacy and Persistence Model

The application operates on a strict zero-PII (Personally Identifiable Information) policy. It does not require names, emails, or phone numbers.

### FM Codes
To allow users to return to their results without account creation, the system uses a proprietary FM Code mechanism.
- Results are saved to the browser's local storage.
- A unique FM Code is generated as a key.
- No data leaves the client-side environment; the code is only valid on the device where the report was first generated.

## Technical Architecture

The project is built as a high-performance, single-page application with a focus on fluid, responsive design.

- **Frontend**: React 18+ powered by Vite.
- **OCR & Document Parsing**: 
  - **Tesseract.js**: For client-side optical character recognition of report images.
  - **PDF.js**: For extraction of text layers from PDF documents.
- **Layout**: A custom fluid design system that utilizes CSS Grid (auto-fill) and fluid typography (clamp functions) to ensure native-like behavior on mobile and desktop without extensive media queries.
- **State Management**: React hooks for local persistence and coordinated interpretation processing.
- **Rule Engine**: Standardized JavaScript logic that decouples medical thresholds from UI components for easier updates as clinical guidelines evolve.

## Core Features

- **Automated Report Scanning**: Integrated OCR and PDF parsing that allows users to upload report images or documents, automatically extracting key parameters.
- **Rule-Based Interpretation**: Dynamically generated narratives based on the combination of parameter results.
- **Interactive Checklists**: Personalized next steps categorized by timeline (Immediate, 30 Days, 90 Days).
- **Comparison View**: Ability to track changes over time by comparing multiple reports side-by-side.
- **Simulated Analysis**: A processing layer that provides visual feedback during the interpretative phase.

## Installation and Development

Ensure you have Node.js installed.

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Use `npm run dev` to start the local development server.
4. Use `npm run build` to generate a production-ready bundle.

## Disclaimer

This software serves as an interpretative aid for laboratory reports and is not a substitute for professional medical diagnosis. The insights provided are based on automated analysis of WHO guidelines. All clinical results should be reviewed by a qualified andrologist or medical professional.
