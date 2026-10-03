/**
 * Every word on the homepage lives here, so copy can change without touching a component.
 *
 * Voice: US English, the company speaks as "we", plain words a busy owner would use. No jargon, no
 * "AI-powered", no futurism. Examples are operational (jobs, invoices, schedules, stock), never marketing.
 * The running example business is Harbor Home Services, owned by Dana. It is fictional and illustrative.
 */

export const SITE = {
  name: "One Spot",
  title: "One Spot — We learn your business before we build anything",
  description:
    "One Spot is a consulting company for small and mid-sized businesses. We learn how your company really works, map where work gets stuck, show you the fix before you say yes, then build it around the tools you already use.",
} as const;

export const NAV = [
  { label: "How we work", href: "#how" },
  { label: "Examples", href: "#examples" },
  { label: "Websites", href: "#websites" },
  { label: "FAQ", href: "#faq" },
] as const;

export const NAV_CTA = { label: "Talk to us", href: "#contact" } as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const HERO = {
  eyebrow: "Consulting for small and mid-sized businesses",
  headline: ["We learn your business", "before we build anything."],
  lead: "We study how work really moves through your company, find what's worth fixing, and show you the result before you say yes. Then we build it around the tools you already use, and stay with it.",
  primary: { label: "Start with a conversation", href: "#contact" },
  secondary: { label: "See how we work", href: "#how" },
  reassurance: "No jargon. No ripping out the tools you already use.",
} as const;

/**
 * The company file in the hero: one business, the six steps, and what we know growing at each one.
 * Harbor Home Services and its numbers are illustrative.
 */
export const FILE = {
  label: "Company file",
  company: "Harbor Home Services",
  meta: "Plumbing & heating · 24 people",
  /** One line per step, added as the file reaches it. tone: what the line means. */
  lines: [
    { text: "Likely tools: Jobber, QuickBooks, Gmail", tone: "ink" },
    { text: "Dana retypes every job at night", tone: "risk" },
    { text: "Invoices wait 6 days after the job", tone: "wait" },
    { text: "3 fixes worth making, 1 that isn't", tone: "spot" },
    { text: "About 11 hours back every week", tone: "spot" },
    { text: "Live: invoices go out the same day", tone: "done" },
  ],
  next: ["Prepare the first conversation", "Map how a job becomes an invoice", "Find what's worth fixing", "Choose what to build", "Show Dana the preview", "Measure what changed"],
} as const;

/* ------------------------------------------------------------------ */
/* 01 · How we work: the six steps                                     */
/* ------------------------------------------------------------------ */

export type StepKey = "look" | "listen" | "map" | "find" | "show" | "build";

export const JOURNEY = {
  eyebrow: "How we work",
  headline: ["Six steps, from first call", "to something that works."],
  lead: "Every business goes through the same six steps with us. Each one takes away a little more guesswork, so by the time we build, we know we're building the right thing.",
  note: "Harbor Home Services is an example business, and its numbers are illustrative.",
  steps: [
    {
      key: "look",
      short: "Look",
      question: "What should we know before we talk?",
      title: "We do our homework first.",
      body: "Before we meet, we learn how businesses like yours usually run, where they tend to get stuck, and which tools you probably use. Your first call is about you, not the basics.",
    },
    {
      key: "listen",
      short: "Listen",
      question: "How does the work really happen?",
      title: "We sit with you and your team.",
      body: "We talk with the people doing the work and watch a normal day. Every messy note becomes something clear: what hurts, who does what, and the rules nobody wrote down.",
    },
    {
      key: "map",
      short: "Map",
      question: "Where does work wait?",
      title: "We map how work really moves.",
      body: "Step by step, person by person. Every place something gets typed twice, handed off, or left waiting, on one page you can read in ten seconds.",
    },
    {
      key: "find",
      short: "Find",
      question: "What's worth fixing?",
      title: "We find the few changes that matter most.",
      body: "We look across the whole business, not one department at a time. The smallest set of changes that removes the most pain, and an honest list of what's not worth building.",
    },
    {
      key: "show",
      short: "Show",
      question: "What would it look like?",
      title: "You see it before you say yes.",
      body: "A clickable preview with work like yours in it, the before and after side by side, and a short proposal in plain English with one clear price.",
    },
    {
      key: "build",
      short: "Build",
      question: "Is it working?",
      title: "We build it, then we stay.",
      body: "It runs alongside the way you work now until you're sure. Then we measure what changed, and keep improving it with you.",
    },
  ] satisfies { key: StepKey; short: string; question: string; title: string; body: string }[],
};

/** Words and numbers inside the six illustrations. Illustrative: Harbor Home Services is fictional. */
export const STEP_SCENES = {
  look: {
    company: "Harbor Home Services",
    meta: "Plumbing & heating · 24 people",
    toolsLabel: "Likely tools",
    tools: ["Jobber", "QuickBooks", "Gmail", "Spreadsheets"],
    stuckLabel: "Where businesses like this get stuck",
    stuck: ["Jobs get finished, invoices go out late", "The office retypes the techs' notes", "Quotes go out and nobody follows up"],
    openerLabel: "Ask first",
    opener: "How does a finished job turn into an invoice?",
  },
  listen: {
    notes: [
      { quote: "Techs text me photos. I type it all into QuickBooks at night.", who: "Dana, owner" },
      { quote: "Half the quotes we send, nobody ever follows up.", who: "Maria, office" },
      { quote: "Anything over five grand, Dana has to see it.", who: "Dev, lead tech" },
    ],
    findings: [
      { kind: "Pain", text: "Every job typed twice, five nights a week" },
      { kind: "Pain", text: "Quotes with no follow-up" },
      { kind: "Rule", text: "Quotes over $5,000 need Dana's OK" },
    ],
  },
  map: {
    lanes: ["Customer", "Office", "Tech", "Dana"],
    /** lane index, label, pain? and the wait that follows it */
    steps: [
      { lane: 0, label: "Calls for a repair" },
      { lane: 1, label: "Books the job" },
      { lane: 2, label: "Does it, texts photos" },
      { lane: 3, label: "Retypes it at night", pain: true, wait: "2 days" },
      { lane: 1, label: "Builds the invoice", pain: true, wait: "4 days" },
      { lane: 0, label: "Finally gets the bill" },
    ],
    total: "6 days from finished job to invoice",
  },
  find: {
    painsLabel: "What we found",
    pains: ["Retyping job notes", "Late invoices", "Quotes nobody chases", "Parts missing from the van", "A new phone system"],
    fixesLabel: "What we'd fix",
    fixes: [
      { title: "Job notes become the invoice", solves: "Fixes 2" },
      { title: "Quote follow-ups on day 3 and 7", solves: "Fixes 1" },
      { title: "Tomorrow's parts checked tonight", solves: "Fixes 1" },
    ],
    skip: { title: "A new phone system", why: "Not worth it. The one you have works." },
  },
  show: {
    title: "A finished job, to a paid invoice",
    stats: [
      { label: "Steps", before: "6", after: "3" },
      { label: "Done by hand", before: "4", after: "1" },
      { label: "Turnaround", before: "6 days", after: "Same day" },
    ],
    hoursLabel: "Hours back each week",
    hours: "~11",
    after: [
      { actor: "onespot", text: "Turns the tech's notes and photos into the invoice" },
      { actor: "system", text: "QuickBooks sends it the same day" },
      { actor: "you", text: "Dana approves anything over $5,000" },
    ],
    approve: "Approve the plan",
    approved: "Approved",
  },
  build: {
    status: ["Building", "Running side by side", "Live"],
    tasks: ["Connect Jobber and QuickBooks", "Run it next to the old way", "Dana switches it on"],
    measuredLabel: "Measured after 30 days",
    measured: [
      { label: "Invoices out", value: "Same day" },
      { label: "Retyping at night", value: "None" },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* 02 · Examples                                                       */
/* ------------------------------------------------------------------ */

export const EXAMPLES = {
  eyebrow: "Examples",
  headline: ["See it in a", "real business."],
  lead: "One ordinary moment, before and after One Spot. Pick the kind of business that looks most like yours.",
  disclaimer: "Illustrative examples, drawn from situations every business in these fields will recognize.",
  before: "Before",
  after: "With One Spot",
  switchPrompt: "Now see it with One Spot",
} as const;

/* ------------------------------------------------------------------ */
/* 03 · Websites                                                       */
/* The store in the mockups (Seaside Swim Co.) is fictional. The        */
/* features are the ones we build for real online stores.               */
/* ------------------------------------------------------------------ */

export const WEBSITES = {
  eyebrow: "Websites & online stores",
  headline: ["Your website,", "organized to sell."],
  lead: "Your website is part of how the business runs. We rebuild it so customers find what they want in a click or two, know what will fit, and see the things that go with it, on the platform you already use.",
  compare: {
    label: "Drag to compare the store before and after",
    before: "Before",
    after: "After",
    caption: "An illustrative online store, before and after a One Spot redesign.",
  },
  cart: {
    eyebrow: "Try it",
    title: "Your bag",
    threshold: 150,
    items: [
      { name: "Coral tie top", detail: "Size M", price: 44 },
      { name: "Seafoam one-piece", detail: "Size S", price: 74 },
    ],
    setTitle: "Complete the set",
    set: { name: "Coral tie bottom", detail: "Size M, matched to your top", price: 38 },
    addOnsTitle: "Easy add-ons",
    addOns: [
      { name: "Straw sun hat", detail: "One size", price: 28 },
      { name: "Canvas beach tote", detail: "One size", price: 36 },
    ],
    add: "Add",
    added: "Added",
    away: "away from free shipping",
    unlocked: "Free shipping unlocked",
    reset: "Start over",
    note: "What a shopper sees in the cart: how close they are to free shipping, and the pieces that go with what they chose.",
  },
  features: [
    { icon: "list", title: "Menus that make sense", body: "Dozens of scattered collections become a handful of clear choices." },
    { icon: "check", title: "Sizes, sorted", body: "One size scale, and filters that only show what's in stock." },
    { icon: "person", title: "Fit before they buy", body: "A simple runs small, true to size, runs big guide on every product." },
    { icon: "copies", title: "Complete the set", body: "The cart suggests the piece that goes with it, already in their size." },
    { icon: "cart", title: "A nudge to free shipping", body: "Shoppers see how close they are, with a few easy add-ons to get there." },
    { icon: "mail", title: "A welcome offer that behaves", body: "A first-order discount that only works for new subscribers, once." },
  ],
  platform: "We build on the platform you already use, like Shopify, so your team can keep editing it themselves.",
} as const;

/* ------------------------------------------------------------------ */
/* 04 · What stays in your hands                                       */
/* ------------------------------------------------------------------ */

export const PROMISES = {
  eyebrow: "Working with us",
  headline: ["Built around you.", "Decided by you."],
  items: [
    { title: "You stay in charge", body: "Prices, approvals, anything a customer sees: you choose where a person decides, and it stays that way." },
    { title: "Everything is written down", body: "Every action the system takes is recorded, so you can always see what happened and why." },
    { title: "Side by side first", body: "Your current way keeps working until the new one has proven itself on your real work." },
    { title: "Nothing reaches customers early", body: "We test with your own examples before anything goes live." },
    { title: "Every business makes us better", body: "We remember what actually worked for businesses like yours, and trust what was proven over what only looked good on paper." },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 05 · FAQ                                                            */
/* ------------------------------------------------------------------ */

export const FAQ = {
  eyebrow: "Questions",
  headline: ["Good questions,", "straight answers."],
  items: [
    {
      q: "Do I need to be technical?",
      a: "Not at all. You know your business; that's the part we need from you. We handle everything technical and explain it in plain English along the way.",
    },
    {
      q: "Do we have to switch software?",
      a: "Almost never. We build around the tools you already use. If something truly isn't working for you, we'll tell you why and let you decide.",
    },
    {
      q: "Will this replace my staff?",
      a: "That isn't the goal. We take the repetitive work off your team's plate, like copying details between systems and chasing reminders, so they can spend their time on customers and the work they were hired to do.",
    },
    {
      q: "What exactly is an agent?",
      a: "Think of it as a digital team member with one clear job, like turning job notes into invoices or following up on quotes. It follows the rules you set, checks with a person before anything important, and keeps a record of everything it does.",
    },
    {
      q: "Is our information safe?",
      a: "Your information stays in your own accounts. We only connect what's needed for the job, and we walk you through exactly what connects to what before anything goes live.",
    },
    {
      q: "How long does it take, and what does it cost?",
      a: "It depends on your business, which is why we start by learning it. Before you commit to anything, you'll see a preview of the change, the before and after, and a short proposal with one clear price.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 06 · Contact                                                        */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  eyebrow: "Start here",
  headline: ["Tell us where it", "feels manual."],
  lead: "A few lines is plenty. We'll do our homework on your business before we talk, so the first conversation is about you, not the basics.",
  next: [
    { title: "We look into your business", body: "Before we ever get on a call." },
    { title: "We talk, and mostly listen", body: "About how work moves, not what software you run." },
    { title: "You get a few honest ideas", body: "Yours to keep, whether we work together or not." },
  ],
  fields: {
    name: "Your name",
    email: "Email",
    company: "Your company, and what it does",
    stuck: "Where does it feel manual?",
  },
  placeholders: {
    name: "Dana Reyes",
    email: "dana@harborhome.com",
    company: "Harbor Home Services, plumbing and heating, 24 people",
    stuck: "We type every job in twice, and invoices go out a week late.",
  },
  submit: "Send",
  sending: "Sending",
  success: {
    title: "Thank you. We've got it.",
    body: "We'll look into your business and be in touch soon to find a time to talk. No need to prepare anything.",
  },
  error: "Something went wrong and your message didn't send. Please try again.",
} as const;

export const FOOTER = {
  line: "Consulting for small and mid-sized businesses. We learn how your company works, find what's worth fixing, and build it around the tools you already use.",
} as const;
