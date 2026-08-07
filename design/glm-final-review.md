# GLM Final Design Review — Mission Control

## 1. Overall Verdict

**Ship-ready with one critical fix.** The design system is mature, consistent, and well-structured. Typography hierarchy (34px hero → 22px page → 17px topbar → 13.5px sidebar → 12.5px body) is uniform across all 13 screens. Agent color-coding (Henry=purple, Ralph=amber, Scout=green, Echo=teal, etc.) is consistent. The sidebar grouping (WORKSPACE / TEAM / OBSERVE) is clear. One critical dark-mode bug (white card backgrounds) must be fixed before build; everything else is polish.

## 2. Top 5 Must-Fix / Improve Items

### MUST-1: Dark-mode card backgrounds are white (critical)
In the dark variants of Tasks, Agents, and likely other content screens, the card containers still use `fill="#FFFFFF"`. Text on these cards is set to `#E6E9ED` (light text for dark mode), resulting in **light text on white backgrounds = invisible**. Fix: use a dark surface color like `#1B2026` or `#1A1F26` for all card backgrounds in dark mode. This affects task cards, agent hierarchy cards, and the team-status panel.

### MUST-2: Health screen — "WS LATENCY" and "PROVIDER" cards show "100%" instead of real values
Both cards display "100%" with a full progress bar. The WS Latency card should show "74ms" (already visible in the sidebar footer and the card's own subtitle). The Provider card should show the provider name/status (e.g., "deepseek · ok" is in the subtitle but the headline value is meaningless). Replace "100%" with the actual metric.

### MUST-3: Approvals screen — "Approve" button is black (`#161A1F`) in light mode
The primary action "Approve" uses `fill="#161A1F"` (near-black) while the "Review" buttons on the Overview screen also use black. This is fine for consistency, but consider using the brand blue (`#1D4ED8`) for the primary positive action to distinguish "Approve" from generic dark buttons. Green (`#15803D`) would also work and aligns with the "approve" mental model.

### MUST-4: Overview KPI tiles lack card containers
The four KPI tiles (3 running, 5 pending, 14 shipped, $4.82) are bare text with vertical dividers — no card background. Every other screen uses rounded white cards for content grouping. The Overview feels visually flatter than the rest. Wrap KPIs in the same `rx="12"` white card treatment used elsewhere, or at minimum add a subtle background panel.

### MUST-5: Flow diagram — missing cross-lane drill-downs
The flow has no path from **Agents → Sessions** (clicking an agent to see their sessions), **Tasks → Approvals** (a task triggering an approval), or **Sessions → Logs** (drilling from a session into logs). These are core user journeys. Add dashed arrows for these drill-down flows. Also, **Settings** is a dead-end in the sidebar with no flow node.

## 3. Dark Mode Verdict

**Good foundation, one critical bug.** The palette is well-chosen: `#0E1114` bg, `#14181D` sidebar, `#15191D` topbar, `#E6E9ED` primary text, `#96A0AA` secondary, `#6B7681` tertiary. The sun/moon toggle is correctly placed in the topbar (between search and avatar), and the icon swaps correctly (sun with rays in dark = click to go light; moon in light = click to go dark). Status colors adapt well: green `#15803D`→`#3FB950`, red `#B91C1C`→`#F85149`, blue `#1D4ED8`→`#58A6FF`, purple `#6D28D9`→`#BC8CFF`.

**Fix the white card backgrounds (MUST-1)** and dark mode is solid. The badge colors in dark mode (e.g., RUNNING=`#142B4A` bg with `#79C0FF` text, DONE=`#12301F` with `#56D364`, QUEUED=`#332B15` with `#E3B341`) are excellent.

## 4. Flow Diagram Verdict

**Clear and well-structured.** The three-lane layout (Manage Work / Review & Gate / Observe) with the Live Activity band as a cross-cutting event sink is intuitive. The feedback loop from Live Activity back to Overview KPIs is a nice touch. The legend and spacing rules are documented inline.

**Gaps:** Add the missing drill-down flows (MUST-5). The Calendar→Tasks dashed arrow for scheduled runs is good but could also show Cron→Factory (auto-triggered builds). Consider a "Settings" node at the bottom with a link from the sidebar. The "Theme toggle" note in the legend is accurate and verified.

## 5. Light Theme Recommendations

- **KPI tiles need cards** (MUST-4) — visual consistency with other screens.
- **Approve button color** (MUST-3) — consider blue or green instead of black.
- **Logs screen**: The log viewer background is `#EEF0F3` (light gray) which is good for a terminal feel. Consider adding a subtle monospace font-size bump (currently 12px) for readability on dense log lines.
- **Agents screen**: The hierarchy tree lines use `#57606B` at 1.4px stroke — slightly heavy for light mode. Consider `#94A3B8` at 1.2px for a lighter touch.
- **Sessions screen**: The overlapping rounded-rect icons for Sessions are clever but may read as a "copy" icon rather than "sessions." Test with users.

---

*Review based on SVG source analysis of all 13 light + 13 dark wireframes and the user flow diagram. Priorities: MUST-1 is a blocker; MUST-2 through 5 are pre-build improvements.*

---

## Fix Status (2026-08-05)

All MUST items addressed in `wireframes/gen_wireframes.py` and re-rendered (light + dark):

- **MUST-1 ✅** — Root cause: Python default-arg binding captured light palette at def time. `card()`, `pill_btn()`, `progress()`, `bot()`, `text()`, `line()`, `path()` now resolve `None` → current theme at call time. Dark cards verified dark on Tasks/Agents/Tickets/Sessions.
- **MUST-2 ✅** — Health cards now show real values: `74ms` (WS LATENCY), `ok` (PROVIDER) instead of 100%.
- **MUST-3 ✅** — Approve button is now green (`#15803D` light / `#3FB950` dark).
- **MUST-4 ✅** — Overview KPI tiles now wrapped in cards (matches rest of the system).
- **MUST-5 ✅** — Flow diagram updated: Agents node added (Lane C), Tasks→Approvals cross-lane drill, Sessions→Logs drill arrow, Settings node (no longer a dead-end).

Also applied: Agents tree line weight 1.4→1.2 (lighter touch), topbar ws:// text removed (redundant with sidebar, was cramped against toggle).

Verdict now: **ship-ready.**
