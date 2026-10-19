/**
 * Every word on the homepage lives here, so copy can change without touching a component.
 *
 * Voice: US English, the company speaks as "we", plain words a busy owner would use. No jargon, no
 * "AI-powered", no futurism. Examples are operational (jobs, invoices, schedules, stock), never marketing.
 * Every business, person and number in the examples is fictional and illustrative.
 */

export const SITE = {
  name: "One Spot",
  title: "One Spot — Modern workflows, made simple",
  description:
    "One Spot helps small and mid-sized businesses cut through endless tools and new technology. We find what actually fits your business, connect the software you already use, and put it to work.",
} as const;

export const NAV = [
  { label: "What we connect", href: "#connect" },
  { label: "What it's worth", href: "#worth" },
  { label: "How we work", href: "#process" },
  { label: "FAQ", href: "#faq" },
] as const;

export const NAV_CTA = { label: "Talk to us", href: "#contact" } as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const HERO = {
  eyebrow: "Consulting for small and mid-sized businesses",
  headline: ["Modern workflows.", "Made simple."],
  lead: "In a world with endless tools and new technology, knowing where to start is the hard part. We cut through the noise, find what actually fits your business, and put it to work.",
  primary: { label: "Start with a conversation", href: "#contact" },
  secondary: { label: "See what we connect", href: "#connect" },
  reassurance: "No jargon. No ripping out the tools you already use.",
} as const;

/* ------------------------------------------------------------------ */
/* Hero calculator: what a better way of working could be worth         */
/* Recovered time is shown as potential value, never as cash saved.     */
/* ------------------------------------------------------------------ */

export type WorthMode = "team" | "you";

export interface WorthSlider {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: "people" | "hours" | "money" | "weeks";
}

export const WORTH = {
  /** The section around the calculator. */
  section: { eyebrow: "What it's worth", headline: ["Do the math", "on your own team."], lead: "Move the sliders. It takes ten seconds, and the numbers are yours." },
  headline: "What could a better way of working be worth?",
  lead: "Small improvements add up. See what getting time back and getting more done could mean for your business.",
  modes: [
    { key: "team", label: "My Team's Time" },
    { key: "you", label: "My Time" },
  ] satisfies { key: WorthMode; label: string }[],
  defaultMode: "team" as WorthMode,
  /** A workweek, for "workweeks recovered". */
  weekHours: 40,
  team: {
    sliders: [
      { key: "people", label: "Number of employees", min: 1, max: 150, step: 1, value: 15, unit: "people" },
      { key: "hours", label: "Hours saved per employee each week", min: 0.5, max: 10, step: 0.5, value: 3, unit: "hours" },
      { key: "rate", label: "Average hourly cost", min: 15, max: 150, step: 1, value: 35, unit: "money" },
    ] satisfies WorthSlider[],
    weeks: 52,
    hoursLabel: "hours your team gets back every year",
    valueLabel: "Potential value of that time",
    weeksLabel: "Workweeks recovered",
    statement: "Imagine what your team could accomplish with that time back.",
  },
  you: {
    sliders: [
      { key: "hours", label: "Hours you'd get back each week", min: 1, max: 25, step: 1, value: 5, unit: "hours" },
      { key: "rate", label: "What an hour of your time is worth", min: 25, max: 500, step: 5, value: 100, unit: "money" },
      { key: "weeks", label: "Weeks you work in a year", min: 30, max: 52, step: 1, value: 48, unit: "weeks" },
    ] satisfies WorthSlider[],
    hoursLabel: "hours of your own time back every year",
    valueLabel: "Potential value of your time",
    weeksLabel: "Workweeks back",
    statement: "Imagine what you could do if you had that time back.",
  },
  yearLabel: { start: "Week 1", end: "Week 52" },
  footnote: "Potential value at the hourly figure above. Actual savings depend on how the time is used.",
  close: ["You don't always need more people.", "Sometimes you just need a better way of working."],
};

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
/* 01 · What we connect: the parts of any business, around one         */
/* dashboard. Generic tools, so every visitor sees their own setup.    */
/* The examples are illustrative.                                      */
/* ------------------------------------------------------------------ */

export type ConnectIcon = "users" | "calendar" | "invoice" | "file" | "box" | "plus";

export interface ConnectPart {
  key: string;
  label: string;
  /** A short qualifier under the label, e.g. "if you have them". */
  note?: string;
  icon: ConnectIcon;
  /** Where this part usually lives today. Generic, never brand names. */
  tools: string[];
  /** What changes once it's connected. */
  outcomes: string[];
  /** One line each, from different kinds of business. */
  examples: string[];
}

export const CONNECT = {
  eyebrow: "What we connect",
  headline: ["Every part of your business.", "One dashboard."],
  lead: "Almost every business runs on the same few parts. Which ones are a mess is different every time. Pick yours.",
  hub: { label: "Your dashboard", sub: "Everything in one place" },
  labels: { tools: "Usually lives in", outcomes: "Once it's connected", examples: "For example" },
  parts: [
    {
      key: "customers",
      label: "Customers",
      icon: "users",
      tools: ["Phone and voicemail", "Your inbox", "Your website", "Your CRM"],
      outcomes: ["Every call, email and form lands in one place", "New enquiries answered or passed to the right person", "Nothing slips through the cracks"],
      examples: ["A dealership answering a Saturday-night enquiry in minutes.", "A clinic confirming appointments without phone tag."],
    },
    {
      key: "work",
      label: "The work",
      icon: "calendar",
      tools: ["Your scheduling app", "Shared calendar", "Job notes and texts", "Spreadsheets"],
      outcomes: ["Jobs booked once, and everyone sees them", "Your team always knows what's next", "Customers kept up to date without anyone typing it"],
      examples: ["An HVAC company sending the tech's notes straight to the office.", "A contractor reshuffling the day when materials are late."],
    },
    {
      key: "money",
      label: "Money",
      icon: "invoice",
      tools: ["Quotes and estimates", "Your accounting app", "Payments", "Email"],
      outcomes: ["Quote to invoice without retyping", "Reminders on unpaid invoices go out on time", "You see what's owed at a glance"],
      examples: ["A service company invoicing the day the job is done.", "A body shop following vendor credits until they arrive."],
    },
    {
      key: "paperwork",
      label: "Paperwork",
      icon: "file",
      tools: ["Forms and PDFs", "Contracts", "IDs and licenses", "Claims"],
      outcomes: ["Documents checked before they go out", "Missing pieces flagged early", "Everything filed where it belongs"],
      examples: ["A lender holding a deal until the invoice and license match.", "A dental office attaching the right X-rays before a claim goes out."],
    },
    {
      key: "stock",
      label: "Stock & suppliers",
      note: "If you have them",
      icon: "box",
      tools: ["Supplier emails", "Purchase orders", "An inventory sheet", "Returns"],
      outcomes: ["Stock counts you can trust", "Reorders and returns tracked", "Credits followed until they land"],
      examples: ["A body shop returning unused parts before the window closes.", "A distributor reordering before the shelf runs out."],
    },
  ] satisfies ConnectPart[],
  /** The open slot: anything the five don't cover. */
  other: {
    key: "other",
    label: "Anything else",
    icon: "plus" as ConnectIcon,
    cycle: ["Your booking app", "An industry system", "A shared spreadsheet", "Paper forms", "Your point of sale"],
    title: "If your team uses it, we can usually connect it.",
    body: "And if something can't connect, we build around it, so it still shows up on your dashboard.",
    action: "Tell us what you use",
  },
  note: "Illustrative examples.",
  /** What the owner sees: the payoff of connecting the parts. */
  dashboard: {
    title: "What you see each morning",
    body: "Everything connected comes together on one screen: what's happening today, what's owed, and only the few things that need you.",
    caption: "Illustrative",
    greeting: "Good morning. Here's today.",
    tiles: [
      { label: "Jobs today", value: "12", detail: "2 need a tech assigned" },
      { label: "Money owed", value: "$18,400", detail: "3 invoices past 14 days" },
      { label: "Waiting on you", value: "3", detail: "Approvals and replies" },
    ],
    attention: { label: "Needs attention", text: "Invoice #1042 is 16 days late. A friendly reminder is ready to send." },
  },
  website: {
    text: "Need your website to work harder too? We redesign websites that book, sell and are easy to update.",
    action: "Ask about a website",
  },
};

/* ------------------------------------------------------------------ */
/* 04 · FAQ                                                            */
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
/* 05 · Contact                                                        */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  eyebrow: "Start here",
  headline: ["Tell us what you'd", "like help with."],
  lead: "A few lines is plenty. We'll do our homework on your business before we talk, so the first conversation is about you, not the basics.",
  /** The choice at the top of the form: general help, or only a website redesign. */
  kinds: {
    label: "What can we help with?",
    options: [
      { key: "general", label: "My business" },
      { key: "website", label: "Website redesign" },
    ],
  },
  fields: {
    name: "Your name",
    email: "Email",
    company: "Company name",
    site: "Website (optional)",
    stuck: "What would you like help with?",
  },
  placeholders: {
    name: "Dana Reyes",
    email: "dana@harborhome.com",
    company: "Harbor Home Services",
    site: "harborhome.com",
    stuck: "We copy every order from email into a spreadsheet by hand, and invoices go out a week late.",
  },
  /** What changes when they pick "Website redesign": the address is needed, and boxes replace most of the typing. */
  website: {
    fields: { site: "Your website", stuck: "Anything specific? (optional)" },
    placeholders: { stuck: "The booking button is hard to find on a phone, and our photos are out of date." },
    changes: {
      label: "What would you like to change?",
      help: "Tick any that fit.",
      options: [
        "A fresh, modern look",
        "Works better on phones",
        "Clearer menu and pages",
        "Online booking or quote requests",
        "Online store or checkout",
        "Faster loading",
        "Show up better on Google",
        "Easier for us to update",
      ],
    },
  },
  submit: "Send",
  sending: "Sending",
  success: {
    title: "Thank you. We've got it.",
    body: "Your message is on its way to us. We'll look into your business and be in touch soon.",
    websiteBody: "Your message is on its way to us. We'll take a good look at your website and send you two fresh design ideas for it, usually by tomorrow.",
  },
  /** After a general enquiry: a few quick questions, and we build them a working demo. */
  demo: {
    title: "Want a demo by tomorrow?",
    body: "Answer a few quick questions (about 2 minutes, mostly taps) and we'll build a working demo of the idea and email it to you by tomorrow.",
    button: "Answer the questions",
    opening: "Opening",
    emailed: "We'll also email you the link, so you can finish later.",
    error: "That didn't open. Please try again, or reply to our email and we'll send the questions.",
  },
  error: "Something went wrong and your message didn't send. Please try again.",
} as const;

export const FOOTER = {
  line: "Consulting for small and mid-sized businesses. We cut through the noise, find what actually fits your business, and connect the tools you already use.",
} as const;
