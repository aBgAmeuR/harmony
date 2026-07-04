---
version: alpha
name: Harmony
description: A nocturnal, data-forward music analytics dashboard where a
  softened Spotify-green accent moves through charts, active navigation, upload
  progress, and primary controls. The interface stays compact and analytical:
  pure black canvas, charcoal panels, hairline borders, Spotify Mix typography,
  ranked tables, album thumbnails, and flat chart surfaces carry the product
  without decorative shadows.
colors:
  primary: "#57B660"
  primary-bright: "#72E97D"
  primary-mid: "#5DC267"
  primary-dim: "#37783D"
  primary-deep: "#25562A"
  background: "#000000"
  chart-background: "#0A0A0A"
  surface-sidebar: "#121212"
  surface-card: "#121212"
  surface-popover: "#171717"
  surface-muted: "#1F1F1F"
  surface-secondary: "#2A2A2A"
  surface-accent: "#404040"
  foreground: "#FFFFFF"
  foreground-soft: "#FAFAFA"
  body: "#D9D9D9"
  muted: "#8C8F95"
  chart-label: "#AAAEB4"
  hairline: "#FFFFFF1A"
  input-fill: "#FFFFFF26"
  focus-ring: "#737373"
  destructive: "#FF6467"
  rank-gold-fill: "#F59E0B33"
  rank-gold-text: "#FCD34D"
  rank-silver-fill: "#94A3B833"
  rank-silver-text: "#E2E8F0"
  rank-bronze-fill: "#C2410C40"
  rank-bronze-text: "#FED7AA"
  on-primary: "#FFFFFF"
  on-dark: "#FFFFFF"
typography:
  brand:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.4px
  page-title:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.2px
  widget-value:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.3px
  body-md:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  body-sm:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: 0
  table-label:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: 0
  micro:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  button:
    fontFamily: "'Spotify Mix', ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.625
    letterSpacing: 0
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px
spacing:
  none: 0px
  hairline: 1px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  section: 64px
  sidebar-expanded: 256px
  sidebar-collapsed: 48px
  sidebar-mobile: 288px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 28px
    padding: "{spacing.none} {spacing.sm}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    borderColor: "{colors.hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 28px
    padding: "{spacing.none} {spacing.sm}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 28px
    padding: "{spacing.none} {spacing.sm}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 28px
    padding: "{spacing.none} {spacing.sm}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    width: 28px
    height: 28px
  view-mode-toggle:
    backgroundColor: "transparent"
    activeBackgroundColor: "{colors.primary}"
    textColor: "{colors.muted}"
    activeTextColor: "{colors.on-primary}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    height: 28px
  app-sidebar:
    backgroundColor: "{colors.surface-sidebar}"
    textColor: "{colors.body}"
    borderColor: "{colors.hairline}"
    width: "{spacing.sidebar-expanded}"
    collapsedWidth: "{spacing.sidebar-collapsed}"
  sidebar-item:
    backgroundColor: "transparent"
    activeBackgroundColor: "{colors.surface-accent}"
    textColor: "{colors.body}"
    activeTextColor: "{colors.foreground-soft}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: 28px
  app-header:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.hairline}"
    typography: "{typography.page-title}"
    height: 45px
    padding: "{spacing.sm} {spacing.base}"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.base}"
  chart-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.none}"
    padding: "{spacing.base}"
  catalog-table:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    headerBackgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-sm}"
  catalog-row:
    backgroundColor: "transparent"
    hoverBackgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground}"
    secondaryTextColor: "{colors.body}"
    borderColor: "{colors.hairline}"
    height: 56px
  catalog-thumbnail:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.body}"
    rounded: "{rounded.md}"
    width: 32px
    height: 32px
  rank-badge-gold:
    backgroundColor: "{colors.rank-gold-fill}"
    textColor: "{colors.rank-gold-text}"
    rounded: "{rounded.md}"
    minWidth: 20px
    height: 20px
  rank-badge-silver:
    backgroundColor: "{colors.rank-silver-fill}"
    textColor: "{colors.rank-silver-text}"
    rounded: "{rounded.md}"
    minWidth: 20px
    height: 20px
  rank-badge-bronze:
    backgroundColor: "{colors.rank-bronze-fill}"
    textColor: "{colors.rank-bronze-text}"
    rounded: "{rounded.md}"
    minWidth: 20px
    height: 20px
  input:
    backgroundColor: "{colors.input-fill}"
    textColor: "{colors.foreground}"
    placeholderColor: "{colors.body}"
    borderColor: "{colors.input-fill}"
    focusBorderColor: "{colors.focus-ring}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: 28px
  badge-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.body}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
  tooltip:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.xs} {spacing.md}"
  upload-pipeline-list:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.hairline}"
    runningBackgroundColor: "{colors.primary}"
    rounded: "{rounded.lg}"
---

## Overview

Harmony reads as a premium, always-dark music intelligence product: part streaming companion, part analyst workstation. It uses the confidence of music-platform interfaces - green pulse, album thumbnails, ranked tracks, compressed navigation - but its posture is more technical than entertainment-first. Screens feel built for repeat inspection: a user can scan years of listening history, table rankings, upload pipeline steps, and chart panels without leaving the black analytical shell.

The visual system is compact but not cramped. The page floor is {colors.background} (#000000), the sidebar and cards sit one step above it at {colors.surface-sidebar} (#121212), and structure is drawn with {colors.hairline} (#FFFFFF1A) rather than with heavy depth. The brand color is {colors.primary} (#57B660), a softened streaming green used for active controls and key data marks; brighter chart tiers such as {colors.primary-bright} (#72E97D) appear when visualization needs more light.

Typography does quiet work. Spotify Mix gives the product a music-native voice, while small sizes, medium weights, and tabular numeric alignment keep the dashboard dense. The result should feel focused, nocturnal, and personal: a listening archive presented as a polished analytics report rather than a raw export.

**Key Characteristics:**

- Always-dark canvas: {colors.background} holds every authenticated screen and makes charts, album art, and green accents carry the energy.
- Single green accent family: {colors.primary} anchors controls; {colors.primary-bright}, {colors.primary-mid}, {colors.primary-dim}, and {colors.primary-deep} extend that hue for charts.
- Flat depth model: surfaces separate through charcoal steps and {colors.hairline} borders, not drop shadows.
- Compact analytics density: 28px controls, 32px thumbnails, small typography, right-aligned metrics, and persistent navigation.
- Music-native artifacts: album covers, artist avatars, track rankings, stream counts, minutes listened, and Spotify package language define the product vocabulary.

## Colors

### Brand & Accent

- **Harmony Green** ({colors.primary} - #57B660): The primary interactive and brand color. Use for primary buttons, active toggle sliders, upload progress, selected controls, link accents, logo bars, and moments that should feel "live."
- **Chart Glow Green** ({colors.primary-bright} - #72E97D): The brightest visualization green. Use for foreground chart series, tall active bars, line peaks, and heatmap cells that represent the highest listening intensity.
- **Chart Mid Green** ({colors.primary-mid} - #5DC267): The middle chart tier. Use for secondary bars, ring segments, and intermediate activity levels.
- **Chart Deep Green** ({colors.primary-dim} - #37783D) and **Chart Forest Green** ({colors.primary-deep} - #25562A): The low-intensity end of the data scale. Use behind brighter marks to keep charts tonal rather than rainbow-coded.

### Surface

- **Absolute Black** ({colors.background} - #000000): The app canvas and primary page floor. It should remain dominant; most screens are black first, green second.
- **Chart Black** ({colors.chart-background} - #0A0A0A): A barely lifted black for plot interiors and visualization backplates when a chart needs separation from the page.
- **Sidebar Charcoal** ({colors.surface-sidebar} - #121212): The fixed navigation surface and the default card plate. It is close enough to black to feel integrated but visible enough to frame controls.
- **Popover Charcoal** ({colors.surface-popover} - #171717): Floating menus, combobox content, tooltips in dark mode, and elevated overlays.
- **Muted Graphite** ({colors.surface-muted} - #1F1F1F): Table header bands, subtle row hover fills, recessed controls, card footers, and low-contrast panel divisions.
- **Secondary Graphite** ({colors.surface-secondary} - #2A2A2A): Secondary buttons and badges that need more presence than muted surfaces without becoming primary.
- **Active Slate** ({colors.surface-accent} - #404040): Active sidebar rows, expanded trigger states, and stronger hover states.

### Text

- **Studio White** ({colors.foreground} - #FFFFFF): Primary headings, track names, selected labels, metric values, and high-emphasis chart text.
- **Soft White** ({colors.foreground-soft} - #FAFAFA): Popover foregrounds and selected nav text when pure white would feel too sharp.
- **Silver Body** ({colors.body} - #D9D9D9): Default readable copy, sidebar labels, table labels, button text, and most secondary foreground.
- **Telemetry Gray** ({colors.muted} - #8C8F95): Chart tooltip metadata, very quiet helper text, and details that should recede behind the main data.
- **Chart Label Gray** ({colors.chart-label} - #AAAEB4): Axis labels and visualization annotations. It is cooler than body text and tuned for chart grids.

### Hairlines & Inputs

- **Whisper Hairline** ({colors.hairline} - #FFFFFF1A): The structural line for sidebar edges, table rows, card rings, widget dividers, and header bottoms. It should read as a boundary only after the eye settles.
- **Translucent Input Fill** ({colors.input-fill} - #FFFFFF26): Search, select, and text input fill. It creates a frosted control surface without introducing a new neutral.
- **Focus Ring Gray** ({colors.focus-ring} - #737373): Keyboard focus rings and active input borders, usually applied with opacity so the ring is visible without becoming a brand accent.

### Semantic & Rank

- **Alert Coral** ({colors.destructive} - #FF6467): Destructive actions, failed uploads, validation errors, and serious warnings.
- **Champion Gold** ({colors.rank-gold-fill} / {colors.rank-gold-text}): First-place rank badge. This is the only warm celebration color and should stay limited to rank/status.
- **Runner-Up Silver** ({colors.rank-silver-fill} / {colors.rank-silver-text}): Second-place rank badge with cool slate character.
- **Third-Place Bronze** ({colors.rank-bronze-fill} / {colors.rank-bronze-text}): Third-place rank badge, warmer and darker than gold.

## Typography

**Primary Font Family:** {typography.body-md} uses Spotify Mix with `ui-sans-serif`, `system-ui`, and `sans-serif` fallbacks. The face is geometric and rounded enough to feel music-native, with numerals that hold up in tables and metrics.

| Token                     | Role                              | Size | Weight | Line Height | Letter Spacing |
| ------------------------- | --------------------------------- | ---: | -----: | ----------: | -------------: |
| {typography.brand}        | Sidebar wordmark                  | 20px |    700 |         1.2 |         -0.4px |
| {typography.page-title}   | Route titles and compact headings | 14px |    600 |        1.25 |         -0.2px |
| {typography.widget-value} | Large metric values               | 22px |    700 |           1 |         -0.3px |
| {typography.body-md}      | Track names, normal content       | 14px |    400 |        1.45 |              0 |
| {typography.body-sm}      | Descriptions, nav items, controls | 12px |    400 |       1.625 |              0 |
| {typography.table-label}  | Table headers and metric labels   | 12px |    500 |        1.33 |              0 |
| {typography.micro}        | Tiny badges and hints             | 10px |    500 |         1.2 |              0 |
| {typography.button}       | Buttons and segmented controls    | 12px |    500 |       1.625 |              0 |

### Principles

Hierarchy comes from density, placement, and weight rather than from large display type. Catalog pages rely on {typography.body-md} for names and {typography.body-sm} for descriptions so rows can stay compact. Insight screens reserve {typography.widget-value} for numbers that need instant recognition, with labels dropping to {typography.body-sm}. Use tabular numerals for all metric columns, stream counts, durations, years, ranks, and chart labels.

### Note on Font Substitutes

Spotify Mix is a bundled brand font in this project. If it is unavailable in a generated mockup or external tool, use Inter or system UI as the closest substitute, but keep the compact sizes, medium weights, and tight wordmark tracking. Do not replace it with a decorative music font.

## Layout

### Spacing Scale

The system is based on a compact 4px/8px rhythm: {spacing.xs} for toolbar gaps, {spacing.sm} for compact control padding, {spacing.base} for page header edges, and {spacing.lg} to {spacing.xl} for larger chart or card interiors. {spacing.section} exists for larger editorial or upload screens but should be rare inside the authenticated dashboard.

### Application Shell

The app shell is a fixed two-panel frame. {components.app-sidebar} occupies {spacing.sidebar-expanded} (256px) when expanded and {spacing.sidebar-collapsed} (48px) when collapsed. The main content fills the remaining viewport; catalog routes intentionally avoid centered article widths so tables can use horizontal space. The Listening Habits route is the main exception: it caps dense chart content at a wide analytical measure and uses border rails at very large widths.

### Page Structure

Most package routes follow a two-tier structure:

- A {components.app-header} bar with a page title on the left, optional artist/breadcrumb selector, and a right-aligned toolbar containing Filters, view mode, and date range.
- A primary content region that is either a {components.catalog-table}, a divided chart grid, an upload pipeline card, or an empty state.

### Grid & Rhythm

Catalog tables use a rank column, a title column with thumbnail and two-line text stack, and right-aligned metric columns. Insight dashboards use bordered widget grids: four metric tiles across on desktop, chart-plus-side-panel rows for mixed data, and simple stacked sections on narrow screens. Dividers are part of the layout language; avoid free-floating cards when a shared grid border can express the same structure.

### Whitespace Philosophy

Harmony should feel dense in the way a professional audio tool is dense: lots of signal, little ornament. Use whitespace to separate functional zones, not to create marketing spaciousness. Rows, controls, badges, and headers should stay compact; charts can breathe more because they carry the emotional data story.

## Elevation

Harmony has a flat elevation system.

### Surface Tiers

- **Tier 0 - Canvas:** {colors.background} carries the app and table backgrounds.
- **Tier 1 - Sidebar/Card:** {colors.surface-sidebar} and {colors.surface-card} lift persistent navigation and contained content by one visible step.
- **Tier 2 - Muted/Secondary Controls:** {colors.surface-muted} and {colors.surface-secondary} define table headers, card footers, secondary buttons, and badges.
- **Tier 3 - Popovers:** {colors.surface-popover} plus a {colors.hairline} ring creates overlays without theatrical shadow.

### Shadow Policy

Use no drop shadow for ordinary dashboard panels, cards, tables, or widgets. Subtle `shadow-sm` or `shadow-md` is acceptable only for true floating layers such as navigation menus, combobox popovers, tooltips, and chart tooltip boxes. If a surface is part of the page layout, separate it with color, border, or divider lines instead.

## Components

**`button-primary`** - The primary action control. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, rounded `{rounded.md}`, height 28px, horizontal padding `{spacing.sm}`. Hover may soften to primary at reduced opacity; active state translates down by 1px.

**`button-outline`** - The compact toolbar outline button. Transparent background, `{colors.hairline}` border, `{colors.body}` text, `{typography.button}`, rounded `{rounded.md}`, 28px height. Hover fills with `{colors.input-fill}` or `{colors.surface-muted}`.

**`button-ghost`** - The quiet action button used for header filters and sidebar utilities. Transparent background, `{colors.body}` text, `{typography.button}`, rounded `{rounded.md}`, 28px height. Hover fills with `{colors.surface-muted}` and promotes text to `{colors.foreground}`.

**`button-destructive`** - The delete/error action. Use `{colors.destructive}` as text and a low-opacity destructive fill, not a solid red block unless the action is the only focal point. Keeps `{typography.button}`, `{rounded.md}`, and the 28px control height.

**`icon-button`** - Square toolbar and sidebar trigger. Transparent by default, `{colors.body}` icon, `{rounded.md}`, 28px by 28px. Icon strokes should be thin and consistent, usually 2px.

**`view-mode-toggle`** - Segmented control for list/grid state. The container uses a transparent or outlined shell with `{colors.hairline}` border and `{rounded.md}` corners. The active half is `{colors.primary}` with `{colors.on-primary}` icon color; inactive icons use `{colors.muted}`.

**`app-sidebar`** - Persistent navigation rail. Background `{colors.surface-sidebar}`, text `{colors.body}`, right border `{colors.hairline}`, width `{spacing.sidebar-expanded}` and collapsed width `{spacing.sidebar-collapsed}`. It is visually continuous from top to bottom and holds brand, search, nav groups, and footer links.

**`sidebar-item`** - Navigation row inside the sidebar. Default state is transparent with `{colors.body}` text and thin icons. Active state uses `{colors.surface-accent}` and `{colors.foreground-soft}`; AI/status pills may use `{colors.primary}`. Rows stay 28px tall with `{rounded.md}` corners.

**`app-header`** - Package route header. Background `{colors.background}`, text `{colors.foreground}`, bottom border `{colors.hairline}`, type `{typography.page-title}`, and compact `{spacing.sm}` vertical by `{spacing.base}` horizontal padding. It should read like a control strip, not a marketing header.

**`card`** - Default contained surface. Background `{colors.surface-card}`, text `{colors.foreground}`, ring or border `{colors.hairline}`, rounded `{rounded.lg}`, padding `{spacing.base}`. Card footers may use `{colors.surface-muted}`. No layout card should cast a visible shadow.

**`chart-panel`** - Insight widget or chart region. Background `{colors.background}` or `{colors.chart-background}`, text `{colors.foreground}`, dividers `{colors.hairline}`, square edges when part of a larger grid, and `{spacing.base}` internal padding. Use green chart tiers instead of unrelated categorical colors.

**`catalog-table`** - Ranking table for artists, tracks, and albums. Background `{colors.background}`, header band `{colors.surface-muted}`, borders `{colors.hairline}`, type `{typography.body-sm}`. The table is full-width, horizontally scrollable when needed, and optimized for quick scanning.

**`catalog-row`** - Clickable table row. Transparent by default, `{colors.surface-muted}` on hover, `{colors.foreground}` for title, `{colors.body}` for description, row border `{colors.hairline}`. Metrics are right-aligned with tabular numerals; title cells truncate rather than wrap.

**`catalog-thumbnail`** - Album/artist image treatment. 32px by 32px, rounded `{rounded.md}`, fallback surface `{colors.surface-muted}`, fallback icon `{colors.body}`. Actual image corners can be slightly tighter inside the avatar frame.

**`rank-badge-gold`** - First-place rank indicator. Fill `{colors.rank-gold-fill}`, text `{colors.rank-gold-text}`, rounded `{rounded.md}`, at least 20px by 20px. Use only for rank 1.

**`rank-badge-silver`** - Second-place rank indicator. Fill `{colors.rank-silver-fill}`, text `{colors.rank-silver-text}`, rounded `{rounded.md}`, at least 20px by 20px. Use only for rank 2.

**`rank-badge-bronze`** - Third-place rank indicator. Fill `{colors.rank-bronze-fill}`, text `{colors.rank-bronze-text}`, rounded `{rounded.md}`, at least 20px by 20px. Use only for rank 3.

**`input`** - Search, select, and form input. Fill `{colors.input-fill}`, text `{colors.foreground}`, placeholder `{colors.body}`, focus border `{colors.focus-ring}`, type `{typography.body-sm}`, rounded `{rounded.md}`, 28px height for toolbar controls. Larger forms may use the same language at 32-48px height.

**`badge-secondary`** - Compact metadata pill. Background `{colors.surface-secondary}`, text `{colors.body}`, type `{typography.micro}`, rounded `{rounded.full}`, and tight `{spacing.xs}` / `{spacing.sm}` padding. Use for counts, "Soon", "AI", and pipeline metadata.

**`tooltip`** - Small explanatory overlay. In light-on-dark mode it may invert to `{colors.foreground}` on `{colors.background}` for maximum legibility, with `{typography.body-sm}`, `{rounded.md}`, and `{spacing.xs}` / `{spacing.md}` padding. Keep copy short.

**`upload-pipeline-list`** - Vertical progress list for Spotify package ingestion. Surface `{colors.surface-card}`, borders `{colors.hairline}`, rounded `{rounded.lg}`, row dividers at reduced hairline opacity, running rows tinted by `{colors.primary}`, pending rows lowered in opacity, and completed rows subtly filled with `{colors.surface-muted}`.

## Responsive Behavior

| Name    |       Width | Key Changes                                                                                                                                   |
| ------- | ----------: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile  |     < 768px | Sidebar becomes a sheet at {spacing.sidebar-mobile}; main content takes full width; tables scroll horizontally; chart grids stack one column. |
| Tablet  |  768-1024px | Sidebar can persist or collapse; insight widgets move to two-column grids; headers keep toolbar controls compact.                             |
| Desktop | 1024-1536px | Full {spacing.sidebar-expanded} sidebar, full catalog tables, four-up metric rows, and mixed chart grids.                                     |
| Wide    |    > 1536px | Listening Habits can cap content width and add side border rails; catalog routes may continue full-width for table legibility.                |

### Touch Targets

- Standard toolbar controls are 28px high in the desktop dashboard. On touch-heavy mobile screens, prefer at least 40px and increase form controls toward 44px when the layout is not table-dense.
- Icon-only controls must preserve a visible focus ring using `{colors.focus-ring}`.
- Sidebar rows are compact on desktop, but mobile sheet rows should get more vertical space if new mobile-first screens are designed.

### Collapsing Strategy

- Sidebar collapses from {spacing.sidebar-expanded} to {spacing.sidebar-collapsed} on desktop and becomes a {spacing.sidebar-mobile} sheet on mobile.
- Tables keep their metric alignment and use horizontal overflow rather than wrapping metric cells.
- Insight dashboards stack by section; dividers remain visible so each chart keeps a clear boundary.
- Toolbar clusters should compress by hiding labels before changing color or hierarchy. Preserve the active green state for selected toggles and date/filter affordances.
- Upload and package status views may use centered narrow cards, but authenticated analytics views should keep the app-shell rhythm.

## Known Gaps

- Motion timing is only partially documented. Existing controls use short transitions and some 200-300ms easing, but the system does not yet define a canonical motion scale.
- Dark mode is the only documented mode. There is no light theme variant.
- Success, warning, empty, and skeleton states are not fully extracted beyond destructive red, green progress, and muted empty cards.
- Marketing or public landing pages are not covered in depth; this spec focuses on the authenticated analytics dashboard and upload/package surfaces.
- Grid mode for catalog views is represented by a toggle but not yet fully specified as a card system.
- Advanced filters, social comparison, AI personality screens, exports, and settings are navigation promises with limited captured UI, so their component states remain speculative.
