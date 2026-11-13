---
name: Clinical Vitals System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#1b6b51'
  on-secondary: '#ffffff'
  secondary-container: '#a6f2d1'
  on-secondary-container: '#237157'
  tertiary: '#006398'
  on-tertiary: '#ffffff'
  tertiary-container: '#4aaaef'
  on-tertiary-container: '#003c5e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#a6f2d1'
  secondary-fixed-dim: '#8bd6b6'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#00513b'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.03em
  display-md:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 3rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  title-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a modern clinical telemetry aesthetic: precise, dependable, and vital. Designed for high-frequency clinical monitoring, patient vitals tracking, and healthcare dashboards, it balances professional composure with fresh, reassuring energy. 

The aesthetic is clean clinical modernism. Crisp geometric display typography anchors key biometric readings, while utilitarian neutral type ensures effortless legibility across complex diagnostic tables and patient charts. Elevated pure white surfaces sit above a cool mist structural canvas, paired with pill-inspired rounded containers that soften the clinical environment without sacrificing data density or analytical authority.

## Colors

The palette establishes an immediate sense of biological health, precision, and clarity.

- **Primary (`#10B981` Fresh Emerald):** Primary actions, active diagnostic toggles, confirmed normal baseline states, and core interactive targets.
- **Secondary (`#065F46` Forest Pine):** Structural grounding, primary header emphasis, deep contextual badges, and high-contrast anchors.
- **Tertiary (`#0284C7` Sky Blue):** Secondary telemetry, respiratory and oxygen saturation metrics, informational callouts, and secondary trendlines.
- **Neutral (`#111827` Midnight Ink):** High-contrast body copy and primary clinical values.
- **Supportive Accents:**
  - Amber Gold (`#F59E0B`): Clinical warnings, parameter shifts, and diagnostic milestones.
  - Soft Rose (`#EF4444`): Critical flags, out-of-range biometrics, and immediate attention states.
  - Slate Grey (`#4B5563` and `#6B7280`): Supportive metadata, unit labels, and secondary contextual captions.
  - Cool Mist (`#F3F4F6`): Base canvas backdrop.
  - Pure White (`#FFFFFF`): Elevated card and panel surfaces.
  - Border Slate (`#E5E7EB`): Structural dividers, perimeter rings, and grid tracks.

## Typography

Space Grotesk provides a technical, forward-looking structure for display figures, primary section headings, and diagnostic readings. Its geometric apertures bring clarity to numerical vitals without feeling overly mechanized.

Inter delivers neutral, highly legible support across dense clinical charts, labels, medication descriptions, and longitudinal history. Tabular numerals (`tnum`) must be enforced for all vital signs, timestamps, and metric listings to ensure vertical alignment across changing live feeds.

## Layout & Spacing

The layout is built on an adaptive 12-column grid anchored by a 4px/8px incremental base unit. 

- **Desktop (1024px+):** 12 columns, 1.5rem (24px) gutters, and 2rem (32px) minimum outer canvas margins. Multi-pane panels split between navigation/patient roster, central telemetry feeds, and diagnostic history.
- **Tablet (768px - 1023px):** 8 columns, 1rem (16px) gutters, and 1.5rem (24px) canvas margins. Panels stack into modular secondary sheets or tabbed sections.
- **Mobile (< 768px):** 4 columns, 1rem (16px) gutters, and 1rem (16px) canvas margins. Layout shifts to vertical stacking, prioritized vital cards, and persistent bottom-docked quick actions.

## Elevation & Depth

Visual hierarchy uses crisp, pure white containers atop the cool mist canvas, paired with low-contrast borders and light ambient shadows.

- **Level 0 (Canvas):** Cool Mist (`#F3F4F6`) un-elevated base layer.
- **Level 1 (Standard Metric Cards & Panels):** Pure White (`#FFFFFF`) surface, 1px structural outline of `#E5E7EB`, and an ambient shadow: `0 1px 3px 0 rgba(17, 24, 39, 0.04), 0 1px 2px -1px rgba(17, 24, 39, 0.04)`.
- **Level 2 (Hover States, Interactive Cards, Dropdowns):** Pure White (`#FFFFFF`) surface, `#E5E7EB` border, and shadow: `0 4px 6px -1px rgba(17, 24, 39, 0.06), 0 2px 4px -2px rgba(17, 24, 39, 0.04)`.
- **Level 3 (Modals, Clinical Alert Overlays, Drawers):** Pure White (`#FFFFFF`) surface, subtle `#10B981` tinted perimeter shadow: `0 20px 25px -5px rgba(6, 95, 70, 0.08), 0 8px 10px -6px rgba(6, 95, 70, 0.04)`.

## Shapes

The design uses a roundedness level of 3 (pill-shaped foundation), yielding a soft yet technical feel. 

Primary buttons, status chips, search bars, and floating controls utilize full pill perimeters (`9999px`). Metric display cards, flyouts, and modular containers use generous, soft radiuses (`1.5rem` to `2rem` / 24px–32px), creating distinct visual zones that reduce perceived visual friction in high-stress clinical monitoring workflows.

## Components

### Buttons
- **Primary:** Fresh Emerald (`#10B981`) background, Pure White text, pill shape (`9999px`), 0.75rem vertical by 1.5rem horizontal padding. Hover shifts to deep Forest Pine (`#065F46`).
- **Secondary:** Pure White surface, 1px Border Slate (`#E5E7EB`), Midnight Ink (`#111827`) text. Hover transitions border to `#10B981` with faint emerald tint.
- **Destructive / Flagged:** Soft Rose (`#EF4444`) fill or 1px rose border for critical intervention toggles.

### Chips & Badges
- **Vitals Status Badges:** Fully rounded (`rounded-full`), 0.25rem vertical by 0.75rem horizontal padding, label-md typography.
  - Normal/Stable: 10% Fresh Emerald background with Forest Pine text (`#065F46`).
  - Secondary Telemetry: 10% Sky Blue background with `#0369A1` text.
  - Caution/Review: 10% Amber Gold background with `#B45309` text.
  - Critical/Out of Range: 10% Soft Rose background with `#B91C1C` text.

### Metric Cards
- Pure White background, 1.5rem (24px) padding, `rounded-2xl` (1.5rem) corners, framed by a 1px `#E5E7EB` border.
- Features a header row with vital label (Slate Grey) alongside an optional sparkline or trend badge, an oversized Space Grotesk reading (`display-md`), and a footer indicating delta variance against standard reference intervals.

### Form Inputs
- 1px `#E5E7EB` border, Pure White fill, 0.75rem vertical and 1rem horizontal padding, `rounded-xl` (1rem) curvature. 
- Focused state transitions border directly to Fresh Emerald (`#10B981`) with a 3px outer ring tinted at 15% opacity.

### Lists & Clinical Data Tables
- Edge-to-edge within white cards. 
- Alternating subtle rows or clean 1px bottom borders in `#E5E7EB`.
- Column headers styled in `label-sm`, uppercase, Slate Grey (`#6B7280`), with tabular numeric alignment for continuous telemetry streams.

### Alert Banners
- Full-width modular pill containers, with high-contrast indicator dots and an icon placed inline with Space Grotesk headline text for instantaneous anomaly detection.