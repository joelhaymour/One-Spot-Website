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
  { label: "Examples", href: "#top" },
  { label: "How we work", href: "#process" },
  { label: "Your tools", href: "#tools" },
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
  secondary: { label: "See how we work", href: "#process" },
  reassurance: "No jargon. No ripping out the tools you already use.",
} as const;

/* ------------------------------------------------------------------ */
/* Hero examples: one ordinary job, before and with One Spot           */
/* Illustrative: the businesses, people and numbers are made up.       */
/* ------------------------------------------------------------------ */

export type ExampleActor = "team" | "onespot" | "you" | "wait" | "outside";

export interface ExampleStep {
  text: string;
  /** Who does it, in a word or two. */
  who: string;
  actor: ExampleActor;
  /** Something that hurts (before) or the thing that's now caught early (after). */
  flag?: string;
  /** Apps this step makes someone open (before) or keeps in sync (after). */
  apps?: string[];
}

export interface HeroExample {
  key: string;
  tab: string;
  icon: "car" | "tooth" | "bank" | "tools";
  moment: string;
  before: ExampleStep[];
  after: ExampleStep[];
  stats: { label: string; before: string; after: string }[];
}

export const HERO_EXAMPLES = {
  label: "One job, two ways",
  before: "Today",
  after: "With One Spot",
  note: "Illustrative examples",
  items: [
    {
      key: "body",
      tab: "Body shop",
      icon: "car",
      moment: "A customer books a bumper repair for Thursday.",
      before: [
        { text: "Front desk books it, nobody checks the parts", who: "Front desk", actor: "team" },
        { text: "Tuesday cancels; their parts sit uncounted on the shelf", who: "Parts room", actor: "team", flag: "Count is wrong" },
        { text: "Thursday the clips are missing, the car waits in the bay", who: "Technician", actor: "wait", flag: "Bay blocked 2 days" },
        { text: "Someone phones the supplier and re-books the customer", who: "Front desk", actor: "team" },
      ],
      after: [
        { text: "The booking checks parts on hand: bumper cover ✓, clips short", who: "One Spot", actor: "onespot" },
        { text: "The clips are ordered from the supplier, arriving Wednesday", who: "One Spot", actor: "onespot" },
        { text: "Tuesday's cancellation puts its parts back for the next booking", who: "One Spot", actor: "onespot" },
        { text: "Orders over your limit wait for your OK", who: "You", actor: "you" },
      ],
      stats: [
        { label: "Cars waiting on parts", before: "3 a week", after: "None" },
        { label: "Parts orders", before: "By phone", after: "Automatic" },
      ],
    },
    {
      key: "dental",
      tab: "Dental & medical",
      icon: "tooth",
      moment: "A patient comes in for a cleaning and X-rays.",
      before: [
        { text: "Front desk calls the insurer to check coverage", who: "Front desk", actor: "wait", flag: "20 min on hold" },
        { text: "After the visit, codes and notes are typed into the insurer's site", who: "Front desk", actor: "team" },
        { text: "Two weeks later the claim bounces: X-rays not attached", who: "Insurer", actor: "outside", flag: "Rejected" },
        { text: "It's fixed and sent again; payment lands a month later", who: "Front desk", actor: "wait" },
      ],
      after: [
        { text: "Coverage is checked the day before the appointment", who: "One Spot", actor: "onespot" },
        { text: "After the visit, the claim fills itself from the chart, X-rays attached", who: "One Spot", actor: "onespot" },
        { text: "It's checked against the insurer's rules before it goes", who: "One Spot", actor: "onespot", flag: "Caught before sending" },
        { text: "Anything unusual comes to the desk to approve", who: "Front desk", actor: "you" },
      ],
      stats: [
        { label: "Claims sent back", before: "1 in 5", after: "Rare" },
        { label: "Time on claims", before: "9 hrs a week", after: "2 hrs" },
      ],
    },
    {
      key: "finance",
      tab: "Financing",
      icon: "bank",
      moment: "An account manager submits a deal for funding.",
      before: [
        { text: "The doc request joins the queue", who: "Account manager", actor: "team" },
        { text: "Hours later the specialist finds the invoice name doesn't match and the license expired", who: "Contract specialist", actor: "team", flag: "Sent back" },
        { text: "The account manager chases the customer and the dealership", who: "Account manager", actor: "team" },
        { text: "The dealership replies tomorrow; every deal behind it waits", who: "Dealership", actor: "wait", flag: "+1 day, queue stuck" },
      ],
      after: [
        { text: "Checked the moment it's submitted: business name, invoice, license", who: "One Spot", actor: "onespot" },
        { text: "Invoice name doesn't match, license expired: it's held", who: "One Spot", actor: "onespot", flag: "Caught at submit" },
        { text: "The account manager gets the fix list, with the requests drafted", who: "Account manager", actor: "team" },
        { text: "Only clean deals reach the queue for the specialist", who: "Contract specialist", actor: "you" },
      ],
      stats: [
        { label: "Deals sent back", before: "1 in 4", after: "Almost none" },
        { label: "Submit to funded", before: "3 days", after: "Same day" },
      ],
    },
    {
      key: "hvac",
      tab: "HVAC",
      icon: "tools",
      moment: "A technician quotes a furnace replacement on site.",
      before: [
        { text: "The tech builds the estimate in the field app", who: "Technician", actor: "team", apps: ["Field app"] },
        { text: "The office retypes it into accounting, the CRM and the job folder", who: "Office", actor: "team", apps: ["Accounting", "CRM", "Shared drive"] },
        { text: "The account manager emails it out for approval and a deposit", who: "Account manager", actor: "team", apps: ["Email"] },
        { text: "The customer adds a humidifier: redo it in every app", who: "Everyone", actor: "wait", flag: "Start over", apps: ["Field app", "Accounting", "CRM", "Email"] },
      ],
      after: [
        { text: "The estimate goes from the field app to everywhere it's needed", who: "One Spot", actor: "onespot", apps: ["Accounting", "CRM", "Shared drive"] },
        { text: "The customer gets it to approve and pay the deposit", who: "One Spot", actor: "onespot", apps: ["Email"] },
        { text: "Add a humidifier once, and every app updates", who: "One Spot", actor: "onespot", flag: "Nothing retyped" },
        { text: "The office reviews it and books the install", who: "Office", actor: "you" },
      ],
      stats: [
        { label: "Apps per job", before: "5, by hand", after: "1" },
        { label: "Times retyped", before: "3+", after: "0" },
      ],
    },
  ] satisfies HeroExample[],
};

/* ------------------------------------------------------------------ */
/* 01 · How we work                                                    */
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
/* 02 · Your tools: too many clicks, then connected                    */
/* ------------------------------------------------------------------ */

export const TOOLS = {
  eyebrow: "Your tools",
  headline: ["One job.", "Too many clicks."],
  lead: "Most businesses don't need more software. They need the software they already have to talk to each other. Scroll to follow one job through a typical office.",
  counter: "Clicks to finish one job",
  retyped: "Details typed again",
  before: { clicks: 47, retyped: 9, label: "Today: every app on its own" },
  after: { clicks: 6, retyped: 0, label: "With One Spot: connected" },
  close: "Same tools you use today. We just connect them, so the work moves by itself.",
  apps: [
    { name: "Email", icon: "mail", color: "#c4533d" },
    { name: "Accounting", icon: "invoice", color: "#2b7a57" },
    { name: "CRM", icon: "users", color: "#7b5cd6" },
    { name: "Shared drive", icon: "file", color: "#2f8aa0" },
    { name: "Spreadsheet", icon: "sheet", color: "#3f8f4f" },
    { name: "Calendar", icon: "calendar", color: "#d08a1e" },
    { name: "Field app", icon: "phone", color: "#2d4ae0" },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 03 · FAQ                                                            */
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
      a: "It depends on your business, which is why we start by listening. After we've mapped how your company works, you'll get a clear plan with a clear price before any building starts. We begin with the change that gives you the most time back.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 04 · Contact                                                        */
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
  line: "Consulting for small and mid-sized businesses. We cut through the noise, find what actually fits your business, and connect the tools you already use.",
} as const;
