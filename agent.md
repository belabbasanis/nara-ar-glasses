# GLYCO HUD LAYOUT INSTRUCTIONS
Version: 0.2  
Target: Smart-glasses vertical emulator (single screen)  
Goal: Make the HUD readable, analog-friendly, and semantically clear while keeping `TRIGGER_SCAN` always visible.

---

## 1. CORE PRINCIPLES

- The world is primary, the HUD is secondary.
- Current body state (glucose) is more important than any scan or prediction.
- Each on-screen region answers exactly one question:
  - Top: “How am **I** right now?”
  - Middle: “What am I looking at / is the system scanning?”
  - Bottom: “What can I **do** and what might happen if I act?”

When modifying the UI, you MUST preserve this semantic separation.

---

## 2. SCREEN STRUCTURE (VERTICAL)

Treat the vertical screen as three fixed lanes:

1. TOP LANE — STATE
2. MIDDLE LANE — CONTEXT
3. BOTTOM LANE — ACTION + IMPACT

These lanes are locked. Do not swap their semantics or move blocks between them.

---

## 3. TOP LANE — STATE (CURRENT BODY STATUS)

Purpose: show current physiological state at a glance.

Content:
- `SYS: OK`
- `GLUCOSE 118↓ IN_RANGE`
- `2M_AGO`
- Optional secondary line: `CAL 420/1800` and `NET_CARBS 32G`

Rules:
- MUST always display current glucose value and trend when `SYS: OK`.
- MUST NOT show food names or scan results here.
- MUST keep this lane the BRIGHTEST and most stable element.

---

## 4. MIDDLE LANE — CONTEXT (RETICLE + SCAN STATE)

Purpose: reflect what the system is doing without judgments.

Rules:
- Default: targeting reticle, no judgments.
- Scanning: `ANALYZING…`
- MUST NOT display numbers or risk labels here.

---

## 5. BOTTOM LANE — ACTION + IMPACT

Purpose: house the always-visible `TRIGGER_SCAN` CTA and any scan impact data.

### 5.1 TRIGGER_SCAN CTA (ALWAYS VISIBLE)
- `TRIGGER_SCAN` MUST be visible at all times.
- Default: Lowest brightness.
- Active: Disabled or “busy” style.

### 5.2 SCAN RESULTS / IMPACT
- Display above or next to `TRIGGER_SCAN`.
- Allowed: `IMPACT: LOW | MED | HIGH`, `ΔGLUCOSE: +30–50 MG/DL`, `CARBS: 155G`, etc.
- Rules:
  - One line per concept.
  - No narrative or emotional language.
  - Visually differentiate from Top Lane (e.g., dimmer or different accent color like Yellow).

---

## 6. COLOR AND TYPOGRAPHY
- Top Lane: Brightest.
- Severity: Red is ONLY for CURRENT danger. Yellow for hypothetical impact.
- Max 24 chars per line.

---

## 7. DATA CONTRACT

```json
{
  "system_state": "OK",
  "glucose": { "value": 118, "unit": "mg/dL", "trend": "DOWN", "status": "IN_RANGE", "age_minutes": 2 },
  "calories": { "consumed_today": 420, "daily_target": 1800, "net_carbs_grams": 32 },
  "scan": { "state": "IDLE", "impact_level": "HIGH", "delta_glucose_min": 30, "delta_glucose_max": 50, "carbs_grams": 155, "sugars_grams": 68, "fiber_grams": 6 }
}
```