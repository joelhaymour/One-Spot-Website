---
name: One Spot
description: The job ticket that follows work through a shop, filled in once and stamped as it moves.
colors:
  paper: "#e8d5a3"
  paper-2: "#dcc48c"
  card: "#fbf7ec"
  field: "#fffdf7"
  ink: "#1c1b18"
  ink-2: "#3d3a33"
  ink-3: "#5a5446"
  ink-4: "#8f866f"
  line: "rgba(28, 27, 24, 0.16)"
  line-strong: "rgba(28, 27, 24, 0.32)"
  spot: "#2d4ae0"
  on-spot: "#ffffff"
  spot-deep: "#2037b4"
  spot-light: "#93a4ff"
  risk: "#b3301f"
  wait: "#7a4f0c"
  carbon-canary: "#f6e58d"
  carbon-pink: "#f6cdd2"
  carbon-green: "#d5ebd1"
  carbon-blue: "#e2e9f6"
  counter: "#1c1b18"
  counter-text: "#fbf7ec"
  counter-text-2: "#cfc6b0"
  string: "#8a6a2a"
  eyelet-ring: "#d7bd7d"
typography:
  display:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "clamp(3.6rem, 8.4vw, 7.6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.8rem, 5.6vw, 5.4rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.005em"
  headline-sm:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.9rem, 2.6vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.005em"
  stamp:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.8rem, 5vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 0.85
    fontFeature: "\"tnum\""
  numeral:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "1.7rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\""
  label:
    fontFamily: "Big Shoulders, 'Arial Narrow', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.018em"
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
  button:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.005em"
rounded:
  chip: "3px"
  control: "4px"
  ticket: "6px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  section: "clamp(88px, 11vw, 160px)"
  container: "1280px"
  nav: "72px"
  ticket-x: "20px"
  ticket-x-wide: "28px"
  slip-x: "32px"
  field-row: "10px 0 6px"
components:
  button-primary:
    backgroundColor: "{colors.spot}"
    textColor: "{colors.on-spot}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 22.4px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.spot-deep}"
    textColor: "{colors.on-spot}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 22.4px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  button-sm:
    padding: "0 16px"
    height: "42px"
  ticket:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "{spacing.ticket-x}"
  ticket-stub:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    padding: "16px 28px"
  stamp-risk:
    textColor: "{colors.risk}"
    typography: "{typography.stamp}"
    rounded: "{rounded.control}"
    padding: "0.35em 0.6em 0.3em"
  stamp-spot:
    textColor: "{colors.spot}"
    typography: "{typography.stamp}"
    rounded: "{rounded.control}"
  segmented-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  segmented-off:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
  field-input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  flag-risk:
    textColor: "{colors.risk}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "1px 6px"
  flag-spot:
    textColor: "{colors.spot}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "1px 6px"
  app-chip:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.chip}"
    padding: "1px 6px"
  step-box:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
    rounded: "{rounded.control}"
    size: "48px"
  step-box-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  counter-section:
    backgroundColor: "{colors.counter}"
    textColor: "{colors.counter-text}"
    padding: "{spacing.section}"
---

# Design System: One Spot

## Overview

**Creative North Star: "The Job Ticket"**

The page is the paperwork that follows a job through a shop. Manila tag stock is the ground, paper-white tickets lie on it with a real paper shadow, and every number sits in a ruled field beside its unit. Things that go wrong today are marked in red stamp ink; what One Spot changes is marked in One Spot blue, and blue goes nowhere else. Kinds of business are told apart by carbon-copy tints, the way a shop tells the white, canary and pink copies of one form apart. The densest passage is laid out on the shop counter, a near-black ground with tickets set down on it.

The lettering is the lettering of tags, bins and work orders: Big Shoulders in heavy condensed capitals for headlines, labels, numbers and stamps, over Inter for everything a person reads at length. Corners are square-ish (3px chips, 4px controls and stamps, 6px tickets). Rules are drawn in ink: a 2px ink rule heads every ticket, 1px ink rules sit under every field, dashed perforations mark where a stub tears off. Apps are drawn in ink on paper, never in their own brand colours, and the job's own ticket, not a product node, sits at the centre of a connected picture.

Motion runs on one clock and has one signature: the stamp. When a result settles it comes down with a single press and then never moves. Everything else enters once and holds still. Reduced-motion and no-JS visitors get the finished state of every scene, never an empty one.

**Key Characteristics:**
- Manila ground with a faint fixed fibre grain; paper-white tickets on top; carbon tints beneath as depth.
- Ink does nearly all the work: text, rules, step boxes, active toggles, slider fill.
- Red stamp ink for today's problems, One Spot blue for what One Spot changes, nothing else in colour.
- Heavy condensed capitals for anything that would be printed on a form; Inter for anything you read.
- Every number in a ruled field with its unit, set in tabular figures.
- The shop counter (near-black) for the densest passage and the footer only.
- One press per stamp, one motion clock, finished states without motion.

## Colors

A warm paper palette held almost entirely in ink, with two inks of meaning (stamp red and One Spot blue) and four carbon tints that identify a kind of business.

### Primary
- **One Spot Blue** (spot): the primary action, the mark's spot, the "with One Spot" side of every comparison (flags, stats, the One Spot actor badge, "filled in" stamps, connection spokes, the received stamp), focus rings and the field caret. Its rarity is what makes it read as "this is what we change".
- **Pressed Blue** (spot-deep): hover state of the primary action only.
- **Counter Blue** (spot-light): the mark's spot when the mark sits on the shop counter, where full spot blue would sink.
- **On Blue** (on-spot): text and the mark's spot on One Spot blue. The only pure white in the system.

### Secondary
- **Stamp Red** (risk): what goes wrong in the visitor's business today: the hours-back stamp on the calculator, "today" flags and stats in the examples, the hopping trail and click ripple in Your tools, the "Today" status label.
- **Clock Amber** (wait): waiting, and form errors. A field that needs attention is amber, not red; red belongs to the business's problems, not the visitor's typing.

### Tertiary
- **Canary Copy** (carbon-canary): the body shop's carbon copy, the carbon sheet under the hanging calculator, the demo offer card, text selection, and a grabbed slider thumb.
- **Pink Copy** (carbon-pink): the dental practice's carbon copy.
- **Green Copy** (carbon-green): the financing company's carbon copy.
- **Blue-White Copy** (carbon-blue): the HVAC company's carbon copy.

### Neutral
- **Manila Stock** (paper): the page ground, the nav when solid, the mobile menu, the eyelet hole and the perforation notches.
- **Manila Fold** (paper-2): the deeper stock: the Your tools desk, the calculator's tear-off stub, the contact section, idle slider track, hover on segmented toggles.
- **Ticket White** (card): every ticket and slip; the text colour on ink and on the counter.
- **Form White** (field): the fill of text inputs and checkboxes, a shade brighter than the ticket so a field reads as a place to write.
- **Ink** (ink): headlines, values, 2px ticket-head rules, ghost button stroke, active toggle fill, step boxes, slider fill.
- **Ink 2** (ink-2): body copy, field labels, idle toggle text.
- **Ink 3** (ink-3): footnotes, ticket numbers, secondary labels. The lightest ink allowed for text.
- **Ink 4** (ink-4): never text; scrollbar thumb and faint marks only.
- **Rule** (line) and **Strong Rule** (line-strong): hairline borders, ruled-field underlines, row dividers, perforations.
- **Shop Counter** (counter) with **Counter Text** (counter-text) and **Counter Text 2** (counter-text-2): the Examples section and the footer.
- **Tag String** (string) and **Eyelet Ring** (eyelet-ring): the hanging string and the reinforced ring around the eyelet; used only on the hanging ticket.

### Named Rules
**The Rationed Blue Rule.** One Spot blue appears only on the primary action, the mark, focus, and things One Spot does or changes. Headline emphasis, slider fills, active tabs, step boxes and dividers are ink. If removing the blue would not change the meaning, it should not be blue.

**The Two Inks Rule.** Red is stamp ink for today's problems; blue is One Spot's ink for the after state. A comparison always puts red on the "today" ticket and blue on the "with One Spot" ticket, at the same size.

**The Carbon Copy Rule.** Each kind of business keeps one carbon tint (body shop canary, dental pink, financing green, HVAC blue-white) on its tab and its "today" ticket. Tints never carry text colour and never mean status.

## Typography

**Display Font:** Big Shoulders (with Arial Narrow, sans-serif), loaded through next/font with its optical-size axis.
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif), with its optical-size axis.

**Character:** Big Shoulders is the stencilled, condensed lettering on a bin label or a work order, always in capitals and always heavy (800 or 900). Inter carries the reading text plainly and quietly underneath it, so the page reads like a form a person filled in by hand on a printed blank.

### Hierarchy
- **Display** (900, clamp(3.6rem, 8.4vw, 7.6rem), 0.86, uppercase, balanced): the hero headline only.
- **Headline** (900, clamp(2.8rem, 5.6vw, 5.4rem), 0.9, uppercase): section headlines and the footer statement (reduced to clamp(2.4rem, 4.4vw, 4rem) there).
- **Headline Small** (800, clamp(1.9rem, 2.6vw, 2.5rem), 0.95, uppercase): routing-slip step names, the example's moment line, the received confirmation, mobile menu items (2.4rem).
- **Stamp** (900, clamp(2.8rem, 5vw, 3.5rem), 0.85, uppercase, tabular): the number inside a rubber stamp.
- **Numeral** (800, 1.7rem, 1, tabular): a value in a ruled field. Ticket stats and result lines use the same face at 1.35 to 1.45rem; the Your tools tally at 2.2 to 3rem in 900.
- **Label** (800, 0.95rem, 0.06em tracking, uppercase): ticket heads ("Job ticket", "No. 0001"), slip column heads (0.8rem), flags (0.78rem), footer column heads.
- **Title** (Inter 600, 1.15 to 1.3rem, 1.2, -0.018em): FAQ questions and the calculator's question.
- **Lead** (Inter 400, clamp(1.075rem, 1.4vw, 1.3rem), 1.5): the paragraph beside each headline, held to about 30 to 34rem.
- **Body** (Inter 400, 1rem, 1.6): step bodies, FAQ answers, held to about 38 to 40rem.
- **Small** (Inter 400, 0.875rem, 1.5, ink-3): reassurance lines and footnotes.

### Named Rules
**The Same Ink Rule.** A headline's emphasis is never colour. Its second line is the same ink as the first; `em` inside a display headline renders upright and uncoloured.

**The Printed Blank Rule.** Anything that would be pre-printed on a form (headlines, labels, ticket numbers, stamps, values) is Big Shoulders in capitals. Anything a person would write or read in sentences is Inter in sentence case. Never set Inter in capitals, never set paragraphs in Big Shoulders.

**The Unit Rule.** Every number sits in a ruled field with its unit beside it in small Inter ("15 people", "3 hrs / wk", "$35 / hr"), in tabular figures.

## Layout

A single centred column of max 1280px inside a fluid gutter (clamp(20px, 4.4vw, 64px)); sections breathe with clamp(88px, 11vw, 160px) of vertical padding. The nav is 72px tall, transparent over the hero and manila (97% opaque) with a strong rule once the page moves; it hides on scroll down after 200px.

The hero splits 1.1fr / 0.9fr at the large breakpoint (1024px), headline and actions left, the hanging calculator right (max 500px), filling the first viewport. Section openings put the headline left and the lead right in a column of about 30 to 32rem, aligned to the bottom. Below that, the section's own object takes the full width: the routing slip as a four-column ruled table (4.5rem step / 11rem when / flexible what / 17rem you get) that collapses to stacked rows on phones; the Your tools desk as a 100svh sticky stage scrubbed through a 320vh track; two example tickets side by side on wide screens and one at a time on phones with a Today / With One Spot switch; FAQ as a sticky headline (0.8fr) beside a ruled accordion (1.2fr); contact as copy plus numbered next steps beside a 34rem ticket form.

Phones keep a 20px side gutter, stack every split, and never scroll sideways. Without motion, the Your tools stage is a fixed-height still of the connected state (min(82vh, 680px)).

## Elevation & Depth

Depth is paper lying on paper. Shadows are warm brown (rgba(60, 42, 8, ...)), short at the contact edge and long and soft below, the way a sheet casts on manila. There are three heights: a carbon copy beneath a sheet, a ticket lying on the ground, and the one ticket that floats at the centre of the Your tools picture. Beneath that, depth is told by layering sheets: the canary carbon tilted 2.6 degrees under the calculator, the deeper manila of the stub and desk, the near-black counter as the lowest surface.

### Shadow Vocabulary
- **Carbon** (`box-shadow: 0 1px 1px rgba(60, 42, 8, 0.08), 0 6px 14px -8px rgba(60, 42, 8, 0.3)`): the carbon sheet beneath a ticket.
- **Lying flat** (`box-shadow: 0 2px 3px rgba(60, 42, 8, 0.1), 0 18px 34px -18px rgba(60, 42, 8, 0.45)`): every ticket, slip and app window.
- **Floating** (`box-shadow: 0 3px 6px rgba(60, 42, 8, 0.12), 0 30px 50px -24px rgba(60, 42, 8, 0.55)`): the job's own ticket at the centre of Your tools, nothing else.

### Named Rules
**The Paper Shadow Rule.** Shadows under sheets are warm brown and belong to paper. No grey or black shadows and no hard offset shadows; a sheet is lifted by laying it on another sheet, not by lighting it. The one tinted shadow is the short blue drop under the primary action (see Buttons).

**The Top Sheet Rule.** Content lives on the top sheet, upright and sharp. Tilt belongs to the copies beneath and to stamps; a sheet carrying text a visitor must read stays square.

## Shapes

Square-ish and stamped. Chips and flags take 3px corners, buttons, inputs, stamps, step boxes and icon tiles take 4px, tickets and slips take 6px; business tabs are tickets' tops (6px top, 2px bottom). Circles exist only where paper has holes or where the mark is drawn: the eyelet, the perforation notches, the logo's ring and spot, the click ripple.

Rules are the main form language: a 2px ink rule under every ticket head, a 1px strong rule under every ruled field and slip row, a 1.5px ink stroke around segmented toggles and ghost controls, a 2px dashed perforation where a stub tears away (notched on both ends with manila half-circles). Stamps are a 3px box in their own ink with a noise mask so the ink does not take everywhere, set at a slight angle (-3 to -6 degrees).

## Components

### Buttons
Stamped rectangles with a press you can feel.
- **Shape:** squared (4px), 52px tall (42px small), Inter 600 at 1rem with an arrow that nudges 3px on hover (2px down for a down arrow).
- **Primary:** One Spot blue with white text, a faint inset top highlight and a short blue-tinted drop beneath (`0 8px 18px -10px rgba(32, 55, 180, 0.8)`). The primary action is the only filled blue control on any screen region.
- **Hover / Focus / Active:** hover deepens to pressed blue; focus draws a 2px blue outline 3px out; active presses down 1px and scales to 0.98 on the press clock.
- **Ghost:** transparent with a 1.5px ink stroke and ink text; hover fills with ink and turns the text ticket white. On the counter the stroke is counter-text-2 and brightens on hover.

### Tickets / Containers
- **Corner Style:** 6px.
- **Background:** ticket white; "today" tickets in the examples take their business's carbon tint instead.
- **Shadow Strategy:** lying flat (see Elevation); the Your tools hub floats.
- **Head:** every ticket opens with a label row on a 2px ink rule: what it is on the left, its number or note on the right ("Job ticket / No. 0001", "Routing slip / 5 steps", "Your ticket / About a minute", "Today / Carbon copy").
- **Internal Padding:** 20px on phones, 28px from 640px; the routing slip uses 32px.

### Inputs / Fields
- **Ruled field (calculator):** label left in ink-2, value right as a Big Shoulders numeral with its unit in small Inter, a 1px strong rule beneath. The slider is a 4px track filled in ink over manila fold, with a 16 x 26px ticket-white tab, 2px ink stroke and 3px corners; grabbing it lifts it slightly and turns it canary.
- **Text field (contact):** form white fill, 1.5px strong-rule stroke, 4px corners, 52px tall, 16px text so phones do not zoom; hover darkens the stroke to ink-2.
- **Focus:** the stroke turns blue with a 3px blue halo at 18% (rgba(45, 74, 224, 0.18)); the caret is blue. Sliders draw a 3px ticket-white gap and a 2px blue ring around the tab.
- **Error:** the stroke and message turn clock amber. Read-only fields drop to 60% opacity while sending.

### Segmented toggles
Two tabs on a ticket: a 1.5px ink frame split in two, the chosen side filled solid ink with ticket-white text, the other side ink-2 with a manila-fold hover. Used for whose time (calculator), what kind of help (contact) and which side (examples on phones, where "With One Spot" fills blue).

### Flags and chips
- **Flags:** Big Shoulders capitals at 0.78rem in a 1.5px box of their own ink with 3px corners: stamp red on the "today" ticket, One Spot blue on the "with One Spot" ticket.
- **App chips:** Inter 0.7rem in ink-2 inside a 1px strong-rule box with a tiny ink square, so an app is named, never branded.
- **Actor badges:** 32px squares with 4px corners: blue with the white mark for One Spot, solid ink with a check for the owner, an amber or red outline for waiting or outside, a strong-rule outline for staff.

### Navigation
Inter 500 at 0.92rem in ink-2, ink when active or hovered, with a 2px ink underline that draws in from the left for the section in view. The lockup (ring-and-spot mark plus "One Spot" in Inter 600) sits left, the small primary button right. Phones get a 44px ink-stroked menu square that opens a full-height manila sheet of Headline Small links on ruled rows with a full-width primary action at the foot.

### The Hanging Ticket (signature)
The hero calculator: a ticket hanging from a brown string through a reinforced eyelet (manila hole, 6px eyelet-ring, inner shadow), with a canary carbon tilted beneath it on wide screens. Head row, the question, the whose-time toggle, three ruled fields, then the result: the yearly hours as a red stamp beside two ruled result lines (potential value, workweeks), the statement, the footnote, and a perforated tear-off stub in manila fold carrying the close in Big Shoulders and the small primary action.

### The Stamp (signature)
A rubber stamp: Big Shoulders 900 capitals inside a 3px box of its ink, 4px corners, noise-masked edges, set at an angle. It lands with one press (from 135% scale to 96% to 100% over 260ms on the out curve) when its number has been still for 280ms, fades to 30% while the number moves, and otherwise never moves. Red for hours lost today; blue for "Received" and for "Filled in" on connected apps. Routing-slip step boxes take the same press, unrotated, as the reader reaches them, and fill with ink.

### The Shop Counter
The Examples section and the footer sit on the near-black counter: counter-text headlines, counter-text-2 leads and notes, business tabs on 8% ticket white that brighten on hover and take their carbon tint when chosen, with a 3px ink timer bar running along the chosen tab while the examples play. The footer ends on the mark (with counter blue spot) and a full-width Big Shoulders "One Spot" set at clamp(4.4rem, 19vw, 17rem).

## Do's and Don'ts

### Do:
- **Do** put every number in a ruled field with its unit, in tabular figures.
- **Do** keep One Spot blue to the primary action, the mark, focus, and what One Spot does; draw everything else in ink.
- **Do** mark today's problems in stamp red and the after state in One Spot blue, at the same size on both sides of a comparison.
- **Do** give each kind of business its own carbon tint (canary, pink, green, blue-white) and keep it on that business's tab and "today" ticket.
- **Do** open every ticket with a label row on a 2px ink rule, and separate rows with 1px strong rules.
- **Do** land a stamp once, on a settled value, with the 260ms press, and leave it still.
- **Do** run motion on the page clock: 160ms press, 220ms state change, 600ms entrance, all on cubic-bezier(0.16, 1, 0.3, 1).
- **Do** give reduced-motion and no-JS visitors the finished state of every scene.
- **Do** mark form errors in clock amber.

### Don't:
- **Don't** colour a headline's emphasis; the second line is the same ink.
- **Don't** draw apps in their own brand colours or with their logos; name them in ink on paper.
- **Don't** put a product node at the centre of a connected picture; the job's own ticket goes there.
- **Don't** put grey, black or hard-offset shadows under sheets; sheets cast warm brown paper shadows.
- **Don't** round past 6px or use pills; circles are for holes, notches and the mark only.
- **Don't** tilt a sheet whose text must be read; tilt the copy beneath it or the stamp on it.
- **Don't** use ink-4 or the carbon tints for text.
- **Don't** use pure white as a surface; ticket white and form white are the lightest sheets, and white is reserved for text on One Spot blue.
- **Don't** put the counter's near-black anywhere but the densest passage and the footer.
