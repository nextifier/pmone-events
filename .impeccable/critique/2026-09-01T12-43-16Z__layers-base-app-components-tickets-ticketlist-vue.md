---
timestamp: 2026-09-01T12-43-16Z
slug: layers-base-app-components-tickets-ticketlist-vue
---
{
  "target": "layers/base/app/components/tickets/TicketList.vue",
  "surface": "Access code applied banner (Alert variant=success) + its promo twin",
  "mode": "persuade",
  "provenance": "two isolated sub-agents (A design review, B detector+browser)",
  "heuristics": {
    "visibility_of_status": 3,
    "match_real_world": 4,
    "user_control": 2,
    "consistency": 3,
    "error_prevention": 3,
    "recognition_over_recall": 4,
    "flexibility": null,
    "aesthetic_minimalist": 2,
    "error_recovery": null,
    "help_docs": null
  },
  "confirmed_violations": [
    {"id": "desc-contrast", "severity": "P1", "detail": "alert-description 4.19:1 vs AA 4.5:1, caused by text-success-foreground/90 alpha in .cn-alert-variant-success across 27 style packs", "measured_by": "both assessments independently (4.193 / 4.19)"},
    {"id": "touch-target", "severity": "P1", "detail": "Remove button 60.83x28px, 16px under the 44px comfortable target; from size=xs (h-7, text-xs) which also breaks the project's own 14px control-scale rule"},
    {"id": "gutter-wrap", "severity": "P1", "detail": "pe-18 reserves 72px unconditionally; at a 360px box the text column drops to 252px and both title and description wrap, alert height 60->100px. Action only needs 68.83px, so the gutter is not the waste - reserving it at all on a phone is"},
    {"id": "remove-not-undo", "severity": "P1", "detail": "removeAccessCode() never strips ?code= and onMounted re-reads it, so a reload silently re-applies the code. Verified from source."},
    {"id": "long-code-overflow", "severity": "P2", "detail": "A 39-char unbroken code overflows the box by 18.1px and runs under the absolutely positioned action. overflow-wrap computes to normal and the input allows 60 chars. Reported by A only; B did not test this input."}
  ],
  "measured_clean": [
    "alert/card alignment 0.00px at both 512 and 457",
    "no horizontal document overflow at any tested width",
    "no action/text overlap with normal-length codes",
    "console clean, no Vue warnings, no hydration mismatch",
    "RTL mirrors correctly with no RTL branch (logical properties)"
  ],
  "tooling_caveat": "detect.mjs on .vue matches only a narrow slop ruleset (it caught gradient-text but not text-xs, inline color, missing alt, empty button, onclick on div). URL scanning with --viewport needs puppeteer, not installed. An empty result is not a quality gate."
}
