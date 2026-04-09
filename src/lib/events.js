// Lightweight analytics event tracker
// Stores events locally; swap pushEvent() internals to send to any backend later.

const STORAGE_KEY = "fm_analytics";
const MAX_EVENTS = 500;

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

export function trackEvent(name, props = {}) {
  const event = {
    name,
    props,
    ts: new Date().toISOString(),
    url: window.location.pathname,
  };

  // Store locally
  const events = getEvents();
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) { /* storage full — silently drop */ }

  // Console in dev only
  if (import.meta.env.DEV) {
    console.log(`[FM Analytics] ${name}`, props);
  }
}

export function getAnalytics() {
  return getEvents();
}

// Pre-defined event names for consistency
export const EVENTS = {
  FORM_SUBMITTED: "form_submitted",
  REPORT_VIEWED: "report_viewed",
  ACTION_CHECKED: "action_checked",
  ACTION_UNCHECKED: "action_unchecked",
  FM_CODE_COPIED: "fm_code_copied",
  FM_CODE_DOWNLOADED: "fm_code_downloaded",
  FM_CODE_LOADED: "fm_code_loaded",
  COMPARISON_VIEWED: "comparison_viewed",
  PDF_DOWNLOADED: "pdf_downloaded",
  WHATSAPP_SHARED: "whatsapp_shared",
  SUGGESTION_VIEWED: "suggestion_viewed",
  FERTIQ_CLICKED: "fertiq_clicked",
  DOCTOR_CTA_CLICKED: "doctor_cta_clicked",
  SCREEN_CHANGED: "screen_changed",
  PASTE_REPORT_USED: "paste_report_used",
};
