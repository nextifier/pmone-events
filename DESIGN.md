---
name: PM One Events
description: One exhibition chassis rendered sixteen times, where structure is shared and identity is a slot each event fills.
colors:
  ink: "#000000"
  paper: "#ffffff"
  brand-accent: "#000000"
  signal-info: "oklch(62.3% 0.214 259.815)"
  signal-info-foreground: "oklch(48.8% 0.243 264.376)"
  signal-success: "oklch(72.3% 0.219 149.579)"
  signal-success-foreground: "oklch(52.7% 0.154 150.069)"
  signal-warning: "oklch(79.5% 0.184 86.047)"
  signal-warning-foreground: "oklch(55.4% 0.135 66.442)"
  signal-destructive: "oklch(63.7% 0.237 25.331)"
  signal-destructive-foreground: "oklch(50.5% 0.213 27.518)"
typography:
  hero:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(3rem, 8vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.05em"
  section:
    fontFamily: "var(--font-sans)"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.05em"
  section-description:
    fontFamily: "var(--font-sans)"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "-0.025em"
  body:
    fontFamily: "MinusOne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  control:
    fontFamily: "MinusOne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "-0.025em"
  field:
    fontFamily: "MinusOne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    letterSpacing: "-0.025em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  field-stack: "8px"
  form-column-gap: "8px"
  group: "16px"
  section: "24px"
  page-section: "64px"
components:
  button-default:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-accent:
    backgroundColor: "{colors.brand-accent}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  section-heading:
    textColor: "{colors.ink}"
    typography: "{typography.section}"
  hero-heading:
    textColor: "{colors.ink}"
    typography: "{typography.hero}"
---

# Design System: PM One Events

## Overview

**Creative North Star: "The Exhibition Hall"**

Sixteen event sites are one building rented out sixteen times. The hall is fixed: the same entrance sequence, the same aisles, the same signage system, the same stand dimensions. What changes is who is exhibiting, what colors they hang, and what typeface is on the banner. A visitor who has been to one of these sites can navigate any of the others without learning anything new, and still feel they are somewhere specific.

That split is the whole system. Structure, components, page flow, spacing, and behavior belong to `layers/base` and must never mention a brand. Identity is a set of slots each app fills in `app/assets/css/app.css`: the accent color, the neutral ramp, the display typeface, and the hero treatment. A visual decision that cannot be expressed as one of those slots is either a chassis change (make it in base, for all sixteen) or a mistake.

These are public marketing surfaces, not tools. They can be bolder than an admin screen, and they should be: large type, real photography, generous vertical rhythm, motion that rewards scrolling. What they cannot be is inconsistent about the things a visitor uses to orient, and what they must never be is louder than the exhibitors they are presenting.

**Key Characteristics:**
- Shared chassis, brand-filled slots: accent, neutral ramp, display face, hero
- Marketing scale on public pages, tool scale on forms and interactive controls
- Real exhibitor material and photography carry the persuasion
- Mobile-first weight budget: the first screen decides
- Truthful empty states over decorated placeholders

## Colors

The chassis ships a monochrome default and four status signals; every app then supplies its own neutral ramp and one accent that carries the brand.

### Primary
- **Ink** (`#000000`): The default primary and the color of committed actions when an app has not set an accent. Inverts to paper in dark mode.

### Secondary
- **Brand Accent** (per app, defaults to ink): The single hue that identifies the event. ICC is pink, INACON is yellow with black text on it, FLEI is cyan, Megabuild uses a gold gradient, ICF a custom brown. Declared as `--accent` / `--accent-foreground` in the app's `app.css` and nowhere else.

### Neutral
- **Neutral ramp** (per app, 50 through 950): The chassis deliberately leaves every gray stop commented out, so each app chooses its own ramp (Megabuild runs Tailwind's cool Gray, PM One's admin runs Zinc). Background, foreground, body, border, input, card, popover, and sidebar all resolve from it.

### Tertiary (status signals)
- **Signal Info / Success / Warning / Destructive**: Status only, on the 500 stop with a 700 foreground for text. Used by badges, form validation, ticket and reservation states.

### Named Rules

**The Slot Rule.** Brand color exists in exactly one place: the app's `app.css`. If a component needs to look different for one event, it reads a token; it does not get an `if (event === 'icc')`.

**The One Accent Rule.** One accent per event. It marks the primary path (buy, register, enquire) and the brand's own furniture. A second brand hue means the visitor no longer knows what the accent means.

**The Exhibitor-First Rule.** Exhibitor logos, guest photography, and sponsor marks are the most colorful things on the page, and the chrome around them stays neutral so they read cleanly. The site is the wall, not the artwork.

## Typography

**Body Font:** MinusOne (variable), falling back to `ui-sans-serif, system-ui, sans-serif`
**Display Font:** `--font-display`, per app. The chassis default is the system sans; apps override it (ICC ships Avenir Extra Bold, ICF ships Sink). Heading follows `--font-heading`, which defaults to the same stack.

**Character:** A neutral variable sans does all the reading work so the display face can be as loud as the brand requires without hurting comprehension. The contrast between the two is the point: the display face is for a handful of moments per page, never for content.

### Hierarchy
- **Hero** (per app display face, roughly 3rem to 5.5rem, 1.1): The one statement at the top of a landing page. Owned by `section-title-large`, which each app defines.
- **Section** (500, 2.25rem rising to 3rem at `sm`, 1.2): Every section heading on a public page, via `section-title`. This value is identical in all sixteen apps and is part of the chassis, not the brand.
- **Section description** (400, 1rem rising to 1.125rem at `sm`, relaxed leading, max 36rem): The lead paragraph under a section heading, via `section-description`.
- **Body** (400, 0.875rem): Cards, lists, metadata, table content.
- **Control** (500, 0.875rem): Buttons, tabs, menu items. Fixed at every width.
- **Field** (400, 1rem, dropping to 0.875rem on mouse devices): Typed inputs, textareas, native selects, and the select trigger beside them.

### Named Rules

**The Two-Scale Rule.** A public page has a marketing scale and a tool scale, and they do not blend. Headings, heroes, and lead paragraphs are marketing. Forms, filters, tables, and every interactive control keep the same sizes as the admin, because the same components are used there.

**The Tighter-As-It-Grows Rule.** Everything is `tracking-tight`; from `text-xl` or `font-semibold` up it becomes `tracking-tighter`, and display type goes tighter still. Bigger means tighter, always.

**The Hero Restraint Rule.** `section-title-large` has drifted: `text-[12vw]`, gradient fills, uppercase, skew, and outline treatments now vary widely across apps, and some of that variation is decoration rather than identity. Treat the current values as legacy. New heroes stay within roughly `3rem`–`5.5rem` at desktop, keep the display face and the accent as the brand signal, and add gradient or outline treatment only when that treatment is genuinely the event's identity (ICC's comic title is; a gradient on a B2B expo is not). Do not copy one app's hero rule into another.

**The Semibold Ceiling Rule.** `font-semibold` is the ceiling for interface text. Display type may go heavier when the brand's own typeface requires it, but body, labels, and controls never do.

## Layout

Public pages are a single column of full-width sections over a centered container (`container`, widening through `container-wider` to 1600px). Section rhythm is generous, on the order of 64px and up between page sections, while everything inside a component keeps the tool rhythm: 8px between a label and its field, 16px within a group, 24px between blocks. Two-column form grids use `gap-x-2`.

Breakpoints are `xs` 540, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1500, `3xl` 1600. The first screen is designed at 390px wide, not at desktop and then squeezed: date, place, and the entry action must be reachable without interaction on a phone.

The 21 shared pages have a fixed anatomy: header, one hero or page header, sections in a deliberate order, footer. Event-specific pages (guests, cosplay) extend that anatomy rather than replacing it.

## Elevation & Depth

Flat by default, the same as the admin: hairline borders and surface steps on the neutral ramp do the separating, with shadows reserved for genuinely floating layers (dialog, popover, tooltip, sticky bars). Public pages have one extra depth tool the admin does not: full-bleed imagery and media that establish depth photographically. When a section already carries a photograph, it does not also get a shadow.

### Shadow Vocabulary
- **Resting lift** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Buttons and focused inputs.
- **Card** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Cards that float on a page background rather than sitting in a bordered grid.
- **Floating layer** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dialogs, popovers, tooltips, sticky action bars.

### Named Rules

**The Border-Before-Shadow Rule.** Separate with a border or a surface step first. A shadow is for something that genuinely floats.

## Shapes

Corners follow the shared scale: 6px on chips, 8px on inputs and small buttons, 10px on standard buttons, 14px on cards and panels, full on avatars and status dots, `squircle` on brand marks and app icons. All of it derives from one `--radius` (0.625rem), and the `lyra` and `sera` styles force it to zero.

Media is the exception worth stating: hero imagery and full-bleed sections go edge to edge with no radius, because a rounded photograph inside a rounded card inside a rounded section is how a page starts to look like a template.

## Components

`components/ui` is the shared primitive library, identical across this repo, PM One's admin, and levenium. Its rules are the same everywhere: buttons, inputs, dialogs, badges, tables, and empty states come from primitives, sizing is owned by the active style pack, and call sites never hardcode the box.

Above that sits the exhibition layer, which exists only here:

### Header and navigation
Per-app logo and route list from `app.config.ts`, sticky, collapsing to a sheet on mobile. Routes are declared as data, never hand-written per page, so an event that has no gallery simply has no gallery link.

### Hero and countdown
The opening statement: display type, date, venue, and one primary action, with a countdown when the event is upcoming. This is the only place per-app display typography and accent appear at full strength.

### Brand directory (signature component)
The exhibitor list is the most-used surface on these sites and has the most machinery behind it: search, filters, table and grid views, virtualized lists, skeletons per view mode, related brands, and a preview dialog. It must stay fast at several thousand rows and must render an honest empty state for an edition that has no exhibitors yet.

### Content sections
`section-title` + `section-description` + content, repeated down the page: about, facts and figures, rundown, gallery, partners, FAQ, news. The order is editorial per app; the anatomy is not.

### Forms
Book space, sponsorship, media partner, and contact all use the admin's field primitives at tool scale, with validation and error messages from the same components. A marketing page does not get a prettier input.

### Empty states
The `EmptyState` component with truthful copy. An edition with no exhibitors, no gallery, or no rundown says so.

### Named Rules

**The Base Is Brand-Blind Rule.** No component in `layers/base` may name an event, hardcode a brand color, or branch on the app. Everything it needs comes from tokens and `app.config.ts`.

**The Three-Repo Rule.** `components/ui` changes propagate to all three repositories in the same pass, along with the nine `style-*.css` files. A fix that lands in one repo is a divergence, not a fix.

**The Style-Owns-The-Box Rule.** Never attach `bg-*`, `border-*`, `h-*`, `rounded-*`, `px-*`, or `shadow-*` to an input-like element at the call site; those belong to the `cn-*` rules in the style files.

## Do's and Don'ts

### Do:
- **Do** put every brand-specific value in the app's `app.css` or `app.config.ts`, and nothing brand-specific anywhere else.
- **Do** design the first screen at 390px with the date, the venue, and the entry action visible.
- **Do** let exhibitor logos, guest photos, and gallery images carry the color.
- **Do** use `section-title` and `section-description` for every section heading.
- **Do** keep forms and controls at tool scale even on marketing pages.
- **Do** render an honest empty state when an edition has no data.
- **Do** use `<img>` or `<BlurImage>` for CDN images, never `NuxtImg`.

### Don't:
- **Don't** introduce a second brand hue, or use the accent on anything that isn't the primary path or the brand's own furniture.
- **Don't** copy one event's hero rule into another app, and don't add gradient, outline, or skew treatments unless they are that event's actual identity.
- **Don't** let `section-title-large` grow past roughly 5.5rem on desktop in new work; the existing `12vw` values are legacy.
- **Don't** branch on the event name inside `layers/base`.
- **Don't** round hero imagery or full-bleed media.
- **Don't** use `font-bold`, `font-extrabold`, `tracking-wider`, or `tracking-widest` on interface text.
- **Don't** backfill exhibitor lists, galleries, or numbers from another edition to make a page look full.
- **Don't** hand-build pills, cards, empty states, or toolbar buttons that a primitive already covers.
- **Don't** use em dashes in interface copy.
