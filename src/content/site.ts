/**
 * Every word on the homepage lives here, so copy can change without touching a component.
 *
 * Voice: US English, the company speaks as "we", plain words a busy owner would use. No jargon, no
 * "AI-powered", no futurism. Examples are operational (jobs, invoices, schedules, stock), never marketing.
 * The running example business is Harbor Home Services, owned by Dana. It is fictional and illustrative.
 */

export const SITE = {
  name: "One Spot",
  title: "One Spot — Your business, easier to run",
  description:
    "One Spot is an agentic consulting company for small and mid-sized businesses. We learn how your company works, connect the tools you already use, take repetitive work off your team's plate, and give you one clear view of everything.",
  tagline: "Your business, easier to run.",
} as const;

export const NAV = [
  { label: "What we do", href: "#what" },
  { label: "How we work", href: "#process" },
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
  headline: ["Your business,", "easier to run."],
  /** Index of the headline line set in italic accent. */
  accentLine: 1,
  lead: "We get to know how your company really works. Then we connect the tools you already use, take repetitive work off your team's plate, and give you one clear view of everything that's happening.",
  primary: { label: "Start with a conversation", href: "#contact" },
  secondary: { label: "See how it works", href: "#what" },
  reassurance: "No jargon. No ripping out the tools you already use.",
  cue: "Scroll to sort a busy Monday",
} as const;

export type Lane = "handled" | "routed" | "you";

export type ChipIcon = "mail" | "phone" | "chat" | "invoice" | "calendar" | "sheet" | "box" | "report" | "file";

export interface BoardChip {
  id: string;
  icon: ChipIcon;
  title: string;
  /** Where it came from, shown while it is still loose on the desk. */
  raw: string;
  /** What happened to it, shown once it has been sorted. */
  status: string;
  lane: Lane;
  /** Hidden on phones, where the board has less room. */
  desktopOnly?: boolean;
}

/** The sorted board at the end of the hero: a normal Monday morning at Harbor Home Services. */
export const BOARD = {
  eyebrow: "With One Spot",
  headline: ["Your Monday morning,", "sorted."],
  lead: "Most of it handled. Some of it passed to the right person. Only what truly needs you, waiting for you.",
  lanes: [
    { id: "handled", title: "Handled for you" },
    { id: "routed", title: "Sent to the right person" },
    { id: "you", title: "Waiting on your OK" },
  ] satisfies { id: Lane; title: string }[],
  chips: [
    { id: "invoice", icon: "invoice", title: "Invoice #1042 · 14 days late", raw: "Accounting · flagged Friday", status: "Friendly reminder sent", lane: "handled" },
    { id: "call", icon: "phone", title: "Missed call · Mrs. Patel", raw: "Voicemail · 7:40pm", status: "Called back, booked Thu 9am", lane: "handled" },
    { id: "order", icon: "chat", title: "“Is my order on its way?”", raw: "Website chat · 11:02pm", status: "Tracking link sent", lane: "handled" },
    { id: "timesheets", icon: "sheet", title: "Timesheets · week 38", raw: "Spreadsheet · 3 missing", status: "Collected and filed", lane: "handled", desktopOnly: true },
    { id: "report", icon: "report", title: "Month-end report", raw: "Not started", status: "Drafted for Friday", lane: "handled", desktopOnly: true },
    { id: "quote", icon: "mail", title: "Quote request · Jensen Co.", raw: "Email · 6:58am", status: "To Maria in Sales, with past jobs", lane: "routed" },
    { id: "schedule", icon: "calendar", title: "Tuesday · two techs short", raw: "Calendar · 3 clashes", status: "To Dev, with two fixes ready", lane: "routed" },
    { id: "prices", icon: "mail", title: "Supplier price update", raw: "Email · PDF attached", status: "To accounting, prices updated", lane: "routed", desktopOnly: true },
    { id: "stock", icon: "box", title: "Low stock · ½″ copper fittings", raw: "Stockroom · 12 left", status: "Reorder $1,240 · approve?", lane: "you" },
    { id: "renewal", icon: "file", title: "Van lease renewal · Oct 1", raw: "Paper file · drawer 2", status: "Renew at the new rate?", lane: "you", desktopOnly: true },
  ] satisfies BoardChip[],
};

/* ------------------------------------------------------------------ */
/* 01 · The problem                                                    */
/* ------------------------------------------------------------------ */

export const PROBLEM = {
  eyebrow: "Sound familiar?",
  statement:
    "Most growing businesses don't have a people problem. They have a handoff problem. The details live in inboxes, spreadsheets and people's heads, and somewhere along the way the owner became the glue holding it all together.",
  pains: [
    { icon: "person", quote: "I'm the only one who knows where everything is." },
    { icon: "copies", quote: "We type the same details into three different places." },
    { icon: "inbox", quote: "Customers wait because a message sat in someone's inbox." },
    { icon: "month", quote: "I find out about problems at the end of the month." },
  ],
  close: "None of this means you need new software, or a tech team. It means the pieces aren't talking to each other yet.",
} as const;

/* ------------------------------------------------------------------ */
/* 02 · What we do                                                     */
/* ------------------------------------------------------------------ */

export type PillarScene = "connect" | "organize" | "automate" | "see";

export const WHAT = {
  eyebrow: "What we do",
  headline: ["Four things we do", "for every business."],
  lead: "Every company is different, so every setup is too. But the work always comes down to the same four jobs.",
  pillars: [
    {
      scene: "connect",
      title: "Connect the tools you already use",
      body: "Your email, calendar, accounting and customer list start sharing what they know, so nobody types the same thing twice.",
      example: "Add a new customer once, and they show up everywhere they're needed.",
    },
    {
      scene: "organize",
      title: "Organize how information moves",
      body: "When something happens in one part of the business, the right people hear about it straight away, with the details they need.",
      example: "A signed quote tells scheduling to book the job and accounting to send the deposit invoice.",
    },
    {
      scene: "automate",
      title: "Take the repetitive work off your team",
      body: "Reminders, follow-ups, data entry and reports get done on time, every time, by agents we set up to work the way you do.",
      example: "Late invoices get a polite nudge on day seven, and a call on your list by day fourteen.",
    },
    {
      scene: "see",
      title: "Give you a clear view of everything",
      body: "One simple summary of what's happening across the company, and a heads-up the moment something needs you.",
      example: "Every Monday: last week in plain English, and the few things worth your attention.",
    },
  ] satisfies { scene: PillarScene; title: string; body: string; example: string }[],
};

/** Words and numbers inside the four illustrations. Illustrative: Harbor Home Services is fictional. */
export const SCENES = {
  connect: {
    tools: ["Email", "Calendar", "Accounting", "Spreadsheets", "Phone", "Customer list", "Inventory", "Payroll"],
    /** Tool indexes that receive the new customer. */
    receivers: [1, 2, 5],
    packet: "New customer · Rivera Dental",
    caption: "Entered once. Up to date everywhere.",
  },
  organize: {
    source: { dept: "Sales", title: "Quote signed · Jensen Co.", detail: "$7,400 · kitchen repipe" },
    outcomes: [
      { dept: "Scheduling", title: "Job booked", detail: "Thu 9:00 · Maria's crew" },
      { dept: "Accounting", title: "Deposit invoice sent", detail: "$1,850 · due in 7 days" },
      { dept: "Customer", title: "Confirmation sent", detail: "What to expect, and when" },
    ],
    owner: "You: nothing to do. It's in Monday's summary.",
  },
  automate: {
    title: "This week's routine work",
    tasks: [
      { label: "Appointment reminders", count: "38 sent" },
      { label: "Follow up on open quotes", count: "7 sent" },
      { label: "Nudge late invoices", count: "4 sent" },
      { label: "Timesheets into payroll", count: "12 filed" },
      { label: "Update stock counts", count: "Done" },
      { label: "Write the weekly report", count: "Done" },
    ],
    hoursLabel: "Hours back for your team this week",
    hours: 11.5,
  },
  see: {
    greeting: "Good morning, Dana.",
    intro: "Here's last week at Harbor Home Services.",
    stats: [
      { label: "Jobs completed", value: "46", note: "6 more than usual" },
      { label: "Invoiced", value: "$38,420", note: "92% already paid" },
      { label: "Reply to customers", value: "6 min", note: "on average" },
    ],
    attentionTitle: "Worth your attention",
    attention: [
      { text: "Two invoices are over 30 days late ($4,100). Reminders are out.", action: "Call them" },
      { text: "Copper fittings are running low. Reorder drafted: $1,240.", action: "Approve" },
      { text: "Tuesday is overbooked. Moving two jobs to Wednesday would fix it.", action: "Move them" },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* 03 · How we work                                                    */
/* ------------------------------------------------------------------ */

export const PROCESS = {
  eyebrow: "How we work",
  headline: ["Business first.", "Technology second."],
  lead: "We don't show up with software to sell. We show up to listen, and we only build what will make your week noticeably easier.",
  note: "Every engagement starts the same way: a conversation about your business, not a sales pitch.",
  steps: [
    {
      name: "Listen",
      when: "Week one",
      body: "We spend time with you and your team, watching how work actually gets done. Not how the org chart says it does.",
      get: "A clear list of where time and money slip away.",
    },
    {
      name: "Map",
      when: "Week two",
      body: "We draw your whole business on one page: every tool, every handoff, every place where things wait or get lost.",
      get: "A map of your company you'll want to keep.",
    },
    {
      name: "Plan",
      when: "Before any build",
      body: "Together we choose what to fix first, starting with what gives you the most time back. Clear scope, clear price, no surprises.",
      get: "A simple plan, written in plain English.",
    },
    {
      name: "Build",
      when: "One improvement at a time",
      body: "We connect your tools, set up the automations, and train your agents to work the way your business works. Your team keeps working while we build.",
      get: "Working improvements your team can feel.",
    },
    {
      name: "Stay",
      when: "For as long as it helps",
      body: "We check in, fine-tune, and add the next improvement when you're ready. You're never handed a black box and left alone with it.",
      get: "A partner who knows your business.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 04 · Examples                                                       */
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
/* 05 · Websites                                                       */
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
/* 06 · Principles and who we work with                                */
/* ------------------------------------------------------------------ */

export const PRINCIPLES = {
  eyebrow: "Working with us",
  headline: ["What it feels like", "to work with us."],
  items: [
    { title: "Business first", body: "We learn how your company runs before we recommend anything." },
    { title: "Your tools stay", body: "We build around what your team already knows and uses every day." },
    { title: "You stay in charge", body: "Agents handle the routine. The decisions stay with you." },
    { title: "Plain English", body: "No jargon in our meetings, our reports, or our invoices." },
    { title: "Small steps, real results", body: "We start with one change that pays off, then build from there." },
  ],
} as const;

export const INDUSTRIES = {
  lead: "Built for businesses like",
  list: [
    "Plumbing & HVAC",
    "Dental practices",
    "Wholesale & distribution",
    "Accounting firms",
    "Property management",
    "Builders & trades",
    "Car dealerships",
    "Auto body & glass",
    "Clinics",
    "Agencies",
    "Landscaping",
    "Manufacturing",
    "Retail",
    "Cleaning services",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 07 · FAQ                                                            */
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
      q: "Will this replace my staff?",
      a: "That isn't the goal. We take the repetitive work off your team's plate, like copying details between systems and chasing reminders, so they can spend their time on customers and the work they were hired to do.",
    },
    {
      q: "Do we have to switch software?",
      a: "Almost never. We build around the tools you already use. If something truly isn't working for you, we'll tell you why and let you decide.",
    },
    {
      q: "What exactly is an agent?",
      a: "Think of it as a digital team member with one clear job, like sending invoice reminders or booking appointments. It follows the rules you set, checks with a person before anything important, and keeps a record of everything it does.",
    },
    {
      q: "What if something goes wrong?",
      a: "Agents work inside limits you agree to and ask before anything that matters. Every action is recorded, so it's easy to see what happened, fix it, and adjust the rules. We keep an eye on things with you.",
    },
    {
      q: "Is our information safe?",
      a: "Your information stays in your own accounts. We only connect what's needed for the job, and we walk you through exactly what connects to what before anything goes live.",
    },
    {
      q: "How long does it take, and what does it cost?",
      a: "It depends on your business, which is why we start by listening. After we've mapped how your company works, you'll get a clear plan with a clear price before any building starts. We begin with the change that gives you the most time back.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 08 · Contact                                                        */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  eyebrow: "Start here",
  headline: ["Let's talk about your business.", "Not about AI."],
  lead: "Tell us a little about how your company works and where the day gets stuck. We'll come back with a few honest ideas, even if we're not the right fit.",
  next: [
    { title: "We reply to set up a call", body: "At a time that suits you." },
    { title: "We ask about your business", body: "How work flows, not what software you run." },
    { title: "You get a few honest ideas", body: "Yours to keep, whether we work together or not." },
  ],
  fields: {
    name: "Your name",
    email: "Email",
    company: "Your company, and what it does",
    stuck: "Where does the day get stuck?",
  },
  placeholders: {
    name: "Dana Reyes",
    email: "dana@harborhome.com",
    company: "Harbor Home Services, plumbing and heating, 24 people",
    stuck: "Scheduling takes hours every week, and invoices go out late.",
  },
  submit: "Send",
  sending: "Sending",
  success: {
    title: "Thank you. We've got it.",
    body: "We'll be in touch soon to find a time to talk. No need to prepare anything.",
  },
  error: "Something went wrong and your message didn't send. Please try again.",
} as const;

export const FOOTER = {
  line: "Consulting for small and mid-sized businesses. We connect your tools, organize how work moves, take the repetitive work off your team, and give you one clear view.",
} as const;
