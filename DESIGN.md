---
name: One Spot
description: Warm paper, ink and one blue spot. A consultancy's desk, calm and readable, where colour is kept for meaning.
colors:
  paper: "#f5f2ec"
  paper-2: "#eeeae2"
  paper-3: "#e5e0d6"
  card: "#fffdf9"
  ink: "#15171b"
  ink-2: "#4a4f57"
  ink-3: "#5d636c"
  ink-4: "#b2b4b8"
  line-soft: "rgba(21, 23, 27, 0.06)"
  line: "rgba(21, 23, 27, 0.1)"
  line-strong: "rgba(21, 23, 27, 0.18)"
  spot: "#2d4ae0"
  spot-soft: "#e4e8fb"
  spot-light: "#93a4ff"
  done: "#256b4c"
  done-soft: "#dfeee5"
  wait: "#8a5a10"
  wait-soft: "#f5e8d0"
  risk: "#a63b2a"
  risk-soft: "#f6e1db"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 5.6vw, 5.4rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.2vw, 3.9rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 2.2vw, 2.05rem)"
    fontWeight: 620
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  result-number:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6.2vw, 4.1rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\" 1"
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.075rem, 1.4vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.006em"
  small:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.004em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.975rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
  pill:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 550
    lineHeight: 1
rounded:
  check: "6px"
  choice: "12px"
  field: "16px"
  card-compare: "22px"
  card: "24px"
  panel: "28px"
  panel-lg: "40px"
  full: "999px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  section: "clamp(96px, 13vw, 184px)"
  nav: "72px"
  container: "1280px"
  card-pad: "20px"
  card-pad-lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.spot}"
    textColor: "{colors.paper}"
  button-primary-sm:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 18px"
    height: "42px"
  button-ghost:
    backgroundColor: "rgba(255, 253, 249, 0.5)"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad-lg}"
  pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-2}"
    typography: "{typography.pill}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  pill-spot:
    backgroundColor: "{colors.spot-soft}"
    textColor: "{colors.spot}"
    rounded: "{rounded.full}"
  pill-done:
    backgroundColor: "{colors.done-soft}"
    textColor: "{colors.done}"
    rounded: "{rounded.full}"
  pill-wait:
    backgroundColor: "{colors.wait-soft}"
    textColor: "{colors.wait}"
    rounded: "{rounded.full}"
  pill-risk:
    backgroundColor: "{colors.risk-soft}"
    textColor: "{colors.risk}"
    rounded: "{rounded.full}"
  toggle-track:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.full}"
    padding: "4px"
  toggle-thumb:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
  tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  tab-idle:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "52px"
  field-focus:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
  choice-selected:
    backgroundColor: "{colors.spot-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.choice}"
    padding: "10px 14px"
  compare-today:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card-compare}"
    padding: "24px"
  compare-onespot:
    backgroundColor: "{colors.card}"
    textColor: "{colors.spot}"
    rounded: "{rounded.card-compare}"
    padding: "24px"
  result-number:
    textColor: "{colors.spot}"
    typography: "{typography.result-number}"
  nav-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  nav-link-active:
    textColor: "{colors.ink}"
---

# Design System: One Spot

## Overview

**Creative North Star: "The Consultant's Desk"**

One Spot reads like a well-kept desk in a small consultancy: warm paper underfoot, white cards laid on it with a soft shadow, dark ink for everything that speaks, and a single blue spot that lands only where something matters. It is not a control room and it is not a startup launch page. The owner looked at a louder world (manila, stamps, condensed caps) and turned it down as hard to read and unprofessional; this system is the incumbent look, sharpened, and its job is to be easy for a busy, non-technical business owner to read and trust.

Density is relaxed. Sections breathe with very tall vertical padding, headlines are large, heavy and tight, and the reading text sits a step lighter in a dark warm-grey ink. Surfaces alternate between paper and a slightly deeper paper, and the interactive pieces (the worth calculator, the example comparison, the contact form) sit on white cards that lift gently off the page. Controls are round: pill buttons, pill tabs, segmented toggles with a sliding thumb, round checkpoints.

Colour carries meaning and almost nothing else. Green, amber and brick red say done, waiting and at risk, always as a deep text colour on its own soft wash. Blue is One Spot itself: the mark, the side of every comparison that shows working with One Spot, the one result number in the hero, focus, and selected states. Movement is quick and settled (about 200 to 220ms for toggles and states), and every animated reveal has a finished, visible state without JavaScript or with reduced motion.

**Key Characteristics:**
- Warm paper ground with white cards, soft negative-spread shadows and 22-24px corners.
- Inter for every word; headings 620-650 weight with -0.03em to -0.04em tracking.
- One blue spot, reserved: the hero result number, the One Spot side of comparisons, the mark, focus and selected states.
- Meaning colours (done, wait, risk) as deep text on a soft wash, never as decoration.
- Round controls: pills, pill tabs, segmented toggles with a sliding ink thumb.
- No eyebrow labels, no coloured or italic headline emphasis.

## Colors

A warm, low-chroma paper-and-ink neutral set carries the page; one saturated blue and three muted meaning colours do all the signalling.

### Primary
- **One Spot Blue** (spot): the brand's single accent. The hero calculator's yearly-hours number, the "With One Spot" side of every comparison (its heading, its stat values, its row avatars, its pale wash and border), the dot inside the mark, the primary button's hover, the 2px focus outline, the slider focus ring, the field caret and focus border, and selected checkboxes. White text on it holds 6.6:1.
- **Spot Wash** (spot-soft): the soft ground behind spot-coloured text in the spot pill and a selected multi-choice option.
- **Spot Haze** (spot-light): non-text only; the thin progress bar under the playing example tab.

### Secondary
- **Ledger Green** (done / done-soft): finished, recovered, flagged-for-you outcomes. The success badge after sending the form and the "done" pills on the One Spot side.
- **Pending Amber** (wait / wait-soft): something waits on a person. Wait avatars in the examples, and form validation and send errors.
- **Brick Red** (risk / risk-soft): something is leaking or late. The "Today" side's flags and its leading dot, and the hop trail in the tools scene.

### Neutral
- **Desk Paper** (paper): the page ground, the nav's frosted surface (82% with blur once scrolled), field backgrounds and the calculator's footer band.
- **Deeper Paper** (paper-2): alternate section grounds (How we work, Examples), the contact panel, toggle tracks, the "Today" stat tiles.
- **Ruled Paper** (paper-3): idle slider tracks and the placeholder lines in app illustrations.
- **Card White** (card): every lifted surface; warm, never pure #fff (pure white is only the slider thumb).
- **Ink** (ink): headings, values, primary buttons, toggle thumbs, active tabs, the mark's ring and the slider fill. 16:1 on paper.
- **Ink 2** (ink-2): reading text (lead, body), field labels, idle nav links and idle tabs. 7.4:1 on paper.
- **Ink 3** (ink-3): the darkened secondary text for notes, stat labels, footnotes, placeholders and idle toggle labels. 5.4:1 on paper, 4.6:1 on paper-3, so it passes AA on every ground it sits on.
- **Ink 4** (ink-4): never text. Hover borders on fields and choices, the scrollbar thumb.
- **Hairlines** (line-soft / line / line-strong): 6%, 10% and 18% ink. `line` borders cards and dividers; `line-strong` borders ghost buttons, fields, numbered nodes and the process rail.

### Named Rules
**The One Spot Rule.** Blue appears only on the hero's result number, the One Spot side of a comparison, the mark, focus and selected states, and the primary button's hover. If a new element is blue, it must be one of these; otherwise it is ink.

**The Meaning-Only Rule.** Green, amber and red say done, waiting and at risk. They always appear as the deep tone on its own soft wash (or as a small dot), never as a decorative tint, a heading colour or a background block.

**The Ink-4 Rule.** Ink 4 is for tracks, hover borders and faint marks. It is never used for text; secondary text uses Ink 3 at minimum.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif)

**Character:** One family, carried over from the One Spot HUD. Headings are set heavy and tight so they read as confident and plain; text sits lighter and slightly open so a long lead stays easy to read. Numbers use tabular figures wherever they change.

### Hierarchy
- **Display** (650, clamp(2.6rem, 5.6vw, 5.4rem), line-height 1, -0.04em): the hero headline only, "Modern workflows. Made simple.", balanced, revealed word by word.
- **Headline** (650, clamp(2.2rem, 4.2vw, 3.9rem), 1.02, -0.04em): one per section.
- **Title** (620, clamp(1.55rem, 2.2vw, 2.05rem), 1.12, -0.03em): process steps and the footer's sign-off line.
- **Result Number** (600, clamp(3rem, 6.2vw, 4.1rem), 0.95, -0.04em, tabular): the hero calculator's yearly hours, in One Spot Blue. Supporting values beside it are 600 at 1.3rem in ink.
- **Lead** (400, clamp(1.075rem, 1.4vw, 1.3rem), 1.5, -0.012em): the paragraph under each headline, Ink 2, about 32-36rem wide.
- **Body** (400, 1rem, 1.6, -0.006em): answers, step descriptions, the footer line; Ink 2, 34-40rem wide.
- **Small** (400, 0.875rem, 1.5): reassurance and notes in Ink 3.
- **Label** (500, 0.85rem): form labels and legends in Ink 2. Stat labels are 0.76-0.8rem in Ink 3.

Card questions and example moments sit between title and lead: 600 at 1.3-1.5rem, -0.025em to -0.03em, in ink.

### Named Rules
**The One Family Rule.** Inter sets every word on the page. No second display face, no serif, no condensed caps.

**The Tight Heading Rule.** Headings are 620-650 weight with -0.03em to -0.04em tracking and balanced wrapping. Text below headings never goes tighter than -0.02em.

**The Ink Emphasis Rule.** Emphasis inside a heading stays ink and upright. It is never blue, never another colour, never italic.

## Layout

A single centred container, 1280px wide plus a fluid gutter of clamp(20px, 4.4vw, 64px) each side. Sections are separated by very generous vertical padding, clamp(96px, 13vw, 184px), and by alternating paper and deeper-paper grounds rather than rules. The nav is a fixed 72px bar that is transparent at the top, takes a frosted paper surface after 24px of scroll, and hides on scroll down.

Section heads use a two-column split on wide screens: headline on the left, lead on the right, aligned to the bottom (Examples), or a sticky headline column beside a long list (How we work, with a 0.9fr / 1.1fr split). The hero is two equal columns at 1024px and up: promise on the left, the calculator card (max 540px) on the right, filling the first viewport. The contact section is an inset rounded panel (28px, 40px from 640px) with a 12-16px page margin around it, holding copy on the left and the form card (34rem) on the right.

Breakpoints follow Tailwind's defaults (640, 768, 1024, 1280). The important switch is 1024px: the nav links appear, the hero and section heads go two-column, and the example comparison shows both sides at once; below it the comparison shows one side at a time behind a Today / With One Spot toggle. Cards pad 20px on phones and 28-32px from 640px.

## Elevation & Depth

Depth is a hybrid of tonal layering and soft ambient shadow. The page is paper; a section may step down to deeper paper; interactive content sits on Card White with a hairline border and a shadow that sits under the card rather than around it (large blur, negative spread, low ink opacity). There are no hard offset shadows and no coloured glows except the One Spot hub's pulse ring and the spot-tinted shadow on a hovered primary button.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 1px rgba(21, 23, 27, 0.04), 0 8px 24px -12px rgba(21, 23, 27, 0.12)`): resting cards, chips on the tools stage, the "You get" callouts, the toggle thumb.
- **Lift** (`box-shadow: 0 2px 4px rgba(21, 23, 27, 0.04), 0 24px 48px -20px rgba(21, 23, 27, 0.22)`): the contact form card.
- **Float** (`box-shadow: 0 2px 6px rgba(21, 23, 27, 0.05), 0 30px 60px -24px rgba(21, 23, 27, 0.28)`): the hero calculator and the floating app windows.

### Named Rules
**The Soft Lift Rule.** Shadows are ambient: negative spread, 12-28% ink, always under a Card White surface with a hairline border. Three levels only (card, lift, float); the higher the stakes of the content, the higher it floats.

## Shapes

The form language is round and soft. Every control that can be pressed is a full pill (999px): buttons, tabs, toggles and their thumbs, pills, the menu button, numbered step nodes, avatars. Content surfaces use generous rounded rectangles: 24px for primary cards (the calculator), 22px for comparison sides, 26px for the contact form card, 28px for stage and contact panels (40px on wider screens). Inside cards, smaller pieces step down: 16px for fields, stat tiles and callouts, 12px for multi-choice options and icon tiles, 6px for checkboxes. The mark is a solid spot inside a thin ring, and that circle-in-a-circle recurs in avatars, the nav's active dot and the process nodes.

## Components

### Buttons
Confident, dark and round.
- **Shape:** full pill (999px), 52px tall with 24px side padding; the small size is 42px with 18px padding.
- **Primary:** ink ground, paper text, 500 weight at 0.975rem, with a faint inset top highlight and a soft ink shadow below. Usually carries a right arrow (17px, 1.8 stroke).
- **Hover / Focus:** the ground turns One Spot Blue and the shadow takes a blue tint; the arrow nudges 3px right (2px down for a down arrow). Press scales to 0.97. Colour transitions run 260ms on the expo ease-out; the arrow 320ms. Focus is the global 2px blue outline with a 3px offset.
- **Ghost:** ink text on half-transparent card white with a line-strong border; hover darkens the border to ink and fills the ground with Card White.

### Chips (pills)
- **Style:** 24px tall (20px inside example rows), full pill, 0.72-0.75rem at 550 weight. Neutral pills are card white with a hairline border and Ink 2 text; app-name tags in example rows use this form.
- **State:** meaning pills drop the border and pair deep text with its own wash: spot, done, wait, risk. On the Today side flags are risk; on the One Spot side they are done.

### Segmented Toggles
The site's signature control: a paper-2 pill track with 4px padding and an ink thumb that slides between two equal halves in 220ms on the expo ease-out. The selected label is paper; idle labels are Ink 3 and darken to ink on hover (200ms). Used for My Team's Time / My Time, My business / Website redesign, and (on phones) Today / With One Spot, where the thumb turns blue on the One Spot half. Arrow keys switch options where the toggle is a radiogroup.

### Tabs
Business tabs in the examples are pills with a 15px line icon: active is ink with paper text, idle is card white with Ink 2 text. While the examples play, a 2px spot-haze bar runs along the active tab's bottom edge. A Play / Pause pill (ghost style, 40px) sits beside them, and they always pause.

### Cards / Containers
- **Corner Style:** 24px (calculator), 22px (comparison sides), 26px (form card).
- **Background:** Card White; footer bands inside a card drop to paper with a hairline above.
- **Shadow Strategy:** card, lift or float (see Elevation & Depth).
- **Border:** 1px `line` hairline.
- **Internal Padding:** 20px on phones, 24-32px from 640px.

### Inputs / Fields
- **Style:** 52px tall (textareas 120px minimum), 16px radius, paper ground, 1px line-strong border, 16px text in ink, Ink 3 placeholder, blue caret. Labels sit above in 0.85rem 500 Ink 2.
- **Hover / Focus:** hover darkens the border to Ink 4; focus turns the border blue, lifts the ground to Card White and adds a 4px blue ring at 12% (300ms).
- **Error / Disabled:** errors turn the border and the message amber (wait); locked fields drop to 60% opacity.
- **Multi-choice:** 12px-radius option tiles with an 18px rounded checkbox; selected is a blue border on spot wash with a filled blue check (200ms, press scales to 0.98).

### Navigation
Logo lockup left, four section links centred, a small primary button ("Talk to us") right. Links are 0.9rem pills in Ink 2, ink on hover; the section under the reading line is marked by ink text and a 5px ink dot that scales in beneath it. Below 1024px the links collapse into a full-height paper menu of large 2rem 650 links divided by hairlines, opened by a 44px round menu button, with a full-width primary button at the foot.

### Worth Calculator (signature)
A float-shadow card, 24px radius: a 600-weight question, the whose-time toggle, three quiet sliders (6px paper-3 track filled with ink, a 22px white thumb with a 2px ink ring that grows 12% while dragged and takes a paper-and-blue double ring on focus), then a hairline and the result: the yearly hours as the one blue number, gliding to new values, with value and workweeks in ink beneath and an Ink 3 footnote. A paper footer band closes it with a two-line couplet and a small primary button that carries the numbers into the contact form.

### Comparison Sides (signature)
Two 22px cards side by side on wide screens. Today: card white, hairline border, an Ink 2 heading with a small risk dot, risk flags, and paper-2 stat tiles with ink values. With One Spot: a blue hairline border (22% spot), a pale blue wash fading into card white over the top 40%, a blue heading with the mark, blue avatars, done flags, and pale blue stat tiles with blue values. Rows arrive in order (400ms, 45ms apart) whenever the story changes.

## Do's and Don'ts

### Do:
- **Do** set every word in Inter, headings at 620-650 weight with -0.03em to -0.04em tracking.
- **Do** keep blue to the hero result number, the One Spot side of a comparison, the mark, focus and selected states.
- **Do** put interactive content on Card White (#fffdf9) with a hairline border, a soft card/lift/float shadow and 22-24px corners.
- **Do** use Ink 3 (#5d636c) as the lightest text colour, and check new text grounds hold 4.5:1.
- **Do** pair each meaning colour with its own soft wash (done on done-soft, wait on wait-soft, risk on risk-soft).
- **Do** make pressable things pills, and move toggles and state changes in about 200-220ms on the expo ease-out (cubic-bezier(0.16, 1, 0.3, 1)).
- **Do** give every reveal a finished state that shows without JavaScript and under reduced motion, and make anything that plays pausable.

### Don't:
- **Don't** put eyebrow labels or numbered kickers above headings.
- **Don't** colour, italicise or blue-highlight words inside a headline; emphasis stays ink and upright.
- **Don't** use Ink 4 (#b2b4b8) for any text.
- **Don't** add a second accent colour, or use done/wait/risk as decoration.
- **Don't** add decorative glows, gradients or washes; the only blue wash is the One Spot comparison side, and the only glow is the One Spot hub's pulse.
- **Don't** use hard offset shadows, or pure #fff for cards and page grounds (white is for text on blue and the slider thumb).
- **Don't** reach for the rejected louder world: manila, stamps, condensed caps or novelty display faces.
